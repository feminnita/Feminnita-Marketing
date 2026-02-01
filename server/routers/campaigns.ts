import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const campaignsRouter = router({
  // Criar campanha
  criar: protectedProcedure
    .input(
      z.object({
        nome: z.string(),
        plataforma: z.enum(["instagram", "facebook", "tiktok", "whatsapp", "email"]),
        orcamento: z.number(),
        publico_alvo: z.string(),
        descricao: z.string(),
        data_inicio: z.string(),
        data_fim: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      console.log("Criando campanha:", input);
      return {
        id: Math.random().toString(),
        ...input,
        status: "rascunho",
        criado_em: new Date(),
        performance: {
          impressoes: 0,
          cliques: 0,
          conversoes: 0,
          roi: 0,
        },
      };
    }),

  // Listar campanhas
  listar: protectedProcedure.query(async () => {
    return [
      {
        id: "1",
        nome: "Campanha Verão 2026",
        plataforma: "instagram",
        orcamento: 5000,
        publico_alvo: "Mulheres 18-45 anos",
        descricao: "Promoção de verão com até 50% de desconto",
        data_inicio: "2026-01-15",
        data_fim: "2026-02-28",
        status: "ativa",
        criado_em: new Date("2026-01-10"),
        performance: {
          impressoes: 125000,
          cliques: 3500,
          conversoes: 280,
          roi: 2.8,
        },
      },
      {
        id: "2",
        nome: "Black Friday 2026",
        plataforma: "facebook",
        orcamento: 8000,
        publico_alvo: "Todos os públicos",
        descricao: "Preparação para Black Friday",
        data_inicio: "2026-10-01",
        data_fim: "2026-11-30",
        status: "planejamento",
        criado_em: new Date("2026-09-15"),
        performance: {
          impressoes: 0,
          cliques: 0,
          conversoes: 0,
          roi: 0,
        },
      },
    ];
  }),

  // Obter campanha específica
  obter: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }: any) => {
      console.log("Obtendo campanha:", input.id);
      return {
        id: input.id,
        nome: "Campanha Exemplo",
        plataforma: "instagram",
        orcamento: 5000,
        publico_alvo: "Mulheres 18-45 anos",
        descricao: "Descrição da campanha",
        data_inicio: "2026-01-15",
        data_fim: "2026-02-28",
        status: "ativa",
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
    .mutation(async ({ input }: any) => {
      console.log("Atualizando campanha:", input);
      return { sucesso: true, mensagem: "Campanha atualizada com sucesso!" };
    }),

  // Deletar campanha
  deletar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }: any) => {
      console.log("Deletando campanha:", input.id);
      return { sucesso: true, mensagem: "Campanha deletada com sucesso!" };
    }),

  // Publicar campanha
  publicar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }: any) => {
      console.log("Publicando campanha:", input.id);
      return { sucesso: true, mensagem: "Campanha publicada com sucesso!" };
    }),

  // Pausar campanha
  pausar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }: any) => {
      console.log("Pausando campanha:", input.id);
      return { sucesso: true, mensagem: "Campanha pausada com sucesso!" };
    }),

  // Retomar campanha
  retomar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }: any) => {
      console.log("Retomando campanha:", input.id);
      return { sucesso: true, mensagem: "Campanha retomada com sucesso!" };
    }),
});
