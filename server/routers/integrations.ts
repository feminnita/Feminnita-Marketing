import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { oauthCredentials } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const integrationsRouter = router({
  // Get status of all integrations
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const credentials = await db
      .select()
      .from(oauthCredentials)
      .where(eq(oauthCredentials.userId, ctx.user.id));

    const status: Record<string, any> = {
      bling: { connected: false },
      canva: { connected: false },
      meta: { connected: false },
    };

    credentials.forEach((cred) => {
      if (cred.platform === "bling") {
        status.bling = {
          connected: true,
          lastSync: cred.lastValidated,
        };
      } else if (cred.platform === "canva") {
        status.canva = {
          connected: true,
          lastSync: cred.lastValidated,
        };
      } else if (cred.platform === "meta") {
        status.meta = {
          connected: true,
          lastSync: cred.lastValidated,
        };
      }
    });

    return status;
  }),

  // Test Bling connection
  testBlingConnection: protectedProcedure
    .input(
      z.object({
        apiKey: z.string().min(1, "API Key é obrigatória"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch("https://api.bling.com.br/Api/v3/contatos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${input.apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          return { success: false, message: "Token/API Key inválido" };
        } else if (response.status === 403) {
          return { success: false, message: "Acesso negado - verifique as permissões" };
        } else if (response.ok) {
          return { success: true, message: "Conexão com Bling validada com sucesso!" };
        } else {
          return { success: false, message: "Bling indisponível no momento" };
        }
      } catch (error: any) {
        return { success: false, message: `Erro ao conectar: ${error.message}` };
      }
    }),

  // Connect Bling
  connectBling: protectedProcedure
    .input(
      z.object({
        apiKey: z.string().min(1, "API Key é obrigatória"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Test connection to Bling API
        const response = await fetch("https://api.bling.com.br/Api/v3/contatos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${input.apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Token/API Key inválido");
          } else if (response.status === 403) {
            throw new Error("Acesso negado - verifique as permissões");
          } else {
            throw new Error("Bling indisponível");
          }
        }

        // Delete existing Bling credential
        await db
          .delete(oauthCredentials)
          .where(
            and(
              eq(oauthCredentials.userId, ctx.user.id),
              eq(oauthCredentials.platform, "bling")
            )
          );

        // Save new credential
        await db.insert(oauthCredentials).values({
          userId: ctx.user.id,
          platform: "bling",
          accessToken: input.apiKey,
          refreshToken: null,
          expiresAt: null,
          lastValidated: new Date(),
        });

        return { success: true, message: "Bling conectado com sucesso" };
      } catch (error: any) {
        throw new Error(`Erro ao conectar Bling: ${error.message}`);
      }
    }),

  // Test Canva connection
  testCanvaConnection: protectedProcedure
    .input(
      z.object({
        clientId: z.string().min(1),
        clientSecret: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch("https://api.canva.com/rest/v1/brand", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${input.clientId}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          return { success: true, message: "Conexão com Canva validada com sucesso!" };
        } else if (response.status === 401) {
          return { success: false, message: "Credenciais do Canva inválidas" };
        } else {
          return { success: false, message: "Canva indisponível no momento" };
        }
      } catch (error: any) {
        return { success: false, message: `Erro ao conectar: ${error.message}` };
      }
    }),

  // Connect Canva
  connectCanva: protectedProcedure
    .input(
      z.object({
        clientId: z.string().min(1, "Client ID é obrigatório"),
        clientSecret: z.string().min(1, "Client Secret é obrigatório"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Test connection to Canva API
        const response = await fetch("https://api.canva.com/rest/v1/brand", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${input.clientId}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Credenciais do Canva inválidas ou Canva indisponível");
        }

        // Delete existing Canva credential
        await db
          .delete(oauthCredentials)
          .where(
            and(
              eq(oauthCredentials.userId, ctx.user.id),
              eq(oauthCredentials.platform, "canva")
            )
          );

        // Save new credential
        await db.insert(oauthCredentials).values({
          userId: ctx.user.id,
          platform: "canva",
          accessToken: input.clientId,
          refreshToken: input.clientSecret,
          expiresAt: null,
          lastValidated: new Date(),
        });

        return { success: true, message: "Canva conectada com sucesso" };
      } catch (error: any) {
        throw new Error(`Erro ao conectar Canva: ${error.message}`);
      }
    }),

  // Test Meta connection
  testMetaConnection: protectedProcedure
    .input(
      z.object({
        appId: z.string().min(1),
        appSecret: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          `https://graph.instagram.com/v18.0/me?access_token=${input.appId}`
        );

        if (response.ok) {
          return { success: true, message: "Conexão com Meta validada com sucesso!" };
        } else if (response.status === 401) {
          return { success: false, message: "App ID/Secret inválidos" };
        } else {
          return { success: false, message: "Meta indisponível no momento" };
        }
      } catch (error: any) {
        return { success: false, message: `Erro ao conectar: ${error.message}` };
      }
    }),

  // Connect Meta
  connectMeta: protectedProcedure
    .input(
      z.object({
        appId: z.string().min(1, "App ID é obrigatório"),
        appSecret: z.string().min(1, "App Secret é obrigatório"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Test connection to Meta Graph API
        const response = await fetch(
          `https://graph.instagram.com/v18.0/me?access_token=${input.appId}`
        );

        if (!response.ok) {
          throw new Error("App ID/Secret inválidos ou Meta indisponível");
        }

        // Delete existing Meta credential
        await db
          .delete(oauthCredentials)
          .where(
            and(
              eq(oauthCredentials.userId, ctx.user.id),
              eq(oauthCredentials.platform, "meta")
            )
          );

        // Save new credential
        await db.insert(oauthCredentials).values({
          userId: ctx.user.id,
          platform: "meta",
          accessToken: input.appId,
          refreshToken: input.appSecret,
          expiresAt: null,
          lastValidated: new Date(),
        });

        return { success: true, message: "Meta conectada com sucesso" };
      } catch (error: any) {
        throw new Error(`Erro ao conectar Meta: ${error.message}`);
      }
    }),

  // Disconnect integration
  disconnect: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["bling", "canva", "meta"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(oauthCredentials)
        .where(
          and(
            eq(oauthCredentials.userId, ctx.user.id),
            eq(oauthCredentials.platform, input.platform)
          )
        );

      return { success: true, message: `${input.platform} desconectado com sucesso` };
    }),

  // Get Bling products
  getBlingProducts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const credential = await db
      .select()
      .from(oauthCredentials)
      .where(
        and(
          eq(oauthCredentials.userId, ctx.user.id),
          eq(oauthCredentials.platform, "bling")
        )
      )
      .limit(1);

    if (!credential.length) {
      throw new Error("Bling não conectado");
    }

    try {
      const response = await fetch("https://api.bling.com.br/Api/v3/produtos", {
        headers: {
          Authorization: `Bearer ${credential[0].accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar produtos do Bling");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(`Erro: ${error.message}`);
    }
  }),

  // Get Bling orders
  getBlingOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const credential = await db
      .select()
      .from(oauthCredentials)
      .where(
        and(
          eq(oauthCredentials.userId, ctx.user.id),
          eq(oauthCredentials.platform, "bling")
        )
      )
      .limit(1);

    if (!credential.length) {
      throw new Error("Bling não conectado");
    }

    try {
      const response = await fetch("https://api.bling.com.br/Api/v3/pedidos", {
        headers: {
          Authorization: `Bearer ${credential[0].accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar pedidos do Bling");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(`Erro: ${error.message}`);
    }
  }),
});
