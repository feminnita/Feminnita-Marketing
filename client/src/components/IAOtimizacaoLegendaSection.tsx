import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, TrendingUp, CheckCircle, AlertCircle, Copy } from "lucide-react";
import { useState } from "react";

export default function IAOtimizacaoLegendaSection() {
  const [legendaOriginal, setLegendaOriginal] = useState("");
  const [legendasOtimizadas, setLegendasOtimizadas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [sugestoesAtivas, setSugestoesAtivas] = useState(false);

  const [historico, setHistorico] = useState([
    {
      id: 1,
      original: "Chegou! Pijama Inverno 2026 - Conforto Máximo para as Noites Frias",
      otimizada: "❄️ CHEGOU! Pijama Inverno 2026 - Conforto Máximo para Noites Frias 🛏️ Tecido Premium ✨ Cores Exclusivas 🎨 Clique no link da bio e garanta o seu! 👇 #PijamaInverno #Conforto #Feminnita",
      engajamento: 8.5,
      conversoes: 156,
      data: "2026-01-30"
    },
    {
      id: 2,
      original: "Promoção 40% OFF - Últimas peças disponíveis",
      otimizada: "🚨 PROMOÇÃO RELÂMPAGO! 40% OFF 🚨 Últimas peças disponíveis! ⏰ Válido até 23:59 de hoje! 💰 Economize AGORA! Clique no link da bio 👇 #Promoção #Desconto #Feminnita #PijamaEmPromoção",
      engajamento: 12.3,
      conversoes: 234,
      data: "2026-01-29"
    },
    {
      id: 3,
      original: "Como ganhei R$ 2.500 revendendo pijamas",
      otimizada: "💰 COMO GANHEI R$ 2.500 EM 1 MÊS? 📈 Revendendo pijamas Feminnita! 🎁 Sem experiência prévia ✅ Trabalhando de casa 🏠 Horário flexível ⏰ Quer começar também? Clique no link da bio! 👇 #RendaExtra #Empreendedorismo #Feminnita #Oportunidade",
      engajamento: 15.7,
      conversoes: 312,
      data: "2026-01-28"
    }
  ]);

  const otimizarLegenda = () => {
    if (!legendaOriginal.trim()) return;

    setCarregando(true);

    // Simular chamada à IA
    setTimeout(() => {
      const sugestoes = [
        {
          id: 1,
          titulo: "Versão 1: Urgência + Emojis",
          legenda: `🚨 ${legendaOriginal} 🚨\n\n⏰ Tempo limitado!\n💰 Aproveite agora!\n\nClique no link da bio 👇\n\n#Feminnita #Pijamas #Promoção #Desconto`,
          engajamentoEstimado: 8.5,
          conversoeEstimadas: 145,
          motivo: "Emojis e urgência aumentam cliques em 35%"
        },
        {
          id: 2,
          titulo: "Versão 2: Storytelling + Prova Social",
          legenda: `${legendaOriginal}\n\n\"Meu pijama favorito! Durabilidade garantida\" - Maria S. ⭐⭐⭐⭐⭐\n\n✅ 5.000+ clientes satisfeitos\n✅ Qualidade premium\n✅ Frete rápido\n\nVocê merece conforto! 💖\n\nClique no link da bio 👇\n\n#Feminnita #Qualidade #ClientesSatisfeitos`,
          engajamentoEstimado: 10.2,
          conversoeEstimadas: 178,
          motivo: "Prova social aumenta conversão em 42%"
        },
        {
          id: 3,
          titulo: "Versão 3: Educacional + CTA",
          legenda: `${legendaOriginal}\n\n🔍 Sabia que?\n• Tecido 100% algodão respirável\n• Costura reforçada (dura 2x mais)\n• 4 cores exclusivas\n• Entrega em 48h\n\n💡 Dica: Compre 2+ e economize ainda mais!\n\nClique no link da bio para conhecer 👇\n\n#PijamaQualidade #Feminnita #Conforto #Durável`,
          engajamentoEstimado: 9.8,
          conversoeEstimadas: 192,
          motivo: "Educação + benefícios aumentam conversão em 38%"
        },
        {
          id: 4,
          titulo: "Versão 4: Comunidade + Inclusão",
          legenda: `${legendaOriginal}\n\n👥 Junte-se a 5.000+ pessoas que já confiam em nós!\n\n\"Melhor investimento que fiz\" - João M. 💬\n\"Durabilidade incrível\" - Ana P. 💬\n\n🎁 Novo cliente? Ganhe 10% de desconto!\n\nVem com a gente! 💕\n\nClique no link da bio 👇\n\n#Feminnita #Comunidade #Confiança #Qualidade`,
          engajamentoEstimado: 11.3,
          conversoeEstimadas: 215,
          motivo: "Comunidade + desconto aumentam conversão em 45%"
        }
      ];

      setLegendasOtimizadas(sugestoes);
      setCarregando(false);
      setSugestoesAtivas(true);
    }, 2000);
  };

  const copiarLegenda = (legenda: string) => {
    navigator.clipboard.writeText(legenda);
    alert("Legenda copiada para a área de transferência!");
  };

  const usarLegenda = (legenda: string) => {
    setHistorico([
      {
        id: historico.length + 1,
        original: legendaOriginal,
        otimizada: legenda,
        engajamento: 0,
        conversoes: 0,
        data: new Date().toISOString().split('T')[0]
      },
      ...historico
    ]);
    setLegendaOriginal("");
    setLegendasOtimizadas([]);
    setSugestoesAtivas(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">IA para Otimização de Legendas</h2>
        <p className="text-slate-600">
          Use inteligência artificial para sugerir melhorias em legendas baseado em trending topics, hashtags e performance histórica.
        </p>
      </div>

      {/* Editor de Legenda */}
      <Card className="border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Otimizar Legenda com IA
          </CardTitle>
          <CardDescription>Cole sua legenda e deixe a IA sugerir melhorias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Sua Legenda Original</label>
            <Textarea 
              placeholder="Cole sua legenda aqui..."
              value={legendaOriginal}
              onChange={(e) => setLegendaOriginal(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-slate-600 mt-2">{legendaOriginal.length} caracteres</p>
          </div>

          <Button 
            onClick={otimizarLegenda}
            disabled={!legendaOriginal.trim() || carregando}
            className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
            size="lg"
          >
            <Sparkles className="w-5 h-5" />
            {carregando ? "Analisando..." : "Gerar Sugestões com IA"}
          </Button>
        </CardContent>
      </Card>

      {/* Sugestões Geradas */}
      {sugestoesAtivas && legendasOtimizadas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">✨ Sugestões Geradas pela IA</h3>
          
          {legendasOtimizadas.map((sugestao) => (
            <Card key={sugestao.id} className="border-2 border-purple-200 hover:border-purple-300 transition">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-base">{sugestao.titulo}</CardTitle>
                    <CardDescription>{sugestao.motivo}</CardDescription>
                  </div>
                  <Badge className="bg-purple-600">IA</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Legenda Otimizada */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{sugestao.legenda}</p>
                </div>

                {/* Métricas Estimadas */}
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="border border-slate-200 rounded p-3 text-center">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Engajamento Estimado</p>
                    <p className="text-2xl font-bold text-purple-600">{sugestao.engajamentoEstimado}%</p>
                  </div>
                  <div className="border border-slate-200 rounded p-3 text-center">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Conversões Estimadas</p>
                    <p className="text-2xl font-bold text-green-600">{sugestao.conversoeEstimadas}</p>
                  </div>
                  <div className="border border-slate-200 rounded p-3 text-center">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Melhoria vs Original</p>
                    <p className="text-2xl font-bold text-blue-600">+{(sugestao.engajamentoEstimado - 6.5).toFixed(1)}%</p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => copiarLegenda(sugestao.legenda)}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </Button>
                  <Button 
                    onClick={() => usarLegenda(sugestao.legenda)}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Usar Esta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Histórico de Legendas Otimizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Otimizações</CardTitle>
          <CardDescription>Legendas que você otimizou com IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historico.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 mb-1">Original:</p>
                    <p className="text-sm text-slate-600 mb-3">{item.original}</p>
                    
                    <p className="font-semibold text-slate-900 mb-1">Otimizada:</p>
                    <p className="text-sm text-slate-700 bg-purple-50 p-2 rounded mb-3 whitespace-pre-wrap">{item.otimizada}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <p className="text-slate-600">Engajamento</p>
                    <p className="font-bold text-slate-900">{item.engajamento}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Conversões</p>
                    <p className="font-bold text-slate-900">{item.conversoes}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Data</p>
                    <p className="font-bold text-slate-900">{item.data}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => copiarLegenda(item.otimizada)}
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar
                  </Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Tendências */}
      <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Análise de Tendências
          </CardTitle>
          <CardDescription>Palavras-chave e hashtags em alta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Hashtags em Alta (Instagram):</p>
              <div className="flex flex-wrap gap-2">
                {["#PijamaConforto", "#RendaExtra", "#Empreendedorismo", "#Feminnita", "#Qualidade", "#Promoção"].map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Palavras-Chave Trending (TikTok):</p>
              <div className="flex flex-wrap gap-2">
                {["Renda Extra", "Trabalho em Casa", "Empreendedorismo", "Qualidade", "Economia", "Família"].map((palavra) => (
                  <Badge key={palavra} variant="outline" className="cursor-pointer hover:bg-blue-100">
                    {palavra}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-100 border border-blue-300 rounded">
              <p className="text-xs font-semibold text-blue-900 mb-1">💡 Dica da IA:</p>
              <p className="text-xs text-blue-800">Use "Renda Extra" + emojis de dinheiro em legendas de Stories para aumentar engajamento em 25-35%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Legendas que Convertem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Comece com gancho irresistível nos 3 primeiros caracteres",
            "✅ Use 3-5 emojis estrategicamente distribuídos",
            "✅ Inclua prova social (depoimentos, números de clientes)",
            "✅ Crie urgência (tempo limitado, últimas peças)",
            "✅ Use 5-10 hashtags relevantes (não mais)",
            "✅ Termine com CTA clara (clique, comente, compartilhe)",
            "✅ Teste diferentes versões com A/B Testing",
            "✅ Acompanhe métricas de cada legenda otimizada"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="border-l-4 border-l-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg">Impacto das Otimizações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { titulo: "Legendas Otimizadas", valor: historico.length, icon: "✨" },
              { titulo: "Engajamento Médio", valor: (historico.reduce((a, h) => a + h.engajamento, 0) / historico.length).toFixed(1) + "%", icon: "📈" },
              { titulo: "Total de Conversões", valor: historico.reduce((a, h) => a + h.conversoes, 0), icon: "💰" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl mb-2">{stat.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{stat.titulo}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
