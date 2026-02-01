import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  obterCampanhasMetaAds,
  obterInsightsCampanha,
  criarCampanha,
  atualizarCampanha,
  obterAnunciosCampanha,
  obterPerformanceAnuncio,
  formatarErroMetaAds,
  MetaAdsAPIError,
} from "../integrations/meta-ads-api";

export const metaAdsRouter = router({
  /**
   * Obtém campanhas da Meta Ads
   */
  obterCampanhas: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        accountId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const campanhas = await obterCampanhasMetaAds(
          input.accessToken,
          input.accountId
        );
        return {
          sucesso: true,
          campanhas: campanhas.data || [],
          total: campanhas.data?.length || 0,
        };
      } catch (erro) {
        if (erro instanceof MetaAdsAPIError) {
          throw new Error(formatarErroMetaAds(erro));
        }
        throw erro;
      }
    }),

  /**
   * Obtém insights de uma campanha
   */
  obterInsights: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const insights = await obterInsightsCampanha(
          input.accessToken,
          input.campaignId
        );
        return {
          sucesso: true,
          insights: insights.insights?.data || [],
        };
      } catch (erro) {
        if (erro instanceof MetaAdsAPIError) {
          throw new Error(formatarErroMetaAds(erro));
        }
        throw erro;
      }
    }),

  /**
   * Cria uma nova campanha
   */
  criarCampanha: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        accountId: z.string(),
        nome: z.string(),
        objetivo: z.string(),
        status: z.enum(["PAUSED", "ACTIVE"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const resultado = await criarCampanha(input.accessToken, input.accountId, {
          name: input.nome,
          objective: input.objetivo,
          status: input.status,
        });
        return {
          sucesso: true,
          campaignId: resultado.id,
          mensagem: "Campanha criada com sucesso",
        };
      } catch (erro) {
        if (erro instanceof MetaAdsAPIError) {
          throw new Error(formatarErroMetaAds(erro));
        }
        throw erro;
      }
    }),

  /**
   * Atualiza uma campanha
   */
  atualizarCampanha: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        campaignId: z.string(),
        nome: z.string().optional(),
        status: z.enum(["PAUSED", "ACTIVE"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const dados: any = {};
        if (input.nome) dados.name = input.nome;
        if (input.status) dados.status = input.status;

        await atualizarCampanha(input.accessToken, input.campaignId, dados);
        return {
          sucesso: true,
          mensagem: "Campanha atualizada com sucesso",
        };
      } catch (erro) {
        if (erro instanceof MetaAdsAPIError) {
          throw new Error(formatarErroMetaAds(erro));
        }
        throw erro;
      }
    }),

  /**
   * Obtém anúncios de uma campanha
   */
  obterAnuncios: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const anuncios = await obterAnunciosCampanha(
          input.accessToken,
          input.campaignId
        );
        return {
          sucesso: true,
          anuncios: anuncios.data || [],
          total: anuncios.data?.length || 0,
        };
      } catch (erro) {
        if (erro instanceof MetaAdsAPIError) {
          throw new Error(formatarErroMetaAds(erro));
        }
        throw erro;
      }
    }),

  /**
   * Obtém performance de um anúncio
   */
  obterPerformanceAnuncio: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        adId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const performance = await obterPerformanceAnuncio(
          input.accessToken,
          input.adId
        );
        return {
          sucesso: true,
          performance: performance.insights?.data || [],
        };
      } catch (erro) {
        if (erro instanceof MetaAdsAPIError) {
          throw new Error(formatarErroMetaAds(erro));
        }
        throw erro;
      }
    }),
});
