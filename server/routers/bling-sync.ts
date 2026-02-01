/**
 * Router tRPC para sincronização de dados com Bling\n */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  sincronizarProdutosBling,
  sincronizarPedidosBling,
  sincronizarContatosBling,
  sincronizarEstoqueBling,
  obterProdutoBling,
  obterPedidoBling,
  atualizarEstoqueBling,
  BlingAPIError,
  formatarErroBling,
} from "../integrations/bling-api";

export const blingSyncRouter = router({
  /**
   * Sincroniza produtos do Bling
   */
  produtos: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        pagina: z.number().optional().default(1),
        limite: z.number().optional().default(100),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const response = await sincronizarProdutosBling(
          input.accessToken,
          input.pagina,
          input.limite
        );

        return {
          sucesso: true,
          total: response.data?.length || 0,
          produtos: response.data || [],
          paginacao: response.paging,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) {
          throw new Error(formatarErroBling(error));
        }
        throw error;
      }
    }),

  /**
   * Sincroniza pedidos do Bling
   */
  pedidos: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        pagina: z.number().optional().default(1),
        limite: z.number().optional().default(100),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const response = await sincronizarPedidosBling(
          input.accessToken,
          input.pagina,
          input.limite,
          input.dataInicio,
          input.dataFim
        );

        return {
          sucesso: true,
          total: response.data?.length || 0,
          pedidos: response.data || [],
          paginacao: response.paging,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) {
          throw new Error(formatarErroBling(error));
        }
        throw error;
      }
    }),

  /**
   * Sincroniza contatos do Bling
   */
  contatos: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        pagina: z.number().optional().default(1),
        limite: z.number().optional().default(100),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const response = await sincronizarContatosBling(
          input.accessToken,
          input.pagina,
          input.limite
        );

        return {
          sucesso: true,
          total: response.data?.length || 0,
          contatos: response.data || [],
          paginacao: response.paging,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) {
          throw new Error(formatarErroBling(error));
        }
        throw error;
      }
    }),

  /**
   * Sincroniza estoque do Bling
   */
  estoque: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        pagina: z.number().optional().default(1),
        limite: z.number().optional().default(100),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const response = await sincronizarEstoqueBling(
          input.accessToken,
          input.pagina,
          input.limite
        );

        return {
          sucesso: true,
          total: response.data?.length || 0,
          estoque: response.data || [],
          paginacao: response.paging,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) {
          throw new Error(formatarErroBling(error));
        }
        throw error;
      }
    }),

  /**
   * Sincroniza todos os dados (produtos, pedidos, contatos, estoque)
   */
  todosDados: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const [produtos, pedidos, contatos, estoque] = await Promise.all([
          sincronizarProdutosBling(input.accessToken),
          sincronizarPedidosBling(input.accessToken),
          sincronizarContatosBling(input.accessToken),
          sincronizarEstoqueBling(input.accessToken),
        ]);

        return {
          sucesso: true,
          resumo: {
            totalProdutos: produtos.data?.length || 0,
            totalPedidos: pedidos.data?.length || 0,
            totalContatos: contatos.data?.length || 0,
            totalEstoque: estoque.data?.length || 0,
          },
          dados: {
            produtos: produtos.data || [],
            pedidos: pedidos.data || [],
            contatos: contatos.data || [],
            estoque: estoque.data || [],
          },
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) {
          throw new Error(formatarErroBling(error));
        }
        throw error;
      }
    }),

  /**
   * Obtém detalhes de um produto específico
   */
  obterProduto: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        produtoId: z.number(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const produto = await obterProdutoBling(input.accessToken, input.produtoId);
        return {
          sucesso: true,
          produto,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) {
          throw new Error(formatarErroBling(error));
        }
        throw error;
      }
    }),

  /**
   * Obtém detalhes de um pedido específico
   */
  obterPedido: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        pedidoId: z.number(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const pedido = await obterPedidoBling(input.accessToken, input.pedidoId);
        return {
          sucesso: true,
          pedido,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) {
          throw new Error(formatarErroBling(error));
        }
        throw error;
      }
    }),

  /**
   * Atualiza estoque de um produto
   */
  atualizarEstoque: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        produtoId: z.number(),
        quantidade: z.number(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const resultado = await atualizarEstoqueBling(
          input.accessToken,
          input.produtoId,
          input.quantidade
        );

        return {
          sucesso: true,
          mensagem: "Estoque atualizado com sucesso",
          resultado,
        };
      } catch (error: unknown) {
        if (error instanceof BlingAPIError) {
          throw new Error(formatarErroBling(error));
        }
        throw error;
      }
    }),
});
