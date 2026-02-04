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

        influencerAccountsStore.set(input.influencerId, accountData);

        return {
          success: true,
          message: "Contas salvas com sucesso!",
          data: accountData,
        };
      } catch (error) {
        console.error("[influencerAccounts.saveAccounts]", error);
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
        const account = influencerAccountsStore.get(input.influencerId);
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
        influencerAccountsStore.delete(input.influencerId);
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
      return Array.from(influencerAccountsStore.values());
    } catch (error) {
      console.error("[influencerAccounts.getAllAccounts]", error);
      throw new Error("Erro ao obter contas");
    }
  }),
});
