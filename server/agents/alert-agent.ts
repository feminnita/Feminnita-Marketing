import { getDb } from "../db";
import { oauthTokens, metaCampaignAlerts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

let notifyNewAlert: (userId: number, alert: object) => void;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  notifyNewAlert = require("../_core/websocket-notifications").notifyNewAlert;
} catch {
  notifyNewAlert = (userId: number, alert: object) => {
    console.log(`[AlertAgent] WebSocket notificação userId=${userId}`, alert);
  };
}

interface CampaignInsights {
  cpc?: string;
  ctr?: string;
  spend?: string;
  impressions?: string;
  clicks?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  budget_remaining?: string;
  daily_budget?: string;
  insights?: { data: CampaignInsights[] };
}

async function fetchCampaigns(adAccountId: string, token: string): Promise<Campaign[]> {
  const filter = encodeURIComponent(
    JSON.stringify([{ field: "effective_status", operator: "IN", value: ["ACTIVE"] }])
  );
  const fields = "id,name,status,budget_remaining,daily_budget,insights{cpc,ctr,spend,impressions,clicks,actions}";
  const url = `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=${fields}&access_token=${token}&filtering=${filter}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Meta API error: ${res.status}`);
  const data = await res.json() as { data: Campaign[] };
  return data.data ?? [];
}

function getThresholdAlerts(
  campaign: Campaign,
  insights: CampaignInsights
): Array<{ alertType: string; severity: "warning" | "critical"; title: string; description: string; currentValue: string; threshold: string; recommendation: string }> {
  const alerts = [];
  const ctr = parseFloat(insights.ctr ?? "0") * 100;
  const cpc = parseFloat(insights.cpc ?? "0");
  const spend = parseFloat(insights.spend ?? "0");
  const budgetRemaining = parseFloat(campaign.budget_remaining ?? "0") / 100;
  const dailyBudget = parseFloat(campaign.daily_budget ?? "0") / 100;

  if (ctr < 1) {
    alerts.push({
      alertType: "low_ctr",
      severity: (ctr < 0.5 ? "critical" : "warning") as "warning" | "critical",
      title: `CTR baixo: ${ctr.toFixed(2)}%`,
      description: `Campanha "${campaign.name}" com CTR de ${ctr.toFixed(2)}%, abaixo do mínimo recomendado.`,
      currentValue: `${ctr.toFixed(2)}%`,
      threshold: ctr < 0.5 ? "0.5%" : "1%",
      recommendation: "Revise os criativos e segmentação de público.",
    });
  }

  if (cpc > 5) {
    alerts.push({
      alertType: "high_cpc",
      severity: (cpc > 10 ? "critical" : "warning") as "warning" | "critical",
      title: `CPC elevado: R$${cpc.toFixed(2)}`,
      description: `Campanha "${campaign.name}" com CPC de R$${cpc.toFixed(2)}.`,
      currentValue: `R$${cpc.toFixed(2)}`,
      threshold: cpc > 10 ? "R$10" : "R$5",
      recommendation: "Ajuste lances ou segmentação para reduzir o custo por clique.",
    });
  }

  if (dailyBudget > 0 && budgetRemaining < dailyBudget * 0.1) {
    alerts.push({
      alertType: "budget_limit",
      severity: "critical" as "critical",
      title: `Orçamento crítico: ${((budgetRemaining / dailyBudget) * 100).toFixed(1)}% restante`,
      description: `Campanha "${campaign.name}" com menos de 10% do orçamento diário restante.`,
      currentValue: `R$${budgetRemaining.toFixed(2)}`,
      threshold: "10% do orçamento diário",
      recommendation: "Considere aumentar o orçamento ou pausar a campanha.",
    });
  }

  if (dailyBudget > 0 && spend > dailyBudget * 0.9) {
    alerts.push({
      alertType: "high_spend",
      severity: "warning" as "warning",
      title: `Gasto elevado: ${((spend / dailyBudget) * 100).toFixed(1)}% do orçamento`,
      description: `Campanha "${campaign.name}" consumiu mais de 90% do orçamento diário.`,
      currentValue: `R$${spend.toFixed(2)}`,
      threshold: "90% do orçamento diário",
      recommendation: "Monitore o ritmo de gasto para evitar ultrapassar o limite.",
    });
  }

  return alerts;
}

async function runAlertCheck() {
  const db = await getDb();
  if (!db) {
    console.log("[AlertAgent] DB indisponível, pulando ciclo.");
    return;
  }

  let tokens: typeof oauthTokens.$inferSelect[] = [];
  try {
    tokens = await db
      .select()
      .from(oauthTokens)
      .where(and(eq(oauthTokens.plataforma, "meta"), eq(oauthTokens.isActive, true)));
  } catch (err) {
    console.error("[AlertAgent] Erro ao buscar tokens:", err);
    return;
  }

  for (const tokenRow of tokens) {
    try {
      const accountInfo = tokenRow.accountInfo ? JSON.parse(tokenRow.accountInfo) : {};
      const adAccountId: string = accountInfo.adAccountId ?? accountInfo.id;
      if (!adAccountId) continue;

      const campaigns = await fetchCampaigns(adAccountId, tokenRow.accessToken);

      for (const campaign of campaigns) {
        const insightsData = campaign.insights?.data?.[0] ?? {};
        const thresholdAlerts = getThresholdAlerts(campaign, insightsData);

        for (const alertDef of thresholdAlerts) {
          try {
            const existing = await db
              .select()
              .from(metaCampaignAlerts)
              .where(
                and(
                  eq(metaCampaignAlerts.campaignId, campaign.id),
                  eq(metaCampaignAlerts.alertType, alertDef.alertType as typeof metaCampaignAlerts.$inferSelect["alertType"]),
                  eq(metaCampaignAlerts.isResolved, false)
                )
              )
              .limit(1);

            if (existing.length > 0) continue;

            const [inserted] = await db
              .insert(metaCampaignAlerts)
              .values({
                userId: tokenRow.userId,
                campaignId: campaign.id,
                campaignName: campaign.name,
                alertType: alertDef.alertType as typeof metaCampaignAlerts.$inferSelect["alertType"],
                severity: alertDef.severity,
                title: alertDef.title,
                description: alertDef.description,
                currentValue: alertDef.currentValue,
                threshold: alertDef.threshold,
                recommendation: alertDef.recommendation,
                isRead: false,
                isResolved: false,
              })
              .$returningId();

            console.log(`[AlertAgent] Alerta criado: ${alertDef.alertType} para campanha ${campaign.name}`);

            notifyNewAlert(tokenRow.userId, {
              id: inserted?.id,
              ...alertDef,
              campaignId: campaign.id,
              campaignName: campaign.name,
            });
          } catch (err) {
            console.error(`[AlertAgent] Erro ao inserir alerta ${alertDef.alertType}:`, err);
          }
        }
      }
    } catch (err) {
      console.error(`[AlertAgent] Erro ao processar userId=${tokenRow.userId}:`, err);
    }
  }
}

export function startAlertAgent(): () => void {
  console.log("[AlertAgent] Agente iniciado. Verificando a cada 15 minutos.");

  const interval = setInterval(async () => {
    await runAlertCheck();
  }, 15 * 60 * 1000);

  return () => {
    clearInterval(interval);
    console.log("[AlertAgent] Agente encerrado.");
  };
}
