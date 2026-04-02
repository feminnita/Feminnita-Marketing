import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { drops } from "../../drizzle/schema";
import { eq, and, desc, gte } from "drizzle-orm";

export const dropsRouter = router({
  listar: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(drops)
      .where(eq(drops.userId, ctx.user.id))
      .orderBy(desc(drops.dataLancamento));
  }),

  proximos: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(drops)
      .where(and(eq(drops.userId, ctx.user.id), gte(drops.dataLancamento, new Date())))
      .orderBy(drops.dataLancamento);
  }),

  criar: protectedProcedure
    .input(z.object({
      nome: z.string().min(2),
      descricao: z.string().optional(),
      dataLancamento: z.string(), // ISO string
      categoria: z.enum(["inverno","verao","natal","dia_das_maes","dia_dos_namorados","black_friday","lancamento","outro"]),
      metaVendas: z.number().optional(),
      precoMinimo: z.string().optional(),
      precoMaximo: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(drops).values({
        userId: ctx.user.id,
        nome: input.nome,
        descricao: input.descricao,
        dataLancamento: new Date(input.dataLancamento),
        categoria: input.categoria,
        metaVendas: input.metaVendas,
        precoMinimo: input.precoMinimo,
        precoMaximo: input.precoMaximo,
        status: new Date(input.dataLancamento) > new Date() ? "agendado" : "ativo",
      });
      return { success: true };
    }),

  atualizar: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional(),
      dataLancamento: z.string().optional(),
      status: z.enum(["rascunho","agendado","ativo","encerrado"]).optional(),
      categoria: z.enum(["inverno","verao","natal","dia_das_maes","dia_dos_namorados","black_friday","lancamento","outro"]).optional(),
      metaVendas: z.number().optional(),
      vendasRealizadas: z.number().optional(),
      preListaWhatsapp: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, dataLancamento, ...rest } = input;
      await db.update(drops).set({
        ...rest,
        ...(dataLancamento ? { dataLancamento: new Date(dataLancamento) } : {}),
        updatedAt: new Date(),
      }).where(and(eq(drops.id, id), eq(drops.userId, ctx.user.id)));
      return { success: true };
    }),

  deletar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(drops).where(and(eq(drops.id, input.id), eq(drops.userId, ctx.user.id)));
      return { success: true };
    }),
});
