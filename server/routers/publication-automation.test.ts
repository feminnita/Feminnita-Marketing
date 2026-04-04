import { describe, it, expect, vi, beforeEach } from "vitest";
import { publicationAutomationRouter } from "./publication-automation";

const mockRow = {
  id: 1, contentId: 1, userId: 1,
  platforms: '["instagram", "tiktok"]',
  scheduledAt: new Date("2026-02-10T10:00:00"),
  status: "pending", failureReason: null,
  createdAt: new Date(), updatedAt: new Date(),
};

// Thenable chain so both `await db.select().from().where()` (no .limit)
// and `await db.select().from().where().orderBy().limit()` work.
const makeThenableChain = (data: any[]) => {
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
  getDb: vi.fn(async () => ({
    select: vi.fn().mockImplementation(() => makeThenableChain([mockRow])),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  })),
}));

describe("Publication Automation Router", () => {
  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
  };

  const mockContext = {
    user: mockUser,
  };

  describe("checkPendingPosts", () => {
    it("deve retornar posts pendentes", async () => {
      const caller = publicationAutomationRouter.createCaller(mockContext);

      const result = await caller.checkPendingPosts();

      expect(result.success).toBe(true);
      expect(result.data.count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.data.posts)).toBe(true);
    });
  });

  describe("getPublicationHistory", () => {
    it("deve retornar histórico de publicações", async () => {
      const caller = publicationAutomationRouter.createCaller(mockContext);

      const result = await caller.getPublicationHistory({
        limit: 50,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("deve filtrar por status", async () => {
      const caller = publicationAutomationRouter.createCaller(mockContext);

      const result = await caller.getPublicationHistory({
        status: "published",
        limit: 50,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("deve respeitar o limite de resultados", async () => {
      const caller = publicationAutomationRouter.createCaller(mockContext);

      const result = await caller.getPublicationHistory({
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe("getPublicationStats", () => {
    it("deve retornar estatísticas de publicação", async () => {
      const caller = publicationAutomationRouter.createCaller(mockContext);

      const result = await caller.getPublicationStats();

      expect(result.success).toBe(true);
      expect(result.data.total).toBeGreaterThanOrEqual(0);
      expect(result.data.published).toBeGreaterThanOrEqual(0);
      expect(result.data.failed).toBeGreaterThanOrEqual(0);
      expect(result.data.pending).toBeGreaterThanOrEqual(0);
      expect(result.data.cancelled).toBeGreaterThanOrEqual(0);
    });

    it("deve ter total igual à soma de todos os status", async () => {
      const caller = publicationAutomationRouter.createCaller(mockContext);

      const result = await caller.getPublicationStats();

      expect(result.success).toBe(true);
      const sum =
        result.data.published +
        result.data.failed +
        result.data.pending +
        result.data.cancelled;
      expect(result.data.total).toBe(sum);
    });
  });

  describe("startAutomation", () => {
    it("deve iniciar a automação", async () => {
      const caller = publicationAutomationRouter.createCaller(mockContext);

      const result = await caller.startAutomation();

      expect(result.success).toBe(true);
      expect(result.message).toBe("Automação iniciada");
      expect(result.jobId).toBeDefined();
    });
  });

  describe("stopAutomation", () => {
    it("deve parar a automação", async () => {
      const caller = publicationAutomationRouter.createCaller(mockContext);

      const startResult = await caller.startAutomation();
      const stopResult = await caller.stopAutomation({
        jobId: startResult.jobId,
      });

      expect(stopResult.success).toBe(true);
      expect(stopResult.message).toBe("Automação parada");
    });
  });
});
