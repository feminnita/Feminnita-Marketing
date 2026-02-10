import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiContentGeneratorRouter } from "./ai-content-generator";

// Mock do invokeLLM
vi.mock("../server/_core/llm", () => ({
  invokeLLM: vi.fn(async (input) => {
    // Simular resposta da IA
    return {
      choices: [
        {
          message: {
            content:
              "Adorei este pijama! Perfeito para as noites de série com meu café ☕️ #PijamaConfortável #MãeModerna",
          },
        },
      ],
    };
  }),
}));

describe("AI Content Generator Router", () => {
  const mockUser = {
    id: 1,
    openId: "test-user",
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
  };

  const mockContext = {
    user: mockUser,
  };

  describe("generateCaption", () => {
    it("deve gerar uma caption para Carol", async () => {
      const caller = aiContentGeneratorRouter.createCaller(mockContext);

      const result = await caller.generateCaption({
        influencerId: 1,
        influencerName: "carol",
        topic: "pijamas confortáveis",
        type: "product",
        productName: "Pijama Algodão Premium",
      });

      expect(result.success).toBe(true);
      expect(result.data.caption).toBeDefined();
      expect(result.data.influencer).toBe("carol");
      expect(result.data.type).toBe("product");
    });

    it("deve gerar uma caption para Renata", async () => {
      const caller = aiContentGeneratorRouter.createCaller(mockContext);

      const result = await caller.generateCaption({
        influencerId: 2,
        influencerName: "renata",
        topic: "descanso executivo",
        type: "lifestyle",
      });

      expect(result.success).toBe(true);
      expect(result.data.influencer).toBe("renata");
    });

    it("deve incluir contexto adicional na caption", async () => {
      const caller = aiContentGeneratorRouter.createCaller(mockContext);

      const result = await caller.generateCaption({
        influencerId: 1,
        influencerName: "carol",
        topic: "noites de série",
        type: "lifestyle",
        additionalContext: "Assistindo The Office",
      });

      expect(result.success).toBe(true);
      expect(result.data.caption).toBeDefined();
    });
  });

  describe("generateHashtags", () => {
    it("deve gerar hashtags para um post", async () => {
      const caller = aiContentGeneratorRouter.createCaller(mockContext);

      const result = await caller.generateHashtags({
        influencerId: 1,
        influencerName: "carol",
        caption: "Adorei este pijama!",
        topic: "pijamas",
        count: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data.hashtags).toBeDefined();
      expect(Array.isArray(result.data.hashtags)).toBe(true);
    });

    it("deve respeitar o limite de hashtags", async () => {
      const caller = aiContentGeneratorRouter.createCaller(mockContext);

      const result = await caller.generateHashtags({
        influencerId: 1,
        influencerName: "carol",
        caption: "Adorei este pijama!",
        topic: "pijamas",
        count: 5,
      });

      expect(result.success).toBe(true);
      expect(result.data.count).toBeLessThanOrEqual(5);
    });
  });

  describe("generateFullPost", () => {
    it("deve gerar um post completo com caption e hashtags", async () => {
      const caller = aiContentGeneratorRouter.createCaller(mockContext);

      const result = await caller.generateFullPost({
        influencerId: 1,
        influencerName: "carol",
        topic: "pijamas confortáveis",
        type: "product",
        productName: "Pijama Algodão Premium",
      });

      expect(result.success).toBe(true);
      expect(result.data.caption).toBeDefined();
      expect(result.data.hashtags).toBeDefined();
      expect(result.data.fullPost).toBeDefined();
      expect(result.data.fullPost).toContain(result.data.caption);
    });

    it("deve incluir hashtags no post completo", async () => {
      const caller = aiContentGeneratorRouter.createCaller(mockContext);

      const result = await caller.generateFullPost({
        influencerId: 1,
        influencerName: "carol",
        topic: "pijamas",
        type: "lifestyle",
      });

      expect(result.success).toBe(true);
      expect(result.data.fullPost).toContain("#");
    });
  });

  describe("getSuggestedTopics", () => {
    it("deve retornar tópicos sugeridos para Carol", async () => {
      const caller = aiContentGeneratorRouter.createCaller(mockContext);

      const result = await caller.getSuggestedTopics({
        influencerName: "carol",
      });

      expect(result.success).toBe(true);
      expect(result.data.persona).toBe("A Mãe Moderna");
      expect(Array.isArray(result.data.suggestedTopics)).toBe(true);
      expect(result.data.suggestedTopics.length).toBeGreaterThan(0);
    });

    it("deve retornar hashtags sugeridas", async () => {
      const caller = aiContentGeneratorRouter.createCaller(mockContext);

      const result = await caller.getSuggestedTopics({
        influencerName: "renata",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.suggestedHashtags)).toBe(true);
      expect(result.data.suggestedHashtags[0]).toContain("#");
    });

    it("deve retornar informações corretas para cada influenciadora", async () => {
      const caller = aiContentGeneratorRouter.createCaller(mockContext);

      const personas = {
        carol: "A Mãe Moderna",
        renata: "A Executiva Elegante",
        vanessa: "A Criativa Artística",
        luiza: "A Fitness Aventureira",
      };

      for (const [name, persona] of Object.entries(personas)) {
        const result = await caller.getSuggestedTopics({
          influencerName: name as "carol" | "renata" | "vanessa" | "luiza",
        });

        expect(result.success).toBe(true);
        expect(result.data.persona).toBe(persona);
      }
    });
  });
});
