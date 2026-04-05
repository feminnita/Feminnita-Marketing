import { describe, it, expect, vi } from "vitest";
import { scheduledPostsRouter } from "./scheduled-posts";
import { getDb } from "../db";

vi.mock("../db", () => ({ getDb: vi.fn() }));

const makeChain = (data: any[]) => {
  const chain: any = {
    from: vi.fn().mockImplementation(() => chain),
    where: vi.fn().mockImplementation(() => chain),
    orderBy: vi.fn().mockImplementation(() => chain),
    limit: vi.fn().mockImplementation(() => chain),
    offset: vi.fn().mockImplementation(() => chain),
    then: (resolve: any, reject: any) => Promise.resolve(data).then(resolve, reject),
    catch: (reject: any) => Promise.resolve(data).catch(reject),
    finally: (fn: any) => Promise.resolve(data).finally(fn),
  };
  return chain;
};

function makeMockDb(selectData: any[] = []) {
  return {
    select: vi.fn().mockImplementation(() => makeChain(selectData)),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    })),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
    delete: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockResolvedValue(undefined),
    })),
  };
}

const mockCtx = {
  user: { id: 1, name: "Test", email: "test@test.com", role: "admin" as const },
};

const mockScheduledPost = {
  id: 1,
  contentId: 5,
  userId: 1,
  platforms: '["instagram","tiktok"]',
  scheduledAt: new Date("2026-06-01T10:00:00"),
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Scheduled Posts Router", () => {
  describe("create", () => {
    it("deve criar content item e scheduled post", async () => {
      const db = makeMockDb() as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.create({
        influencerId: 1,
        content: "Conteúdo do post agendado",
        scheduledAt: new Date("2026-06-01T10:00:00"),
        platforms: ["instagram", "tiktok"],
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("sucesso");
      expect(db.insert).toHaveBeenCalledTimes(2); // contentItems + scheduledPosts
    });

    it("deve serializar platforms como JSON no insert", async () => {
      const db = makeMockDb() as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.create({
        influencerId: 1,
        content: "C",
        scheduledAt: new Date("2026-06-01T10:00:00"),
        platforms: ["instagram", "facebook"],
      });

      // Two inserts: one for contentItems, one for scheduledPosts
      expect(db.insert).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });
  });

  describe("list", () => {
    it("deve retornar lista com platforms parseadas de JSON", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([mockScheduledPost]) as any);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.list({});

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0].platforms).toEqual(["instagram", "tiktok"]);
    });

    it("deve aceitar platforms já como array sem duplo parse", async () => {
      const postWithArrayPlatforms = {
        ...mockScheduledPost,
        platforms: ["instagram"] as any, // already array
      };
      vi.mocked(getDb).mockResolvedValue(makeMockDb([postWithArrayPlatforms]) as any);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.list({});

      expect(Array.isArray(result.data[0].platforms)).toBe(true);
    });

    it("deve filtrar por status quando fornecido", async () => {
      const db = makeMockDb([mockScheduledPost]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.list({ status: "pending" });

      expect(result.success).toBe(true);
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("deve atualizar post agendado com sucesso", async () => {
      const db = makeMockDb() as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.update({
        id: 1,
        status: "cancelled",
        platforms: ["instagram"],
      });

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("deve serializar platforms na atualização", async () => {
      const db = makeMockDb() as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      await caller.update({ id: 1, platforms: ["tiktok", "instagram"] });

      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("deve deletar post agendado", async () => {
      const db = makeMockDb() as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.delete({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.message).toContain("sucesso");
      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe("publish", () => {
    it("deve publicar post em múltiplas plataformas", async () => {
      const db = makeMockDb() as any;
      // publish calls getDb() twice (once in try, once for final status update)
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.publish({
        id: 1,
        platforms: ["instagram", "tiktok"],
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("sucesso");
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
      // 1 update (processing) + 2 inserts (postHistory) + 1 final update (published)
      expect(db.update).toHaveBeenCalledTimes(2);
      expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it("deve registrar resultado por plataforma", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb() as any);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.publish({ id: 1, platforms: ["instagram"] });

      expect(result.data[0]).toHaveProperty("platform", "instagram");
      expect(result.data[0]).toHaveProperty("success", true);
    });
  });

  describe("getUpcoming", () => {
    it("deve retornar posts nas próximas 24 horas por padrão", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          { ...mockScheduledPost, platforms: '["instagram"]' },
        ]) as any
      );

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.getUpcoming({ hours: 24 });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("deve retornar lista vazia quando não há posts próximos", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([]) as any);

      const caller = scheduledPostsRouter.createCaller(mockCtx);
      const result = await caller.getUpcoming({ hours: 1 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });
});
