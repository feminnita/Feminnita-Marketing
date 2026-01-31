import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Heart, MessageCircle, Share2, Eye, Zap, TrendingUp } from "lucide-react";
import PersonaAvatar from "./PersonaAvatar";

export default function EstrategiaGrowthViralSection() {
  const viralStrategies = [
    {
      persona: "Carol",
      title: "Estratégia: Renda Extra Rápida",
      objective: "Ganhar 10K seguidores em 30 dias",
      hooks: [
        "Comprei R$ 199 em pijamas e olha quanto lucrei em 1 semana!",
        "Como ganhar R$ 1.500 por mês em casa (sem experiência)",
        "Meu primeiro pedido Feminnita: de 0 a 1K em 7 dias",
      ],
      hashtags: [
        "#RendaExtra", "#PrimeiroNegócio", "#EmpreendedorismoFeminino",
        "#FeminnitaLucroFácil", "#TrabalhoEmCasa", "#RendaExtraOnline",
        "#MulheresEmpreendedoras", "#NegócioFeminino"
      ],
      bestTimes: ["10h-12h", "19h-21h"],
      cta: "Me manda DM que eu ensino!",
      contentTypes: ["Stories", "Reels 15-30s", "Lives"],
      expectedGrowth: "300-500 seguidores/dia",
    },
    {
      persona: "Renata",
      title: "Estratégia: Autoridade em Fornecedor",
      objective: "Ganhar 5K seguidores em 30 dias",
      hooks: [
        "Fornecedor de pijamas com 5% OFF no PIX (confira qualidade)",
        "Como escolher fornecedor de pijamas que realmente lucra",
        "Análise: Por que Feminnita é melhor que concorrentes",
      ],
      hashtags: [
        "#AtacadoDePijamas", "#FornecedorConfiável", "#MargemDeLucro",
        "#ModaIntimaAtacado", "#RevendedoraFeminnita", "#NegócioFeminino",
        "#Empreendedora", "#LucroGarantido"
      ],
      bestTimes: ["9h-11h", "14h-16h", "19h-20h"],
      cta: "Solicite sua cotação agora",
      contentTypes: ["Feed", "Carrossel", "Vídeos 30-60s"],
      expectedGrowth: "150-250 seguidores/dia",
    },
    {
      persona: "Vanessa",
      title: "Estratégia: Comunidade Familiar",
      objective: "Ganhar 8K seguidores em 30 dias",
      hooks: [
        "Compramos pijamas para 20 pessoas e economizamos R$ 500!",
        "Kits Família: O pijama perfeito para noite do filme",
        "Como organizar compra coletiva e ganhar comissão",
      ],
      hashtags: [
        "#CompraColetiva", "#PijamaFamília", "#EconomiaFamiliar",
        "#ConfortoEmCasa", "#MãesEmpreendedoras", "#FamiliaUnida",
        "#ComprasCom Amigas", "#PijamaConfortável"
      ],
      bestTimes: ["14h-16h", "20h-21h"],
      cta: "Junte-se ao nosso grupo!",
      contentTypes: ["Stories", "Reels 20-45s", "Carrossel"],
      expectedGrowth: "250-400 seguidores/dia",
    },
    {
      persona: "Luiza",
      title: "Estratégia: Moda Loungewear Viral",
      objective: "Ganhar 15K seguidores em 30 dias",
      hooks: [
        "Transformação: Do look do dia para o look da noite com o mesmo pijama!",
        "Tendência 2026: Pijamas que você pode usar na rua",
        "O Baby Doll Blogueira que está esgotando o estoque!",
      ],
      hashtags: [
        "#Loungewear", "#PijamaNaRua", "#ModaTikTok", "#EstiloConfortável",
        "#BabyDollBlogueira", "#TrendyStyle", "#FashionTok", "#Viral"
      ],
      bestTimes: ["18h-20h", "22h-23h"],
      cta: "Mostre seu look nos comentários!",
      contentTypes: ["TikTok", "Reels 15-30s", "Stories"],
      expectedGrowth: "500-800 seguidores/dia",
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Estratégia de Crescimento Viral</h2>
        <p className="text-slate-600">Roteiros, hashtags e CTAs otimizados para cada persona ganhar milhares de seguidores</p>
      </div>

      {/* Strategies */}
      <div className="space-y-6">
        {viralStrategies.map((strategy) => (
          <Card key={strategy.persona} className="border-slate-200">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <PersonaAvatar name={strategy.persona} size="md" />
                  <div>
                    <CardTitle>{strategy.title}</CardTitle>
                    <CardDescription>{strategy.objective}</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">{strategy.expectedGrowth}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hooks */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">🎣 Hooks (Ganchos)</h3>
                <div className="space-y-2">
                  {strategy.hooks.map((hook, idx) => (
                    <div key={idx} className="bg-blue-50 rounded-lg p-3 flex items-start justify-between group">
                      <p className="text-sm text-slate-700 flex-1">{hook}</p>
                      <button
                        onClick={() => copyToClipboard(hook)}
                        className="ml-2 p-1 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">#️⃣ Hashtags Estratégicas</h3>
                <div className="flex flex-wrap gap-2">
                  {strategy.hashtags.map((hashtag, idx) => (
                    <button
                      key={idx}
                      onClick={() => copyToClipboard(hashtag)}
                      className="bg-pink-50 hover:bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm transition flex items-center gap-1"
                    >
                      {hashtag}
                      <Copy className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-slate-200">
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-2">MELHORES HORÁRIOS</p>
                  <div className="space-y-1">
                    {strategy.bestTimes.map((time, idx) => (
                      <p key={idx} className="text-sm text-slate-700">⏰ {time}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-2">TIPOS DE CONTEÚDO</p>
                  <div className="space-y-1">
                    {strategy.contentTypes.map((type, idx) => (
                      <p key={idx} className="text-sm text-slate-700">📱 {type}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-2">CALL-TO-ACTION</p>
                  <p className="text-sm text-slate-700 bg-yellow-50 rounded p-2">"{strategy.cta}"</p>
                </div>
              </div>

              {/* Complete Strategy Copy */}
              <button
                onClick={() => {
                  const fullStrategy = `
${strategy.title}
Objetivo: ${strategy.objective}

HOOKS:
${strategy.hooks.map((h) => `- ${h}`).join("\n")}

HASHTAGS:
${strategy.hashtags.join(" ")}

MELHORES HORÁRIOS: ${strategy.bestTimes.join(", ")}
TIPOS DE CONTEÚDO: ${strategy.contentTypes.join(", ")}
CTA: "${strategy.cta}"

CRESCIMENTO ESPERADO: ${strategy.expectedGrowth}
                  `;
                  copyToClipboard(fullStrategy);
                }}
                className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded hover:from-pink-600 hover:to-purple-600 transition font-medium flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Estratégia Completa
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Formula */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">📈 Fórmula de Crescimento Garantido</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-900 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="font-bold text-2xl">1️⃣</p>
              <p className="font-semibold mt-2">Hook Irresistível</p>
              <p className="text-sm mt-1">Capture atenção em 3 segundos</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="font-bold text-2xl">2️⃣</p>
              <p className="font-semibold mt-2">Conteúdo Autêntico</p>
              <p className="text-sm mt-1">Mostre resultado real</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="font-bold text-2xl">3️⃣</p>
              <p className="font-semibold mt-2">CTA Claro</p>
              <p className="text-sm mt-1">Peça ação específica</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <p className="font-bold text-2xl">4️⃣</p>
              <p className="font-semibold mt-2">Engajamento Rápido</p>
              <p className="text-sm mt-1">Responda em 30 min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posting Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Calendário de Posting Otimizado</CardTitle>
          <CardDescription>Poste nos melhores horários para cada persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Persona</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Plataforma</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Melhor Horário</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Frequência</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Duração</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4"><PersonaAvatar name="Carol" size="sm" /></td>
                  <td className="py-3 px-4">Instagram Stories</td>
                  <td className="py-3 px-4">10h-12h, 19h-21h</td>
                  <td className="py-3 px-4">3-5x/dia</td>
                  <td className="py-3 px-4">15-30s</td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4"><PersonaAvatar name="Renata" size="sm" /></td>
                  <td className="py-3 px-4">Instagram Feed</td>
                  <td className="py-3 px-4">9h-11h, 14h-16h</td>
                  <td className="py-3 px-4">1-2x/dia</td>
                  <td className="py-3 px-4">30-60s</td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4"><PersonaAvatar name="Vanessa" size="sm" /></td>
                  <td className="py-3 px-4">WhatsApp + Instagram</td>
                  <td className="py-3 px-4">14h-16h, 20h-21h</td>
                  <td className="py-3 px-4">2-3x/semana</td>
                  <td className="py-3 px-4">45-90s</td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4"><PersonaAvatar name="Luiza" size="sm" /></td>
                  <td className="py-3 px-4">TikTok + Reels</td>
                  <td className="py-3 px-4">18h-20h, 22h-23h</td>
                  <td className="py-3 px-4">2-3x/dia</td>
                  <td className="py-3 px-4">15-45s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
