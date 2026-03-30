import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { campaigns } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const campaignsRouter = router({
  // Criar campanha
  criar: protectedProcedure
    .input(
      z.object({
        nome: z.string(),
        plataforma: z.enum(["instagram", "facebook", "tiktok", "whatsapp", "email"]),
        orcamento: z.number(),
        publico_alvo: z.string().optional(),
        descricao: z.string().optional(),
        data_inicio: z.string().optional(),
        data_fim: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(campaigns).values({
        userId: ctx.user.id,
        nome: input.nome,
        plataforma: input.plataforma,
        orcamento: String(input.orcamento),
        publicoAlvo: input.publico_alvo,
        descricao: input.descricao,
        dataInicio: input.data_inicio,
        dataFim: input.data_fim,
        status: "rascunho",
      });

      const inserted = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.userId, ctx.user.id))
        .orderBy(desc(campaigns.createdAt))
        .limit(1);

      const c = inserted[0];
      return {
        id: String(c.id),
        nome: c.nome,
        plataforma: c.plataforma,
        orcamento: parseFloat(String(c.orcamento)),
        publico_alvo: c.publicoAlvo,
        descricao: c.descricao,
        data_inicio: c.dataInicio,
        data_fim: c.dataFim,
        status: c.status,
        criado_em: c.createdAt,
        performance: { impressoes: 0, cliques: 0, conversoes: 0, roi: 0 },
      };
    }),

  // Listar campanhas
  listar: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, ctx.user.id))
      .orderBy(desc(campaigns.createdAt));

    return rows.map((c) => ({
      id: String(c.id),
      nome: c.nome,
      plataforma: c.plataforma,
      orcamento: parseFloat(String(c.orcamento)),
      publico_alvo: c.publicoAlvo,
      descricao: c.descricao,
      data_inicio: c.dataInicio,
      data_fim: c.dataFim,
      status: c.status,
      criado_em: c.createdAt,
      performance: {
        impressoes: c.impressoes ?? 0,
        cliques: c.cliques ?? 0,
        conversoes: c.conversoes ?? 0,
        roi: parseFloat(String(c.roi ?? "0")),
      },
    }));
  }),

  // Obter campanha específica
  obter: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db
        .select()
        .from(campaigns)
        .where(and(eq(campaigns.id, parseInt(input.id)), eq(campaigns.userId, ctx.user.id)))
        .limit(1);

      if (!rows.length) throw new Error("Campanha não encontrada");
      const c = rows[0];

      return {
        id: String(c.id),
        nome: c.nome,
        plataforma: c.plataforma,
        orcamento: parseFloat(String(c.orcamento)),
        publico_alvo: c.publicoAlvo,
        descricao: c.descricao,
        data_inicio: c.dataInicio,
        data_fim: c.dataFim,
        status: c.status,
        criado_em: c.createdAt,
        performance: {
          impressoes: c.impressoes ?? 0,
          cliques: c.cliques ?? 0,
          conversoes: c.conversoes ?? 0,
          roi: parseFloat(String(c.roi ?? "0")),
        },
      };
    }),

  // Atualizar campanha
  atualizar: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nome: z.string().optional(),
        orcamento: z.number().optional(),
        publico_alvo: z.string().optional(),
        descricao: z.string().optional(),
        data_inicio: z.string().optional(),
        data_fim: z.string().optional(),
        status: z.enum(["rascunho", "planejamento", "ativa", "pausada", "finalizada"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: Record<string, any> = {};
      if (input.nome) updateData.nome = input.nome;
      if (input.orcamento !== undefined) updateData.orcamento = String(input.orcamento);
      if (input.publico_alvo !== undefined) updateData.publicoAlvo = input.publico_alvo;
      if (input.descricao !== undefined) updateData.descricao = input.descricao;
      if (input.data_inicio !== undefined) updateData.dataInicio = input.data_inicio;
      if (input.data_fim !== undefined) updateData.dataFim = input.data_fim;
      if (input.status) updateData.status = input.status;

      await db
        .update(campaigns)
        .set(updateData)
        .where(and(eq(campaigns.id, parseInt(input.id)), eq(campaigns.userId, ctx.user.id)));

      return { sucesso: true, mensagem: "Campanha atualizada com sucesso!" };
    }),

  // Deletar campanha
  deletar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(campaigns)
        .where(and(eq(campaigns.id, parseInt(input.id)), eq(campaigns.userId, ctx.user.id)));

      return { sucesso: true, mensagem: "Campanha deletada com sucesso!" };
    }),

  // Publicar campanha (muda status para ativa)
  publicar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(campaigns)
        .set({ status: "ativa" })
        .where(and(eq(campaigns.id, parseInt(input.id)), eq(campaigns.userId, ctx.user.id)));

      return { sucesso: true, mensagem: "Campanha publicada com sucesso!" };
    }),

  // Pausar campanha
  pausar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(campaigns)
        .set({ status: "pausada" })
        .where(and(eq(campaigns.id, parseInt(input.id)), eq(campaigns.userId, ctx.user.id)));

      return { sucesso: true, mensagem: "Campanha pausada com sucesso!" };
    }),

  // Retomar campanha
  retomar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(campaigns)
        .set({ status: "ativa" })
        .where(and(eq(campaigns.id, parseInt(input.id)), eq(campaigns.userId, ctx.user.id)));

      return { sucesso: true, mensagem: "Campanha retomada com sucesso!" };
    }),
});
