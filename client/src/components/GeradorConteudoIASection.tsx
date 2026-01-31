import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, ThumbsUp, ThumbsDown, RefreshCw, Zap } from "lucide-react";

const TRENDING_TOPICS = [
  { id: 1, tema: "#PijamaConforto", trending: true, mencoes: 2450, crescimento: "+15%" },
  { id: 2, tema: "#RendaExtra", trending: true, mencoes: 3120, crescimento: "+22%" },
  { id: 3, tema: "#CompraColetiva", trending: false, mencoes: 1890, crescimento: "+8%" },
  { id: 4, tema: "#QualidadePremium", trending: true, mencoes: 2100, crescimento: "+18%" },
  { id: 5, tema: "#InvernoConforto", trending: true, mencoes: 2800, crescimento: "+25%" },
];

const LEGENDAS_GERADAS = [
  {
    id: 1,
    original: "Pijama Suede Rosa - 40% OFF",
    ia_sugestoes: [
      "🎀 Pijama Suede Rosa em PROMOÇÃO! 40% OFF hoje! Conforto máximo, preço mínimo. Aproveita enquanto tiver estoque! 👇 #PijamaConforto #RendaExtra",
      "Acordar com conforto nunca foi tão barato! 💕 Pijama Suede Rosa agora com 40% OFF. Qualidade premium, preço de amiga. Clique no link da bio! #CompraColetiva",
      "URGENTE: Pijama Suede Rosa 40% OFF! 🔥 Últimas peças em estoque. Corre que tá acabando! #InvernoConforto #QualidadePremium"
    ],
    rating: 4.8,
    engajamento_estimado: "8-10%"
  },
  {
    id: 2,
    original: "Lançamento Coleção Inverno",
    ia_sugestoes: [
      "❄️ CHEGOU! Coleção Inverno 2026 da Feminnita! 15 cores exclusivas, tecido premium, conforto garantido. Qual é sua favorita? 👇 #InvernoConforto #LançamentoExclusivo",
      "Inverno chegou e a gente também! 🥶 Coleção Inverno 2026 com cores que você NUNCA viu. Conforto máximo para as noites frias. Confira! #QualidadePremium",
      "Prepara o guarda-roupa! 🎨 Coleção Inverno Feminnita com 15 cores novas. Tecido respirável, design moderno, preço acessível. Qual cor você escolhe? #PijamaConforto"
    ],
    rating: 4.9,
    engajamento_estimado: "9-11%"
  },
];

const HASHTAGS_RECOMENDADAS = [
  { hashtag: "#PijamaConforto", volume: 2450, tendencia: "↑ +15%" },
  { hashtag: "#RendaExtra", volume: 3120, tendencia: "↑ +22%" },
  { hashtag: "#QualidadePremium", volume: 2100, tendencia: "↑ +18%" },
  { hashtag: "#InvernoConforto", volume: 2800, tendencia: "↑ +25%" },
  { hashtag: "#CompraColetiva", volume: 1890, tendencia: "→ +8%" },
  { hashtag: "#FemininnitaPijamas", volume: 1200, tendencia: "↑ +12%" },
];

export default function GeradorConteudoIASection() {
  const [legendaSelecionada, setLegendaSelecionada] = useState(0);
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState(0);
  const [gerando, setGerando] = useState(false);
  const [copiadoIdx, setCopiadoIdx] = useState(-1);

  const handleCopiar = (texto: string, idx: number) => {
    navigator.clipboard.writeText(texto);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx(-1), 2000);
  };

  const handleGerar = async () => {
    setGerando(true);
    setTimeout(() => {
      setGerando(false);
      alert("Novas sugestões geradas com sucesso!");
    }, 2000);
  };

  const legendaAtual = LEGENDAS_GERADAS[legendaSelecionada];
  const sugestaoAtual = legendaAtual.ia_sugestoes[sugestaoSelecionada];

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            Gerador de Conteúdo com IA
          </CardTitle>
          <CardDescription>
            Crie sugestões automáticas de legendas, hashtags e ideias baseado em trending topics e performance histórica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trending Topics */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📈 Trending Topics Agora</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {TRENDING_TOPICS.map(topic => (
                <Card key={topic.id} className={`p-3 ${topic.trending ? "border-red-200 bg-red-50" : ""}`}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-sm">{topic.tema}</h4>
                    {topic.trending && (
                      <Badge variant="destructive" className="text-xs">Trending</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{topic.mencoes.toLocaleString()} menções</span>
                    <span className="text-green-600 font-semibold">{topic.crescimento}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Gerador de Legendas */}
          <div>
            <h3 className="font-semibold text-sm mb-3">✍️ Gerador de Legendas</h3>
            
            {/* Seleção de Legenda Base */}
            <div className="mb-4">
              <label className="text-sm font-semibold block mb-2">Escolha a Legenda Base</label>
              <div className="space-y-2">
                {LEGENDAS_GERADAS.map((leg, idx) => (
                  <Card
                    key={idx}
                    className={`p-3 cursor-pointer transition-all ${
                      legendaSelecionada === idx
                        ? "border-2 border-amber-500 bg-amber-50"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => {
                      setLegendaSelecionada(idx);
                      setSugestaoSelecionada(0);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{leg.original}</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          Rating: {leg.rating} ⭐ | Engajamento: {leg.engajamento_estimado}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sugestões de Legendas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">Sugestões de IA</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGerar}
                  disabled={gerando}
                  className="gap-1 text-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  {gerando ? "Gerando..." : "Gerar Novas"}
                </Button>
              </div>

              <div className="space-y-2">
                {legendaAtual.ia_sugestoes.map((sugestao, idx) => (
                  <Card
                    key={idx}
                    className={`p-3 cursor-pointer transition-all ${
                      sugestaoSelecionada === idx
                        ? "border-2 border-amber-500 bg-amber-50"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSugestaoSelecionada(idx)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 mb-2">{sugestao}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline">Opção {idx + 1}</Badge>
                          <span className="text-slate-600">Engajamento estimado: 8-10%</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopiar(sugestao, idx);
                        }}
                        className="text-xs"
                      >
                        {copiadoIdx === idx ? "✓ Copiado" : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Preview da Legenda Selecionada */}
            <Card className="mt-4 p-4 bg-slate-50">
              <h4 className="font-semibold text-sm mb-2">📋 Preview</h4>
              <div className="bg-white p-3 rounded border border-slate-200 mb-3">
                <p className="text-sm text-slate-900">{sugestaoAtual}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleCopiar(sugestaoAtual, -1)}
                  className="flex-1 gap-1 text-xs"
                >
                  <Copy className="w-3 h-3" />
                  {copiadoIdx === -1 ? "Copiar Legenda" : "✓ Copiado"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1 text-xs"
                >
                  <ThumbsUp className="w-3 h-3" />
                  Útil
                </Button>
              </div>
            </Card>
          </div>

          {/* Hashtags Recomendadas */}
          <div>
            <h3 className="font-semibold text-sm mb-3">🏷️ Hashtags Recomendadas</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {HASHTAGS_RECOMENDADAS.map((item, idx) => (
                <Card key={idx} className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{item.hashtag}</h4>
                    <Badge variant="outline" className="text-xs">{item.tendencia}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">{item.volume.toLocaleString()} menções</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopiar(item.hashtag, idx)}
                    className="w-full mt-2 text-xs"
                  >
                    {copiadoIdx === idx ? "✓ Copiado" : "Copiar"}
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Ideias de Posts */}
          <div>
            <h3 className="font-semibold text-sm mb-3">💡 Ideias de Posts Recomendadas</h3>
            <div className="space-y-2">
              {[
                {
                  tipo: "Renda Extra",
                  ideia: "Mostre quanto uma pessoa pode ganhar em 1 mês revendendo",
                  trending: true,
                  engajamento: "10-12%"
                },
                {
                  tipo: "Compra Coletiva",
                  ideia: "Cálculo de economia ao comprar em grupo vs individual",
                  trending: true,
                  engajamento: "9-11%"
                },
                {
                  tipo: "Bastidores",
                  ideia: "Mostre o processo de produção dos pijamas",
                  trending: false,
                  engajamento: "7-9%"
                },
                {
                  tipo: "Depoimento",
                  ideia: "Cliente revendendo com sucesso (prova social)",
                  trending: true,
                  engajamento: "8-10%"
                },
              ].map((item, idx) => (
                <Card key={idx} className={`p-3 ${item.trending ? "border-red-200 bg-red-50" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{item.tipo}</h4>
                        {item.trending && (
                          <Badge variant="destructive" className="text-xs">Trending</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{item.ideia}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{item.engajamento}</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Gerar Roteiro
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Análise de Performance */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📊 Análise de Performance</h3>
            <Card className="p-4 bg-slate-50">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Legendas com Trending Topics</span>
                    <span className="text-sm font-bold text-green-600">+35% engajamento</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Legendas com 3+ Hashtags</span>
                    <span className="text-sm font-bold text-green-600">+28% alcance</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Legendas com CTA Claro</span>
                    <span className="text-sm font-bold text-green-600">+42% cliques</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Dicas */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">✅ Dicas para Máximo Engajamento</h4>
            <ul className="text-sm space-y-2 text-slate-700">
              <li>• <strong>Use trending topics</strong> relevantes - aumenta alcance em 35%</li>
              <li>• <strong>Inclua 3-5 hashtags</strong> estratégicas - melhora descoberta</li>
              <li>• <strong>CTA clara</strong> (clique, comente, compartilhe) - aumenta cliques em 42%</li>
              <li>• <strong>Emojis estratégicos</strong> - aumentam engajamento em 20%</li>
              <li>• <strong>Primeira linha impactante</strong> - 80% das pessoas leem só o início</li>
            </ul>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
