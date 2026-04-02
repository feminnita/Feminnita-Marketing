import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { oauthCredentials } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Bling ERP API Integration Router - REAL IMPLEMENTATION
 * API Base: https://api.bling.com.br/Api/v3
 * Uses Client ID and Client Secret for OAuth
 */

const BLING_API_BASE = "https://api.bling.com.br/Api/v3";

export const blingRealRouter = {
  /**
   * Get Bling OAuth authorization URL
   */
  getAuthUrl: publicProcedure.query(async () => {
    try {
      const clientId = process.env.BLING_CLIENT_ID;
      if (!clientId) throw new Error("BLING_CLIENT_ID não configurado");
      const redirectUri = process.env.BLING_REDIRECT_URI || "https://your-domain.com/api/oauth/callback";

      const authUrl = `https://bling.com.br/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=produtos,pedidos,estoque,contatos`;

      return {
        success: true,
        authUrl,
      };
    } catch (error: any) {
      throw new Error(`Erro ao gerar URL de autenticação: ${error.message}`);
    }
  }),

  /**
   * Get access token from authorization code
   */
  getAccessToken: publicProcedure
    .input(z.object({
      code: z.string(),
    }))
    .mutation(async ({ input }: any) => {
      try {
        const clientId = process.env.BLING_CLIENT_ID;
        const clientSecret = process.env.BLING_CLIENT_SECRET;
        if (!clientId || !clientSecret) throw new Error("BLING_CLIENT_ID / BLING_CLIENT_SECRET não configurados");
        const redirectUri = process.env.BLING_REDIRECT_URI || "https://your-domain.com/api/oauth/callback";

        const response = await fetch(`${BLING_API_BASE}/oauth/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code: input.code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
          }).toString(),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error_description || "Erro ao obter token");
        }

        return {
          success: true,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        };
      } catch (error: any) {
        throw new Error(`Erro ao obter token: ${error.message}`);
      }
    }),

  /**
   * Sync products from Bling
   */
  syncProducts: protectedProcedure.mutation(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Get Bling credentials
      const credentials = await db
        .select()
        .from(oauthCredentials)
        .where(and(eq(oauthCredentials.platform, "bling"), eq(oauthCredentials.userId, ctx.user.id)));

      if (!credentials || credentials.length === 0) {
        throw new Error("Credenciais do Bling não configuradas");
      }

      const accessToken = credentials[0].accessToken;

      // Fetch products from Bling API
      const response = await fetch(`${BLING_API_BASE}/produtos`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao sincronizar produtos: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        products: data.data || [],
        message: `${data.data?.length || 0} produtos sincronizados`,
      };
    } catch (error: any) {
      throw new Error(`Erro ao sincronizar produtos: ${error.message}`);
    }
  }),

  /**
   * Sync orders from Bling
   */
  syncOrders: protectedProcedure.mutation(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Get Bling credentials
      const credentials = await db
        .select()
        .from(oauthCredentials)
        .where(and(eq(oauthCredentials.platform, "bling"), eq(oauthCredentials.userId, ctx.user.id)));

      if (!credentials || credentials.length === 0) {
        throw new Error("Credenciais do Bling não configuradas");
      }

      const accessToken = credentials[0].accessToken;

      // Fetch orders from Bling API
      const response = await fetch(`${BLING_API_BASE}/pedidos`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao sincronizar pedidos: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        orders: data.data || [],
        message: `${data.data?.length || 0} pedidos sincronizados`,
      };
    } catch (error: any) {
      throw new Error(`Erro ao sincronizar pedidos: ${error.message}`);
    }
  }),

  /**
   * Sync inventory/stock from Bling
   */
  syncInventory: protectedProcedure.mutation(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Get Bling credentials
      const credentials = await db
        .select()
        .from(oauthCredentials)
        .where(and(eq(oauthCredentials.platform, "bling"), eq(oauthCredentials.userId, ctx.user.id)));

      if (!credentials || credentials.length === 0) {
        throw new Error("Credenciais do Bling não configuradas");
      }

      const accessToken = credentials[0].accessToken;

      // Fetch inventory from Bling API
      const response = await fetch(`${BLING_API_BASE}/estoques`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao sincronizar estoque: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        inventory: data.data || [],
        message: `${data.data?.length || 0} itens de estoque sincronizados`,
      };
    } catch (error: any) {
      throw new Error(`Erro ao sincronizar estoque: ${error.message}`);
    }
  }),

  /**
   * Get product details from Bling
   */
  getProductDetails: protectedProcedure
    .input(z.object({
      productId: z.string(),
    }))
    .query(async ({ input, ctx }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Bling credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(and(eq(oauthCredentials.platform, "bling"), eq(oauthCredentials.userId, ctx.user.id)));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Bling não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        // Fetch product details from Bling API
        const response = await fetch(`${BLING_API_BASE}/produtos/${input.productId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Erro ao obter detalhes do produto: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          product: data.data,
        };
      } catch (error: any) {
        throw new Error(`Erro ao obter detalhes do produto: ${error.message}`);
      }
    }),

  /**
   * Check if product is in stock
   */
  checkStock: protectedProcedure
    .input(z.object({
      productId: z.string(),
    }))
    .query(async ({ input, ctx }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Bling credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(and(eq(oauthCredentials.platform, "bling"), eq(oauthCredentials.userId, ctx.user.id)));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Bling não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        // Fetch stock info from Bling API
        const response = await fetch(`${BLING_API_BASE}/produtos/${input.productId}/estoques`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Erro ao verificar estoque: ${response.statusText}`);
        }

        const data = await response.json();
        const inStock = data.data && data.data.length > 0 && data.data[0].quantidade > 0;

        return {
          success: true,
          inStock,
          quantity: data.data?.[0]?.quantidade || 0,
        };
      } catch (error: any) {
        throw new Error(`Erro ao verificar estoque: ${error.message}`);
      }
    }),

  /**
   * Disconnect Bling account
   */
  disconnect: protectedProcedure.mutation(async ({ ctx }: any) => {
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
        .where(and(eq(oauthCredentials.platform, "bling"), eq(oauthCredentials.userId, ctx.user.id)));

      return {
        success: true,
        message: "Conta Bling desconectada com sucesso",
      };
    } catch (error: any) {
      throw new Error(`Erro ao desconectar: ${error.message}`);
    }
  }),
};
