import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { scheduledPosts, contentItems, postHistory, ScheduledPost } from "../../drizzle/schema";
import { sql, and, eq } from "drizzle-orm";

export const scheduledPostsRouter = router({
  // Criar post agendado
  create: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        content: z.string().min(1),
        caption: z.string().optional(),
        hashtags: z.string().optional(),
        scheduledAt: z.date(),
        platforms: z.array(z.string()), // ["instagram", "tiktok", "blog"]
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Criar content item
        const contentResult = await db.insert(contentItems).values({
          userId: ctx.user.id,
          section: "scheduled_post",
          title: `Post agendado - ${new Date(input.scheduledAt).toLocaleDateString('pt-BR')}`,
          description: input.caption || input.content.substring(0, 100),
          content: input.content,
          hashtags: input.hashtags ? JSON.stringify(input.hashtags.split(' ')) : null,
          status: "scheduled",
        });

        // Criar scheduled post
        const result = await db.insert(scheduledPosts).values({
          contentId: (contentResult as any)[0].insertId || 1,
          userId: ctx.user.id,
          platforms: JSON.stringify(input.platforms),
          scheduledAt: input.scheduledAt,
          status: "pending",
        });

        return {
          success: true,
          message: "Post agendado com sucesso",
          data: result,
        };
      } catch (error) {
        console.error("Erro ao agendar post:", error);
        throw new Error("Erro ao agendar post");
      }
    }),

  // Listar posts agendados
  list: protectedProcedure
    .input(
      z.object({
        influencerId: z.number().optional(),
        status: z.enum(["pending", "processing", "published", "failed", "cancelled"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const conditions = [eq(scheduledPosts.userId, ctx.user.id)];

        if (input.status) {
          conditions.push(eq(scheduledPosts.status, input.status));
        }

        const posts = await db
          .select()
          .from(scheduledPosts)
          .where(and(...conditions))
          .orderBy(sql`${scheduledPosts.scheduledAt} DESC`);

        return {
          success: true,
          data: posts.map((post: ScheduledPost) => ({
            ...post,
            platforms: typeof post.platforms === 'string' ? JSON.parse(post.platforms) : post.platforms,
          })),
        };
      } catch (error) {
        console.error("Erro ao listar posts:", error);
        throw new Error("Erro ao listar posts");
      }
    }),

  // Atualizar post agendado
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        scheduledAt: z.date().optional(),
        platforms: z.array(z.string()).optional(),
        status: z.enum(["pending", "processing", "published", "failed", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db
          .update(scheduledPosts)
          .set({
            scheduledAt: input.scheduledAt,
            platforms: input.platforms ? JSON.stringify(input.platforms) : undefined,
            status: input.status,
            updatedAt: new Date(),
          })
          .where(and(eq(scheduledPosts.id, input.id), eq(scheduledPosts.userId, ctx.user.id)));

        return {
          success: true,
          message: "Post atualizado com sucesso",
          data: result,
        };
      } catch (error) {
        console.error("Erro ao atualizar post:", error);
        throw new Error("Erro ao atualizar post");
      }
    }),

  // Deletar post agendado
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db
          .delete(scheduledPosts)
          .where(and(eq(scheduledPosts.id, input.id), eq(scheduledPosts.userId, ctx.user.id)));

        return {
          success: true,
          message: "Post deletado com sucesso",
          data: result,
        };
      } catch (error) {
        console.error("Erro ao deletar post:", error);
        throw new Error("Erro ao deletar post");
      }
    }),

  // Publicar post agora
  publish: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        platforms: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Atualizar status para processing (com userId para garantir ownership)
        await db
          .update(scheduledPosts)
          .set({ status: "processing", updatedAt: new Date() })
          .where(and(eq(scheduledPosts.id, input.id), eq(scheduledPosts.userId, ctx.user.id)));

        // Simular publicação em plataformas
        const results = await Promise.all(
          input.platforms.map(async (platform) => {
            try {
              // Aqui você integraria com as APIs reais
              // Por enquanto, apenas registra no histórico
              await db.insert(postHistory).values({
                scheduledPostId: input.id,
                contentId: 1, // Seria obtido do scheduled post
                userId: ctx.user.id,
                platform,
                status: "success",
                postedAt: new Date(),
              });

              return { platform, success: true };
            } catch (error) {
              return { platform, success: false, error };
            }
          })
        );

        // Atualizar status para published
        const db2 = await getDb();
        if (db2) {
          await db2
            .update(scheduledPosts)
            .set({ status: "published", updatedAt: new Date() })
            .where(eq(scheduledPosts.id, input.id));
        }

        return {
          success: true,
          message: "Post publicado com sucesso",
          data: results,
        };
      } catch (error) {
        console.error("Erro ao publicar post:", error);
        // Atualizar status para failed
        const db2 = await getDb();
        if (db2) {
          await db2
            .update(scheduledPosts)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(scheduledPosts.id, input.id));
        }

        throw new Error("Erro ao publicar post");
      }
    }),

  // Obter próximos posts a publicar
  getUpcoming: protectedProcedure
    .input(
      z.object({
        hours: z.number().default(24),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const now = new Date();
        const futureDate = new Date(now.getTime() + input.hours * 60 * 60 * 1000);

        const posts = await db
          .select()
          .from(scheduledPosts)
          .where(
            and(
              eq(scheduledPosts.userId, ctx.user.id),
              eq(scheduledPosts.status, "pending"),
              sql`${scheduledPosts.scheduledAt} BETWEEN ${now} AND ${futureDate}`
            )
          )
          .orderBy(sql`${scheduledPosts.scheduledAt} ASC`);

        return {
          success: true,
          data: posts.map((post: ScheduledPost) => ({
            ...post,
            platforms: typeof post.platforms === 'string' ? JSON.parse(post.platforms) : post.platforms,
          })),
        };
      } catch (error) {
        console.error("Erro ao obter próximos posts:", error);
        throw new Error("Erro ao obter próximos posts");
      }
    }),
});
