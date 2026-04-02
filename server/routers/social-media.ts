import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  influencerAccounts,
  contentItems,
  scheduledPosts,
  influencerPosts,
  influencers,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const socialMediaRouter = router({
  saveInfluencerAccounts: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        email: z.string().email().optional(),
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        facebook: z.string().optional(),
        whatsapp: z.string().optional(),
        youtube: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Ensure influencer belongs to user
      const [influencer] = await db
        .select()
        .from(influencers)
        .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id)))
        .limit(1);
      if (!influencer) throw new Error("Influenciadora não encontrada");

      const existing = await db
        .select()
        .from(influencerAccounts)
        .where(eq(influencerAccounts.influencerId, input.influencerId))
        .limit(1);

      const updates: Record<string, string | undefined> = {};
      if (input.email !== undefined) updates.email = input.email;
      if (input.instagram !== undefined) updates.instagram = input.instagram;
      if (input.tiktok !== undefined) updates.tiktok = input.tiktok;
      if (input.facebook !== undefined) updates.facebook = input.facebook;
      if (input.whatsapp !== undefined) updates.whatsapp = input.whatsapp;
      if (input.youtube !== undefined) updates.youtube = input.youtube;

      if (existing.length > 0) {
        await db
          .update(influencerAccounts)
          .set(updates)
          .where(eq(influencerAccounts.influencerId, input.influencerId));
      } else {
        await db.insert(influencerAccounts).values({
          influencerId: input.influencerId,
          ...updates,
        });
      }

      const [updated] = await db
        .select()
        .from(influencerAccounts)
        .where(eq(influencerAccounts.influencerId, input.influencerId))
        .limit(1);

      return { success: true, data: updated };
    }),

  getInfluencerAccounts: protectedProcedure
    .input(z.object({ influencerId: z.number() }))
    .query(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
      if (!owned) return { influencerId: input.influencerId, email: "", instagram: "", tiktok: "", facebook: "", whatsapp: "", youtube: "" };

      const [accounts] = await db
        .select()
        .from(influencerAccounts)
        .where(eq(influencerAccounts.influencerId, input.influencerId))
        .limit(1);

      return accounts ?? {
        influencerId: input.influencerId,
        email: "",
        instagram: "",
        tiktok: "",
        facebook: "",
        whatsapp: "",
        youtube: "",
      };
    }),

  schedulePost: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        title: z.string().min(1),
        content: z.string().min(1),
        scheduledDate: z.string(),
        scheduledTime: z.string(),
        platforms: z.array(z.enum(["instagram", "facebook", "tiktok", "whatsapp"])),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const scheduledAt = new Date(`${input.scheduledDate}T${input.scheduledTime}`);

      // Create a content item first
      await db.insert(contentItems).values({
        userId: ctx.user.id,
        section: "social_media",
        title: input.title,
        content: input.content,
        status: "scheduled",
      });

      const [contentItem] = await db
        .select()
        .from(contentItems)
        .where(and(eq(contentItems.userId, ctx.user.id), eq(contentItems.title, input.title)))
        .orderBy(desc(contentItems.createdAt))
        .limit(1);

      await db.insert(scheduledPosts).values({
        userId: ctx.user.id,
        contentId: contentItem.id,
        platforms: JSON.stringify(input.platforms),
        scheduledAt,
        status: "pending",
      });

      const [created] = await db
        .select()
        .from(scheduledPosts)
        .where(eq(scheduledPosts.contentId, contentItem.id))
        .limit(1);

      return {
        success: true,
        message: `Postagem agendada para ${scheduledAt.toLocaleString("pt-BR")}`,
        postId: created.id,
      };
    }),

  publishPost: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        title: z.string(),
        content: z.string(),
        platforms: z.array(z.enum(["instagram", "facebook", "tiktok", "whatsapp"])),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
      if (!owned) throw new Error("Influenciadora não encontrada");

      // Insert draft post per platform, queued for immediate publishing via publication worker
      const now = new Date();
      for (const platform of input.platforms) {
        if (platform === "whatsapp") continue; // WhatsApp handled via Baileys separately
        await db.insert(influencerPosts).values({
          influencerId: input.influencerId,
          platform,
          content: input.content,
          caption: input.content,
          status: "scheduled",
          scheduledAt: now,
          aiGenerated: false,
        });
      }

      return {
        success: true,
        message: "Postagem enviada para publicação via fila",
        platforms: input.platforms,
      };
    }),

  getScheduledPosts: protectedProcedure
    .input(z.object({ influencerId: z.number().optional() }))
    .query(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const posts = await db
        .select()
        .from(scheduledPosts)
        .where(eq(scheduledPosts.userId, ctx.user.id))
        .orderBy(desc(scheduledPosts.scheduledAt))
        .limit(50);

      return { posts, total: posts.length };
    }),

  deleteScheduledPost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(scheduledPosts)
        .set({ status: "cancelled" })
        .where(and(eq(scheduledPosts.id, input.postId), eq(scheduledPosts.userId, ctx.user.id)));

      return { success: true };
    }),
});
