import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { ugcSubmissions } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const ugcRouter = router({
  listar: protectedProcedure
    .input(z.object({ status: z.enum(["pendente","aprovado","rejeitado","republicado"]).optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(ugcSubmissions)
        .where(eq(ugcSubmissions.userId, ctx.user.id))
        .orderBy(desc(ugcSubmissions.createdAt))
        .limit(200);
      if (input.status) return rows.filter(r => r.status === input.status);
      return rows;
    }),

  adicionar: protectedProcedure
    .input(z.object({
      plataforma: z.enum(["instagram","tiktok","whatsapp","twitter","outro"]),
      autorHandle: z.string().optional(),
      autorNome: z.string().optional(),
      conteudoUrl: z.string().optional(),
      conteudoTexto: z.string().optional(),
      tipo: z.enum(["foto","video","story","reels","depoimento"]),
      tags: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(ugcSubmissions).values({ userId: ctx.user.id, ...input });
      return { success: true };
    }),

  aprovar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(ugcSubmissions).set({ status: "aprovado", updatedAt: new Date() })
        .where(and(eq(ugcSubmissions.id, input.id), eq(ugcSubmissions.userId, ctx.user.id)));
      return { success: true };
    }),

  rejeitar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(ugcSubmissions).set({ status: "rejeitado", updatedAt: new Date() })
        .where(and(eq(ugcSubmissions.id, input.id), eq(ugcSubmissions.userId, ctx.user.id)));
      return { success: true };
    }),

  marcarRepublicado: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(ugcSubmissions).set({ status: "republicado", updatedAt: new Date() })
        .where(and(eq(ugcSubmissions.id, input.id), eq(ugcSubmissions.userId, ctx.user.id)));
      return { success: true };
    }),

  marcarAutorizacao: protectedProcedure
    .input(z.object({ id: z.number(), autorizado: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(ugcSubmissions).set({ autorizacaoObtida: input.autorizado, updatedAt: new Date() })
        .where(and(eq(ugcSubmissions.id, input.id), eq(ugcSubmissions.userId, ctx.user.id)));
      return { success: true };
    }),

  deletar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(ugcSubmissions)
        .where(and(eq(ugcSubmissions.id, input.id), eq(ugcSubmissions.userId, ctx.user.id)));
      return { success: true };
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { total: 0, pendentes: 0, aprovados: 0, republicados: 0 };
    const all = await db.select().from(ugcSubmissions).where(eq(ugcSubmissions.userId, ctx.user.id));
    return {
      total: all.length,
      pendentes: all.filter(u => u.status === "pendente").length,
      aprovados: all.filter(u => u.status === "aprovado").length,
      republicados: all.filter(u => u.status === "republicado").length,
    };
  }),
});
