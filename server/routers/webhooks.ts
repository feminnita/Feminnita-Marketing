import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { webhooks, webhookEvents, notifications } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
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
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const webhookSecret = crypto.randomBytes(32).toString("hex");

      const result = await db.insert(webhooks).values({
        userId: ctx.user.id,
        plataforma: input.plataforma,
        webhookUrl: input.webhookUrl,
        webhookSecret,
        isActive: true,
      });

      return {
        sucesso: true,
        mensagem: "Webhook registrado com sucesso",
        webhookSecret,
        plataforma: input.plataforma,
      };
    }),

  // Listar webhooks do usuário
  listar: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const result = await db
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
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(webhooks)
        .set({ isActive: false })
        .where(
          and(
            eq(webhooks.id, input.webhookId),
            eq(webhooks.userId, ctx.user.id)
          )
        );

      return { sucesso: true, mensagem: "Webhook desativado com sucesso" };
    }),

  // Deletar webhook
  deletar: protectedProcedure
    .input(z.object({ webhookId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(webhooks)
        .where(
          and(
            eq(webhooks.id, input.webhookId),
            eq(webhooks.userId, ctx.user.id)
          )
        );

      return { sucesso: true, mensagem: "Webhook deletado com sucesso" };
    }),

  // Listar eventos de webhook
  listarEventos: protectedProcedure
    .input(z.object({ webhookId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.userId, ctx.user.id));

      const filtered = input.webhookId
        ? rows.filter((e: any) => e.webhookId === input.webhookId)
        : rows;

      return filtered.map((e: any) => ({
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
  listarNotificacoes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id));
  }),

  // Marcar notificação como lida (com persistência real)
  marcarComoLida: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, ctx.user.id)
          )
        );

      return { sucesso: true, mensagem: "Notificação marcada como lida" };
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
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { sucesso: false, mensagem: "Database not available" };

      const webhook = await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.webhookSecret, input.webhookSecret))
        .limit(1);

      if (!webhook || webhook.length === 0) {
        return { sucesso: false, mensagem: "Webhook secret inválido" };
      }

      const w = webhook[0];

      await db.insert(webhookEvents).values({
        webhookId: w.id,
        userId: w.userId,
        plataforma: input.plataforma,
        eventType: input.eventType,
        eventData: JSON.stringify(input.eventData),
        status: "pending",
      });

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

      await db.insert(notifications).values({
        userId: w.userId,
        plataforma: input.plataforma,
        titulo,
        mensagem: `${titulo} em ${input.plataforma}: ${input.eventData.nome || input.eventData.id || ""}`,
        tipo,
      });

      await db
        .update(webhooks)
        .set({ lastTriggered: new Date() })
        .where(eq(webhooks.id, w.id));

      return { sucesso: true, mensagem: "Evento processado com sucesso" };
    }),

  // Verificar assinatura HMAC de um webhook recebido
  verificarAssinatura: publicProcedure
    .input(z.object({
      payload: z.string(), // body do webhook como string
      signature: z.string(), // valor do header X-Hub-Signature-256
      secret: z.string(),    // secret do webhook
    }))
    .mutation(({ input }) => {
      const expectedSig = "sha256=" + crypto
        .createHmac("sha256", input.secret)
        .update(input.payload)
        .digest("hex");

      const sigBuffer = Buffer.from(input.signature);
      const expBuffer = Buffer.from(expectedSig);

      if (sigBuffer.length !== expBuffer.length) {
        return { valid: false };
      }

      const valid = crypto.timingSafeEqual(sigBuffer, expBuffer);
      return { valid };
    }),

  // Receber e validar evento de webhook com HMAC
  receberEvento: publicProcedure
    .input(z.object({
      webhookId: z.number(),
      payload: z.string(),
      signature: z.string(),
      eventType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const webhook = await db.select().from(webhooks)
        .where(and(eq(webhooks.id, input.webhookId), eq(webhooks.isActive, true)))
        .limit(1);

      if (!webhook.length) throw new Error("Webhook não encontrado");

      const secret = webhook[0].webhookSecret;
      const expectedSig = "sha256=" + crypto.createHmac("sha256", secret).update(input.payload).digest("hex");
      const sigBuffer = Buffer.from(input.signature.padEnd(expectedSig.length));
      const expBuffer = Buffer.from(expectedSig);

      const valid = sigBuffer.length === expBuffer.length && crypto.timingSafeEqual(sigBuffer, expBuffer);
      if (!valid) throw new Error("Assinatura HMAC inválida");

      await db.insert(webhookEvents).values({
        webhookId: input.webhookId,
        userId: webhook[0].userId,
        plataforma: webhook[0].plataforma,
        eventType: input.eventType,
        eventData: input.payload,
        status: "pending",
      });

      await db.update(webhooks).set({ lastTriggered: new Date() }).where(eq(webhooks.id, input.webhookId));

      return { success: true, message: "Evento registrado com sucesso" };
    }),
});
