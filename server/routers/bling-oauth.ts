/**
 * Router tRPC para autenticação OAuth com Bling
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  gerarUrlAutorizacao,
  trocarCodigoPorToken,
  renovarAccessToken,
  tokenExpirado,
} from "../integrations/bling-oauth";
import { getOAuthToken, saveOAuthToken } from "../db";

export const blingOAuthRouter = router({
  /**
   * Gera a URL de autorização para iniciar o fluxo OAuth
   */
  gerarUrlAutorizacao: protectedProcedure
    .query(async () => {
      try {
        const state = (await import("crypto")).randomBytes(16).toString("hex");
        const urlAutorizacao = gerarUrlAutorizacao(state);

        return {
          sucesso: true,
          url: urlAutorizacao,
          state,
        };
      } catch (error: unknown) {
        return {
          sucesso: false,
          mensagem: `Erro ao gerar URL de autorização: ${error}`,
        };
      }
    }),

  /**
   * Processa o callback OAuth e armazena o token
   */
  processarCallback: publicProcedure
    .input(
      z.object({
        code: z.string(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const token = await trocarCodigoPorToken(input.code);

        // Aqui você salvaria o token no banco de dados
        // await db.blingCredentials.create({
        //   userId: ctx.user.id,
        //   accessToken: token.access_token,
        //   refreshToken: token.refresh_token,
        //   expiresAt: new Date(Date.now() + token.expires_in * 1000),
        //   scope: token.scope,
        // });

        return {
          sucesso: true,
          mensagem: "Autenticação com Bling realizada com sucesso!",
          token: {
            access_token: token.access_token,
            expires_in: token.expires_in,
          },
        };
      } catch (error: unknown) {
        return {
          sucesso: false,
          mensagem: `Erro ao processar callback: ${error}`,
        };
      }
    }),

  /**
   * Renova o access token usando o refresh token
   */
  renovarToken: protectedProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const novoToken = await renovarAccessToken(input.refreshToken);

        return {
          sucesso: true,
          token: {
            access_token: novoToken.access_token,
            expires_in: novoToken.expires_in,
          },
        };
      } catch (error: unknown) {
        return {
          sucesso: false,
          mensagem: `Erro ao renovar token: ${error}`,
        };
      }
    }),

  /**
   * Verifica se o token está expirado
   */
  verificarExpiracao: protectedProcedure
    .input(
      z.object({
        expiresAt: z.string(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const expiresAt = new Date(input.expiresAt);
        const expirado = tokenExpirado(expiresAt);

        return {
          expirado,
          mensagem: expirado ? "Token expirado, renovação necessária" : "Token válido",
        };
      } catch (error: unknown) {
        return {
          sucesso: false,
          mensagem: `Erro ao verificar expiração: ${error}`,
        };
      }
    }),

  /**
   * Retorna status da conexão com Bling para o usuário logado
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const token = await getOAuthToken(ctx.user.id, "bling");
      if (!token || !token.isActive) {
        return { conectado: false, expirado: false };
      }
      const expirado = token.expiresAt ? tokenExpirado(new Date(token.expiresAt)) : false;
      return {
        conectado: true,
        expirado,
        expiresAt: token.expiresAt,
        scope: token.scope,
      };
    } catch {
      return { conectado: false, expirado: false };
    }
  }),

  /**
   * Desconecta o Bling (marca token como inativo)
   */
  desconectar: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await (await import("../db")).getDb();
    if (!db) throw new Error("Database not available");
    const { oauthTokens } = await import("../../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");
    await db.update(oauthTokens)
      .set({ isActive: false })
      .where(and(eq(oauthTokens.userId, ctx.user.id), eq(oauthTokens.plataforma, "bling")));
    return { sucesso: true };
  }),
});
