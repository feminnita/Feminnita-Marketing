import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { tiktokAffiliateCreators } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const tiktokAffiliatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Banco indisponível");
    return db.select().from(tiktokAffiliateCreators)
      .where(eq(tiktokAffiliateCreators.userId, ctx.user.id))
      .orderBy(desc(tiktokAffiliateCreators.createdAt));
  }),

  create: protectedProcedure.input(z.object({
    username: z.string().min(1),
    displayName: z.string().optional(),
    profileUrl: z.string().optional(),
    followers: z.number().optional(),
    engagementRate: z.string().optional(),
    gmv30d: z.string().optional(),
    niche: z.string().optional(),
    notes: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Banco indisponível");
    await db.insert(tiktokAffiliateCreators).values({ userId: ctx.user.id, ...input });
    return { success: true };
  }),

  updateStatus: protectedProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["prospecto", "convidado", "aceito", "postou", "converteu", "inativo"]),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Banco indisponível");
    const updates: Record<string, unknown> = { status: input.status };
    if (input.status === "convidado") updates.invitedAt = new Date();
    if (input.status === "aceito")   updates.acceptedAt = new Date();
    if (input.status === "postou")   updates.lastPostAt = new Date();
    await db.update(tiktokAffiliateCreators)
      .set(updates)
      .where(and(
        eq(tiktokAffiliateCreators.id, input.id),
        eq(tiktokAffiliateCreators.userId, ctx.user.id),
      ));
    return { success: true };
  }),

  update: protectedProcedure.input(z.object({
    id: z.number(),
    gmvGenerated: z.string().optional(),
    videosPosted: z.number().optional(),
    notes: z.string().optional(),
    creatorBriefSent: z.boolean().optional(),
    sampleSent: z.boolean().optional(),
    sampleProduct: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Banco indisponível");
    const { id, ...updates } = input;
    await db.update(tiktokAffiliateCreators)
      .set(updates)
      .where(and(
        eq(tiktokAffiliateCreators.id, id),
        eq(tiktokAffiliateCreators.userId, ctx.user.id),
      ));
    return { success: true };
  }),

  delete: protectedProcedure.input(z.object({
    id: z.number(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Banco indisponível");
    await db.delete(tiktokAffiliateCreators)
      .where(and(
        eq(tiktokAffiliateCreators.id, input.id),
        eq(tiktokAffiliateCreators.userId, ctx.user.id),
      ));
    return { success: true };
  }),
});
