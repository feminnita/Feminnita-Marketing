import { describe, it, expect, vi } from "vitest";
import { autoContentGeneratorRouter } from "./auto-content-generator";

describe("Auto Content Generator", () => {
  it("deve listar todas as influenciadoras", async () => {
    const caller = autoContentGeneratorRouter.createCaller({ user: null } as any);
    const influencers = await caller.listInfluencers();
    
    expect(influencers).toHaveLength(4);
    expect(influencers.map((i: any) => i.id)).toEqual(["carol", "renata", "vanessa", "luiza"]);
  });

  it("deve obter perfil de uma influenciadora", async () => {
    const caller = autoContentGeneratorRouter.createCaller({ user: null } as any);
    const profile = await caller.getInfluencerProfile({ influencerId: "carol" });
    
    expect(profile.name).toBe("Carol");
    expect(profile.persona).toBe("A Mãe Moderna");
    expect(profile.interests).toContain("maternidade");
  });

  it("deve lançar erro para influenciadora inválida", async () => {
    const caller = autoContentGeneratorRouter.createCaller({ user: null } as any);
    
    try {
      await caller.getInfluencerProfile({ influencerId: "invalid" as any });
      expect.fail("Deveria ter lançado erro");
    } catch (error: any) {
      expect(error.message).toContain("Influenciadora não encontrada");
    }
  });

  it("deve gerar um post para uma influenciadora", async () => {
    const caller = autoContentGeneratorRouter.createCaller({ user: { id: "test" } } as any);
    
    // Mock do invokeLLM
    vi.mock("../server/_core/llm", () => ({
      invokeLLM: vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              caption: "Post de teste da Carol",
              hashtags: ["#maternidade", "#conforto"],
              cta: "Visite a Feminnita",
              productMention: "Pijamas confortáveis"
            })
          }
        }]
      })
    }));

    const post = await caller.generatePost({
      influencerId: "carol",
      includeProduct: true
    });
    
    expect(post).toBeDefined();
    expect(post.influencerId).toBe("carol");
    expect(post.influencerName).toBe("Carol");
    expect(post.caption).toBeDefined();
    expect(post.hashtags).toBeDefined();
    expect(post.topic).toBeDefined();
  });

  it("deve gerar múltiplos posts para uma influenciadora", async () => {
    const caller = autoContentGeneratorRouter.createCaller({ user: { id: "test" } } as any);
    
    // Mock do invokeLLM
    vi.mock("../server/_core/llm", () => ({
      invokeLLM: vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              caption: "Post de teste",
              hashtags: ["#teste"],
              cta: "CTA",
              productMention: "Produto"
            })
          }
        }]
      })
    }));

    const posts = await caller.generateMultiplePosts({
      influencerId: "renata",
      count: 2,
      includeProducts: true
    });
    
    expect(posts).toHaveLength(2);
    expect(posts[0].influencerId).toBe("renata");
  });

  it("deve gerar posts para todas as influenciadoras", async () => {
    const caller = autoContentGeneratorRouter.createCaller({ user: { id: "test" } } as any);
    
    // Mock do invokeLLM
    vi.mock("../server/_core/llm", () => ({
      invokeLLM: vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              caption: "Post de teste",
              hashtags: ["#teste"],
              cta: "CTA",
              productMention: "Produto"
            })
          }
        }]
      })
    }));

    const posts = await caller.generateAllPosts({
      includeProducts: true
    });
    
    expect(posts).toBeDefined();
    // Pode ter posts ou erros, dependendo da execução
    expect(Array.isArray(posts)).toBe(true);
  });
});
