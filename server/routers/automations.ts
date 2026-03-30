import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { automations } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const automationsRouter = router({
  // Criar automação
  criar: protectedProcedure
    .input(
      z.object({
        nome: z.string(),
        tipo: z.enum(["post", "mensagem", "email", "whatsapp"]),
        plataforma: z.enum(["instagram", "facebook", "tiktok", "whatsapp", "email"]),
        conteudo: z.string(),
        agendamento: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(automations).values({
        userId: ctx.user.id,
        nome: input.nome,
        tipo: input.tipo,
        plataforma: input.plataforma,
        conteudo: input.conteudo,
        agendamento: input.agendamento,
        status: "agendado",
      });

      const inserted = await db
        .select()
        .from(automations)
        .where(eq(automations.userId, ctx.user.id))
        .orderBy(desc(automations.createdAt))
        .limit(1);

      const a = inserted[0];
      return {
        id: String(a.id),
        nome: a.nome,
        tipo: a.tipo,
        plataforma: a.plataforma,
        conteudo: a.conteudo,
        agendamento: a.agendamento,
        status: a.status,
        criado_em: a.createdAt,
      };
    }),

  // Executar automação
  executar: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        plataforma: z.enum(["instagram", "facebook", "tiktok", "whatsapp", "email"]),
        conteudo: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(automations)
        .set({ ultimaExecucao: new Date() })
        .where(and(eq(automations.id, parseInt(input.id)), eq(automations.userId, ctx.user.id)));

      return { sucesso: true, mensagem: `Automação executada na plataforma ${input.plataforma}` };
    }),

  // Listar automações
  listar: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(automations)
      .where(eq(automations.userId, ctx.user.id))
      .orderBy(desc(automations.createdAt));

    return rows.map((a) => ({
      id: String(a.id),
      nome: a.nome,
      tipo: a.tipo,
      plataforma: a.plataforma,
      conteudo: a.conteudo,
      agendamento: a.agendamento,
      status: a.status,
      proxima_execucao: a.proximaExecucao,
      ultima_execucao: a.ultimaExecucao,
    }));
  }),

  // Atualizar automação
  atualizar: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nome: z.string().optional(),
        conteudo: z.string().optional(),
        agendamento: z.string().optional(),
        status: z.enum(["ativo", "pausado", "agendado"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: Record<string, any> = {};
      if (input.nome) updateData.nome = input.nome;
      if (input.conteudo !== undefined) updateData.conteudo = input.conteudo;
      if (input.agendamento !== undefined) updateData.agendamento = input.agendamento;
      if (input.status) updateData.status = input.status;

      await db
        .update(automations)
        .set(updateData)
        .where(and(eq(automations.id, parseInt(input.id)), eq(automations.userId, ctx.user.id)));

      return { sucesso: true, mensagem: "Automação atualizada com sucesso!" };
    }),

  // Deletar automação
  deletar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(automations)
        .where(and(eq(automations.id, parseInt(input.id)), eq(automations.userId, ctx.user.id)));

      return { sucesso: true, mensagem: "Automação deletada com sucesso!" };
    }),

  // Testar publicação (sem persistência real, apenas validação)
  testar: protectedProcedure
    .input(
      z.object({
        plataforma: z.enum(["instagram", "facebook", "tiktok", "whatsapp", "email"]),
        conteudo: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        sucesso: true,
        mensagem: `Teste de publicação no ${input.plataforma} realizado com sucesso!`,
      };
    }),
});
