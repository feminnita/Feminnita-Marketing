import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { videoPlans, videoCreditOrders } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

// ── Custos por modo ───────────────────────────────────────────────────────────
export const CREDIT_COSTS = {
  livre:     10,
  runningup: 15,
  fala:      12,
} as const;

// ── Pacotes disponíveis ───────────────────────────────────────────────────────
export const CREDIT_PACKAGES = [
  { id: "starter", name: "Starter", credits: 30,  amountBrl: "29.00",  label: "~2 Running Up" },
  { id: "pro",     name: "Pro",     credits: 100, amountBrl: "79.00",  label: "~6 Running Up" },
  { id: "ultra",   name: "Ultra",   credits: 220, amountBrl: "149.00", label: "~14 Running Up" },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getOrCreatePlan(userId: number, db: any) {
  const rows = await db.select().from(videoPlans).where(eq(videoPlans.userId, userId)).limit(1);
  if (rows.length > 0) return rows[0];
  await db.insert(videoPlans).values({ userId, videoCreditsBalance: 0 });
  const newRows = await db.select().from(videoPlans).where(eq(videoPlans.userId, userId)).limit(1);
  return newRows[0];
}

// ── Helper exportado — usado por runpod-video.ts e modo-fala.ts ───────────────
export async function debitCredits(
  userId: number,
  mode: keyof typeof CREDIT_COSTS,
  db: any,
): Promise<void> {
  const cost = CREDIT_COSTS[mode];
  const plan = await getOrCreatePlan(userId, db);

  if ((plan.videoCreditsBalance ?? 0) < cost) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Créditos insuficientes. Necessário: ${cost}, disponível: ${plan.videoCreditsBalance ?? 0}. Adquira mais créditos.`,
    });
  }

  await db.update(videoPlans)
    .set({ videoCreditsBalance: sql`${videoPlans.videoCreditsBalance} - ${cost}` })
    .where(eq(videoPlans.userId, userId));
}

// ── Asaas: criar cliente ou buscar por email ──────────────────────────────────
async function getOrCreateAsaasCustomer(email: string, name: string): Promise<string> {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurado");

  const baseUrl = "https://api.asaas.com/v3";

  // Buscar cliente existente por email
  const searchRes = await fetch(`${baseUrl}/customers?email=${encodeURIComponent(email)}&limit=1`, {
    headers: { access_token: key },
  });
  if (searchRes.ok) {
    const data = await searchRes.json() as any;
    if (data.data?.length > 0) return data.data[0].id as string;
  }

  // Criar novo cliente
  const createRes = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: { access_token: key, "Content-Type": "application/json" },
    body: JSON.stringify({ name: name || email, email, notificationDisabled: false }),
  });
  if (!createRes.ok) throw new Error(`Asaas customer ${createRes.status}: ${(await createRes.text()).slice(0, 200)}`);
  const created = await createRes.json() as any;
  return created.id as string;
}

async function createAsaasPayment(
  customerId: string,
  amountBrl: string,
  description: string,
  externalRef: string,
): Promise<{ paymentId: string; paymentUrl: string; pixQrCode?: string }> {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurado");

  const due = new Date();
  due.setDate(due.getDate() + 1);
  const dueDate = due.toISOString().split("T")[0];

  const res = await fetch("https://api.asaas.com/v3/payments", {
    method: "POST",
    headers: { access_token: key, "Content-Type": "application/json" },
    body: JSON.stringify({
      customer:          customerId,
      billingType:       "UNDEFINED",
      value:             parseFloat(amountBrl),
      dueDate,
      description,
      externalReference: externalRef,
    }),
  });
  if (!res.ok) throw new Error(`Asaas payment ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json() as any;

  return {
    paymentId:  data.id as string,
    paymentUrl: data.invoiceUrl as string,
    pixQrCode:  data.pixTransaction?.qrCode?.encodedImage,
  };
}

// ── Router ────────────────────────────────────────────────────────────────────
export const videoCreditsRouter = router({

  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { balance: 0, costs: CREDIT_COSTS };
    const plan = await getOrCreatePlan(ctx.user.id, db);
    return { balance: plan.videoCreditsBalance ?? 0, costs: CREDIT_COSTS };
  }),

  getPackages: protectedProcedure.query(() => CREDIT_PACKAGES),

  createOrder: protectedProcedure
    .input(z.object({ packageId: z.enum(["starter", "pro", "ultra"]) }))
    .mutation(async ({ input, ctx }) => {
      const pkg = CREDIT_PACKAGES.find(p => p.id === input.packageId);
      if (!pkg) throw new TRPCError({ code: "BAD_REQUEST", message: "Pacote inválido" });

      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      // Criar order no banco
      const insertResult = await db.insert(videoCreditOrders).values({
        userId:    ctx.user.id,
        packageId: pkg.id,
        credits:   pkg.credits,
        amountBrl: pkg.amountBrl,
        status:    "pending",
      });
      const orderId = (insertResult[0] as any).insertId as number;

      // Criar pagamento Asaas
      const externalRef = `VIDEO_CREDITS:${ctx.user.id}:${pkg.id}:${orderId}`;
      const customerId  = await getOrCreateAsaasCustomer(
        ctx.user.email,
        ctx.user.name ?? ctx.user.email,
      );
      const payment = await createAsaasPayment(
        customerId,
        pkg.amountBrl,
        `${pkg.credits} Créditos de Vídeo IA — Feminnita Marketing`,
        externalRef,
      );

      // Atualizar order com IDs do Asaas
      await db.update(videoCreditOrders)
        .set({ asaasPaymentId: payment.paymentId, asaasPaymentUrl: payment.paymentUrl })
        .where(eq(videoCreditOrders.id, orderId));

      return {
        orderId,
        paymentUrl:  payment.paymentUrl,
        pixQrCode:   payment.pixQrCode,
        credits:     pkg.credits,
        amountBrl:   pkg.amountBrl,
      };
    }),

  // Webhook Asaas — chamado pelo servidor Express diretamente (ver nota abaixo)
  // URL configurada no Asaas: POST /api/video-credits/webhook
  handleAsaasWebhook: publicProcedure
    .input(z.object({
      event:   z.string(),
      payment: z.object({
        id:                z.string(),
        status:            z.string(),
        externalReference: z.string().optional().nullable(),
      }),
    }))
    .mutation(async ({ input }) => {
      if (input.event !== "PAYMENT_CONFIRMED" && input.event !== "PAYMENT_RECEIVED") {
        return { ok: true };
      }
      if (!input.payment.externalReference?.startsWith("VIDEO_CREDITS:")) {
        return { ok: true };
      }

      const [, userIdStr, , orderIdStr] = input.payment.externalReference.split(":");
      const userId  = parseInt(userIdStr, 10);
      const orderId = parseInt(orderIdStr, 10);
      if (!userId || !orderId) return { ok: true };

      const db = await getDb();
      if (!db) return { ok: false, error: "DB indisponível" };

      // Verificar se já processou
      const orders = await db.select().from(videoCreditOrders)
        .where(eq(videoCreditOrders.id, orderId)).limit(1);
      if (!orders.length || orders[0].status === "paid") return { ok: true };

      const order = orders[0];

      // Marcar como pago
      await db.update(videoCreditOrders)
        .set({ status: "paid", paidAt: new Date() })
        .where(eq(videoCreditOrders.id, orderId));

      // Adicionar créditos
      await db.update(videoPlans)
        .set({ videoCreditsBalance: sql`${videoPlans.videoCreditsBalance} + ${order.credits}` })
        .where(eq(videoPlans.userId, userId));

      console.log(`[VideoCredits] +${order.credits} créditos → userId ${userId} (order #${orderId})`);
      return { ok: true };
    }),

  adminAddCredits: protectedProcedure
    .input(z.object({
      userId:  z.number().int(),
      credits: z.number().int().min(1).max(10000),
    }))
    .mutation(async ({ input, ctx }) => {
      if ((ctx.user as any).role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");
      await getOrCreatePlan(input.userId, db);
      await db.update(videoPlans)
        .set({ videoCreditsBalance: sql`${videoPlans.videoCreditsBalance} + ${input.credits}` })
        .where(eq(videoPlans.userId, input.userId));
      return { ok: true };
    }),
});
