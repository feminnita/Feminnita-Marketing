/**
 * Trava de conformidade Meta — escaneia o TEXTO de um brief/copy de anúncio
 * e bloqueia claims proibidos pela política do Meta (promessa de renda,
 * "sem CNPJ" como isca, "golpe/scam" como gancho) e incoerência criativo↔destino.
 *
 * Funções puras, sem I/O — testáveis isoladamente.
 * Limitação conhecida: lê texto, não lê pixel. Cobre tudo que a Fernanda
 * escreve (copy + texto ditado para a arte), não o que um designer pinta
 * fora do brief.
 */

export interface ComplianceResult {
  ok: boolean;
  violations: string[];
}

// minúsculas + remove acentos (casa "fábrica"/"fabrica", "mês"/"mes")
function normalize(s: string): string {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const RULES: { rule: string; re: RegExp }[] = [
  {
    rule: "Promessa de renda/faturamento com valor",
    re: /(faturou|faturar|fatura|fature|ganhou|ganhar|ganhe|ganha|lucr\w*|rend\w*|receb\w*)[^.\n]{0,40}r\$\s?\d|r\$\s?\d[\d.,]*[^.\n]{0,40}(faturou|ganh\w*|lucr\w*|rend\w*)/,
  },
  {
    rule: "Valor monetario com janela de tempo (renda)",
    re: /r\$\s?\d[\d.,]*\s*(\/\s*(mes|dia|semana|hora)|por\s+(mes|dia|semana|hora))|r\$\s?\d[\d.,]*[^.\n]{0,30}\bem\s+\d+\s*(dias?|semanas?|meses|mes)\b/,
  },
  {
    rule: "'sem CNPJ' como isca de renda",
    re: /(rend\w*|ganh\w*|lucr\w*|dinheiro|faturar?)[^.\n]{0,40}sem\s+cnpj|sem\s+cnpj[^.\n]{0,40}(rend\w*|ganh\w*|lucr\w*|dinheiro)/,
  },
  {
    rule: "Promessa de renda facil/garantida",
    re: /(rend\w*|lucr\w*|ganh\w*|dinheiro)\s+(extra\s+)?(garantid\w+|facil\w*|rapid\w+|certo|sem esforco)|dinheiro\s+facil|ganhe\s+dinheiro/,
  },
  {
    rule: "Gancho 'golpe/scam/furada/cilada'",
    re: /\b(golpe|scam|furada|cilada)\b/,
  },
  {
    rule: "Promessa de ganho/lucro de casa ou revendendo (sem numero)",
    re: /(ganh\w*|lucr\w*|fatur\w*)[^.\n]{0,20}(de casa|em casa|trabalhando de casa|revend\w*)/,
  },
  {
    rule: "Renda extra/paralela como isca",
    re: /\brenda\s+(extra|paralel\w*)|renda\s+de\s+casa/,
  },
  {
    rule: "'Sem sair de casa' como promessa",
    re: /sem\s+sair\s+de\s+casa/,
  },
  {
    rule: "Promessa de independencia financeira",
    re: /independencia\s+financeira/,
  },
  {
    rule: "Apelo anti-emprego (depender de chefe/salario/marido)",
    re: /odeia\s+depender|depender\s+(do|de|da|de um|de uma)\s+\w*\s*(chefe|patrao|salario|marido|emprego|chefia)|largar\s+(o\s+)?(chefe|emprego|patrao)/,
  },
];

export function checkCopyCompliance(text: string): ComplianceResult {
  const norm = normalize(text);
  const violations: string[] = [];
  for (const { rule, re } of RULES) {
    const m = norm.match(re);
    if (m) violations.push(`${rule}: "${m[0].trim()}"`);
  }
  return { ok: violations.length === 0, violations };
}

// botão/texto na arte promete WhatsApp/contato/revenda, mas o destino é o site
// com CTA de compra → incoerência que o Meta lê como enganoso.
const PROMESSA_CONTATO = /(whats\s?app|chama no whats|chama no direct|manda (uma )?dm|fala com a gente|quero revender|(peca|pede|pedir|solicite|solicita)\s+\w*\s*catalogo|catalogo\s+(pelo|no|via)\s+whats)/;
const CTA_CONTATO = ["MESSAGE_PAGE", "WHATSAPP_MESSAGE", "CONTACT_US", "SEND_MESSAGE"];

export function checkCreativeCoherence(params: {
  briefText: string;
  callToAction?: string;
  linkUrl?: string;
}): string[] {
  const t = normalize(params.briefText);
  const cta = (params.callToAction || "SHOP_NOW").toUpperCase();
  const link = normalize(params.linkUrl || "");

  const prometeContato = PROMESSA_CONTATO.test(t);
  const destinoEhContato =
    link.includes("wa.me") || link.includes("whatsapp") || CTA_CONTATO.includes(cta);

  if (prometeContato && !destinoEhContato) {
    return [
      "Incoerencia criativo->destino: o botao/texto promete WhatsApp/contato/revenda, mas o destino e o site com CTA de compra",
    ];
  }
  return [];
}
