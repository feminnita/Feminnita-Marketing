import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { chatWithAliceAmazon, updateAliceAmazonKnowledge } from "../agents/amazon-alice-agent";

export const amazonAliceRouter = router({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).min(1).max(200),
      account: z.enum(["feminnita", "fnt"]).default("feminnita"),
    }))
    .mutation(async ({ ctx, input }) => {
      const reply = await chatWithAliceAmazon(input.messages, input.account, ctx.user?.name ?? undefined);
      return { reply };
    }),

  updateKnowledge: protectedProcedure
    .mutation(async () => {
      const summary = await updateAliceAmazonKnowledge();
      return { summary };
    }),
});
