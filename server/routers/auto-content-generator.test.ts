import { describe, it, expect } from "vitest";
import { autoContentGeneratorRouter } from "./auto-content-generator";

const mockUser = { id: 1, name: "Test User", email: "test@example.com", role: "user" as const };
const mockCtx = { user: mockUser };

describe("Auto Content Generator", () => {
  it("deve listar influenciadoras do usuário", async () => {
    const caller = autoContentGeneratorRouter.createCaller(mockCtx);
    const result = await caller.listInfluencers();
    expect(Array.isArray(result)).toBe(true);
    // DB may be empty in test environment — just check shape
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
    }
  });
});
