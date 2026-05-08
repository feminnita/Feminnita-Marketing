import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { chatWithLuizaShopee, updateLuizaShopeeKnowledge } from "../agents/shopee-luiza-agent";
import { getDb } from "../db";
import { specialistConversations, specialistMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const shopeeLuizaRouter = router({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).min(1).max(200),
      account: z.enum(["feminnita", "fnt"]).default("feminnita"),
      conversationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const reply = await chatWithLuizaShopee(input.messages, input.account, ctx.user?.name ?? undefined);

      // Persistir conversa no banco
      const db = await getDb();
      if (db) {
        const agentName = input.account === "fnt" ? "luiza_fnt" : "luiza";
        const userMessage = input.messages[input.messages.length - 1];

        let convId = input.conversationId;
        if (!convId) {
          const title = userMessage.content.slice(0, 60) + (userMessage.content.length > 60 ? "…" : "");
          await db.insert(specialistConversations).values({
            userId: ctx.user.id, agentName, title,
          });
          const [created] = await db.select().from(specialistConversations)
            .where(and(eq(specialistConversations.userId, ctx.user.id), eq(specialistConversations.agentName, agentName)))
            .orderBy(desc(specialistConversations.createdAt)).limit(1);
          convId = created.id;
        }

        await db.insert(specialistMessages).values({ conversationId: convId, role: "user", content: userMessage.content });
        await db.insert(specialistMessages).values({ conversationId: convId, role: "assistant", content: reply });
        if (convId) await db.update(specialistConversations).set({ updatedAt: new Date() }).where(eq(specialistConversations.id, convId));

        return { reply, conversationId: convId };
      }

      return { reply, conversationId: null };
    }),

  updateKnowledge: protectedProcedure
    .mutation(async () => {
      const summary = await updateLuizaShopeeKnowledge();
      return { summary };
    }),
});
