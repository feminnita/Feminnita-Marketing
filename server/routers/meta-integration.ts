import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { oauthCredentials } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Meta (Facebook/Instagram) API Integration Router
 * Handles campaign management and ad performance tracking
 */

export const metaIntegrationRouter = {
  /**
   * Get Meta OAuth authorization URL
   */
  getAuthUrl: publicProcedure
    .query(async () => {
      try {
        const clientId = process.env.META_CLIENT_ID || "";
        const redirectUri = process.env.META_REDIRECT_URI || "https://your-domain.com/api/oauth/callback";
        
        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=ads_management,instagram_basic,pages_read_engagement,pages_manage_metadata`;

        return {
          success: true,
          authUrl,
        };
      } catch (error: any) {
        throw new Error(`Erro ao gerar URL de autenticação: ${error.message}`);
      }
    }),

  /**
   * Save Meta credentials after OAuth callback
   */
  saveCredentials: protectedProcedure
    .input(z.object({
      accessToken: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Check if credentials already exist
        const existing = await db
          .select()
          .from(oauthCredentials)
          .where(and(eq(oauthCredentials.platform, "meta"), eq(oauthCredentials.userId, ctx.user.id)));

        if (existing && existing.length > 0) {
          // Update existing credentials
          await db
            .update(oauthCredentials)
            .set({
              accessToken: input.accessToken,
              refreshToken: input.refreshToken,
              expiresAt: input.expiresAt,
              isConnected: true,
              lastValidated: new Date(),
            })
            .where(and(eq(oauthCredentials.platform, "meta"), eq(oauthCredentials.userId, ctx.user.id)));
        } else {
          // Create new credentials
          await db.insert(oauthCredentials).values({
            userId: ctx.user.id,
            platform: "meta",
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            expiresAt: input.expiresAt,
            isConnected: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return {
          success: true,
          message: "Credenciais do Meta salvas com sucesso",
        };
      } catch (error: any) {
        throw new Error(`Erro ao salvar credenciais: ${error.message}`);
      }
    }),

  /**
   * Get Meta ad accounts
   */
  getAdAccounts: protectedProcedure
    .query(async ({ ctx }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Meta credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(and(eq(oauthCredentials.platform, "meta"), eq(oauthCredentials.userId, ctx.user.id)));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Meta não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        const response = await fetch(
          `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_status,currency&access_token=${accessToken}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Erro ao buscar contas de anúncios");
        }

        const accounts = (data.data || []).map((acc: any) => ({
          id: acc.id,
          name: acc.name,
          status: acc.account_status === 1 ? "ACTIVE" : "INACTIVE",
          currency: acc.currency,
        }));

        return {
          success: true,
          accounts,
        };
      } catch (error: any) {
        throw new Error(`Erro ao buscar contas de anúncios: ${error.message}`);
      }
    }),

  /**
   * Create a new Meta ad campaign
   */
  createCampaign: protectedProcedure
    .input(z.object({
      name: z.string(),
      objective: z.enum(["REACH", "TRAFFIC", "CONVERSIONS", "LEADS", "APP_INSTALLS"]),
      budget: z.number(),
      startDate: z.date(),
      endDate: z.date().optional(),
      targetAudience: z.object({
        ageMin: z.number().optional(),
        ageMax: z.number().optional(),
        genders: z.array(z.enum(["male", "female", "all"])).optional(),
        locations: z.array(z.string()).optional(),
        interests: z.array(z.string()).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Meta credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(and(eq(oauthCredentials.platform, "meta"), eq(oauthCredentials.userId, ctx.user.id)));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Meta não configuradas");
        }

        const accessToken = credentials[0].accessToken;
        const adAccountId = process.env.META_AD_ACCOUNT_ID;
        if (!adAccountId) {
          throw new Error("META_AD_ACCOUNT_ID não configurado nas variáveis de ambiente");
        }

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${adAccountId}/campaigns`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: input.name,
              objective: input.objective,
              daily_budget: Math.round(input.budget * 100), // centavos
              start_time: input.startDate.toISOString(),
              ...(input.endDate ? { end_time: input.endDate.toISOString() } : {}),
              status: "PAUSED",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Erro ao criar campanha no Meta");
        }

        return {
          success: true,
          message: "Campanha criada com sucesso",
          campaign: {
            id: data.id,
            name: input.name,
            objective: input.objective,
            budget: input.budget,
            status: "PAUSED",
            createdAt: new Date(),
          },
        };
      } catch (error: any) {
        throw new Error(`Erro ao criar campanha: ${error.message}`);
      }
    }),

  /**
   * Get campaign performance metrics
   */
  getCampaignMetrics: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
    }))
    .query(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(and(eq(oauthCredentials.platform, "meta"), eq(oauthCredentials.userId, ctx.user.id)));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Meta não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${input.campaignId}/insights?fields=impressions,clicks,spend,actions,cpc,ctr&access_token=${accessToken}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Erro ao buscar métricas");
        }

        const insights = data.data?.[0] || {};
        const conversions = (insights.actions || [])
          .filter((a: any) => a.action_type === "purchase" || a.action_type === "lead")
          .reduce((sum: number, a: any) => sum + Number(a.value || 0), 0);
        const spend = parseFloat(insights.spend || "0");
        const roas = spend > 0 ? conversions / spend : 0;

        return {
          success: true,
          metrics: {
            impressions: parseInt(insights.impressions || "0"),
            clicks: parseInt(insights.clicks || "0"),
            conversions,
            spend,
            roas: parseFloat(roas.toFixed(2)),
            cpc: parseFloat(insights.cpc || "0"),
            ctr: parseFloat(insights.ctr || "0"),
          },
        };
      } catch (error: any) {
        throw new Error(`Erro ao buscar métricas: ${error.message}`);
      }
    }),

  /**
   * Pause a campaign
   */
  pauseCampaign: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        const credentials = await db.select().from(oauthCredentials).where(and(eq(oauthCredentials.platform, "meta"), eq(oauthCredentials.userId, ctx.user.id)));
        if (!credentials || credentials.length === 0) throw new Error("Credenciais do Meta não configuradas");

        const response = await fetch(`https://graph.facebook.com/v18.0/${input.campaignId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${credentials[0].accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PAUSED" }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Erro ao pausar campanha");

        return {
          success: true,
          message: "Campanha pausada com sucesso",
          campaign: { id: input.campaignId, status: "PAUSED" },
        };
      } catch (error: any) {
        throw new Error(`Erro ao pausar campanha: ${error.message}`);
      }
    }),

  /**
   * Resume a campaign
   */
  resumeCampaign: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");
        const credentials = await db.select().from(oauthCredentials).where(and(eq(oauthCredentials.platform, "meta"), eq(oauthCredentials.userId, ctx.user.id)));
        if (!credentials || credentials.length === 0) throw new Error("Credenciais do Meta não configuradas");

        const response = await fetch(`https://graph.facebook.com/v18.0/${input.campaignId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${credentials[0].accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ACTIVE" }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Erro ao retomar campanha");

        return {
          success: true,
          message: "Campanha retomada com sucesso",
          campaign: { id: input.campaignId, status: "ACTIVE" },
        };
      } catch (error: any) {
        throw new Error(`Erro ao retomar campanha: ${error.message}`);
      }
    }),

  /**
   * Disconnect Meta account
   */
  disconnect: protectedProcedure
    .mutation(async ({ ctx }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db
          .update(oauthCredentials)
          .set({
            isConnected: false,
            accessToken: null,
            refreshToken: null,
          })
          .where(and(eq(oauthCredentials.platform, "meta"), eq(oauthCredentials.userId, ctx.user.id)));

        return {
          success: true,
          message: "Conta Meta desconectada com sucesso",
        };
      } catch (error: any) {
        throw new Error(`Erro ao desconectar: ${error.message}`);
      }
    }),
};
