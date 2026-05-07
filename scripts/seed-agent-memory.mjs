/**
 * Seed de memórias de negócio para todas as agentes IA.
 * Salva o contexto fixo das duas marcas (Feminnita A e FNT B) no banco.
 * Rode com: node scripts/seed-agent-memory.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");

// Lê .env manualmente
const envContent = readFileSync(envPath, "utf-8");
function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

const dbUrl = getEnv("DATABASE_URL");
// Parseia a URL mysql://user:pass@host:port/db?...
const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
if (!urlMatch) {
  console.error("❌ Não foi possível parsear DATABASE_URL:", dbUrl);
  process.exit(1);
}
const [, user, password, host, port, database] = urlMatch;

const conn = await mysql.createConnection({
  host,
  port: Number(port),
  user,
  password,
  database,
  ssl: { rejectUnauthorized: true },
});

console.log(`✅ Conectado ao banco: ${database}@${host}`);

// ─── Contexto de negócio por agente ──────────────────────────────────────────

const PERIOD = "2026-04";

const GOALS = {
  "gabi": {
    empresa: "Feminnita Pijamas",
    meta_mensal: "R$100.000 (atual ~R$20.000 — era R$78.000 antes da agência ruim)",
    ticket_medio: "R$400",
    conta_a: "Feminnita — B2C, consumidor final, pijamas femininos, marketplace varejo. ML_USER_ID_1=1236039238. Token ML_ACCESS_TOKEN_1 ativo.",
    conta_b: "FNT Confecções — B2B, atacado, foco em revendedoras, grade fechada. ML_ACCESS_TOKEN_2 recém-conectado em abr/2026.",
    produto_principal: "Pijamas femininos e loungewear. Tamanhos P/M/G/GG. Tecidos: viscose, malha.",
    foco_eds: "Atributos obrigatórios: Marca, Gênero, Tamanho, Material, Cor, Tipo de produto. EDS incompleto reduz exposição orgânica.",
    foco_ads: "Product Ads (anúncios patrocinados) ML. Conta A prioridade. Conta B em estruturação.",
    regra_critica: "Sempre verificar token ativo antes de executar. Conta B=fnt, Conta A=feminnita. Nunca misturar os tokens.",
  },
  "luiza-shopee": {
    empresa: "Feminnita Pijamas",
    meta_mensal: "R$100.000 (atual ~R$20.000)",
    ticket_medio: "R$400",
    conta_a: "Feminnita — B2C, consumidor final, pijamas femininos. SHOPEE_SHOP_ID=881564297. Token ativo.",
    conta_b: "FNT Confecções — B2B, atacado. BLOQUEADA: aguardando liberação SOPI pela Shopee. NÃO operar até liberação.",
    produto_principal: "Pijamas femininos e loungewear. Foco em GMV Max com ROAS alvo mínimo 4x.",
    foco_ads: "GMV Max (principal), Search Ads, Discovery Ads, Flash Sale. Shopee é AI-first: configurar condições certas para o algoritmo.",
    regra_critica: "Conta B (FNT) está bloqueada na Shopee — não criar campanhas, não enviar produtos até SOPI liberado.",
  },
  "isabela-shein": {
    empresa: "Feminnita Pijamas",
    meta_mensal: "R$100.000 (atual ~R$20.000)",
    ticket_medio: "R$400",
    conta_a: "Feminnita — B2C, consumidor final. Ativa há 2 anos. Dominar subcategorias 'pijama feminino' e 'loungewear feminino'.",
    conta_b: "FNT Confecções — usar Shein para validar novos estampados com custo baixo antes de produzir volume para outros canais. Shein não é canal de atacado.",
    produto_principal: "Pijamas femininos, loungewear. Foco em velocidade de tração: janela de visibilidade inicial do algoritmo Shein.",
    foco_performance: "Algoritmo Shein prioriza: velocidade de vendas, avaliações positivas, taxa de envio no prazo. Menos produtos performando bem > mais produtos mal.",
    regra_critica: "Produto novo tem janela de visibilidade — entrar com listagem 100% pronta, preço competitivo e pelo menos uma Flash Sale inicial.",
  },
  "alice-amazon": {
    empresa: "Feminnita Pijamas",
    meta_mensal: "R$100.000 (atual ~R$20.000)",
    ticket_medio: "R$400",
    conta_a: "Feminnita — B2C, consumidor final, pijamas femininos. Amazon comprador mais qualificado (cartão na mão).",
    conta_b: "FNT Confecções — B2B, atacado. Varejo Amazon ainda em estruturação.",
    produto_principal: "Pijamas femininos, loungewear. Sponsored Products fase principal.",
    foco_ads: "Sponsored Products, Sponsored Brands, Sponsored Display, Deals. Respeitar ciclo de vida: Lançamento (0-50 reviews, ACoS 60-80%), Crescimento (50-200 reviews), Maturidade.",
    regra_critica: "Mínimo 14 dias de dados antes de otimizar bids. Listing 100% retail-ready antes de ligar qualquer campanha.",
  },
};

// ─── Insere no banco ──────────────────────────────────────────────────────────

for (const [agentName, goals] of Object.entries(GOALS)) {
  const content = JSON.stringify(goals);

  // Verifica se já existe
  const [rows] = await conn.execute(
    `SELECT id FROM agent_memory WHERE agentName=? AND memoryType='business_goals' AND period=? LIMIT 1`,
    [agentName, PERIOD]
  );

  if (rows.length > 0) {
    await conn.execute(
      `UPDATE agent_memory SET content=? WHERE id=?`,
      [content, rows[0].id]
    );
    console.log(`🔄 Atualizado: ${agentName}`);
  } else {
    await conn.execute(
      `INSERT INTO agent_memory (agentName, memoryType, period, content) VALUES (?, 'business_goals', ?, ?)`,
      [agentName, PERIOD, content]
    );
    console.log(`✅ Inserido: ${agentName}`);
  }
}

await conn.end();
console.log("\n🎉 Memórias de negócio salvas para todas as agentes.");
console.log("   Agentes atualizadas: gabi, luiza-shopee, isabela-shein, alice-amazon");
