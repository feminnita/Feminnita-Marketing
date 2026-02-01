import { AlertCircle, CheckCircle, Pause, Play, Settings, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AutomacaoBlingSection() {
  const produtos = [
    {
      id: 1,
      nome: "Pijama Carol Rosa",
      sku: "CAROL-ROSA-P",
      estoque: 0,
      minimo: 1,
      status: "Pausado",
      campanhas: "Meta Ads, Google Ads",
      economia: "R$ 2.400/mês"
    },
    {
      id: 2,
      nome: "Pijama Renata Azul",
      sku: "RENATA-AZUL-M",
      estoque: 15,
      minimo: 1,
      status: "Ativo",
      campanhas: "Meta Ads, Google Ads",
      economia: "—"
    },
    {
      id: 3,
      nome: "Robe Vanessa Branco",
      sku: "VANESSA-BRANCO-G",
      estoque: 0,
      minimo: 1,
      status: "Pausado",
      campanhas: "Meta Ads, Google Ads",
      economia: "R$ 1.800/mês"
    },
    {
      id: 4,
      nome: "Pijama Luiza Roxo",
      sku: "LUIZA-ROXO-P",
      estoque: 8,
      minimo: 1,
      status: "Ativo",
      campanhas: "Meta Ads, Google Ads",
      economia: "—"
    },
    {
      id: 5,
      nome: "Pijama Carol Azul",
      sku: "CAROL-AZUL-M",
      estoque: 0,
      minimo: 1,
      status: "Pausado",
      campanhas: "Meta Ads, Google Ads",
      economia: "R$ 1.200/mês"
    }
  ];

  const historico = [
    {
      data: "01/02/2026 14:30",
      produto: "Pijama Carol Rosa",
      acao: "Pausou campanhas",
      motivo: "Estoque zerou",
      economia: "R$ 2.400/mês"
    },
    {
      data: "31/01/2026 09:15",
      produto: "Pijama Renata Azul",
      acao: "Reativou campanhas",
      motivo: "Reabastecimento recebido",
      economia: "Retomou vendas"
    },
    {
      data: "30/01/2026 16:45",
      produto: "Robe Vanessa Branco",
      acao: "Pausou campanhas",
      motivo: "Estoque zerou",
      economia: "R$ 1.800/mês"
    },
    {
      data: "29/01/2026 11:20",
      produto: "Pijama Luiza Roxo",
      acao: "Reativou campanhas",
      motivo: "Reabastecimento recebido",
      economia: "Retomou vendas"
    }
  ];

  const metricas = [
    {
      titulo: "Economia/Mês",
      valor: "R$ 5.400",
      descricao: "Evitando gastos em produtos sem estoque"
    },
    {
      titulo: "Economia/Ano",
      valor: "R$ 64.800",
      descricao: "Impacto anual da automação"
    },
    {
      titulo: "Produtos Monitorados",
      valor: "5",
      descricao: "Todos os SKUs principais"
    },
    {
      titulo: "Campanhas Pausadas",
      valor: "3",
      descricao: "Atualmente sem estoque"
    }
  ];

  const fluxoAutomacao = [
    {
      numero: 1,
      titulo: "Sincronização com Bling",
      descricao: "A cada 1 hora, verifica estoque no Bling ERP",
      icone: "🔄"
    },
    {
      numero: 2,
      titulo: "Comparação com Limite",
      descricao: "Se estoque < 1 unidade → produto sem estoque",
      icone: "⚖️"
    },
    {
      numero: 3,
      titulo: "Pausa Automática",
      descricao: "Pausa Meta Ads e Google Ads automaticamente",
      icone: "⏸️"
    },
    {
      numero: 4,
      titulo: "Notificação",
      descricao: "Envia alerta para dashboard e email",
      icone: "📧"
    },
    {
      numero: 5,
      titulo: "Reativação",
      descricao: "Quando estoque > 1, reativa campanhas",
      icone: "▶️"
    },
    {
      numero: 6,
      titulo: "Relatório",
      descricao: "Registra ação no histórico com economia calculada",
      icone: "📊"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => (
          <Card key={idx} className="border-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{metrica.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{metrica.valor}</div>
              <p className="text-xs text-slate-500 mt-1">{metrica.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fluxo de Automação */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Como Funciona a Automação
          </CardTitle>
          <CardDescription>Processo automático que sincroniza Bling com campanhas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fluxoAutomacao.map((etapa) => (
              <div key={etapa.numero} className="flex items-start gap-4">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-blue-600 border-2 border-blue-200">
                  {etapa.numero}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{etapa.titulo}</h4>
                  <p className="text-sm text-slate-600 mt-1">{etapa.descricao}</p>
                </div>
                <div className="text-2xl">{etapa.icone}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status de Produtos */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Status de Produtos
          </CardTitle>
          <CardDescription>Sincronização em tempo real com Bling ERP</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {produtos.map((produto) => (
              <div key={produto.id} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{produto.nome}</h4>
                    <p className="text-xs text-slate-500">SKU: {produto.sku}</p>
                  </div>
                  <Badge variant={produto.status === "Ativo" ? "default" : "destructive"}>
                    {produto.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Estoque</p>
                    <p className="font-bold text-slate-900">{produto.estoque} un</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Mínimo</p>
                    <p className="font-bold text-slate-900">{produto.minimo} un</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Campanhas</p>
                    <p className="text-xs text-slate-600">{produto.campanhas}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Economia</p>
                    <p className="font-bold text-green-600">{produto.economia}</p>
                  </div>
                  <div className="flex items-end">
                    {produto.status === "Pausado" ? (
                      <button className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 flex items-center gap-1">
                        <Pause className="w-3 h-3" />
                        Pausado
                      </button>
                    ) : (
                      <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        Ativo
                      </button>
                    )}
                  </div>
                </div>

                {produto.status === "Pausado" && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                    ⚠️ Campanhas pausadas automaticamente para economizar budget
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Ações */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-purple-600" />
            Histórico de Automações
          </CardTitle>
          <CardDescription>Últimas ações executadas automaticamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historico.map((item, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-3 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{item.produto}</h4>
                    <p className="text-xs text-slate-500">{item.data}</p>
                  </div>
                  {item.acao.includes("Pausou") ? (
                    <Badge className="bg-red-100 text-red-700">Pausado</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700">Reativado</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500">Ação</p>
                    <p className="text-slate-700 font-medium">{item.acao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Motivo</p>
                    <p className="text-slate-700 font-medium">{item.motivo}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs font-semibold text-green-600">💰 {item.economia}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Configurações da Automação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">API Key Bling Conectada</p>
              <p className="text-slate-600">Sincronizando estoque a cada 1 hora</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Limite Mínimo: 1 unidade</p>
              <p className="text-slate-600">Pausa campanhas quando estoque ≤ 0</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Campanhas Monitoradas</p>
              <p className="text-slate-600">Meta Ads (Facebook + Instagram) e Google Ads</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Produtos Monitorados</p>
              <p className="text-slate-600">Todos os 5 SKUs principais</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-slate-900">✅ Benefícios da Automação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="text-lg">💰</span>
            <p><strong>Economia de R$ 64.800/ano:</strong> Não gasta em publicidade de produtos sem estoque</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">⏱️</span>
            <p><strong>Automação 24/7:</strong> Funciona automaticamente, sem intervenção manual</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📊</span>
            <p><strong>Dados em Tempo Real:</strong> Sincroniza com Bling a cada 1 hora</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🎯</span>
            <p><strong>Melhor ROI:</strong> Investe apenas em produtos disponíveis</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📈</span>
            <p><strong>Sem Decepção de Cliente:</strong> Não atrai clientes para produtos sem estoque</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
