import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { oauthCredentials } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Canva API Integration Router - REAL IMPLEMENTATION
 * API Base: https://api.canva.com/rest/v1/
 * Uses Client ID and Client Secret for OAuth
 */

const CANVA_API_BASE = "https://api.canva.com/rest/v1";

export const canvaRealRouter = {
  /**
   * Get Canva OAuth authorization URL
   */
  getAuthUrl: publicProcedure.query(async () => {
    try {
      const clientId = "OC-AZwe5Lb9Mj6o";
      const redirectUri = process.env.CANVA_REDIRECT_URI || "https://your-domain.com/api/oauth/callback";
      
      const authUrl = `https://www.canva.com/api/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=design:read,design:write,asset:read,asset:write`;

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
        const clientId = "OC-AZwe5Lb9Mj6o";
        const clientSecret = "CANVA_CLIENT_SECRET_REMOVED";
        const redirectUri = process.env.CANVA_REDIRECT_URI || "https://your-domain.com/api/oauth/callback";

        const response = await fetch(`${CANVA_API_BASE}/oauth/token`, {
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
   * Create a new design
   */
  createDesign: protectedProcedure
    .input(z.object({
      title: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
    }))
    .mutation(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Canva credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(eq(oauthCredentials.platform, "canva"));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Canva não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        // Create design via Canva API
        const response = await fetch(`${CANVA_API_BASE}/designs`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: input.title,
            width: input.width || 1080,
            height: input.height || 1080,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao criar design: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          design: data,
          designId: data.id,
          editUrl: data.urls?.edit,
        };
      } catch (error: any) {
        throw new Error(`Erro ao criar design: ${error.message}`);
      }
    }),

  /**
   * Get design details
   */
  getDesignDetails: protectedProcedure
    .input(z.object({
      designId: z.string(),
    }))
    .query(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Canva credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(eq(oauthCredentials.platform, "canva"));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Canva não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        // Get design details from Canva API
        const response = await fetch(`${CANVA_API_BASE}/designs/${input.designId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Erro ao obter detalhes do design: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          design: data,
        };
      } catch (error: any) {
        throw new Error(`Erro ao obter detalhes do design: ${error.message}`);
      }
    }),

  /**
   * Export design
   */
  exportDesign: protectedProcedure
    .input(z.object({
      designId: z.string(),
      format: z.enum(["PNG", "PDF", "JPG"]).optional(),
    }))
    .mutation(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Canva credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(eq(oauthCredentials.platform, "canva"));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Canva não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        // Export design via Canva API
        const response = await fetch(`${CANVA_API_BASE}/designs/${input.designId}/exports`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            format: input.format || "PNG",
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao exportar design: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          exportId: data.id,
          status: data.status,
          downloadUrl: data.urls?.download,
        };
      } catch (error: any) {
        throw new Error(`Erro ao exportar design: ${error.message}`);
      }
    }),

  /**
   * List user designs
   */
  listDesigns: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Get Canva credentials
      const credentials = await db
        .select()
        .from(oauthCredentials)
        .where(eq(oauthCredentials.platform, "canva"));

      if (!credentials || credentials.length === 0) {
        throw new Error("Credenciais do Canva não configuradas");
      }

      const accessToken = credentials[0].accessToken;

      // List designs from Canva API
      const response = await fetch(`${CANVA_API_BASE}/designs`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao listar designs: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        designs: data.items || [],
        total: data.total || 0,
      };
    } catch (error: any) {
      throw new Error(`Erro ao listar designs: ${error.message}`);
    }
  }),

  /**
   * Disconnect Canva account
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
        .where(eq(oauthCredentials.platform, "canva"));

      return {
        success: true,
        message: "Conta Canva desconectada com sucesso",
      };
    } catch (error: any) {
      throw new Error(`Erro ao desconectar: ${error.message}`);
    }
  }),
};
