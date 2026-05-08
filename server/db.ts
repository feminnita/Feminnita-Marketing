import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, and, or, desc } from "drizzle-orm";
import { users, portalUsers, portalMaterials } from "../drizzle/schema";
import { ENV } from './_core/env';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _pool: any = null;
let _db: any = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Parse DATABASE_URL manually to pass SSL options correctly for TiDB Cloud
      const url = new URL(process.env.DATABASE_URL);
      _pool = mysql.createPool({
        host: url.hostname,
        port: Number(url.port) || 4000,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname.replace("/", "") || "feminnita",
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 5,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });
      _db = drizzle(_pool);
      // Test connection
      await _pool.query("SELECT 1");
      console.log("[Database] Connected to TiDB Cloud");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _pool = null;
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
  if (!db) throw new Error("Database unavailable — check DATABASE_URL and network");
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? undefined;
  } catch (err: any) {
    console.error("[getUserByEmail] Query error:", err?.message ?? err);
    throw new Error(`Database error: ${err?.code ?? err?.message ?? "unknown"}`);
  }
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

// ============ Portal Users ============

export async function getPortalUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [user] = await db.select().from(portalUsers).where(eq(portalUsers.id, id)).limit(1);
  return user ?? undefined;
}

export async function getPortalUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [user] = await db.select().from(portalUsers).where(eq(portalUsers.email, email)).limit(1);
  return user ?? undefined;
}

export async function createPortalUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  profileType: "revendedora" | "influencer";
  instagramHandle?: string;
  phone?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(portalUsers).values({
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name,
    profileType: data.profileType,
    instagramHandle: data.instagramHandle ?? null,
    phone: data.phone ?? null,
    status: "pending",
  });
  const [user] = await db.select().from(portalUsers).where(eq(portalUsers.email, data.email)).limit(1);
  return user;
}

export async function listPortalUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portalUsers).orderBy(desc(portalUsers.createdAt));
}

export async function updatePortalUserStatus(
  id: number,
  status: "pending" | "approved" | "blocked",
  approvedById?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Record<string, any> = { status };
  if (status === "approved" && approvedById) {
    updates.approvedBy = approvedById;
    updates.approvedAt = new Date();
  }
  await db.update(portalUsers).set(updates).where(eq(portalUsers.id, id));
}

export async function listPortalMaterials(profileType?: "revendedora" | "influencer") {
  const db = await getDb();
  if (!db) return [];
  if (profileType) {
    return db.select().from(portalMaterials).where(
      and(
        eq(portalMaterials.isActive, true),
        or(eq(portalMaterials.availableTo, profileType), eq(portalMaterials.availableTo, "ambos"))
      )
    );
  }
  return db.select().from(portalMaterials).where(eq(portalMaterials.isActive, true));
}

export async function listAllPortalMaterials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portalMaterials).orderBy(desc(portalMaterials.createdAt));
}

export async function createPortalMaterial(data: {
  title: string;
  description?: string;
  category: "fotos" | "videos" | "banners" | "copy" | "lookbook" | "calculadora" | "links";
  url: string;
  filename?: string;
  availableTo: "revendedora" | "influencer" | "ambos";
  uploadedBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(portalMaterials).values({
    title: data.title,
    description: data.description ?? null,
    category: data.category,
    url: data.url,
    filename: data.filename ?? null,
    availableTo: data.availableTo,
    uploadedBy: data.uploadedBy,
    isActive: true,
  });
}

export async function updatePortalMaterial(id: number, data: {
  title?: string;
  description?: string;
  category?: "fotos" | "videos" | "banners" | "copy" | "lookbook" | "calculadora" | "links";
  url?: string;
  filename?: string;
  availableTo?: "revendedora" | "influencer" | "ambos";
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(portalMaterials).set(data).where(eq(portalMaterials.id, id));
}

export async function deactivatePortalMaterial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(portalMaterials).set({ isActive: false }).where(eq(portalMaterials.id, id));
}

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
