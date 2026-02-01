import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { webhooks, webhookEvents, notifications } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export const webhooksRouter = router({
  // Registrar um novo webhook
  registrar: protectedProcedure
    .input(
      z.object({
        plataforma: z.enum([
          "tray",
          "google_drive",
          "meta",
          "email_marketing",
          "instagram",
          "tiktok",
          "facebook",
          "whatsapp",
          "bling",
        ]),
        webhookUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      console.log(`Registrando webhook para ${input.plataforma}`);

      const webhookSecret = crypto.randomBytes(32).toString("hex");

      const result = await ctx.db.insert(webhooks).values({
        userId: ctx.user.id,
        plataforma: input.plataforma,
        webhookUrl: input.webhookUrl,
        webhookSecret,
        isActive: true,
      });

      return {
        sucesso: true,
        mensagem: "Webhook registrado com sucesso",
        webhookId: result.insertId,
        webhookSecret,
        plataforma: input.plataforma,
      };
    }),

  // Listar webhooks do usuário
  listar: protectedProcedure.query(async ({ ctx }: any) => {
    console.log(`Listando webhooks do usuário ${ctx.user.id}`);

    const result = await ctx.db
        .select()
        .from(webhooks)
        .where(eq(webhooks.userId, ctx.user.id));

      return result.map((w: any) => ({
      id: w.id,
      plataforma: w.plataforma,
      webhookUrl: w.webhookUrl,
      isActive: w.isActive,
      lastTriggered: w.lastTriggered,
      createdAt: w.createdAt,
    }));
  }),

  // Desativar webhook
  desativar: protectedProcedure
    .input(z.object({ webhookId: z.number() }))
    .mutation(async ({ ctx, input }: any) => {
      console.log(`Desativando webhook ${input.webhookId}`);

      await ctx.db
        .update(webhooks)
        .set({ isActive: false })
        .where(
          and(
            eq(webhooks.id, input.webhookId),
            eq(webhooks.userId, ctx.user.id)
          )
        );

      return {
        sucesso: true,
        mensagem: "Webhook desativado com sucesso",
      };
    }),

  // Deletar webhook
  deletar: protectedProcedure
    .input(z.object({ webhookId: z.number() }))
    .mutation(async ({ ctx, input }: any) => {
      console.log(`Deletando webhook ${input.webhookId}`);

      await ctx.db
        .delete(webhooks)
        .where(
          and(
            eq(webhooks.id, input.webhookId),
            eq(webhooks.userId, ctx.user.id)
          )
        );

      return {
        sucesso: true,
        mensagem: "Webhook deletado com sucesso",
      };
    }),

  // Listar eventos de webhook
  listarEventos: protectedProcedure
    .input(z.object({ webhookId: z.number().optional() }))
    .query(async ({ ctx, input }: any) => {
      console.log(`Listando eventos de webhook`);

      let query = ctx.db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.userId, ctx.user.id));

      if (input.webhookId) {
        query = query.where(eq(webhookEvents.webhookId, input.webhookId));
      }

      const result = await query;

      return result.map((e: any) => ({
        id: e.id,
        webhookId: e.webhookId,
        plataforma: e.plataforma,
        eventType: e.eventType,
        eventData: JSON.parse(e.eventData),
        status: e.status,
        retries: e.retries,
        createdAt: e.createdAt,
        processedAt: e.processedAt,
      }));
    }),

  // Listar notificações
  listarNotificacoes: protectedProcedure.query(async ({ ctx }: any) => {
    console.log(`Listando notificações do usuário ${ctx.user.id}`);

    const result = await ctx.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id));

    return result;
  }),

  // Marcar notificação como lida
  marcarComoLida: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }: any) => {
      console.log(`Marcando notificação ${input.notificationId} como lida`);

      // Aqui você faria a atualização no banco de dados
      // Por enquanto, apenas retornamos sucesso

      return {
        sucesso: true,
        mensagem: "Notificação marcada como lida",
      };
    }),

  // Processar evento de webhook (chamado pelo endpoint Express)
  processarEvento: publicProcedure
    .input(
      z.object({
        webhookSecret: z.string(),
        plataforma: z.string(),
        eventType: z.string(),
        eventData: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      console.log(`Processando evento: ${input.eventType} de ${input.plataforma}`);

      // Validar webhook secret
      const webhook = await ctx.db
        .select()
        .from(webhooks)
        .where(eq(webhooks.webhookSecret, input.webhookSecret))
        .limit(1);

      if (!webhook || webhook.length === 0) {
        return {
          sucesso: false,
          mensagem: "Webhook secret inválido",
        };
      }

      const w = webhook[0];

      // Registrar evento
      await ctx.db.insert(webhookEvents).values({
        webhookId: w.id,
        userId: w.userId,
        plataforma: input.plataforma,
        eventType: input.eventType,
        eventData: JSON.stringify(input.eventData),
        status: "pending",
      });

      // Criar notificação
      const tituloMap: Record<string, string> = {
        campaign_created: "Nova Campanha Criada",
        campaign_updated: "Campanha Atualizada",
        campaign_paused: "Campanha Pausada",
        campaign_resumed: "Campanha Retomada",
      };

      const tipoMap: Record<string, any> = {
        campaign_created: "campaign_created",
        campaign_updated: "campaign_updated",
        campaign_paused: "campaign_paused",
        campaign_resumed: "campaign_resumed",
      };

      const titulo = tituloMap[input.eventType] || input.eventType;
      const tipo = tipoMap[input.eventType] || "success";

      await ctx.db.insert(notifications).values({
        userId: w.userId,
        plataforma: input.plataforma,
        titulo,
        mensagem: `${titulo} em ${input.plataforma}: ${input.eventData.nome || input.eventData.id || ""}`,
        tipo,
      });

      // Atualizar lastTriggered
      await ctx.db
        .update(webhooks)
        .set({ lastTriggered: new Date() })
        .where(eq(webhooks.id, w.id));

      return {
        sucesso: true,
        mensagem: "Evento processado com sucesso",
      };
    }),
});
