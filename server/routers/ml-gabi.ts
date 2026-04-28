import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { chatWithGabi, updateGabiKnowledge } from "../agents/ml-gabi-agent";

export const mlGabiRouter = router({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).min(1).max(50),
      account: z.enum(["feminnita", "fnt"]).default("feminnita"),
    }))
    .mutation(async ({ ctx, input }) => {
      const reply = await chatWithGabi(input.messages, input.account, ctx.user?.name ?? undefined);
      return { reply };
    }),

  updateKnowledge: protectedProcedure
    .mutation(async () => {
      const summary = await updateGabiKnowledge();
      return { summary };
    }),
});
