import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { tiktokLives } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const tiktokLiveRouter = router({
  listar: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(tiktokLives)
      .where(eq(tiktokLives.userId, ctx.user.id))
      .orderBy(desc(tiktokLives.dataAgendada));
  }),

  criar: protectedProcedure
    .input(z.object({
      titulo: z.string().min(2),
      dataAgendada: z.string().optional(),
      duracao: z.number().default(120),
      produtosDestaque: z.string().optional(),
      metaViewers: z.number().optional(),
      metaVendas: z.number().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.insert(tiktokLives).values({
        userId: ctx.user.id,
        titulo: input.titulo,
        dataAgendada: input.dataAgendada ? new Date(input.dataAgendada) : undefined,
        duracao: input.duracao,
        produtosDestaque: input.produtosDestaque,
        metaViewers: input.metaViewers,
        metaVendas: input.metaVendas,
        observacoes: input.observacoes,
      });
      return { success: true };
    }),

  atualizar: protectedProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      dataAgendada: z.string().optional(),
      status: z.enum(["rascunho","agendada","ao_vivo","encerrada"]).optional(),
      roteiro: z.string().optional(),
      produtosDestaque: z.string().optional(),
      viewersReais: z.number().optional(),
      vendasReais: z.number().optional(),
      receitaGerada: z.string().optional(),
      tiktokLiveUrl: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const { id, dataAgendada, ...rest } = input;
      await db.update(tiktokLives).set({
        ...rest,
        ...(dataAgendada ? { dataAgendada: new Date(dataAgendada) } : {}),
        updatedAt: new Date(),
      }).where(and(eq(tiktokLives.id, id), eq(tiktokLives.userId, ctx.user.id)));
      return { success: true };
    }),

  deletar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(tiktokLives).where(and(eq(tiktokLives.id, input.id), eq(tiktokLives.userId, ctx.user.id)));
      return { success: true };
    }),

  gerarRoteiro: protectedProcedure
    .input(z.object({
      liveId: z.number(),
      titulo: z.string(),
      produtos: z.string(),
      duracao: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é especialista em TikTok Live Commerce para moda feminina brasileira. Crie roteiros de live que engajam e vendem. A marca é Feminnita Pijamas — atacado, qualidade premium, público feminino 25-50 anos.`,
          },
          {
            role: "user",
            content: `Crie um roteiro completo para uma live de ${input.duracao} minutos sobre: "${input.titulo}".
Produtos em destaque: ${input.produtos || "coleção atual de pijamas Feminnita"}.

O roteiro deve ter:
1. Abertura impactante (primeiros 30 segundos) — gancho forte para segurar viewers
2. Apresentação dos produtos (com script de fala, tempo por produto, CTA de compra)
3. Momento de interação com chat (perguntas sugeridas para engajar)
4. Oferta especial da live (urgência, exclusividade)
5. Encerramento com CTA forte

Seja específico, use linguagem brasileira natural, inclua emojis TikTok, CTAs de urgência ("Só durante a live!", "Últimas peças!").`,
          },
        ],
      });
      const roteiroRaw = response.choices?.[0]?.message?.content ?? "";
      const roteiro = typeof roteiroRaw === "string" ? roteiroRaw : JSON.stringify(roteiroRaw);
      // Save to DB
      const db = await getDb();
      if (db) {
        await db.update(tiktokLives).set({ roteiro, updatedAt: new Date() })
          .where(and(eq(tiktokLives.id, input.liveId), eq(tiktokLives.userId, ctx.user.id)));
      }
      return { roteiro };
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { total: 0, agendadas: 0, totalVendas: 0, totalReceita: "0" };
    const all = await db.select().from(tiktokLives).where(eq(tiktokLives.userId, ctx.user.id));
    return {
      total: all.length,
      agendadas: all.filter(l => l.status === "agendada").length,
      totalVendas: all.reduce((s, l) => s + (l.vendasReais ?? 0), 0),
      totalReceita: all.reduce((s, l) => s + parseFloat(l.receitaGerada ?? "0"), 0).toFixed(2),
    };
  }),
});
