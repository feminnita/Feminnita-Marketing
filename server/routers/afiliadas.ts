import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { afiliadas, afiliadaVendas, afiliadaCliques } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

export const afiliadasRouter = router({
  listar: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(afiliadas)
      .where(eq(afiliadas.userId, ctx.user.id))
      .orderBy(desc(afiliadas.createdAt));
  }),

  criar: protectedProcedure
    .input(z.object({
      nome: z.string().min(2),
      email: z.string().email().optional(),
      whatsapp: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().max(2).optional(),
      comissaoPercent: z.string().default("10"),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const linkCode = randomBytes(8).toString("hex");
      await db.insert(afiliadas).values({
        userId: ctx.user.id,
        linkCode,
        nome: input.nome,
        email: input.email,
        whatsapp: input.whatsapp,
        cidade: input.cidade,
        estado: input.estado,
        comissaoPercent: input.comissaoPercent,
        observacoes: input.observacoes,
      });
      return { success: true, linkCode };
    }),

  atualizar: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(2).optional(),
      email: z.string().email().optional(),
      whatsapp: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().max(2).optional(),
      comissaoPercent: z.string().optional(),
      status: z.enum(["ativa", "inativa", "pendente"]).optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, ...data } = input;
      await db.update(afiliadas).set({ ...data, updatedAt: new Date() })
        .where(and(eq(afiliadas.id, id), eq(afiliadas.userId, ctx.user.id)));
      return { success: true };
    }),

  deletar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(afiliadas)
        .where(and(eq(afiliadas.id, input.id), eq(afiliadas.userId, ctx.user.id)));
      return { success: true };
    }),

  registrarVenda: protectedProcedure
    .input(z.object({
      afiliadaId: z.number(),
      pedidoId: z.string().optional(),
      produto: z.string().optional(),
      valor: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [afiliada] = await db.select().from(afiliadas)
        .where(and(eq(afiliadas.id, input.afiliadaId), eq(afiliadas.userId, ctx.user.id)));
      if (!afiliada) throw new Error("Afiliada não encontrada");
      const valorNum = parseFloat(input.valor);
      const comissaoNum = valorNum * (parseFloat(afiliada.comissaoPercent ?? "10") / 100);
      await db.insert(afiliadaVendas).values({
        afiliadaId: input.afiliadaId,
        userId: ctx.user.id,
        pedidoId: input.pedidoId,
        produto: input.produto,
        valor: input.valor,
        comissaoValor: comissaoNum.toFixed(2),
      });
      // Update totals
      const novoTotal = (afiliada.totalVendas ?? 0) + 1;
      const novaReceita = (parseFloat(afiliada.totalReceita ?? "0") + valorNum).toFixed(2);
      // Determine nivel
      let nivel: "bronze" | "prata" | "ouro" | "diamante" = "bronze";
      if (novoTotal >= 100) nivel = "diamante";
      else if (novoTotal >= 50) nivel = "ouro";
      else if (novoTotal >= 20) nivel = "prata";
      await db.update(afiliadas).set({
        totalVendas: novoTotal,
        totalReceita: novaReceita,
        nivel,
        status: "ativa",
        updatedAt: new Date(),
      }).where(eq(afiliadas.id, input.afiliadaId));
      return { success: true };
    }),

  listarVendas: protectedProcedure
    .input(z.object({ afiliadaId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(afiliadaVendas)
        .where(eq(afiliadaVendas.userId, ctx.user.id))
        .orderBy(desc(afiliadaVendas.createdAt))
        .limit(100);
      if (input.afiliadaId) return rows.filter(r => r.afiliadaId === input.afiliadaId);
      return rows;
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { total: 0, ativas: 0, totalVendas: 0, totalComissoes: 0 };
    const all = await db.select().from(afiliadas).where(eq(afiliadas.userId, ctx.user.id));
    const vendas = await db.select().from(afiliadaVendas).where(eq(afiliadaVendas.userId, ctx.user.id));
    return {
      total: all.length,
      ativas: all.filter(a => a.status === "ativa").length,
      totalVendas: vendas.length,
      totalComissoes: vendas.reduce((s, v) => s + parseFloat(v.comissaoValor ?? "0"), 0).toFixed(2),
    };
  }),
});
