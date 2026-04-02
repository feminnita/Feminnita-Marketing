import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { cupons } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const cuponsRouter = router({
  listar: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(cupons)
      .where(eq(cupons.userId, ctx.user.id))
      .orderBy(desc(cupons.createdAt));
  }),

  criar: protectedProcedure
    .input(z.object({
      codigo: z.string().min(3).max(50).toUpperCase(),
      desconto: z.string().min(1).max(50),
      tipo: z.enum(["percentual", "valor_fixo", "frete_gratis"]),
      persona: z.string().optional(),
      campanha: z.string().optional(),
      maxUsos: z.number().int().positive().optional(),
      dataExpiracao: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      await db.insert(cupons).values({
        userId: ctx.user.id,
        codigo: input.codigo.toUpperCase(),
        desconto: input.desconto,
        tipo: input.tipo,
        persona: input.persona,
        campanha: input.campanha,
        maxUsos: input.maxUsos,
        dataExpiracao: input.dataExpiracao,
        observacoes: input.observacoes,
        usos: 0,
        ativo: true,
      });
      return { success: true };
    }),

  atualizar: protectedProcedure
    .input(z.object({
      id: z.number(),
      ativo: z.boolean().optional(),
      campanha: z.string().optional(),
      maxUsos: z.number().int().positive().optional(),
      dataExpiracao: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      const { id, ...fields } = input;
      await db.update(cupons)
        .set(fields)
        .where(and(eq(cupons.id, id), eq(cupons.userId, ctx.user.id)));
      return { success: true };
    }),

  deletar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      await db.delete(cupons)
        .where(and(eq(cupons.id, input.id), eq(cupons.userId, ctx.user.id)));
      return { success: true };
    }),

  incrementarUso: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      const [cupom] = await db.select().from(cupons)
        .where(and(eq(cupons.id, input.id), eq(cupons.userId, ctx.user.id)))
        .limit(1);
      if (!cupom) throw new Error("Cupom não encontrado");
      await db.update(cupons)
        .set({ usos: (cupom.usos ?? 0) + 1 })
        .where(eq(cupons.id, input.id));
      return { success: true };
    }),
});
