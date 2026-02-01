import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
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
      eq(oauthTokens.userId, userId) &&
      eq(oauthTokens.plataforma, plataforma)
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing token
    const result = await db
      .update(oauthTokens)
      .set(values)
      .where(
        eq(oauthTokens.userId, userId) &&
        eq(oauthTokens.plataforma, plataforma)
      );
    return existing[0];
  } else {
    // Insert new token
    await db.insert(oauthTokens).values(values);
    const result = await db
      .select()
      .from(oauthTokens)
      .where(
        eq(oauthTokens.userId, userId) &&
        eq(oauthTokens.plataforma, plataforma)
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
      eq(oauthTokens.userId, userId) &&
      eq(oauthTokens.plataforma, plataforma) &&
      eq(oauthTokens.isActive, true)
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
      eq(oauthTokens.userId, userId) &&
      eq(oauthTokens.plataforma, plataforma)
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
      eq(oauthTokens.userId, userId) &&
      eq(oauthTokens.plataforma, plataforma)
    );
}
