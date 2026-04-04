import { describe, it, expect } from "vitest";
import { postApprovalEnhancedRouter } from "./post-approval-enhanced";

// Mock context com user autenticado
const mockContext = {
  user: {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "admin" as const,
  },
};

describe("Post Approval Enhanced Router", () => {
  describe("Integração com Geração Automática", () => {
    it("deve listar posts pendentes com integração de geração", async () => {
      const caller = postApprovalEnhancedRouter.createCaller(mockContext);
      const result = await caller.listPendingPostsWithGenerated({ limit: 20 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("deve gerar e enfileirar um novo post", async () => {
      const caller = postApprovalEnhancedRouter.createCaller(mockContext);
      const result = await caller.generateAndQueuePost({
        influencerId: 1,
        influencerNickname: "carol",
        includeProduct: true,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("queued");
      expect(result.influencerNickname).toBe("carol");
      expect(result.generatedPost).toHaveProperty("caption");
      expect(result.generatedPost).toHaveProperty("hashtags");
    });

    it("deve gerar e enfileirar posts para todas as influenciadoras", async () => {
      const caller = postApprovalEnhancedRouter.createCaller(mockContext);
      const result = await caller.generateAndQueueAllPosts({
        includeProducts: true,
      });

      expect(result.success).toBe(true);
      expect(result.results).toBeDefined();
      expect(Array.isArray(result.results)).toBe(true);
    });
  });

  describe("Notificações em Tempo Real", () => {
    it("deve obter contagem de posts pendentes", async () => {
      const caller = postApprovalEnhancedRouter.createCaller(mockContext);
      const count = await caller.getPendingCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("deve obter posts pendentes por influenciadora", async () => {
      const caller = postApprovalEnhancedRouter.createCaller(mockContext);
      const result = await caller.getPendingByInfluencer();
      expect(typeof result).toBe("object");
    });

    it("deve enviar notificação para novo post", async () => {
      const caller = postApprovalEnhancedRouter.createCaller(mockContext);
      const result = await caller.sendNotificationForNewPost({
        postId: 1,
        influencerName: "Carol",
        preview: "Novo post gerado para aprovação",
      });

      expect(result.success).toBe(true);
      expect(result.notifiedAt).toBeDefined();
    });
  });

  describe("Estrutura de Dados", () => {
    it("generateAndQueuePost deve retornar estrutura correta", async () => {
      const caller = postApprovalEnhancedRouter.createCaller(mockContext);
      const result = await caller.generateAndQueuePost({
        influencerId: 1,
        influencerNickname: "carol",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("postId");
      expect(result).toHaveProperty("influencerId");
      expect(result).toHaveProperty("influencerNickname");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("generatedPost");
      expect(result).toHaveProperty("generatedAt");
    });

    it("generateAndQueueAllPosts deve retornar estrutura correta", async () => {
      const caller = postApprovalEnhancedRouter.createCaller(mockContext);
      const result = await caller.generateAndQueueAllPosts({
        includeProducts: true,
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("totalGenerated");
      expect(result).toHaveProperty("results");
      expect(Array.isArray(result.results)).toBe(true);
      expect(result).toHaveProperty("generatedAt");
    });
  });
});
