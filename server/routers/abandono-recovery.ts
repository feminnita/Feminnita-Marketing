import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { abandonamentoSequencias, abandonamentoLogs } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

const DEFAULT_MESSAGES = {
  etapa1: "Oi {nome}! 👋 Vi que você tinha interesse em nossos pijamas Feminnita. Ainda posso te ajudar? Temos modelos lindos esperando por você! 🛍️",
  etapa2: "Oi {nome}! 😊 Passando para avisar que as peças que você viu ainda estão disponíveis — mas o estoque é limitado. Quer garantir as suas? 🌟",
  etapa3: "Oi {nome}! Última chamada 💫 Para novos pedidos acima de R$ 300, estamos com frete grátis hoje. Não perca! 📦",
};

export const abandonoRecoveryRouter = router({
  listarSequencias: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(abandonamentoSequencias)
      .where(eq(abandonamentoSequencias.userId, ctx.user.id))
      .orderBy(desc(abandonamentoSequencias.createdAt));
  }),

  criarSequencia: protectedProcedure
    .input(z.object({
      nome: z.string().min(2),
      etapa1Horas: z.number().default(1),
      etapa1Mensagem: z.string().optional(),
      etapa2Horas: z.number().default(24),
      etapa2Mensagem: z.string().optional(),
      etapa3Horas: z.number().default(72),
      etapa3Mensagem: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(abandonamentoSequencias).values({
        userId: ctx.user.id,
        nome: input.nome,
        etapa1Horas: input.etapa1Horas,
        etapa1Mensagem: input.etapa1Mensagem ?? DEFAULT_MESSAGES.etapa1,
        etapa2Horas: input.etapa2Horas,
        etapa2Mensagem: input.etapa2Mensagem ?? DEFAULT_MESSAGES.etapa2,
        etapa3Horas: input.etapa3Horas,
        etapa3Mensagem: input.etapa3Mensagem ?? DEFAULT_MESSAGES.etapa3,
      });
      return { success: true };
    }),

  atualizarSequencia: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      ativo: z.boolean().optional(),
      etapa1Horas: z.number().optional(),
      etapa1Mensagem: z.string().optional(),
      etapa2Horas: z.number().optional(),
      etapa2Mensagem: z.string().optional(),
      etapa3Horas: z.number().optional(),
      etapa3Mensagem: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, ...data } = input;
      await db.update(abandonamentoSequencias).set({ ...data, updatedAt: new Date() })
        .where(and(eq(abandonamentoSequencias.id, id), eq(abandonamentoSequencias.userId, ctx.user.id)));
      return { success: true };
    }),

  deletarSequencia: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(abandonamentoSequencias)
        .where(and(eq(abandonamentoSequencias.id, input.id), eq(abandonamentoSequencias.userId, ctx.user.id)));
      return { success: true };
    }),

  iniciarRecuperacao: protectedProcedure
    .input(z.object({
      sequenciaId: z.number(),
      clienteNome: z.string(),
      clienteWhatsapp: z.string(),
      pedidoId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [seq] = await db.select().from(abandonamentoSequencias)
        .where(and(eq(abandonamentoSequencias.id, input.sequenciaId), eq(abandonamentoSequencias.userId, ctx.user.id)));
      if (!seq) throw new Error("Sequência não encontrada");
      await db.insert(abandonamentoLogs).values({
        userId: ctx.user.id,
        sequenciaId: input.sequenciaId,
        clienteNome: input.clienteNome,
        clienteWhatsapp: input.clienteWhatsapp,
        pedidoId: input.pedidoId,
        etapaAtual: 1,
      });
      return { success: true, mensagem: (seq.etapa1Mensagem ?? DEFAULT_MESSAGES.etapa1).replace("{nome}", input.clienteNome) };
    }),

  marcarConvertido: protectedProcedure
    .input(z.object({ logId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.update(abandonamentoLogs).set({
        status: "convertido",
        convertidoEm: new Date(),
        updatedAt: new Date(),
      }).where(and(eq(abandonamentoLogs.id, input.logId), eq(abandonamentoLogs.userId, ctx.user.id)));
      return { success: true };
    }),

  listarLogs: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(abandonamentoLogs)
      .where(eq(abandonamentoLogs.userId, ctx.user.id))
      .orderBy(desc(abandonamentoLogs.createdAt))
      .limit(100);
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { total: 0, ativos: 0, convertidos: 0, taxaConversao: "0" };
    const logs = await db.select().from(abandonamentoLogs).where(eq(abandonamentoLogs.userId, ctx.user.id));
    const total = logs.length;
    const ativos = logs.filter((l: any) => l.status === "ativo").length;
    const convertidos = logs.filter((l: any) => l.status === "convertido").length;
    const taxaConversao = total > 0 ? ((convertidos / total) * 100).toFixed(1) : "0";
    return { total, ativos, convertidos, taxaConversao };
  }),

  defaultMessages: protectedProcedure.query(() => DEFAULT_MESSAGES),
});
