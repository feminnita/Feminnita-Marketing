import { protectedProcedure as publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  obterCampanhasGoogleAds,
  obterAnunciosGoogleAds,
  obterPerformanceCampanha,
  criarCampanhaGoogleAds,
  pausarCampanhaGoogleAds,
  formatarErroGoogleAds,
  GoogleAdsAPIError,
} from "../integrations/google-ads-api";

export const googleAdsRouter = router({
  /**
   * Obtém campanhas do Google Ads
   */
  obterCampanhas: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        customerId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado = await obterCampanhasGoogleAds(
          input.accessToken,
          input.customerId
        );
        return {
          sucesso: true,
          campanhas: resultado.results || [],
          total: resultado.results?.length || 0,
        };
      } catch (erro) {
        if (erro instanceof GoogleAdsAPIError) {
          throw new Error(formatarErroGoogleAds(erro));
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
        customerId: z.string(),
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado = await obterAnunciosGoogleAds(
          input.accessToken,
          input.customerId,
          input.campaignId
        );
        return {
          sucesso: true,
          anuncios: resultado.results || [],
          total: resultado.results?.length || 0,
        };
      } catch (erro) {
        if (erro instanceof GoogleAdsAPIError) {
          throw new Error(formatarErroGoogleAds(erro));
        }
        throw erro;
      }
    }),

  /**
   * Obtém performance de uma campanha
   */
  obterPerformance: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        customerId: z.string(),
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado = await obterPerformanceCampanha(
          input.accessToken,
          input.customerId,
          input.campaignId
        );
        return {
          sucesso: true,
          performance: resultado.results?.[0] || null,
        };
      } catch (erro) {
        if (erro instanceof GoogleAdsAPIError) {
          throw new Error(formatarErroGoogleAds(erro));
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
        customerId: z.string(),
        nome: z.string(),
        tipoCanal: z.string(),
        status: z.string(),
        orcamento: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const resultado = await criarCampanhaGoogleAds(
          input.accessToken,
          input.customerId,
          {
            name: input.nome,
            advertisingChannelType: input.tipoCanal,
            status: input.status,
            budget: input.orcamento,
          }
        );
        return {
          sucesso: true,
          resourceName: resultado.resourceName,
          mensagem: "Campanha criada com sucesso",
        };
      } catch (erro) {
        if (erro instanceof GoogleAdsAPIError) {
          throw new Error(formatarErroGoogleAds(erro));
        }
        throw erro;
      }
    }),

  /**
   * Pausa uma campanha
   */
  pausarCampanha: publicProcedure
    .input(
      z.object({
        accessToken: z.string(),
        customerId: z.string(),
        campaignId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await pausarCampanhaGoogleAds(
          input.accessToken,
          input.customerId,
          input.campaignId
        );
        return {
          sucesso: true,
          mensagem: "Campanha pausada com sucesso",
        };
      } catch (erro) {
        if (erro instanceof GoogleAdsAPIError) {
          throw new Error(formatarErroGoogleAds(erro));
        }
        throw erro;
      }
    }),
});
