/**
 * Router tRPC para integração com Bling
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { saveOAuthToken, getOAuthToken } from "../db";
import { tokenExpirado, renovarAccessToken } from "../integrations/bling-oauth";
import {
  sincronizarProdutos,
  sincronizarPedidos,
  sincronizarContatos,
  sincronizarEstoque,
  formatarErroBlng,
  BlingAPIError,
} from "../integrations/bling";

/** Gets the stored Bling access token, auto-refreshing if expired. */
async function getBlingToken(userId: number): Promise<string> {
  const token = await getOAuthToken(userId, "bling");
  if (!token || !token.isActive) throw new Error("Bling não conectado. Conecte sua conta Bling primeiro.");
  if (token.expiresAt && tokenExpirado(new Date(token.expiresAt))) {
    if (!token.refreshToken) throw new Error("Token Bling expirado. Reconecte sua conta.");
    const renewed = await renovarAccessToken(token.refreshToken);
    await saveOAuthToken(userId, "bling", {
      accessToken: renewed.access_token,
      refreshToken: token.refreshToken,
      expiresIn: renewed.expires_in,
    });
    return renewed.access_token;
  }
  return token.accessToken;
}

export const blingRouter = router({
  /**
   * Armazena o access token do Bling
   */
  salvarAccessToken: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        expiresIn: z.number().optional(),
        refreshToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        await saveOAuthToken(ctx.user.id, "bling", {
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          expiresIn: input.expiresIn,
        });

        return {
          success: true,
          message: "Access token salvo com sucesso",
        };
      } catch (error: unknown) {
        throw new Error(`Erro ao salvar access token: ${error}`);
      }
    }),

  /**
   * Sincroniza produtos do Bling
   */
  sincronizarProdutos: protectedProcedure
    .input(
      z.object({
        accessToken: z.string().optional().default(""),
        pagina: z.number().optional().default(1),
        limite: z.number().optional().default(100),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const token = await getBlingToken(ctx.user.id);
        const response = await sincronizarProdutos(token, input.pagina, input.limite);
        return {
          success: true,
          totalSincronizados: response.paginacao?.total || response.data?.length || 0,
          produtos: response.data,
          paginacao: response.paginacao,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) throw new Error(formatarErroBlng(error));
        throw error;
      }
    }),

  /**
   * Sincroniza pedidos do Bling
   */
  sincronizarPedidos: protectedProcedure
    .input(
      z.object({
        accessToken: z.string().optional().default(""),
        pagina: z.number().optional().default(1),
        limite: z.number().optional().default(100),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const token = await getBlingToken(ctx.user.id);
        const response = await sincronizarPedidos(token, input.pagina, input.limite, input.dataInicio, input.dataFim);
        return {
          success: true,
          totalPedidos: response.paginacao?.total || response.data?.length || 0,
          pedidos: response.data,
          paginacao: response.paginacao,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) throw new Error(formatarErroBlng(error));
        throw error;
      }
    }),

  /**
   * Sincroniza contatos do Bling
   */
  sincronizarContatos: protectedProcedure
    .input(
      z.object({
        accessToken: z.string().optional().default(""),
        pagina: z.number().optional().default(1),
        limite: z.number().optional().default(100),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const token = await getBlingToken(ctx.user.id);
        const response = await sincronizarContatos(token, input.pagina, input.limite);
        return {
          success: true,
          totalContatos: response.paginacao?.total || response.data?.length || 0,
          contatos: response.data,
          paginacao: response.paginacao,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) throw new Error(formatarErroBlng(error));
        throw error;
      }
    }),

  /**
   * Sincroniza estoque do Bling
   */
  sincronizarEstoque: protectedProcedure
    .input(
      z.object({
        accessToken: z.string().optional().default(""),
        pagina: z.number().optional().default(1),
        limite: z.number().optional().default(100),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        const token = await getBlingToken(ctx.user.id);
        const response = await sincronizarEstoque(token, input.pagina, input.limite);
        return {
          success: true,
          totalEstoque: response.data?.length || 0,
          estoque: response.data,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) throw new Error(formatarErroBlng(error));
        throw error;
      }
    }),

  /**
   * Sincroniza todos os dados do Bling (produtos, pedidos, contatos, estoque)
   */
  sincronizarTodosDados: protectedProcedure
    .input(z.object({ accessToken: z.string().optional().default("") }))
    .mutation(async ({ ctx }: any) => {
      try {
        const token = await getBlingToken(ctx.user.id);
        const [produtos, pedidos, contatos, estoque] = await Promise.all([
          sincronizarProdutos(token),
          sincronizarPedidos(token),
          sincronizarContatos(token),
          sincronizarEstoque(token),
        ]);

        return {
          success: true,
          resumo: {
            totalProdutos: produtos.paginacao?.total || 0,
            totalPedidos: pedidos.paginacao?.total || 0,
            totalContatos: contatos.paginacao?.total || 0,
            totalEstoque: estoque.data.length,
          },
          dados: {
            produtos: produtos.data,
            pedidos: pedidos.data,
            contatos: contatos.data,
            estoque: estoque.data,
          },
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) {
          throw new Error(formatarErroBlng(error));
        }
        throw error;
      }
    }),

  /**
   * Testa conexão com Bling API
   */
  testarConexao: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        // Tenta sincronizar um produto para testar a conexão
        await sincronizarProdutos(input.accessToken, 1, 1);

        return {
          sucesso: true,
          mensagem: "Conexão com Bling API estabelecida com sucesso!",
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) {
        return {
          sucesso: false,
          mensagem: formatarErroBlng(error),
          codigo: (error as BlingAPIError).statusCode,
        };
        }

        return {
          sucesso: false,
          mensagem: `Erro ao conectar com Bling: ${error}`,
        };
      }
    }),
});
