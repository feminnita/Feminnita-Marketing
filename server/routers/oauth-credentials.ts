import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { oauthCredentials } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const oauthCredentialsRouter = router({
  // Salvar credenciais OAuth
  saveCredentials: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["bling", "canva", "meta", "tiktok", "google_drive", "whatsapp", "email_marketing", "tray"]),
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verificar se já existe credencial para esta plataforma
        const existing = await db
          .select()
          .from(oauthCredentials)
          .where(
            and(
              eq(oauthCredentials.userId, ctx.user.id),
              eq(oauthCredentials.platform, input.platform)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          // Atualizar credencial existente
          const existingCred = existing[0];
          await db
            .update(oauthCredentials)
            .set({
              clientId: input.clientId || existingCred.clientId,
              clientSecret: input.clientSecret || existingCred.clientSecret,
              accessToken: input.accessToken || existingCred.accessToken,
              refreshToken: input.refreshToken || existingCred.refreshToken,
              isConnected: !!(input.clientId || input.accessToken),
              lastValidated: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(oauthCredentials.id, existingCred.id));
        } else {
          // Criar nova credencial
          await db.insert(oauthCredentials).values({
            userId: ctx.user.id,
            platform: input.platform,
            clientId: input.clientId || null,
            clientSecret: input.clientSecret || null,
            accessToken: input.accessToken || null,
            refreshToken: input.refreshToken || null,
            isConnected: !!(input.clientId || input.accessToken),
            lastValidated: new Date(),
          });
        }

        return {
          success: true,
          message: `Credenciais de ${input.platform} salvas com sucesso!`,
        };
      } catch (error) {
        console.error("Erro ao salvar credenciais:", error);
        throw new Error(`Erro ao salvar credenciais: ${error}`);
      }
    }),

  // Obter credenciais de uma plataforma
  getCredentials: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["bling", "canva", "meta", "tiktok", "google_drive", "whatsapp", "email_marketing", "tray"]),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(
            and(
              eq(oauthCredentials.userId, ctx.user.id),
              eq(oauthCredentials.platform, input.platform)
            )
          )
          .limit(1);

        if (credentials.length === 0) {
          return null;
        }

        // Não retornar secrets completos por segurança
        const cred = credentials[0];
        return {
          id: cred.id,
          platform: cred.platform,
          clientId: cred.clientId ? cred.clientId.substring(0, 10) + "..." : null,
          isConnected: cred.isConnected,
          lastValidated: cred.lastValidated,
          createdAt: cred.createdAt,
        };
      } catch (error) {
        console.error("Erro ao obter credenciais:", error);
        throw new Error(`Erro ao obter credenciais: ${error}`);
      }
    }),

  // Listar todas as credenciais do usuário
  listCredentials: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const credentials = await db
        .select()
        .from(oauthCredentials)
        .where(eq(oauthCredentials.userId, ctx.user.id));

      return credentials.map((cred: any) => ({
        id: cred.id,
        platform: cred.platform,
        clientId: cred.clientId ? cred.clientId.substring(0, 10) + "..." : null,
        isConnected: cred.isConnected,
        lastValidated: cred.lastValidated,
        createdAt: cred.createdAt,
      }));
    } catch (error) {
      console.error("Erro ao listar credenciais:", error);
      throw new Error(`Erro ao listar credenciais: ${error}`);
    }
  }),

  // Deletar credenciais
  deleteCredentials: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["bling", "canva", "meta", "tiktok", "google_drive", "whatsapp", "email_marketing", "tray"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
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

        return {
          success: true,
          message: `Credenciais de ${input.platform} deletadas com sucesso!`,
        };
      } catch (error) {
        console.error("Erro ao deletar credenciais:", error);
        throw new Error(`Erro ao deletar credenciais: ${error}`);
      }
    }),

  // Validar credenciais
  validateCredentials: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["bling", "canva", "meta", "tiktok", "google_drive", "whatsapp", "email_marketing", "tray"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(
            and(
              eq(oauthCredentials.userId, ctx.user.id),
              eq(oauthCredentials.platform, input.platform)
            )
          )
          .limit(1);

        if (credentials.length === 0) {
          return {
            success: false,
            message: `Nenhuma credencial encontrada para ${input.platform}`,
          };
        }

        const cred = credentials[0];

        // Validação básica
        if (!cred.clientId && !cred.accessToken) {
          return {
            success: false,
            message: `Credenciais incompletas para ${input.platform}`,
          };
        }

        // Atualizar lastValidated
        await db
          .update(oauthCredentials)
          .set({
            lastValidated: new Date(),
          })
          .where(eq(oauthCredentials.id, cred.id));

        return {
          success: true,
          message: `Credenciais de ${input.platform} validadas com sucesso!`,
        };
      } catch (error) {
        console.error("Erro ao validar credenciais:", error);
        throw new Error(`Erro ao validar credenciais: ${error}`);
      }
    }),
});
