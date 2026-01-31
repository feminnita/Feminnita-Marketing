import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BarChart3, Zap, TrendingUp, DollarSign, Target } from "lucide-react";
import { useState } from "react";

export default function GoogleAdsSection() {
  const [conectado, setConectado] = useState(false);
  const [googleKey, setGoogleKey] = useState("");
  const [campanhas, setCampanhas] = useState([
    {
      id: 1,
      nome: "Renda Extra - Search Ads",
      tipo: "search",
      status: "ativa",
      budget: 500,
      gasto: 342,
      impressoes: 12450,
      cliques: 567,
      conversoes: 45,
      cpa: 7.6,
      roas: 3.2
    },
    {
      id: 2,
      nome: "Compra Familiar - Display Ads",
      tipo: "display",
      status: "ativa",
      budget: 300,
      gasto: 245,
      impressoes: 45230,
      cliques: 234,
      conversoes: 28,
      cpa: 8.75,
      roas: 2.8
    },
    {
      id: 3,
      nome: "Lançamento Inverno - Shopping Ads",
      tipo: "shopping",
      status: "pausada",
      budget: 400,
      gasto: 0,
      impressoes: 0,
      cliques: 0,
      conversoes: 0,
      cpa: 0,
      roas: 0
    }
  ]);

  const [novasCampanhas, setNovasCampanhas] = useState([
    {
      id: 1,
      nome: "Renda Extra - Search Ads",
      descricao: "Segmente por: 'como ganhar dinheiro extra', 'trabalho em casa', 'renda passiva'",
      budget: 500,
      duracao: "7 dias",
      alvo: "Mulheres 25-45 anos, Brasil"
    },
    {
      id: 2,
      nome: "Compra Familiar - Display Ads",
      descricao: "Remarketing para visitantes do site que não compraram",
      budget: 300,
      duracao: "14 dias",
      alvo: "Visitantes anteriores do site"
    },
    {
      id: 3,
      nome: "Lançamento Inverno - Shopping Ads",
      descricao: "Mostre produtos do catálogo em Google Shopping",
      budget: 400,
      duracao: "30 dias",
      alvo: "Pessoas buscando 'pijama inverno'"
    }
  ]);

  const conectarGoogle = () => {
    if (googleKey.trim()) {
      setConectado(true);
    }
  };

  const criarCampanha = (id: number) => {
    const campanha = novasCampanhas.find(c => c.id === id);
    if (campanha) {
      setCampanhas([...campanhas, {
        id: campanhas.length + 1,
        nome: campanha.nome,
        tipo: "search",
        status: "ativa",
        budget: campanha.budget,
        gasto: 0,
        impressoes: 0,
        cliques: 0,
        conversoes: 0,
        cpa: 0,
        roas: 0
      }]);
    }
  };

  const metricas = {
    totalGasto: campanhas.reduce((a, c) => a + c.gasto, 0),
    totalImpressions: campanhas.reduce((a, c) => a + c.impressoes, 0),
    totalCliques: campanhas.reduce((a, c) => a + c.cliques, 0),
    totalConversoes: campanhas.reduce((a, c) => a + c.conversoes, 0),
    cpaMedia: (campanhas.filter(c => c.cpa > 0).reduce((a, c) => a + c.cpa, 0) / campanhas.filter(c => c.cpa > 0).length).toFixed(2),
    roasMedia: (campanhas.filter(c => c.roas > 0).reduce((a, c) => a + c.roas, 0) / campanhas.filter(c => c.roas > 0).length).toFixed(2)
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integração com Google Ads</h2>
        <p className="text-slate-600">
          Crie campanhas de ads diretamente na plataforma com budget automático e otimização de CPA baseada em dados históricos.
        </p>
      </div>

      {/* Conexão com Google Ads */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Conectar Google Ads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!conectado ? (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Token de Acesso Google Ads</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Seu token de acesso Google Ads"
                    value={googleKey}
                    onChange={(e) => setGoogleKey(e.target.value)}
                    type="password"
                    className="flex-1"
                  />
                  <Button 
                    onClick={conectarGoogle}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Conectar
                  </Button>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Encontre seu token em: Google Ads → Configurações → Acesso à API
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold text-blue-900 mb-2">Como Obter Seu Token Google Ads:</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Acesse ads.google.com</li>
                  <li>Vá para Configurações → Acesso à API</li>
                  <li>Clique em "Gerar Novo Token"</li>
                  <li>Copie o token de acesso</li>
                  <li>Cole aqui e clique em Conectar</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded">
              <div>
                <p className="font-semibold text-green-900">✅ Conectado com Sucesso</p>
                <p className="text-sm text-green-700">Google Ads está pronto para usar</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setConectado(false);
                  setGoogleKey("");
                }}
              >
                Desconectar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {conectado && (
        <>
          {/* Métricas Consolidadas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métricas Consolidadas</CardTitle>
              <CardDescription>Performance de todas as campanhas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-6 gap-3">
                {[
                  { titulo: "Gasto Total", valor: `R$ ${metricas.totalGasto.toLocaleString()}`, icon: "💰" },
                  { titulo: "Impressões", valor: metricas.totalImpressions.toLocaleString(), icon: "👁️" },
                  { titulo: "Cliques", valor: metricas.totalCliques.toLocaleString(), icon: "🖱️" },
                  { titulo: "Conversões", valor: metricas.totalConversoes, icon: "✅" },
                  { titulo: "CPA Médio", valor: `R$ ${metricas.cpaMedia}`, icon: "📊" },
                  { titulo: "ROAS Médio", valor: `${metricas.roasMedia}x`, icon: "📈" }
                ].map((metrica, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-3 text-center hover:border-blue-300 hover:bg-blue-50 transition">
                    <p className="text-2xl mb-1">{metrica.icon}</p>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{metrica.titulo}</p>
                    <p className="text-lg font-bold text-slate-900">{metrica.valor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campanhas Ativas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campanhas Ativas</CardTitle>
              <CardDescription>Suas campanhas Google Ads em funcionamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {campanhas.filter(c => c.status === "ativa").map((camp) => (
                <div key={camp.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{camp.nome}</h4>
                      <p className="text-xs text-slate-600">{camp.tipo}</p>
                    </div>
                    <Badge className="bg-green-600">✅ Ativa</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
                    <div>
                      <p className="text-slate-600">Budget</p>
                      <p className="font-bold text-slate-900">R$ {camp.budget}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Gasto</p>
                      <p className="font-bold text-slate-900">R$ {camp.gasto}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">CPA</p>
                      <p className="font-bold text-slate-900">R$ {camp.cpa}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">ROAS</p>
                      <p className="font-bold text-slate-900">{camp.roas}x</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">Editar</Button>
                    <Button size="sm" variant="outline" className="flex-1">Pausar</Button>
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">Ver Detalhes</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Novas Campanhas */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Criar Nova Campanha
              </CardTitle>
              <CardDescription>Campanhas pré-configuradas para suas personas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {novasCampanhas.map((camp) => (
                <div key={camp.id} className="border border-green-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{camp.nome}</h4>
                      <p className="text-xs text-slate-600 mb-2">{camp.descricao}</p>
                      <div className="flex gap-3 text-xs">
                        <span>💰 Budget: R$ {camp.budget}</span>
                        <span>⏱️ Duração: {camp.duracao}</span>
                        <span>🎯 Alvo: {camp.alvo}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => criarCampanha(camp.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Criar Campanha
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Otimização Automática */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Otimização Automática
              </CardTitle>
              <CardDescription>IA otimiza budget e CPA em tempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { titulo: "Budget Automático", descricao: "IA aloca budget para campanhas com melhor ROAS", status: "ativo" },
                  { titulo: "Otimização de CPA", descricao: "Reduz CPA automaticamente mantendo conversões", status: "ativo" },
                  { titulo: "Ajuste de Lances", descricao: "Aumenta/diminui lances baseado em performance", status: "inativo" },
                  { titulo: "Segmentação Dinâmica", descricao: "Ajusta público-alvo para melhor conversão", status: "ativo" }
                ].map((opt, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 border border-purple-200 rounded bg-white">
                    <div>
                      <p className="font-semibold text-slate-900">{opt.titulo}</p>
                      <p className="text-xs text-slate-600">{opt.descricao}</p>
                    </div>
                    <Badge variant={opt.status === "ativo" ? "default" : "secondary"}>
                      {opt.status === "ativo" ? "✅ Ativo" : "⏸️ Inativo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Dicas para Máximo ROI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "✅ Comece com Search Ads (melhor ROI para e-commerce)",
                "✅ Use Remarketing para visitantes que não compraram",
                "✅ Teste diferentes palavras-chave e anúncios",
                "✅ Monitore CPA e ROAS diariamente",
                "✅ Pause campanhas com CPA > R$ 15",
                "✅ Aumente budget para campanhas com ROAS > 3x",
                "✅ Use extensões de anúncio (promoção, avaliação)"
              ].map((dica, idx) => (
                <p key={idx} className="text-slate-700">{dica}</p>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {!conectado && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg">Por que usar Google Ads?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { titulo: "Alcance Massivo", descricao: "Bilhões de buscas por dia no Google" },
              { titulo: "Segmentação Precisa", descricao: "Chegue exatamente quem procura seus produtos" },
              { titulo: "ROI Rastreável", descricao: "Veja exatamente quanto cada real gerou" },
              { titulo: "Otimização Automática", descricao: "IA otimiza campanhas em tempo real" },
              { titulo: "Múltiplos Formatos", descricao: "Search, Display, Shopping, Video Ads" },
              { titulo: "Integração Perfeita", descricao: "Funciona com Meta, Zapier e IA" }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-amber-600">✓</span>
                <div>
                  <p className="font-semibold text-slate-900">{item.titulo}</p>
                  <p className="text-xs text-slate-600">{item.descricao}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
