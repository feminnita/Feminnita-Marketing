import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc, like, or } from "drizzle-orm";
import { generateBlogPost, generateBlogIdeas, improveBlogPost } from "../agents/blog-agent";
import { publishArticleToBlog } from "../services/blog-publisher";
import { TRPCError } from "@trpc/server";

export const blogRouter = router({

  // Listar posts
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "review", "published", "scheduled"]).optional(),
      search: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      let query = db.select().from(blogPosts);
      const conditions = [];
      if (input.status) conditions.push(eq(blogPosts.status, input.status));
      if (input.search) conditions.push(
        or(like(blogPosts.title, `%${input.search}%`), like(blogPosts.content, `%${input.search}%`))
      );

      const posts = await db.select().from(blogPosts)
        .orderBy(desc(blogPosts.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      return posts;
    }),

  // Buscar post por ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, input.id)).limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post não encontrado" });
      return post;
    }),

  // Gerar post com IA
  generateWithAI: protectedProcedure
    .input(z.object({
      topic: z.string().optional(),
      category: z.string().optional(),
      targetKeywords: z.array(z.string()).optional(),
      tone: z.enum(["informativo", "inspiracional", "educativo", "tendência"]).optional(),
      wordCount: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const draft = await generateBlogPost(input);
      return draft;
    }),

  // Gerar ideias
  generateIdeas: protectedProcedure
    .input(z.object({ count: z.number().default(8) }))
    .mutation(async () => {
      const ideas = await generateBlogIdeas(8);
      return { ideas };
    }),

  // Salvar post (criar ou atualizar)
  save: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string().min(1),
      excerpt: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(["draft", "review", "published", "scheduled"]).optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      coverImageUrl: z.string().optional(),
      scheduledFor: z.string().optional(),
      generatedByAI: z.boolean().optional(),
      aiPrompt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const data = {
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt ?? null,
        category: input.category ?? null,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        status: input.status ?? "draft",
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : null,
        generatedByAI: input.generatedByAI ?? false,
        aiPrompt: input.aiPrompt ?? null,
      };

      if (input.id) {
        await db.update(blogPosts).set(data).where(eq(blogPosts.id, input.id));
        const [updated] = await db.select().from(blogPosts).where(eq(blogPosts.id, input.id)).limit(1);
        return updated;
      } else {
        await db.insert(blogPosts).values(data);
        const [created] = await db.select().from(blogPosts)
          .where(eq(blogPosts.slug, input.slug)).limit(1);
        return created;
      }
    }),

  // Melhorar post com IA
  improve: protectedProcedure
    .input(z.object({
      id: z.number(),
      instructions: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, input.id)).limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post não encontrado" });

      const improved = await improveBlogPost(post.content, input.instructions);
      await db.update(blogPosts).set({ content: improved }).where(eq(blogPosts.id, input.id));
      return { content: improved };
    }),

  // Publicar post
  publish: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db.update(blogPosts).set({
        status: "published",
        publishedAt: new Date(),
      }).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  // Deletar post
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  // Publicar no blog.feminnita.com.br via GitHub → Netlify
  publishToLiveBlog: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, input.id)).limit(1);
      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post não encontrado" });

      const url = await publishArticleToBlog({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt ?? "",
        seoTitle: post.seoTitle ?? undefined,
        seoDescription: post.seoDescription ?? undefined,
        category: post.category ?? undefined,
        coverImageUrl: post.coverImageUrl ?? undefined,
        publishedAt: new Date(),
      });

      await db.update(blogPosts).set({
        status: "published",
        publishedAt: new Date(),
      }).where(eq(blogPosts.id, input.id));

      return { success: true, url };
    }),
});
