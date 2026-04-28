import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { chatWithLuizaShopee, updateLuizaShopeeKnowledge } from "../agents/shopee-luiza-agent";

export const shopeeLuizaRouter = router({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).min(1).max(50),
      account: z.enum(["feminnita", "fnt"]).default("feminnita"),
    }))
    .mutation(async ({ ctx, input }) => {
      const reply = await chatWithLuizaShopee(input.messages, input.account, ctx.user?.name ?? undefined);
      return { reply };
    }),

  updateKnowledge: protectedProcedure
    .mutation(async () => {
      const summary = await updateLuizaShopeeKnowledge();
      return { summary };
    }),
});
