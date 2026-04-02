import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { oauthCredentials, designHistory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Canva API Integration Router
 * Handles design generation and template management
 */

export const canvaIntegrationRouter = {
  /**
   * Generate a design using Canva API
   * Creates a new design based on a template
   */
  generateDesign: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      title: z.string(),
      designType: z.enum(["instagram_post", "instagram_story", "tiktok", "youtube_thumbnail", "blog_header"]),
      content: z.object({
        text: z.string().optional(),
        imageUrl: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Canva credentials from database
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(and(eq(oauthCredentials.platform, "canva"), eq(oauthCredentials.userId, ctx.user.id)));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Canva não configuradas");
        }

        const accessToken = credentials[0].clientSecret;

        // Chamar Canva API para criar o design
        try {
          const canvaRes = await fetch("https://api.canva.com/rest/v1/designs", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: input.title,
              design_type: { name: input.designType },
              asset_id: input.templateId,
            }),
          });

          if (canvaRes.status === 401 || canvaRes.status === 403) {
            // Token inválido ou expirado - retornar pending_token ao invés de throw
            console.warn("[Canva] Token inválido ou expirado, retornando pending_token");
            return {
              success: false,
              message: "Token do Canva inválido ou expirado. Reconecte sua conta Canva.",
              design: {
                id: `design_${Date.now()}`,
                title: input.title,
                type: input.designType,
                templateId: input.templateId,
                status: "pending_token",
                createdAt: new Date(),
              },
            };
          }

          if (!canvaRes.ok) {
            const errText = await canvaRes.text();
            console.error(`[Canva] Erro ao criar design: ${errText}`);
            return {
              success: false,
              message: `Erro na API do Canva: ${canvaRes.status}`,
              design: {
                id: `design_${Date.now()}`,
                title: input.title,
                type: input.designType,
                templateId: input.templateId,
                status: "pending_token",
                createdAt: new Date(),
              },
            };
          }

          const canvaData = await canvaRes.json() as {
            design?: { id?: string; title?: string; urls?: { edit_url?: string; view_url?: string } };
          };

          return {
            success: true,
            message: "Design gerado com sucesso",
            design: {
              id: canvaData.design?.id ?? `design_${Date.now()}`,
              title: canvaData.design?.title ?? input.title,
              type: input.designType,
              templateId: input.templateId,
              status: "draft",
              editUrl: canvaData.design?.urls?.edit_url ?? null,
              viewUrl: canvaData.design?.urls?.view_url ?? null,
              createdAt: new Date(),
            },
          };
        } catch (apiError: any) {
          console.warn("[Canva] Falha na chamada à API, retornando pending_token:", apiError);
          return {
            success: false,
            message: "Não foi possível conectar à API do Canva.",
            design: {
              id: `design_${Date.now()}`,
              title: input.title,
              type: input.designType,
              templateId: input.templateId,
              status: "pending_token",
              createdAt: new Date(),
            },
          };
        }
      } catch (error: any) {
        throw new Error(`Erro ao gerar design: ${error.message}`);
      }
    }),

  /**
   * Get available Canva templates
   */
  getTemplates: protectedProcedure
    .input(z.object({
      designType: z.enum(["instagram_post", "instagram_story", "tiktok", "youtube_thumbnail", "blog_header"]).optional(),
    }))
    .query(async ({ input }: any) => {
      try {
        const defaultTemplates = [
          {
            id: "template_1",
            name: "Instagram Post - Produto",
            type: "instagram_post",
            thumbnail: null as string | null,
            category: "ecommerce",
          },
          {
            id: "template_2",
            name: "Instagram Story - Promoção",
            type: "instagram_story",
            thumbnail: null as string | null,
            category: "promotion",
          },
          {
            id: "template_3",
            name: "TikTok Video - Trend",
            type: "tiktok",
            thumbnail: null as string | null,
            category: "viral",
          },
          {
            id: "template_4",
            name: "YouTube Thumbnail",
            type: "youtube_thumbnail",
            thumbnail: null as string | null,
            category: "video",
          },
          {
            id: "template_5",
            name: "Blog Header - Artigo",
            type: "blog_header",
            thumbnail: null as string | null,
            category: "content",
          },
        ];

        const accessToken = process.env.CANVA_ACCESS_TOKEN;

        if (accessToken) {
          try {
            const query = input.designType ?? "";
            const canvaRes = await fetch(
              `https://api.canva.com/rest/v1/designs?query=${encodeURIComponent(query)}&ownership=any&limit=20`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (canvaRes.ok) {
              const canvaData = await canvaRes.json() as {
                items?: Array<{
                  id: string;
                  title: string;
                  thumbnail?: { url?: string };
                  design_type?: { name?: string };
                }>;
              };

              if (canvaData.items && canvaData.items.length > 0) {
                const canvaTemplates = canvaData.items.map((item) => ({
                  id: item.id,
                  name: item.title,
                  type: item.design_type?.name ?? (input.designType ?? "instagram_post"),
                  thumbnail: item.thumbnail?.url ?? null,
                  category: "canva",
                }));

                const filtered = input.designType
                  ? canvaTemplates.filter(t => t.type === input.designType)
                  : canvaTemplates;

                return {
                  success: true,
                  templates: filtered,
                  total: filtered.length,
                };
              }
            } else {
              console.warn(`[Canva] getTemplates API respondeu ${canvaRes.status}, usando templates padrão`);
            }
          } catch (apiError) {
            console.warn("[Canva] Falha ao buscar templates da API, usando templates padrão:", apiError);
          }
        }

        // Fallback: retornar templates default estruturados
        const filtered = input.designType
          ? defaultTemplates.filter(t => t.type === input.designType)
          : defaultTemplates;

        return {
          success: true,
          templates: filtered,
          total: filtered.length,
        };
      } catch (error: any) {
        throw new Error(`Erro ao buscar templates: ${error.message}`);
      }
    }),

  /**
   * Publish a design to social media
   */
  publishDesign: protectedProcedure
    .input(z.object({
      designId: z.string(),
      platform: z.enum(["instagram", "tiktok", "youtube", "facebook"]),
      scheduleTime: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      // Publicar um design do Canva requer exportar a imagem via Canva API
      // e então publicar via Meta Graph API. Configure CANVA_ACCESS_TOKEN e
      // META_ACCESS_TOKEN para habilitar esta funcionalidade.
      throw new Error(
        "Publicação de designs do Canva ainda não implementada. " +
        "Exporte o design manualmente do Canva e publique via Meta Business Suite."
      );
    }),

  /**
   * Get design history
   */
  getDesignHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(50),
    }).optional())
    .query(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) return { success: true, designs: [], total: 0 };

        const rows = await db
          .select()
          .from(designHistory)
          .where(eq(designHistory.userId, ctx.user.id))
          .orderBy(desc(designHistory.createdAt))
          .limit(input?.limit ?? 50);

        return {
          success: true,
          designs: rows,
          total: rows.length,
        };
      } catch (error: any) {
        throw new Error(`Erro ao buscar histórico: ${error.message}`);
      }
    }),

  saveDesignHistory: protectedProcedure
    .input(z.object({
      designId: z.string(),
      designName: z.string(),
      designType: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      editUrl: z.string().optional(),
      exportUrl: z.string().optional(),
      status: z.enum(["draft", "exported", "published"]).optional().default("draft"),
      influencerId: z.number().optional(),
      campaignId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db.insert(designHistory).values({
          userId: ctx.user.id,
          designId: input.designId,
          designName: input.designName,
          designType: input.designType,
          thumbnailUrl: input.thumbnailUrl,
          editUrl: input.editUrl,
          exportUrl: input.exportUrl,
          status: input.status ?? "draft",
          influencerId: input.influencerId,
          campaignId: input.campaignId,
          notes: input.notes,
        });

        return { success: true };
      } catch (error: any) {
        throw new Error(`Erro ao salvar histórico: ${error.message}`);
      }
    }),

  updateDesignStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "exported", "published"]),
    }))
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        await db
          .update(designHistory)
          .set({ status: input.status })
          .where(and(eq(designHistory.id, input.id), eq(designHistory.userId, ctx.user.id)));

        return { success: true };
      } catch (error: any) {
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }
    }),

  /**
   * Batch generate designs for multiple posts
   */
  batchGenerateDesigns: protectedProcedure
    .input(z.object({
      posts: z.array(z.object({
        title: z.string(),
        content: z.string(),
        designType: z.enum(["instagram_post", "instagram_story", "tiktok", "youtube_thumbnail", "blog_header"]),
      })),
      templateId: z.string(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(and(eq(oauthCredentials.platform, "canva"), eq(oauthCredentials.userId, ctx.user.id)));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Canva não configuradas");
        }

        const accessToken = credentials[0].clientSecret;
        const designs = [];

        for (const post of input.posts) {
          try {
            const canvaRes = await fetch("https://api.canva.com/rest/v1/designs", {
              method: "POST",
              headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                title: post.title,
                design_type: { name: post.designType },
                asset_id: input.templateId,
              }),
            });

            if (canvaRes.ok) {
              const canvaData = await canvaRes.json() as { design?: { id?: string; title?: string; urls?: { edit_url?: string } } };
              designs.push({
                id: canvaData.design?.id ?? `design_${Date.now()}`,
                title: canvaData.design?.title ?? post.title,
                type: post.designType,
                status: "draft",
                editUrl: canvaData.design?.urls?.edit_url ?? null,
                createdAt: new Date(),
              });
            } else {
              designs.push({
                id: `design_${Date.now()}`,
                title: post.title,
                type: post.designType,
                status: "pending_token",
                editUrl: null,
                createdAt: new Date(),
              });
            }
          } catch {
            designs.push({
              id: `design_${Date.now()}`,
              title: post.title,
              type: post.designType,
              status: "pending_token",
              editUrl: null,
              createdAt: new Date(),
            });
          }
        }

        return {
          success: true,
          message: `${designs.length} designs gerados com sucesso`,
          designs,
          total: designs.length,
        };
      } catch (error: any) {
        throw new Error(`Erro ao gerar designs em lote: ${error.message}`);
      }
    }),
};
