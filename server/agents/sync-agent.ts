import { getDb } from "../db";
import { oauthTokens, metaSyncHistory } from "../../drizzle/schema";
import { eq, and, isNotNull } from "drizzle-orm";

const BLING_SYNC_INTERVAL_MS = 60 * 60 * 1000; // 60 min
const META_SYNC_INTERVAL_MS = 30 * 60 * 1000;  // 30 min

async function syncBlingForUser(userId: number, accessToken: string): Promise<void> {
  const endpoints = [
    { name: "produtos",  path: "/produtos?pagina=1&limite=100" },
    { name: "pedidos",   path: "/pedidos?pagina=1&limite=100" },
    { name: "contatos",  path: "/contatos?pagina=1&limite=100" },
    { name: "estoques",  path: "/estoques?pagina=1&limite=100" },
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(
        `https://www.bling.com.br/Api/v3${endpoint.path}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!res.ok) {
        console.warn(`[SyncAgent] Bling ${endpoint.name} userId=${userId} HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const count = Array.isArray(data?.data) ? data.data.length : 0;
      console.log(`[SyncAgent] Bling ${endpoint.name} userId=${userId} — ${count} registros`);
    } catch (err) {
      console.error(`[SyncAgent] Bling ${endpoint.name} userId=${userId} erro:`, err);
    }
  }
}

async function syncMetaForUser(userId: number, accessToken: string): Promise<void> {
  const startedAt = Date.now();
  let totalCampaigns = 0;
  let updatedCampaigns = 0;
  let failedCampaigns = 0;
  let status: "success" | "partial" | "failed" = "success";
  let errorMessage: string | undefined;

  try {
    const accountsRes = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,currency,account_status&access_token=${accessToken}`
    );
    if (!accountsRes.ok) throw new Error(`Accounts HTTP ${accountsRes.status}`);

    const accountsData = await accountsRes.json();
    const accounts: Array<{ id: string; name: string }> = accountsData?.data ?? [];
    console.log(`[SyncAgent] Meta userId=${userId} — ${accounts.length} adaccounts`);

    for (const account of accounts) {
      try {
        const campaignsRes = await fetch(
          `https://graph.facebook.com/v18.0/${account.id}/campaigns` +
          `?fields=id,name,status,objective,budget_remaining,daily_budget,lifetime_budget,start_time,stop_time,insights` +
          `&access_token=${accessToken}`
        );
        if (!campaignsRes.ok) {
          failedCampaigns++;
          status = "partial";
          continue;
        }
        const campaignsData = await campaignsRes.json();
        const campaigns: unknown[] = campaignsData?.data ?? [];
        totalCampaigns += campaigns.length;
        updatedCampaigns += campaigns.length;
        console.log(`[SyncAgent] Meta account=${account.id} userId=${userId} — ${campaigns.length} campanhas`);
      } catch (err) {
        failedCampaigns++;
        status = "partial";
        console.error(`[SyncAgent] Meta account=${account.id} userId=${userId} erro:`, err);
      }
    }
  } catch (err) {
    status = "failed";
    errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[SyncAgent] Meta userId=${userId} erro fatal:`, err);
  }

  try {
    const db = await getDb();
    if (db) {
      await db.insert(metaSyncHistory).values({
        userId,
        syncType: "full",
        totalCampaigns,
        updatedCampaigns,
        failedCampaigns,
        status,
        errorMessage: errorMessage ?? null,
        syncDuration: Date.now() - startedAt,
      });
    }
  } catch (err) {
    console.error(`[SyncAgent] Falha ao gravar metaSyncHistory userId=${userId}:`, err);
  }
}

async function runBlingSync(): Promise<void> {
  console.log("[SyncAgent] Iniciando sync Bling...");
  const db = await getDb();
  if (!db) { console.warn("[SyncAgent] Banco indisponível — sync Bling abortado"); return; }

  try {
    const tokens = await db
      .select()
      .from(oauthTokens)
      .where(and(eq(oauthTokens.plataforma, "bling"), eq(oauthTokens.isActive, true), isNotNull(oauthTokens.accessToken)));

    console.log(`[SyncAgent] Bling — ${tokens.length} usuário(s) para sincronizar`);
    for (const token of tokens) {
      try {
        await syncBlingForUser(token.userId, token.accessToken);
      } catch (err) {
        console.error(`[SyncAgent] Bling userId=${token.userId} erro inesperado:`, err);
      }
    }
  } catch (err) {
    console.error("[SyncAgent] Bling erro ao buscar tokens:", err);
  }

  console.log("[SyncAgent] Sync Bling concluído.");
}

async function runMetaSync(): Promise<void> {
  console.log("[SyncAgent] Iniciando sync Meta Ads...");
  const db = await getDb();
  if (!db) { console.warn("[SyncAgent] Banco indisponível — sync Meta abortado"); return; }

  try {
    const tokens = await db
      .select()
      .from(oauthTokens)
      .where(and(eq(oauthTokens.plataforma, "meta"), eq(oauthTokens.isActive, true), isNotNull(oauthTokens.accessToken)));

    console.log(`[SyncAgent] Meta — ${tokens.length} usuário(s) para sincronizar`);
    for (const token of tokens) {
      try {
        await syncMetaForUser(token.userId, token.accessToken);
      } catch (err) {
        console.error(`[SyncAgent] Meta userId=${token.userId} erro inesperado:`, err);
      }
    }
  } catch (err) {
    console.error("[SyncAgent] Meta erro ao buscar tokens:", err);
  }

  console.log("[SyncAgent] Sync Meta Ads concluído.");
}

export function startSyncAgent(): () => void {
  console.log("[SyncAgent] Agente iniciado (Bling=60min, Meta=30min)");

  // Roda imediatamente na inicialização
  runBlingSync().catch((err) => console.error("[SyncAgent] Erro na execução inicial Bling:", err));
  runMetaSync().catch((err) => console.error("[SyncAgent] Erro na execução inicial Meta:", err));

  const blingInterval = setInterval(() => {
    runBlingSync().catch((err) => console.error("[SyncAgent] Erro no interval Bling:", err));
  }, BLING_SYNC_INTERVAL_MS);

  const metaInterval = setInterval(() => {
    runMetaSync().catch((err) => console.error("[SyncAgent] Erro no interval Meta:", err));
  }, META_SYNC_INTERVAL_MS);

  return () => {
    clearInterval(blingInterval);
    clearInterval(metaInterval);
    console.log("[SyncAgent] Agente encerrado.");
  };
}
