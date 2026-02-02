import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getDb } from "../db";
import { oauthCredentials } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("OAuth Credentials Router", () => {
  let db: any;
  const testUserId = 999;
  const testPlatform = "canva";

  beforeAll(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database not available for tests");
    }
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (db) {
      await db
        .delete(oauthCredentials)
        .where(eq(oauthCredentials.userId, testUserId));
    }
  });

  it("should save new OAuth credentials", async () => {
    if (!db) throw new Error("Database not available");

    const testData = {
      userId: testUserId,
      platform: testPlatform,
      clientId: "test-client-id-123",
      clientSecret: "test-client-secret-456",
      isConnected: true,
    };

    await db.insert(oauthCredentials).values(testData);

    const saved = await db
      .select()
      .from(oauthCredentials)
      .where(
        and(
          eq(oauthCredentials.userId, testUserId),
          eq(oauthCredentials.platform, testPlatform)
        )
      )
      .limit(1);

    expect(saved).toHaveLength(1);
    expect(saved[0].clientId).toBe("test-client-id-123");
    expect(saved[0].isConnected).toBe(true);
  });

  it("should update existing OAuth credentials", async () => {
    if (!db) throw new Error("Database not available");

    const testData = {
      userId: testUserId,
      platform: "meta",
      clientId: "old-client-id",
      clientSecret: "old-secret",
      isConnected: false,
    };

    // Inserir credencial inicial
    await db.insert(oauthCredentials).values(testData);

    // Buscar e atualizar
    const existing = await db
      .select()
      .from(oauthCredentials)
      .where(
        and(
          eq(oauthCredentials.userId, testUserId),
          eq(oauthCredentials.platform, "meta")
        )
      )
      .limit(1);

    expect(existing).toHaveLength(1);

    // Atualizar
    await db
      .update(oauthCredentials)
      .set({
        clientId: "new-client-id",
        clientSecret: "new-secret",
        isConnected: true,
        updatedAt: new Date(),
      })
      .where(eq(oauthCredentials.id, existing[0].id));

    // Verificar atualização
    const updated = await db
      .select()
      .from(oauthCredentials)
      .where(eq(oauthCredentials.id, existing[0].id))
      .limit(1);

    expect(updated[0].clientId).toBe("new-client-id");
    expect(updated[0].isConnected).toBe(true);
  });

  it("should delete OAuth credentials", async () => {
    if (!db) throw new Error("Database not available");

    const testData = {
      userId: testUserId,
      platform: "tiktok",
      clientId: "test-tiktok-id",
      clientSecret: "test-tiktok-secret",
      isConnected: false,
    };

    // Inserir
    await db.insert(oauthCredentials).values(testData);

    // Verificar que foi inserido
    const before = await db
      .select()
      .from(oauthCredentials)
      .where(
        and(
          eq(oauthCredentials.userId, testUserId),
          eq(oauthCredentials.platform, "tiktok")
        )
      );

    expect(before).toHaveLength(1);

    // Deletar
    await db
      .delete(oauthCredentials)
      .where(
        and(
          eq(oauthCredentials.userId, testUserId),
          eq(oauthCredentials.platform, "tiktok")
        )
      );

    // Verificar que foi deletado
    const after = await db
      .select()
      .from(oauthCredentials)
      .where(
        and(
          eq(oauthCredentials.userId, testUserId),
          eq(oauthCredentials.platform, "tiktok")
        )
      );

    expect(after).toHaveLength(0);
  });

  it("should list all credentials for a user", async () => {
    if (!db) throw new Error("Database not available");

    // Inserir múltiplas credenciais
    const credentials = [
      {
        userId: testUserId,
        platform: "bling",
        clientId: "bling-id",
        clientSecret: "bling-secret",
        isConnected: true,
      },
      {
        userId: testUserId,
        platform: "google_drive",
        clientId: "google-id",
        clientSecret: "google-secret",
        isConnected: false,
      },
    ];

    for (const cred of credentials) {
      await db.insert(oauthCredentials).values(cred);
    }

    // Listar todas
    const all = await db
      .select()
      .from(oauthCredentials)
      .where(eq(oauthCredentials.userId, testUserId));

    expect(all.length).toBeGreaterThanOrEqual(2);
  });

  it("should validate credentials exist", async () => {
    if (!db) throw new Error("Database not available");

    const testData = {
      userId: testUserId,
      platform: "whatsapp",
      clientId: "whatsapp-id",
      clientSecret: "whatsapp-secret",
      isConnected: true,
    };

    await db.insert(oauthCredentials).values(testData);

    // Validar que existe
    const exists = await db
      .select()
      .from(oauthCredentials)
      .where(
        and(
          eq(oauthCredentials.userId, testUserId),
          eq(oauthCredentials.platform, "whatsapp")
        )
      )
      .limit(1);

    expect(exists).toHaveLength(1);
    expect(exists[0].clientId).toBe("whatsapp-id");
  });

  it("should handle multiple platforms for same user", async () => {
    if (!db) throw new Error("Database not available");

    const platforms = ["email_marketing", "tray"];

    for (const platform of platforms) {
      await db.insert(oauthCredentials).values({
        userId: testUserId,
        platform,
        clientId: `${platform}-id`,
        clientSecret: `${platform}-secret`,
        isConnected: false,
      });
    }

    // Verificar que ambas foram inseridas
    const all = await db
      .select()
      .from(oauthCredentials)
      .where(eq(oauthCredentials.userId, testUserId));

    const platformsInDb = all.map((c) => c.platform);
    expect(platformsInDb).toContain("email_marketing");
    expect(platformsInDb).toContain("tray");
  });
});
