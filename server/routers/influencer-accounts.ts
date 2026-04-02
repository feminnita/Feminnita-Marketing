import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { influencerAccounts, influencers } from "../../drizzle/schema";
import { eq, sql, inArray, and } from "drizzle-orm";

export const influencerAccountsRouter = router({
  saveAccounts: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        email: z.string().optional(),
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        facebook: z.string().optional(),
        whatsapp: z.string().optional(),
        youtube: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("[saveAccounts] Input recebido:", input);

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Verify ownership
        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) throw new Error("Influencer não encontrado ou acesso negado");

        const { influencerId, email, instagram, tiktok, facebook, whatsapp, youtube } = input;

        // Use raw SQL to avoid Drizzle's default value issues
        await db.execute(sql`
          INSERT INTO influencer_accounts 
          (influencerId, email, instagram, tiktok, facebook, whatsapp, youtube)
          VALUES (${influencerId}, ${email || null}, ${instagram || null}, ${tiktok || null}, ${facebook || null}, ${whatsapp || null}, ${youtube || null})
          ON DUPLICATE KEY UPDATE
            email = VALUES(email),
            instagram = VALUES(instagram),
            tiktok = VALUES(tiktok),
            facebook = VALUES(facebook),
            whatsapp = VALUES(whatsapp),
            youtube = VALUES(youtube)
        `);

        console.log("[saveAccounts] Sucesso!");

        return {
          success: true,
          message: "Contas salvas com sucesso!",
          data: {
            influencerId,
            email: email || undefined,
            instagram: instagram || undefined,
            tiktok: tiktok || undefined,
            facebook: facebook || undefined,
            whatsapp: whatsapp || undefined,
            youtube: youtube || undefined,
          },
        };
      } catch (error) {
        console.error("[saveAccounts] Erro:", error);
        throw new Error(
          "Erro ao salvar contas: " + (error instanceof Error ? error.message : String(error))
        );
      }
    }),

  getAccounts: protectedProcedure
    .input(z.object({ influencerId: z.number() }))
    .query(async ({ input, ctx }) => {
      console.log("[getAccounts] Buscando para influencerId:", input.influencerId);

      const db = await getDb();
      if (!db) return null;

      try {
        // Verify ownership
        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) return null;

        const result = await db
          .select()
          .from(influencerAccounts)
          .where(eq(influencerAccounts.influencerId, input.influencerId))
          .limit(1);

        console.log("[getAccounts] Resultado:", result);

        return result.length > 0 ? result[0] : null;
      } catch (error) {
        console.error("[getAccounts] Erro:", error);
        return null;
      }
    }),

  deleteAccounts: protectedProcedure
    .input(z.object({ influencerId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      console.log("[deleteAccounts] Deletando para influencerId:", input.influencerId);

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Verify ownership before deleting
        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) return { success: false, message: "Acesso negado" };

        await db
          .delete(influencerAccounts)
          .where(eq(influencerAccounts.influencerId, input.influencerId));

        console.log("[deleteAccounts] Sucesso!");

        return {
          success: true,
          message: "Contas deletadas com sucesso!",
        };
      } catch (error) {
        console.error("[deleteAccounts] Erro:", error);
        throw new Error(
          "Erro ao deletar contas: " + (error instanceof Error ? error.message : String(error))
        );
      }
    }),

  getAllAccounts: protectedProcedure.query(async ({ ctx }: any) => {
    const db = await getDb();
    if (!db) return [];

    try {
      const userInfluencers = await db
        .select({ id: influencers.id })
        .from(influencers)
        .where(eq(influencers.userId, ctx.user.id));

      const ids = userInfluencers.map((i: { id: number }) => i.id);
      if (ids.length === 0) return [];

      return await db.select().from(influencerAccounts).where(inArray(influencerAccounts.influencerId, ids));
    } catch (error) {
      console.error("[getAllAccounts] Erro:", error);
      return [];
    }
  }),
});
