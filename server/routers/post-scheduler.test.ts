import { describe, it, expect } from "vitest";
import { postSchedulerRouter } from "./post-scheduler";

describe("Post Scheduler Router", () => {
  it("should schedule posting days", async () => {
    const caller = postSchedulerRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.schedulePostingDays({
      influencerId: 1,
      platforms: ["instagram", "tiktok"],
      postTime: "14:00",
    });

    expect(result.success).toBe(true);
    expect(result.schedule.days).toContain("Tuesday");
    expect(result.schedule.days).toContain("Friday");
    expect(result.schedule.time).toBe("14:00");
  });

  it("should send theme reminder", async () => {
    const caller = postSchedulerRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.sendThemeReminder({
      influencerId: 1,
    });

    expect(result.success).toBe(true);
    expect(result.reminder.day).toBe("Monday");
  });

  it("should request theme approval", async () => {
    const caller = postSchedulerRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.requestThemeApproval({
      influencerId: 1,
      theme: "Verão 2026",
      model: "Coleção Premium",
      description: "Nova coleção de verão com designs exclusivos",
    });

    expect(result.success).toBe(true);
    expect(result.approvalRequest.status).toBe("pending");
    expect(result.approvalRequest.theme).toBe("Verão 2026");
  });

  it("should approve theme and generate content", async () => {
    const caller = postSchedulerRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.approveThemeAndGenerate({
      approvalId: "approval_123",
      influencerId: 1,
      theme: "Verão 2026",
      model: "Coleção Premium",
      platforms: ["instagram", "tiktok"],
    });

    expect(result.success).toBe(true);
    expect(result.generatedContent.status).toBe("approved");
    expect(result.generatedContent.content.instagram).toBeDefined();
    expect(result.generatedContent.content.tiktok).toBeDefined();
  });

  it("should get scheduled posts", async () => {
    const caller = postSchedulerRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.getScheduledPosts({
      influencerId: 1,
    });

    expect(result.success).toBe(true);
    expect(Array.isArray(result.posts)).toBe(true);
    expect(result.nextPosting).toBeDefined();
  });

  it("should get posting schedule", async () => {
    const caller = postSchedulerRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.getPostingSchedule({
      influencerId: 1,
    });

    expect(result.success).toBe(true);
    expect(result.schedule.days).toContain("Tuesday");
    expect(result.schedule.days).toContain("Friday");
  });

  it("should cancel scheduled post", async () => {
    const caller = postSchedulerRouter.createCaller({
      user: { id: "test-user", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.cancelPost({
      postId: "post_123",
      reason: "Tema não aprovado",
    });

    expect(result.success).toBe(true);
  });
});
