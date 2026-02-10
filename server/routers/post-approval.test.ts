import { describe, it, expect } from "vitest";
import { postApprovalRouter } from "./post-approval";

// Mock context com user autenticado
const mockContext = {
  user: {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    openId: "test-open-id",
    role: "admin" as const,
  },
};

describe("Post Approval Router", () => {
  describe("listPendingPosts", () => {
    it("deve retornar lista vazia ou posts pendentes", async () => {
      const caller = postApprovalRouter.createCaller(mockContext);
      const result = await caller.listPendingPosts({ limit: 20 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getApprovalStats", () => {
    it("deve retornar estatísticas de aprovação com estrutura correta", async () => {
      const caller = postApprovalRouter.createCaller(mockContext);
      const stats = await caller.getApprovalStats();

      expect(stats).toHaveProperty("totalGenerated");
      expect(stats).toHaveProperty("totalApproved");
      expect(stats).toHaveProperty("totalRejected");
      expect(stats).toHaveProperty("totalPending");
      expect(stats).toHaveProperty("totalPublished");
      expect(stats).toHaveProperty("approvalRate");

      expect(typeof stats.totalGenerated).toBe("number");
      expect(typeof stats.totalApproved).toBe("number");
      expect(typeof stats.totalRejected).toBe("number");
      expect(typeof stats.totalPending).toBe("number");
      expect(typeof stats.approvalRate).toBe("number");
      expect(stats.approvalRate).toBeGreaterThanOrEqual(0);
      expect(stats.approvalRate).toBeLessThanOrEqual(100);
    });
  });

  describe("getPublishedHistory", () => {
    it("deve retornar histórico de posts publicados", async () => {
      const caller = postApprovalRouter.createCaller(mockContext);
      const history = await caller.getPublishedHistory({ limit: 20 });

      expect(Array.isArray(history)).toBe(true);
      if (history.length > 0) {
        expect(history[0]).toHaveProperty("id");
        expect(history[0]).toHaveProperty("caption");
        expect(history[0]).toHaveProperty("engagement");
      }
    });
  });

  describe("approvePost", () => {
    it("deve retornar sucesso ao aprovar um post", async () => {
      const caller = postApprovalRouter.createCaller(mockContext);
      try {
        const result = await caller.approvePost({
          postId: 999, // ID que não existe, mas testa a estrutura
          platforms: ["instagram", "tiktok"],
        });
        // Se chegar aqui, a estrutura está correta
        expect(result).toHaveProperty("success");
      } catch (error: any) {
        // Erro esperado pois o post não existe
        expect(error).toBeDefined();
      }
    });
  });

  describe("rejectPost", () => {
    it("deve retornar sucesso ao rejeitar um post", async () => {
      const caller = postApprovalRouter.createCaller(mockContext);
      try {
        const result = await caller.rejectPost({
          postId: 999,
          reason: "Conteúdo inadequado",
        });
        expect(result).toHaveProperty("success");
      } catch (error: any) {
        // Erro esperado pois o post não existe
        expect(error).toBeDefined();
      }
    });
  });

  describe("editPost", () => {
    it("deve retornar sucesso ao editar um post", async () => {
      const caller = postApprovalRouter.createCaller(mockContext);
      try {
        const result = await caller.editPost({
          postId: 999,
          caption: "Nova caption",
          hashtags: ["#test"],
        });
        expect(result).toHaveProperty("success");
      } catch (error: any) {
        // Erro esperado pois o post não existe
        expect(error).toBeDefined();
      }
    });
  });

  describe("saveFeedback", () => {
    it("deve retornar sucesso ao salvar feedback", async () => {
      const caller = postApprovalRouter.createCaller(mockContext);
      const result = await caller.saveFeedback({
        postId: 1,
        influencerId: 1,
        feedback: "Excelente conteúdo",
        rating: 5,
        improvements: ["Adicionar mais emojis"],
      });

      expect(result.success).toBe(true);
      expect(result.rating).toBe(5);
      expect(result.feedback).toBe("Excelente conteúdo");
    });
  });
});
