import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { pushSubscriptions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { vapidPublicKey } from "../services/webPush";

export const pushSubscriptionsRouter = router({
  vapidPublicKey: publicProcedure.query(() => ({ key: vapidPublicKey })),

  subscribe: protectedProcedure
    .input(z.object({
      endpoint: z.string().url(),
      p256dh:   z.string(),
      auth:     z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { ok: false };

      // Upsert por endpoint (um dispositivo pode reinscrever)
      const existing = await db.select().from(pushSubscriptions)
        .where(and(eq(pushSubscriptions.userId, ctx.user.id), eq(pushSubscriptions.endpoint, input.endpoint)))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(pushSubscriptions).values({
          userId:   ctx.user.id,
          endpoint: input.endpoint,
          p256dh:   input.p256dh,
          auth:     input.auth,
        });
      }
      return { ok: true };
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { ok: false };
      await db.delete(pushSubscriptions)
        .where(and(eq(pushSubscriptions.userId, ctx.user.id), eq(pushSubscriptions.endpoint, input.endpoint)));
      return { ok: true };
    }),
});
