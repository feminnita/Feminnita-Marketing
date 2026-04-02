import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name?: string;
  role?: "user" | "admin";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const role = data.role ?? (data.email === ENV.adminEmail ? "admin" : "user");
  await db.insert(users).values({
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name ?? null,
    role,
    lastSignedIn: new Date(),
  });

  const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  return user;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? undefined;
}

export async function updateLastSignedIn(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

// TODO: add feature queries here as your schema grows.

// ============ OAuth Tokens Management ============
import { oauthTokens, InsertOAuthToken, OAuthToken } from "../drizzle/schema";

export async function saveOAuthToken(
  userId: number,
  plataforma: "bling" | "meta" | "tiktok" | "google_drive",
  token: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    scope?: string;
    accountInfo?: Record<string, any>;
  }
): Promise<OAuthToken> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const expiresAt = token.expiresIn
    ? new Date(Date.now() + token.expiresIn * 1000)
    : null;

  const values: InsertOAuthToken = {
    userId,
    plataforma,
    accessToken: token.accessToken,
    refreshToken: token.refreshToken || null,
    expiresAt,
    scope: token.scope || null,
    accountInfo: token.accountInfo ? JSON.stringify(token.accountInfo) : null,
    isActive: true,
  };

  // Check if token already exists
  const existing = await db
    .select()
    .from(oauthTokens)
    .where(
      and(
        eq(oauthTokens.userId, userId),
        eq(oauthTokens.plataforma, plataforma)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing token
    const result = await db
      .update(oauthTokens)
      .set(values)
      .where(
        and(
          eq(oauthTokens.userId, userId),
          eq(oauthTokens.plataforma, plataforma)
        )
      );
    return existing[0];
  } else {
    // Insert new token
    await db.insert(oauthTokens).values(values);
    const result = await db
      .select()
      .from(oauthTokens)
      .where(
        and(
          eq(oauthTokens.userId, userId),
          eq(oauthTokens.plataforma, plataforma)
        )
      )
      .limit(1);
    return result[0];
  }
}

export async function getOAuthToken(
  userId: number,
  plataforma: "bling" | "meta" | "tiktok" | "google_drive"
): Promise<OAuthToken | undefined> {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(oauthTokens)
    .where(
      and(
        eq(oauthTokens.userId, userId),
        eq(oauthTokens.plataforma, plataforma),
        eq(oauthTokens.isActive, true)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function deleteOAuthToken(
  userId: number,
  plataforma: "bling" | "meta" | "tiktok" | "google_drive"
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(oauthTokens)
    .set({ isActive: false })
    .where(
      and(
        eq(oauthTokens.userId, userId),
        eq(oauthTokens.plataforma, plataforma)
      )
    );
}

export async function updateOAuthTokenLastUsed(
  userId: number,
  plataforma: "bling" | "meta" | "tiktok" | "google_drive"
): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  await db
    .update(oauthTokens)
    .set({ lastUsed: new Date() })
    .where(
      and(
        eq(oauthTokens.userId, userId),
        eq(oauthTokens.plataforma, plataforma)
      )
    );
}
