import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { influencerAccountsRouter } from "./influencer-accounts";
import { getDb } from "../db";
import { influencers as influencersTable, influencerAccounts } from "../../drizzle/schema";
import { inArray, eq, desc } from "drizzle-orm";

// IDs of influencers created for this test run
const testInfluencerIds: number[] = [];
let db: any;

const mockContext = {
  user: { id: 1, role: "user" as const },
  req: {} as any,
  res: {} as any,
};

beforeAll(async () => {
  db = await getDb();
  if (!db) return;

  // Create 8 test influencers owned by user 1
  for (let i = 1; i <= 8; i++) {
    await db.insert(influencersTable).values({
      userId: 1,
      name: `Test Influencer ${i}`,
    });
    const [row] = await db
      .select({ id: influencersTable.id })
      .from(influencersTable)
      .where(eq(influencersTable.userId, 1))
      .orderBy(desc(influencersTable.id))
      .limit(1);
    if (row?.id) testInfluencerIds.push(row.id);
  }
});

afterAll(async () => {
  if (!db || testInfluencerIds.length === 0) return;
  await db.delete(influencerAccounts).where(inArray(influencerAccounts.influencerId, testInfluencerIds));
  await db.delete(influencersTable).where(inArray(influencersTable.id, testInfluencerIds));
});

describe("Influencer Accounts Router - saveAccounts", () => {
  it("should save accounts of an influencer successfully", async () => {
    if (testInfluencerIds.length < 1) return;
    const caller = influencerAccountsRouter.createCaller(mockContext);

    const result = await caller.saveAccounts({
      influencerId: testInfluencerIds[0],
      instagram: "@carol_teste",
      email: "carol@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("sucesso");
    expect(result.data.influencerId).toBe(testInfluencerIds[0]);
    expect(result.data.instagram).toBe("@carol_teste");
    expect(result.data.email).toBe("carol@example.com");
  });

  it("should save accounts with only some fields filled", async () => {
    if (testInfluencerIds.length < 2) return;
    const caller = influencerAccountsRouter.createCaller(mockContext);

    const result = await caller.saveAccounts({
      influencerId: testInfluencerIds[1],
      instagram: "@renata_teste",
    });

    expect(result.success).toBe(true);
    expect(result.data.instagram).toBe("@renata_teste");
    expect(result.data.email).toBeUndefined();
  });

  it("should update existing accounts", async () => {
    if (testInfluencerIds.length < 3) return;
    const caller = influencerAccountsRouter.createCaller(mockContext);

    await caller.saveAccounts({
      influencerId: testInfluencerIds[2],
      instagram: "@vanessa_v1",
    });

    const result = await caller.saveAccounts({
      influencerId: testInfluencerIds[2],
      instagram: "@vanessa_v2",
      tiktok: "@vanessa_tiktok",
    });

    expect(result.data.instagram).toBe("@vanessa_v2");
    expect(result.data.tiktok).toBe("@vanessa_tiktok");
  });

  it("should save all fields correctly", async () => {
    if (testInfluencerIds.length < 4) return;
    const caller = influencerAccountsRouter.createCaller(mockContext);

    const result = await caller.saveAccounts({
      influencerId: testInfluencerIds[3],
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
    if (testInfluencerIds.length < 5) return;
    const caller = influencerAccountsRouter.createCaller(mockContext);

    await caller.saveAccounts({
      influencerId: testInfluencerIds[4],
      instagram: "@test_ig",
      email: "test@example.com",
    });

    const result = await caller.getAccounts({
      influencerId: testInfluencerIds[4],
    });

    expect(result).not.toBeNull();
    expect(result?.influencerId).toBe(testInfluencerIds[4]);
    expect(result?.instagram).toBe("@test_ig");
    expect(result?.email).toBe("test@example.com");
  });

  it("should return null if accounts do not exist", async () => {
    const caller = influencerAccountsRouter.createCaller(mockContext);

    const result = await caller.getAccounts({
      influencerId: 999999,
    });

    expect(result).toBeNull();
  });
});

describe("Influencer Accounts Router - deleteAccounts", () => {
  it("should delete accounts of an influencer", async () => {
    if (testInfluencerIds.length < 6) return;
    const caller = influencerAccountsRouter.createCaller(mockContext);

    await caller.saveAccounts({
      influencerId: testInfluencerIds[5],
      instagram: "@test_delete",
    });

    const deleteResult = await caller.deleteAccounts({
      influencerId: testInfluencerIds[5],
    });

    expect(deleteResult.success).toBe(true);

    const getResult = await caller.getAccounts({
      influencerId: testInfluencerIds[5],
    });

    expect(getResult).toBeNull();
  });
});

describe("Influencer Accounts Router - getAllAccounts", () => {
  it("should get all saved accounts", async () => {
    if (testInfluencerIds.length < 8) return;
    const caller = influencerAccountsRouter.createCaller(mockContext);

    await caller.saveAccounts({
      influencerId: testInfluencerIds[6],
      instagram: "@influencer7",
    });

    await caller.saveAccounts({
      influencerId: testInfluencerIds[7],
      instagram: "@influencer8",
    });

    const result = await caller.getAllAccounts();

    expect(Array.isArray(result)).toBe(true);
    expect(result.some((acc) => acc.influencerId === testInfluencerIds[6])).toBe(true);
    expect(result.some((acc) => acc.influencerId === testInfluencerIds[7])).toBe(true);
  });
});
