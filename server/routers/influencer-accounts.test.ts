import { describe, it, expect } from "vitest";
import { influencerAccountsRouter } from "./influencer-accounts";

describe("Influencer Accounts Router", () => {
  it("should add a new Instagram account", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.addAccount({
      influencerId: 1,
      platform: "instagram",
      accountHandle: "carol_feminnita",
      accessToken: "IGQVJXa...",
      accountId: "12345678",
    });

    expect(result.success).toBe(true);
    expect(result.account.platform).toBe("instagram");
    expect(result.account.accountHandle).toBe("carol_feminnita");
  });

  it("should get influencer accounts", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.getInfluencerAccounts({
      influencerId: 1,
    });

    expect(result.success).toBe(true);
    expect(Array.isArray(result.accounts)).toBe(true);
  });

  it("should sync account metrics", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.syncAccountMetrics({
      influencerId: 1,
      platform: "instagram",
    });

    expect(result.success).toBe(true);
    expect(result.metrics).toBeDefined();
    expect(result.metrics.followers).toBeGreaterThan(0);
  });

  it("should publish post to account", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.publishPost({
      influencerId: 1,
      platform: "instagram",
      content: "Test content",
      caption: "Test caption",
      hashtags: ["#test", "#feminnita"],
    });

    expect(result.success).toBe(true);
    expect(result.postId).toBeDefined();
    expect(result.platform).toBe("instagram");
  });

  it("should get connection status", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.getConnectionStatus({
      influencerId: 1,
    });

    expect(result.success).toBe(true);
    expect(Array.isArray(result.platforms)).toBe(true);
    expect(result.platforms.length).toBeGreaterThan(0);
  });

  it("should disconnect account", async () => {
    const caller = influencerAccountsRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.disconnectAccount({
      influencerId: 1,
      platform: "instagram",
    });

    expect(result.success).toBe(true);
  });
});
