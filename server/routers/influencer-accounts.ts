import { z } from "zod";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { influencerAccounts } from "../../drizzle/schema";

export const influencerAccountsRouter = router({
  /**
   * Salvar contas de uma influenciadora
   */
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
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        console.log('[Influencer Accounts] INICIANDO saveAccounts com input:', JSON.stringify(input));
        
        // Verificar se já existe registro
        const existing = await db
          .select()
          .from(influencerAccounts)
          .where(eq(influencerAccounts.influencerId, input.influencerId))
          .limit(1);

        let result;
        if (existing && existing.length > 0) {
          // Atualizar
          result = await db
            .update(influencerAccounts)
            .set({
              email: input.email,
              instagram: input.instagram,
              tiktok: input.tiktok,
              facebook: input.facebook,
              whatsapp: input.whatsapp,
              youtube: input.youtube,
              updatedAt: new Date(),
            })
            .where(eq(influencerAccounts.influencerId, input.influencerId));
          console.log('[Influencer Accounts] Contas atualizadas com sucesso!');
        } else {
          // Inserir novo
          result = await db.insert(influencerAccounts).values({
            influencerId: input.influencerId,
            email: input.email,
            instagram: input.instagram,
            tiktok: input.tiktok,
            facebook: input.facebook,
            whatsapp: input.whatsapp,
            youtube: input.youtube,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log('[Influencer Accounts] Contas inseridas com sucesso!');
        }

        return {
          success: true,
          message: "Contas salvas com sucesso!",
          influencerId: input.influencerId,
        };
      } catch (error) {
        console.error("[influencerAccounts.saveAccounts] ERRO:", error);
        throw new Error("Erro ao salvar contas: " + (error instanceof Error ? error.message : "Erro desconhecido"));
      }
    }),

  /**
   * Obter contas de uma influenciadora
   */
  getAccounts: protectedProcedure
    .input(z.object({ influencerId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        console.log('[Influencer Accounts] Obtendo contas para influencerId:', input.influencerId);
        const account = await db
          .select()
          .from(influencerAccounts)
          .where(eq(influencerAccounts.influencerId, input.influencerId))
          .limit(1);
        
        console.log('[Influencer Accounts] Contas encontradas:', account && account.length > 0 ? 'sim' : 'nao');
        return account && account.length > 0 ? account[0] : null;
      } catch (error) {
        console.error("[influencerAccounts.getAccounts]", error);
        throw new Error("Erro ao obter contas");
      }
    }),
});
