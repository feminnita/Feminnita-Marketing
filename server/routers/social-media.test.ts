import { describe, it, expect, vi } from "vitest";
import { socialMediaRouter } from "./social-media";
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

function makeMockDb(selectResponses: any[][]) {
  let callCount = 0;
  return {
    select: vi.fn().mockImplementation(() => makeChain(selectResponses[callCount++] ?? [])),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    })),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  };
}

const mockInfluencer = { id: 1, name: "Carol", userId: 1 };
const mockAccount = {
  id: 1,
  influencerId: 1,
  email: "carol@test.com",
  instagram: "@carol",
  tiktok: "@carol_tk",
  facebook: "carol.fb",
  whatsapp: "+5511999999999",
  youtube: "@carol_yt",
};

const mockCtx = {
  user: { id: 1, name: "Test", email: "test@test.com", role: "admin" as const },
};

describe("Social Media Router", () => {
  describe("saveInfluencerAccounts", () => {
    it("deve inserir contas quando não existem ainda", async () => {
      const db = makeMockDb([
        [mockInfluencer], // ownership check
        [],               // no existing accounts
        [mockAccount],    // updated accounts after insert
      ]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = socialMediaRouter.createCaller(mockCtx);
      const result = await caller.saveInfluencerAccounts({
        influencerId: 1,
        instagram: "@carol_nova",
        email: "carol@test.com",
      });

      expect(result.success).toBe(true);
      expect(db.insert).toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });

    it("deve atualizar contas quando já existem", async () => {
      const db = makeMockDb([
        [mockInfluencer], // ownership check
        [mockAccount],    // existing account found
        [mockAccount],    // updated account
      ]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = socialMediaRouter.createCaller(mockCtx);
      const result = await caller.saveInfluencerAccounts({
        influencerId: 1,
        instagram: "@carol_v2",
      });

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
      expect(db.insert).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando influencer não pertence ao usuário", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([[]]) as any);

      const caller = socialMediaRouter.createCaller(mockCtx);
      await expect(
        caller.saveInfluencerAccounts({ influencerId: 99, instagram: "@x" })
      ).rejects.toThrow("Influenciadora não encontrada");
    });
  });

  describe("getInfluencerAccounts", () => {
    it("deve retornar contas da influencer", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          [{ id: 1 }],   // ownership check
          [mockAccount],  // accounts
        ]) as any
      );

      const caller = socialMediaRouter.createCaller(mockCtx);
      const result = await caller.getInfluencerAccounts({ influencerId: 1 });

      expect(result).toBeDefined();
      expect(result.instagram).toBe("@carol");
    });

    it("deve retornar campos vazios para influencer não pertencente ao usuário", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([[]]) as any);

      const caller = socialMediaRouter.createCaller(mockCtx);
      const result = await caller.getInfluencerAccounts({ influencerId: 99 });

      expect(result.instagram).toBe("");
      expect(result.tiktok).toBe("");
      expect(result.email).toBe("");
    });

    it("deve retornar defaults quando não há contas cadastradas", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          [{ id: 1 }], // ownership ok
          [],           // no accounts
        ]) as any
      );

      const caller = socialMediaRouter.createCaller(mockCtx);
      const result = await caller.getInfluencerAccounts({ influencerId: 1 });

      expect(result.instagram).toBe("");
    });
  });

  describe("publishPost", () => {
    it("deve criar posts para cada plataforma não-WhatsApp", async () => {
      const db = makeMockDb([[{ id: 1 }]]) as any; // ownership check
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = socialMediaRouter.createCaller(mockCtx);
      const result = await caller.publishPost({
        influencerId: 1,
        title: "Post Teste",
        content: "Conteúdo",
        platforms: ["instagram", "tiktok", "whatsapp"],
      });

      expect(result.success).toBe(true);
      // WhatsApp should be skipped: only 2 inserts for instagram + tiktok
      expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it("deve lançar erro quando influencer não encontrada", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([[]]) as any);

      const caller = socialMediaRouter.createCaller(mockCtx);
      await expect(
        caller.publishPost({
          influencerId: 99,
          title: "T",
          content: "C",
          platforms: ["instagram"],
        })
      ).rejects.toThrow("Influenciadora não encontrada");
    });

    it("deve retornar lista de plataformas na resposta", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([[{ id: 1 }]]) as any);

      const caller = socialMediaRouter.createCaller(mockCtx);
      const result = await caller.publishPost({
        influencerId: 1,
        title: "T",
        content: "C",
        platforms: ["instagram", "facebook"],
      });

      expect(result.platforms).toContain("instagram");
      expect(result.platforms).toContain("facebook");
    });
  });

  describe("schedulePost", () => {
    const mockContentItem = { id: 5, userId: 1, title: "Post agendado - 01/06/2026", content: "C", status: "scheduled" };
    const mockScheduledPost = { id: 20, contentId: 5, userId: 1, platforms: '["instagram"]', scheduledAt: new Date(), status: "pending" };

    it("deve criar content item e scheduled post", async () => {
      const db = makeMockDb([
        [mockContentItem],    // content item after insert
        [mockScheduledPost],  // scheduled post after insert
      ]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = socialMediaRouter.createCaller(mockCtx);
      const result = await caller.schedulePost({
        influencerId: 1,
        title: "Meu Post",
        content: "Conteúdo do post",
        scheduledDate: "2026-06-01",
        scheduledTime: "10:00",
        platforms: ["instagram"],
      });

      expect(result.success).toBe(true);
      expect(result.postId).toBeDefined();
      expect(db.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe("getScheduledPosts", () => {
    it("deve retornar posts agendados do usuário", async () => {
      const mockPost = { id: 1, userId: 1, platforms: '["instagram"]', status: "pending", scheduledAt: new Date() };
      vi.mocked(getDb).mockResolvedValue(makeMockDb([[mockPost]]) as any);

      const caller = socialMediaRouter.createCaller(mockCtx);
      const result = await caller.getScheduledPosts({});

      expect(Array.isArray(result.posts)).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe("deleteScheduledPost", () => {
    it("deve cancelar post agendado", async () => {
      const db = makeMockDb([]) as any;
      vi.mocked(getDb).mockResolvedValue(db);

      const caller = socialMediaRouter.createCaller(mockCtx);
      const result = await caller.deleteScheduledPost({ postId: 1 });

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });
  });
});
