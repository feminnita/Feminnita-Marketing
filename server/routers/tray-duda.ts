import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { chatWithDuda } from "../agents/tray-duda-agent";

export const trayDudaRouter = router({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).min(1).max(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const reply = await chatWithDuda(input.messages, ctx.user?.name ?? undefined);
      return { reply };
    }),
});
