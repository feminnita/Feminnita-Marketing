import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { chatWithAny } from "../agents/tray-any-agent";

export const trayAnyRouter = router({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).min(1).max(200),
    }))
    .mutation(async ({ ctx, input }) => {
      const reply = await chatWithAny(input.messages, ctx.user?.name ?? undefined);
      return { reply };
    }),
});
