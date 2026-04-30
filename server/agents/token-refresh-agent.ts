import { getDb } from "../db";
import { oauthTokens } from "../../drizzle/schema";
import { eq, and, lte, isNotNull } from "drizzle-orm";
import { refreshMLToken } from "../routers/ml-oauth";
import { refreshShopeeToken } from "../routers/shopee-oauth";

const REFRESH_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 horas
const EXPIRY_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 horas
const MAX_RETRY_FAILURES = 3;

interface RefreshResult {
  accessToken: string;
  expiresAt: Date;
}

async function refreshBling(refreshToken: string): Promise<RefreshResult> {
  const res = await fetch("https://bling.com.br/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.BLING_CLIENT_ID ?? "",
      client_secret: process.env.BLING_CLIENT_SECRET ?? "",
    }),
  });
  if (!res.ok) throw new Error(`Bling refresh HTTP ${res.status}`);
  const data = await res.json();
  const expiresIn: number = data.expires_in ?? 21600;
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  };
}

async function refreshMeta(accessToken: string): Promise<RefreshResult> {
  const url = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.META_CLIENT_ID ?? "");
  url.searchParams.set("client_secret", process.env.META_CLIENT_SECRET ?? "");
  url.searchParams.set("fb_exchange_token", accessToken);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Meta refresh HTTP ${res.status}`);
  const data = await res.json();
  const expiresIn: number = data.expires_in ?? 5183944; // ~60 dias
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  };
}

async function refreshTikTok(refreshToken: string): Promise<RefreshResult> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_key: process.env.TIKTOK_CLIENT_ID ?? "",
      client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
    }),
  });
  if (!res.ok) throw new Error(`TikTok refresh HTTP ${res.status}`);
  const data = await res.json();
  const expiresIn: number = data.data?.expires_in ?? 86400;
  return {
    accessToken: data.data?.access_token,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  };
}

async function refreshGoogle(refreshToken: string): Promise<RefreshResult> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  });
  if (!res.ok) throw new Error(`Google refresh HTTP ${res.status}`);
  const data = await res.json();
  const expiresIn: number = data.expires_in ?? 3600;
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
  };
}

async function attemptRefresh(token: {
  id: number;
  plataforma: string;
  accessToken: string;
  refreshToken: string | null;
}): Promise<RefreshResult> {
  switch (token.plataforma) {
    case "bling":
      if (!token.refreshToken) throw new Error("Bling: refreshToken ausente");
      return refreshBling(token.refreshToken);
    case "meta":
      return refreshMeta(token.accessToken);
    case "tiktok":
      if (!token.refreshToken) throw new Error("TikTok: refreshToken ausente");
      return refreshTikTok(token.refreshToken);
    case "google_drive":
      if (!token.refreshToken) throw new Error("Google: refreshToken ausente");
      return refreshGoogle(token.refreshToken);
    default:
      throw new Error(`Plataforma desconhecida: ${token.plataforma}`);
  }
}

// Contagem de falhas consecutivas por token id
const failureCount = new Map<number, number>();

async function runTokenRefresh(): Promise<void> {
  console.log("[TokenRefresh] Verificando tokens próximos do vencimento...");
  const db = await getDb();
  if (!db) { console.warn("[TokenRefresh] Banco indisponível — verificação abortada"); return; }

  const threshold = new Date(Date.now() + EXPIRY_THRESHOLD_MS);

  try {
    const tokens = await db
      .select()
      .from(oauthTokens)
      .where(
        and(
          eq(oauthTokens.isActive, true),
          isNotNull(oauthTokens.expiresAt),
          lte(oauthTokens.expiresAt, threshold)
        )
      );

    console.log(`[TokenRefresh] ${tokens.length} token(s) para renovar`);

    for (const token of tokens) {
      try {
        console.log(`[TokenRefresh] Renovando id=${token.id} plataforma=${token.plataforma} userId=${token.userId}`);
        const result = await attemptRefresh(token);

        await db.update(oauthTokens).set({
          accessToken: result.accessToken,
          expiresAt: result.expiresAt,
          updatedAt: new Date(),
        }).where(eq(oauthTokens.id, token.id));

        failureCount.delete(token.id);
        console.log(`[TokenRefresh] Token id=${token.id} renovado com sucesso — expira em ${result.expiresAt.toISOString()}`);
      } catch (err) {
        const failures = (failureCount.get(token.id) ?? 0) + 1;
        failureCount.set(token.id, failures);
        console.error(`[TokenRefresh] Token id=${token.id} falhou (tentativa ${failures}/${MAX_RETRY_FAILURES}):`, err);

        if (failures >= MAX_RETRY_FAILURES) {
          await db.update(oauthTokens).set({ isActive: false, updatedAt: new Date() })
            .where(eq(oauthTokens.id, token.id));
          failureCount.delete(token.id);
          console.warn(`[TokenRefresh] Token id=${token.id} desativado após ${MAX_RETRY_FAILURES} falhas consecutivas`);
        }
      }
    }
  } catch (err) {
    console.error("[TokenRefresh] Erro ao buscar tokens:", err);
  }

  console.log("[TokenRefresh] Verificação concluída.");
}

async function runMarketplaceRefresh(): Promise<void> {
  console.log("[MarketplaceRefresh] Renovando tokens ML (conta 1 e 2) e Shopee...");
  await refreshMLToken("feminnita").catch((e) => console.error("[MarketplaceRefresh] ML feminnita:", e.message));
  await refreshMLToken("fnt").catch((e) => console.error("[MarketplaceRefresh] ML fnt:", e.message));
  await refreshShopeeToken().catch((e) => console.error("[MarketplaceRefresh] Shopee:", e.message));
  console.log("[MarketplaceRefresh] Concluído.");
}

const MARKETPLACE_REFRESH_INTERVAL_MS = 5 * 60 * 60 * 1000; // 5 horas

export function startTokenRefreshAgent(): () => void {
  console.log("[TokenRefresh] Agente iniciado (intervalo=2h, limiar=24h)");

  runTokenRefresh().catch((err) => console.error("[TokenRefresh] Erro na execução inicial:", err));

  const interval = setInterval(() => {
    runTokenRefresh().catch((err) => console.error("[TokenRefresh] Erro no interval:", err));
  }, REFRESH_INTERVAL_MS);

  // Marketplace tokens (ML Feminnita, ML FNT, Shopee) — renovar a cada 5h
  runMarketplaceRefresh().catch((e) => console.error("[MarketplaceRefresh] Erro inicial:", e.message));
  const mlInterval = setInterval(() => {
    runMarketplaceRefresh().catch((e) => console.error("[MarketplaceRefresh] Erro:", e.message));
  }, MARKETPLACE_REFRESH_INTERVAL_MS);

  return () => {
    clearInterval(interval);
    clearInterval(mlInterval);
    console.log("[TokenRefresh] Agente encerrado.");
  };
}
