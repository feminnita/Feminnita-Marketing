import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { updateMarketKnowledge, getKnowledgeStatus, getLatestKnowledge } from "../agents/knowledge-updater";

export const marketKnowledgeRouter = router({
  triggerUpdate: protectedProcedure
    .input(z.object({ domain: z.string().optional() }))
    .mutation(async ({ input }) => {
      const result = await updateMarketKnowledge(input.domain);
      return result;
    }),

  getStatus: protectedProcedure.query(async () => {
    return getKnowledgeStatus();
  }),

  getLatest: protectedProcedure
    .input(z.object({ agentName: z.string() }))
    .query(async ({ input }) => {
      return getLatestKnowledge(input.agentName);
    }),
});
