import { describe, it, expect, vi } from "vitest";
import { postApprovalEnhancedRouter } from "./post-approval-enhanced";

vi.mock("../_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({ caption: "Test caption", hashtags: ["#test"], cta: "Visite a Feminnita", productMention: "Pijamas" }) } }],
  }),
}));

// Thenable chain factory: resolves to `data` when awaited,
// also supports .orderBy().limit() chaining.
const makeChain = (data: any[]) => {
  const chain: any = {
    from: vi.fn().mockImplementation(() => chain),
    where: vi.fn().mockImplementation(() => chain),
    orderBy: vi.fn().mockImplementation(() => chain),
    limit: vi.fn().mockImplementation(() => Promise.resolve(data)),
    then: (resolve: any, reject: any) => Promise.resolve(data).then(resolve, reject),
    catch: (reject: any) => Promise.resolve(data).catch(reject),
    finally: (fn: any) => Promise.resolve(data).finally(fn),
  };
  return chain;
};

vi.mock("../db", () => ({
  getDb: vi.fn(async () => {
    let selectCallCount = 0;
    return {
      select: vi.fn().mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) {
          // First select: influencer ownership check → return influencer
          return makeChain([{ id: 1, name: "carol", bio: null, personality: null, userId: 1 }]);
        }
        // Subsequent selects: post lookup after insert
        return makeChain([{ id: 123, influencerId: 1, status: "draft" }]);
      }),
      insert: vi.fn().mockImplementation(() => ({
        values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
      })),
    };
  }),
}));

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
