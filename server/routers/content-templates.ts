import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contentTemplates } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const contentTemplatesRouter = router({
  listar: protectedProcedure
    .input(z.object({
      tipo: z.enum(["story", "reels", "tiktok", "ads", "email", "whatsapp"]).optional(),
      favorito: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(contentTemplates)
        .where(eq(contentTemplates.userId, ctx.user.id))
        .orderBy(desc(contentTemplates.updatedAt));
      let result = rows;
      if (input?.tipo) result = result.filter(t => t.tipo === input.tipo);
      if (input?.favorito !== undefined) result = result.filter(t => t.favorito === input.favorito);
      return result;
    }),

  criar: protectedProcedure
    .input(z.object({
      nome: z.string().min(1).max(255),
      tipo: z.enum(["story", "reels", "tiktok", "ads", "email", "whatsapp"]),
      descricao: z.string().max(500).optional(),
      conteudo: z.string().min(1),
      tags: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      await db.insert(contentTemplates).values({
        userId: ctx.user.id,
        nome: input.nome,
        tipo: input.tipo,
        descricao: input.descricao,
        conteudo: input.conteudo,
        tags: input.tags,
        favorito: false,
        usos: 0,
      });
      return { success: true };
    }),

  atualizar: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(1).max(255).optional(),
      descricao: z.string().max(500).optional(),
      conteudo: z.string().min(1).optional(),
      favorito: z.boolean().optional(),
      tags: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      const { id, ...fields } = input;
      await db.update(contentTemplates)
        .set(fields)
        .where(and(eq(contentTemplates.id, id), eq(contentTemplates.userId, ctx.user.id)));
      return { success: true };
    }),

  incrementarUso: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      const [tpl] = await db.select({ usos: contentTemplates.usos }).from(contentTemplates)
        .where(and(eq(contentTemplates.id, input.id), eq(contentTemplates.userId, ctx.user.id)))
        .limit(1);
      if (!tpl) throw new Error("Template não encontrado");
      await db.update(contentTemplates)
        .set({ usos: (tpl.usos ?? 0) + 1 })
        .where(eq(contentTemplates.id, input.id));
      return { success: true };
    }),

  deletar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      await db.delete(contentTemplates)
        .where(and(eq(contentTemplates.id, input.id), eq(contentTemplates.userId, ctx.user.id)));
      return { success: true };
    }),
});
