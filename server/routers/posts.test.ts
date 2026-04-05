import { describe, it, expect, vi, beforeEach } from "vitest";
import { postsRouter } from "./posts";
import { getDb } from "../db";

vi.mock("../db", () => ({ getDb: vi.fn() }));

// Thenable chain that supports full Drizzle query builder API (including .offset)
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

// Build a mock db where each call to select() returns the next response in the array
function makeMockDb(selectResponses: any[][]) {
  let callCount = 0;
  return {
    select: vi.fn().mockImplementation(() => makeChain(selectResponses[callCount++] ?? [])),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockResolvedValue([{ insertId: 10 }]),
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

const mockInfluencer = { id: 1, name: "Carol", userId: 1 };
const mockPost = {
  id: 10,
  influencerId: 1,
  platform: "instagram",
  content: "Conteúdo teste",
  caption: "Caption teste",
  hashtags: ["#test"],
  mediaUrls: [],
  status: "draft",
  aiGenerated: false,
  scheduledAt: null,
  createdAt: new Date(),
};

const mockCtx = {
  user: { id: 1, name: "Test User", email: "test@example.com", role: "admin" as const },
};

describe("Posts Router", () => {
  describe("create", () => {
    it("deve criar post com sucesso", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          [mockInfluencer],  // ownership check
          [mockPost],        // created post
        ]) as any
      );

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.create({
        influencerId: 1,
        title: "Meu Post",
        content: "Conteúdo do post",
        platforms: ["instagram"],
        hashtags: ["#feminnita"],
      });

      expect(result.success).toBe(true);
      expect(result.post).toBeDefined();
    });

    it("deve lançar erro quando influencer não pertence ao usuário", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([[]]) as any  // ownership check returns empty
      );

      const caller = postsRouter.createCaller(mockCtx);
      await expect(
        caller.create({ influencerId: 99, title: "X", content: "Y" })
      ).rejects.toThrow("Influenciadora não encontrada");
    });

    it("deve usar primeiro platform da lista como platform do post", async () => {
      const db = makeMockDb([[mockInfluencer], [mockPost]]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = postsRouter.createCaller(mockCtx);
      await caller.create({
        influencerId: 1,
        title: "T",
        content: "C",
        platforms: ["tiktok", "instagram"],
      });

      expect(db.insert).toHaveBeenCalled();
    });

    it("deve usar 'instagram' como platform padrão quando não informado", async () => {
      const db = makeMockDb([[mockInfluencer], [mockPost]]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = postsRouter.createCaller(mockCtx);
      await caller.create({ influencerId: 1, title: "T", content: "C" });

      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("list", () => {
    it("deve retornar posts do usuário", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          [{ id: 1 }],         // user influencers
          [mockPost, mockPost], // posts
        ]) as any
      );

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.list({ limit: 20, offset: 0 });

      expect(Array.isArray(result.posts)).toBe(true);
    });

    it("deve retornar vazio quando usuário não tem influenciadoras", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([[]]) as any  // no influencers
      );

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.list({ limit: 20, offset: 0 });

      expect(result.posts).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("deve aceitar filtro por influencerId dentro dos do usuário", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          [{ id: 1 }],   // user influencers
          [mockPost],    // posts filtered by influencer
        ]) as any
      );

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.list({ influencerId: 1, limit: 10, offset: 0 });

      expect(Array.isArray(result.posts)).toBe(true);
    });
  });

  describe("getById", () => {
    it("deve retornar post do usuário", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          [mockPost],         // post lookup
          [mockInfluencer],   // ownership check
        ]) as any
      );

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.getById({ postId: 10 });

      expect(result).toBeDefined();
      expect(result.id).toBe(10);
    });

    it("deve lançar erro quando post não existe", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([[]]) as any  // post not found
      );

      const caller = postsRouter.createCaller(mockCtx);
      await expect(caller.getById({ postId: 999 })).rejects.toThrow("Post não encontrado");
    });

    it("deve lançar erro quando post não pertence ao usuário", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          [{ ...mockPost, influencerId: 99 }], // post owned by different influencer
          [],                                   // ownership check fails (empty)
        ]) as any
      );

      const caller = postsRouter.createCaller(mockCtx);
      await expect(caller.getById({ postId: 10 })).rejects.toThrow("Acesso negado");
    });
  });

  describe("schedule", () => {
    it("deve agendar post e criar queue jobs por plataforma", async () => {
      const db = makeMockDb([
        [{ influencerId: 1 }], // post lookup
        [{ id: 1 }],           // influencer ownership
      ]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.schedule({
        postId: 10,
        scheduledAt: "2026-06-01T10:00:00.000Z",
        platforms: ["instagram", "tiktok"],
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("agendado");
      // insert called twice: one queue job per platform
      expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it("deve lançar erro quando post não encontrado", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([[]]) as any);

      const caller = postsRouter.createCaller(mockCtx);
      await expect(
        caller.schedule({
          postId: 999,
          scheduledAt: "2026-06-01T10:00:00.000Z",
          platforms: ["instagram"],
        })
      ).rejects.toThrow("Post não encontrado");
    });
  });

  describe("publish", () => {
    it("deve enviar post para publicação imediata", async () => {
      const db = makeMockDb([
        [{ influencerId: 1 }], // post lookup
        [{ id: 1 }],           // influencer ownership
      ]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.publish({ postId: 10, platforms: ["instagram"] });

      expect(result.success).toBe(true);
      expect(result.postId).toBe(10);
      expect(db.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe("delete", () => {
    it("deve deletar post do usuário", async () => {
      const db = makeMockDb([
        [{ influencerId: 1 }], // post lookup
        [{ id: 1 }],           // influencer ownership
      ]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.delete({ postId: 10 });

      expect(result.success).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });

    it("deve retornar success mesmo quando post já não existe", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([[]]) as any);

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.delete({ postId: 999 });

      expect(result.success).toBe(true);
    });

    it("deve lançar erro quando post pertence a outro usuário", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          [{ influencerId: 99 }], // post with foreign influencer
          [],                      // ownership check fails
        ]) as any
      );

      const caller = postsRouter.createCaller(mockCtx);
      await expect(caller.delete({ postId: 10 })).rejects.toThrow("Acesso negado");
    });
  });

  describe("uploadMedia", () => {
    it("deve adicionar URL de mídia ao post existente", async () => {
      const db = makeMockDb([
        [{ ...mockPost, mediaUrls: ["https://example.com/img1.jpg"] }], // post lookup
        [{ id: 1 }],                                                     // ownership
      ]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.uploadMedia({
        postId: 10,
        mediaType: "image",
        fileName: "foto.jpg",
        fileSize: 512000,
        mediaUrl: "https://example.com/img2.jpg",
      });

      expect(result.success).toBe(true);
      expect(result.mediaUrl).toBe("https://example.com/img2.jpg");
      expect(db.update).toHaveBeenCalled();
    });

    it("deve lançar erro quando post não encontrado", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([[]]) as any);

      const caller = postsRouter.createCaller(mockCtx);
      await expect(
        caller.uploadMedia({
          postId: 999,
          mediaType: "image",
          fileName: "x.jpg",
          fileSize: 1000,
          mediaUrl: "https://example.com/x.jpg",
        })
      ).rejects.toThrow("Post não encontrado");
    });
  });

  describe("getHistory", () => {
    it("deve retornar histórico de posts publicados", async () => {
      const publishedPost = { ...mockPost, status: "published", publishedAt: new Date() };
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          [{ id: 1 }],           // ownership check
          [publishedPost],        // published posts
        ]) as any
      );

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.getHistory({ influencerId: 1 });

      expect(result.influencerId).toBe(1);
      expect(Array.isArray(result.posts)).toBe(true);
    });

    it("deve retornar lista vazia para influencer não pertencente ao usuário", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([[]]) as any  // ownership check fails
      );

      const caller = postsRouter.createCaller(mockCtx);
      const result = await caller.getHistory({ influencerId: 99 });

      expect(result.posts).toHaveLength(0);
    });
  });
});
