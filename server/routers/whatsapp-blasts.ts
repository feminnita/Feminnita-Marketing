/**
 * WhatsApp Blasts Router — Disparo em Massa via Baileys
 *
 * Permite criar campanhas de envio em massa para reativar a base de clientes.
 * Executa o envio em background com delay configurável entre mensagens
 * para evitar bloqueio do WhatsApp.
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { whatsappBlasts, whatsappBlastContacts } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendTextMessage, getConnectionStatus } from "../_core/baileys-service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normaliza número para formato WhatsApp: apenas dígitos, com DDI 55 se não tiver.
 * Remove traços, parênteses, espaços.
 */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 11 || digits.length === 10) return "55" + digits;
  return digits; // retorna como está se já for formato internacional
}

/**
 * Parseia lista de contatos (uma linha por contato).
 * Formatos suportados:
 *   11999999999
 *   11999999999,Nome
 *   Nome,11999999999
 *   +5511999999999
 */
function parseContacts(raw: string): Array<{ phoneNumber: string; name: string | null }> {
  return raw
    .split(/[\n;]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        // Detectar qual parte é o número
        const hasDigitsA = /\d{8,}/.test(parts[0]);
        if (hasDigitsA) {
          return { phoneNumber: normalizePhone(parts[0]), name: parts[1] || null };
        } else {
          return { phoneNumber: normalizePhone(parts[1]), name: parts[0] || null };
        }
      }
      return { phoneNumber: normalizePhone(parts[0]), name: null };
    })
    .filter((c) => c.phoneNumber.replace(/\D/g, "").length >= 10);
}

/**
 * Substitui variáveis na mensagem: {nome}, {numero}
 */
function renderMessage(template: string, name: string | null, phone: string): string {
  const primeiroNome = name ? name.split(" ")[0] : "";
  return template
    .replace(/\{nome\}/gi, primeiroNome || "cliente")
    .replace(/\{numero\}/gi, phone);
}

// ─── Envio em Background ──────────────────────────────────────────────────────

async function runBlast(blastId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(whatsappBlasts)
      .set({ status: "running", startedAt: new Date() })
      .where(eq(whatsappBlasts.id, blastId));

    const contacts = await db
      .select()
      .from(whatsappBlastContacts)
      .where(
        and(
          eq(whatsappBlastContacts.blastId, blastId),
          eq(whatsappBlastContacts.status, "pending")
        )
      );

    const blast = await db
      .select()
      .from(whatsappBlasts)
      .where(eq(whatsappBlasts.id, blastId))
      .limit(1);

    if (!blast[0]) return;
    const template = blast[0].message;
    const delayMs = blast[0].delaySeconds * 1000;

    for (const contact of contacts) {
      // Verificar se foi cancelado
      const current = await db
        .select({ status: whatsappBlasts.status })
        .from(whatsappBlasts)
        .where(eq(whatsappBlasts.id, blastId))
        .limit(1);
      if (current[0]?.status === "cancelled") break;

      const msg = renderMessage(template, contact.name ?? null, contact.phoneNumber);
      const ok = await sendTextMessage(userId, contact.phoneNumber, msg);

      await db
        .update(whatsappBlastContacts)
        .set({
          status: ok ? "sent" : "failed",
          sentAt: ok ? new Date() : undefined,
          error: ok ? null : "Falha no envio",
        })
        .where(eq(whatsappBlastContacts.id, contact.id));

      // Atualizar contadores
      if (ok) {
        await db
          .update(whatsappBlasts)
          .set({ sentCount: sql`sentCount + 1` })
          .where(eq(whatsappBlasts.id, blastId));
      } else {
        await db
          .update(whatsappBlasts)
          .set({ failedCount: sql`failedCount + 1` })
          .where(eq(whatsappBlasts.id, blastId));
      }

      // Delay entre mensagens
      await sleep(delayMs);
    }

    // Verificar status final
    const finalBlast = await db
      .select({ status: whatsappBlasts.status })
      .from(whatsappBlasts)
      .where(eq(whatsappBlasts.id, blastId))
      .limit(1);

    if (finalBlast[0]?.status !== "cancelled") {
      await db
        .update(whatsappBlasts)
        .set({ status: "done", completedAt: new Date() })
        .where(eq(whatsappBlasts.id, blastId));
    }
  } catch (err) {
    console.error("[WhatsApp Blast] Erro:", err);
    await db
      .update(whatsappBlasts)
      .set({ status: "error", completedAt: new Date() })
      .where(eq(whatsappBlasts.id, blastId));
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const whatsappBlastsRouter = router({
  /**
   * Criar nova campanha (sem disparar ainda)
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        message: z.string().min(1),
        contactsRaw: z.string().min(1), // lista de números bruta
        delaySeconds: z.number().min(3).max(60).default(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const contacts = parseContacts(input.contactsRaw);
      if (contacts.length === 0)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum contato válido encontrado" });

      const [result] = await db.insert(whatsappBlasts).values({
        userId: ctx.user.id,
        title: input.title,
        message: input.message,
        delaySeconds: input.delaySeconds,
        totalContacts: contacts.length,
        status: "draft",
      });

      const blastId = (result as any).insertId as number;

      await db.insert(whatsappBlastContacts).values(
        contacts.map((c) => ({
          blastId,
          phoneNumber: c.phoneNumber,
          name: c.name ?? undefined,
          status: "pending" as const,
        }))
      );

      return { blastId, totalContacts: contacts.length };
    }),

  /**
   * Iniciar disparo de uma campanha draft
   */
  start: protectedProcedure
    .input(z.object({ blastId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Verificar ownership
      const [blast] = await db
        .select()
        .from(whatsappBlasts)
        .where(and(eq(whatsappBlasts.id, input.blastId), eq(whatsappBlasts.userId, ctx.user.id)))
        .limit(1);

      if (!blast) throw new TRPCError({ code: "NOT_FOUND", message: "Campanha não encontrada" });
      if (blast.status !== "draft")
        throw new TRPCError({ code: "BAD_REQUEST", message: "Campanha já foi iniciada" });

      // Verificar se WhatsApp está conectado
      const status = getConnectionStatus(ctx.user.id);
      if (!status.isConnected)
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "WhatsApp não está conectado. Conecte primeiro na página de WhatsApp.",
        });

      // Rodar em background (não aguarda)
      void runBlast(input.blastId, ctx.user.id);

      return { started: true };
    }),

  /**
   * Cancelar campanha em andamento
   */
  cancel: protectedProcedure
    .input(z.object({ blastId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      await db
        .update(whatsappBlasts)
        .set({ status: "cancelled", completedAt: new Date() })
        .where(
          and(eq(whatsappBlasts.id, input.blastId), eq(whatsappBlasts.userId, ctx.user.id))
        );

      return { cancelled: true };
    }),

  /**
   * Obter status de uma campanha (polling)
   */
  get: protectedProcedure
    .input(z.object({ blastId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [blast] = await db
        .select()
        .from(whatsappBlasts)
        .where(and(eq(whatsappBlasts.id, input.blastId), eq(whatsappBlasts.userId, ctx.user.id)))
        .limit(1);

      if (!blast) throw new TRPCError({ code: "NOT_FOUND", message: "Campanha não encontrada" });
      return blast;
    }),

  /**
   * Listar campanhas do usuário
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    return db
      .select()
      .from(whatsappBlasts)
      .where(eq(whatsappBlasts.userId, ctx.user.id))
      .orderBy(desc(whatsappBlasts.createdAt))
      .limit(50);
  }),

  /**
   * Listar contatos de uma campanha
   */
  getContacts: protectedProcedure
    .input(z.object({ blastId: z.number(), status: z.enum(["pending", "sent", "failed"]).optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Verificar ownership
      const [blast] = await db
        .select({ id: whatsappBlasts.id })
        .from(whatsappBlasts)
        .where(and(eq(whatsappBlasts.id, input.blastId), eq(whatsappBlasts.userId, ctx.user.id)))
        .limit(1);

      if (!blast) throw new TRPCError({ code: "NOT_FOUND", message: "Campanha não encontrada" });

      const conditions = [eq(whatsappBlastContacts.blastId, input.blastId)];
      if (input.status) conditions.push(eq(whatsappBlastContacts.status, input.status));

      return db
        .select()
        .from(whatsappBlastContacts)
        .where(and(...conditions))
        .limit(500);
    }),

  /**
   * Deletar campanha (apenas draft ou concluídas)
   */
  delete: protectedProcedure
    .input(z.object({ blastId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [blast] = await db
        .select({ status: whatsappBlasts.status })
        .from(whatsappBlasts)
        .where(and(eq(whatsappBlasts.id, input.blastId), eq(whatsappBlasts.userId, ctx.user.id)))
        .limit(1);

      if (!blast) throw new TRPCError({ code: "NOT_FOUND", message: "Campanha não encontrada" });
      if (blast.status === "running")
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cancele a campanha antes de deletar" });

      await db
        .delete(whatsappBlastContacts)
        .where(eq(whatsappBlastContacts.blastId, input.blastId));
      await db.delete(whatsappBlasts).where(eq(whatsappBlasts.id, input.blastId));

      return { deleted: true };
    }),

  /**
   * Verificar status da conexão WhatsApp
   */
  checkWhatsApp: protectedProcedure.query(({ ctx }) => {
    return getConnectionStatus(ctx.user.id);
  }),
});
