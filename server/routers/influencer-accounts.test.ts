import { describe, it, expect, beforeEach } from "vitest";
import { influencerAccountsRouter } from "./influencer-accounts";

describe("Influencer Accounts Router - saveAccounts", () => {
  it("should save accounts of an influencer successfully", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.saveAccounts({
      influencerId: 1,
      instagram: "@carol_teste",
      email: "carol@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("sucesso");
    expect(result.data.influencerId).toBe(1);
    expect(result.data.instagram).toBe("@carol_teste");
    expect(result.data.email).toBe("carol@example.com");
  });

  it("should save accounts with only some fields filled", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.saveAccounts({
      influencerId: 2,
      instagram: "@renata_teste",
    });

    expect(result.success).toBe(true);
    expect(result.data.instagram).toBe("@renata_teste");
    expect(result.data.email).toBeUndefined();
  });

  it("should update existing accounts", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // First time
    await caller.saveAccounts({
      influencerId: 3,
      instagram: "@vanessa_v1",
    });

    // Second time (update)
    const result = await caller.saveAccounts({
      influencerId: 3,
      instagram: "@vanessa_v2",
      tiktok: "@vanessa_tiktok",
    });

    expect(result.data.instagram).toBe("@vanessa_v2");
    expect(result.data.tiktok).toBe("@vanessa_tiktok");
  });

  it("should save all fields correctly", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.saveAccounts({
      influencerId: 4,
      email: "luiza@example.com",
      instagram: "@luiza_ig",
      tiktok: "@luiza_tk",
      facebook: "luiza.facebook",
      whatsapp: "+5511999999999",
      youtube: "@luiza_youtube",
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe("luiza@example.com");
    expect(result.data.instagram).toBe("@luiza_ig");
    expect(result.data.tiktok).toBe("@luiza_tk");
    expect(result.data.facebook).toBe("luiza.facebook");
    expect(result.data.whatsapp).toBe("+5511999999999");
    expect(result.data.youtube).toBe("@luiza_youtube");
  });
});

describe("Influencer Accounts Router - getAccounts", () => {
  it("should get accounts of an influencer", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Save first
    await caller.saveAccounts({
      influencerId: 5,
      instagram: "@test_ig",
      email: "test@example.com",
    });

    // Get
    const result = await caller.getAccounts({
      influencerId: 5,
    });

    expect(result).not.toBeNull();
    expect(result?.influencerId).toBe(5);
    expect(result?.instagram).toBe("@test_ig");
    expect(result?.email).toBe("test@example.com");
  });

  it("should return null if accounts do not exist", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.getAccounts({
      influencerId: 999,
    });

    expect(result).toBeNull();
  });
});

describe("Influencer Accounts Router - deleteAccounts", () => {
  it("should delete accounts of an influencer", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Save first
    await caller.saveAccounts({
      influencerId: 6,
      instagram: "@test_delete",
    });

    // Delete
    const deleteResult = await caller.deleteAccounts({
      influencerId: 6,
    });

    expect(deleteResult.success).toBe(true);

    // Verify it was deleted
    const getResult = await caller.getAccounts({
      influencerId: 6,
    });

    expect(getResult).toBeNull();
  });
});

describe("Influencer Accounts Router - getAllAccounts", () => {
  it("should get all saved accounts", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Save some accounts
    await caller.saveAccounts({
      influencerId: 7,
      instagram: "@influencer7",
    });

    await caller.saveAccounts({
      influencerId: 8,
      instagram: "@influencer8",
    });

    const result = await caller.getAllAccounts();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.some((acc) => acc.influencerId === 7)).toBe(true);
    expect(result.some((acc) => acc.influencerId === 8)).toBe(true);
  });
});
