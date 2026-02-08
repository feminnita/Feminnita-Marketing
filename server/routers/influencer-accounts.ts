import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";

/**
 * Router simples para salvar contas das influenciadoras
 * Armazena: email, instagram, tiktok, facebook, whatsapp, youtube
 */

// Armazenamento em memória (em produção, usar banco de dados)
const influencerAccountsStore = new Map<number, {
  influencerId: number;
  email?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  whatsapp?: string;
  youtube?: string;
  updatedAt: Date;
}>();

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
        console.log('[Influencer Accounts] INICIANDO saveAccounts com input:', JSON.stringify(input));
        
        const accountData = {
          influencerId: input.influencerId,
          email: input.email,
          instagram: input.instagram,
          tiktok: input.tiktok,
          facebook: input.facebook,
          whatsapp: input.whatsapp,
          youtube: input.youtube,
          updatedAt: new Date(),
        };

        console.log('[Influencer Accounts] Salvando dados:', JSON.stringify(accountData));
        influencerAccountsStore.set(input.influencerId, accountData);
        console.log('[Influencer Accounts] Dados salvos com sucesso! Total de contas:', influencerAccountsStore.size);

        return {
          success: true,
          message: "Contas salvas com sucesso!",
          data: accountData,
        };
      } catch (error) {
        console.error("[influencerAccounts.saveAccounts] ERRO:", error);
        throw new Error("Erro ao salvar contas");
      }
    }),

  /**
   * Obter contas de uma influenciadora
   */
  getAccounts: protectedProcedure
    .input(z.object({ influencerId: z.number() }))
    .query(async ({ input }) => {
      try {
        console.log('[Influencer Accounts] Obtendo contas para influencerId:', input.influencerId);
        const account = influencerAccountsStore.get(input.influencerId);
        console.log('[Influencer Accounts] Contas encontradas:', account ? 'sim' : 'não');
        return account || null;
      } catch (error) {
        console.error("[influencerAccounts.getAccounts]", error);
        throw new Error("Erro ao obter contas");
      }
    }),

  /**
   * Deletar contas de uma influenciadora
   */
  deleteAccounts: protectedProcedure
    .input(z.object({ influencerId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        console.log('[Influencer Accounts] Deletando contas para influencerId:', input.influencerId);
        influencerAccountsStore.delete(input.influencerId);
        console.log('[Influencer Accounts] Contas deletadas com sucesso!');
        return {
          success: true,
          message: "Contas deletadas com sucesso!",
        };
      } catch (error) {
        console.error("[influencerAccounts.deleteAccounts]", error);
        throw new Error("Erro ao deletar contas");
      }
    }),

  /**
   * Obter todas as contas
   */
  getAllAccounts: protectedProcedure.query(async () => {
    try {
      console.log('[Influencer Accounts] Obtendo todas as contas. Total:', influencerAccountsStore.size);
      return Array.from(influencerAccountsStore.values());
    } catch (error) {
      console.error("[influencerAccounts.getAllAccounts]", error);
      throw new Error("Erro ao obter contas");
    }
  }),
});
