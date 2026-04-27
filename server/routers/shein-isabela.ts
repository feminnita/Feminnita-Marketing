import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { chatWithIsabelaShein, updateIsabelaSheinKnowledge } from "../agents/shein-isabela-agent";

export const sheinIsabelaRouter = router({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).min(1).max(50),
      account: z.enum(["feminnita", "fnt"]).default("feminnita"),
    }))
    .mutation(async ({ ctx, input }) => {
      const reply = await chatWithIsabelaShein(input.messages, input.account, ctx.user?.name ?? undefined);
      return { reply };
    }),

  updateKnowledge: protectedProcedure
    .mutation(async () => {
      const summary = await updateIsabelaSheinKnowledge();
      return { summary };
    }),
});
