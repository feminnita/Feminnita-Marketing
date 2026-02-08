import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { influencerBlogRouter } from "./influencer-blog";
import { getDb } from "../db";

describe("Influencer Blog Router", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
  });

  it("should list influencers", async () => {
    const caller = influencerBlogRouter.createCaller({
      user: { id: "test-user", role: "admin" },
      req: {} as any,
      res: {} as any,
    });

    const influencers = await caller.listInfluencers();
    expect(Array.isArray(influencers)).toBe(true);
  });

  it("should get posts for an influencer", async () => {
    const caller = influencerBlogRouter.createCaller({
      user: { id: "test-user", role: "admin" },
      req: {} as any,
      res: {} as any,
    });

    const posts = await caller.getPosts({ influencerId: 1 });
    expect(Array.isArray(posts)).toBe(true);
  });

  it("should create a draft post", async () => {
    const caller = influencerBlogRouter.createCaller({
      user: { id: "test-user", role: "admin" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.createPost({
      influencerId: 1,
      content: "Test post content",
      caption: "Test caption",
      hashtags: ["#test"],
      platform: "instagram",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it("should create a scheduled post", async () => {
    const caller = influencerBlogRouter.createCaller({
      user: { id: "test-user", role: "admin" },
      req: {} as any,
      res: {} as any,
    });

    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

    const result = await caller.createPost({
      influencerId: 1,
      content: "Scheduled post content",
      caption: "Scheduled caption",
      hashtags: ["#scheduled"],
      scheduledAt: futureDate,
      platform: "instagram",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });
});
