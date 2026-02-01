import { ShoppingCart, Zap, CheckCircle, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function IntegracaoTraySection() {
  const metricas = [
    {
      titulo: "Pedidos Sincronizados",
      valor: "8.450",
      descricao: "Últimos 30 dias",
      cor: "text-blue-600"
    },
    {
      titulo: "Receita Importada",
      valor: "R$ 1.27M",
      descricao: "Valor total dos pedidos",
      cor: "text-green-600"
    },
    {
      titulo: "Taxa de Sincronização",
      valor: "99.8%",
      descricao: "Pedidos sincronizados com sucesso",
      cor: "text-emerald-600"
    },
    {
      titulo: "Última Sincronização",
      valor: "Agora",
      descricao: "Atualização em tempo real",
      cor: "text-purple-600"
    }
  ];

  const pedidosRecentes = [
    {
      id: "TRY-2026-0001",
      cliente: "Maria Silva",
      data: "01/02/2026 14:30",
      produtos: "Pijama Carol Rosa (2x), Robe Vanessa",
      valor: "R$ 425",
      persona: "Carol",
      status: "Entregue"
    },
    {
      id: "TRY-2026-0002",
      cliente: "João Santos",
      data: "01/02/2026 13:15",
      produtos: "Pijama Renata Azul (3x)",
      valor: "R$ 675",
      persona: "Renata",
      status: "Processando"
    },
    {
      id: "TRY-2026-0003",
      cliente: "Ana Costa",
      data: "01/02/2026 12:45",
      produtos: "Pijama Vanessa Branco (1x)",
      valor: "R$ 185",
      persona: "Vanessa",
      status: "Enviado"
    },
    {
      id: "TRY-2026-0004",
      cliente: "Paula Oliveira",
      data: "01/02/2026 11:20",
      produtos: "Pijama Luiza Roxo (2x), Robe Vanessa",
      valor: "R$ 510",
      persona: "Luiza",
      status: "Entregue"
    },
    {
      id: "TRY-2026-0005",
      cliente: "Carlos Mendes",
      data: "01/02/2026 10:05",
      produtos: "Pijama Carol Rosa (1x)",
      valor: "R$ 185",
      persona: "Carol",
      status: "Processando"
    }
  ];

  const fluxoIntegracao = [
    {
      numero: 1,
      titulo: "Conexão Tray",
      descricao: "API Key conectada e autenticada",
      status: "✅ Ativo"
    },
    {
      numero: 2,
      titulo: "Sincronização de Pedidos",
      descricao: "Importa pedidos a cada 15 minutos",
      status: "✅ Ativo"
    },
    {
      numero: 3,
      titulo: "Rastreamento de Persona",
      descricao: "Identifica qual persona fez a compra",
      status: "✅ Ativo"
    },
    {
      numero: 4,
      titulo: "Atualização de Segmento",
      descricao: "Move cliente para segmento correto",
      status: "✅ Ativo"
    },
    {
      numero: 5,
      titulo: "Cálculo de LTV",
      descricao: "Atualiza Lifetime Value do cliente",
      status: "✅ Ativo"
    },
    {
      numero: 6,
      titulo: "Dashboard em Tempo Real",
      descricao: "Exibe dados atualizados na plataforma",
      status: "✅ Ativo"
    }
  ];

  const analisePersonas = [
    { persona: "Carol", pedidos: 2.150, receita: "R$ 268.750", ticket: "R$ 125", margem: "35%" },
    { persona: "Renata", pedidos: 1.890, receita: "R$ 378.000", ticket: "R$ 200", margem: "42%" },
    { persona: "Vanessa", pedidos: 2.680, receita: "R$ 268.000", ticket: "R$ 100", margem: "28%" },
    { persona: "Luiza", pedidos: 1.730, receita: "R$ 311.400", ticket: "R$ 180", margem: "38%" }
  ];

  const statusSincronizacao = [
    { data: "01/02/2026", pedidos: 287, receita: "R$ 42.150", status: "✅" },
    { data: "31/01/2026", pedidos: 312, receita: "R$ 48.720", status: "✅" },
    { data: "30/01/2026", pedidos: 298, receita: "R$ 45.300", status: "✅" },
    { data: "29/01/2026", pedidos: 265, receita: "R$ 39.850", status: "✅" },
    { data: "28/01/2026", pedidos: 301, receita: "R$ 46.950", status: "✅" }
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
              <div className={`text-3xl font-bold ${metrica.cor}`}>{metrica.valor}</div>
              <p className="text-xs text-slate-500 mt-1">{metrica.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status da Integração */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Status da Integração Tray
          </CardTitle>
          <CardDescription>Fluxo de sincronização de pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fluxoIntegracao.map((etapa) => (
              <div key={etapa.numero} className="flex items-start gap-4">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-green-600 border-2 border-green-200">
                  {etapa.numero}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900">{etapa.titulo}</h4>
                    <Badge className="bg-green-100 text-green-700">{etapa.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{etapa.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pedidos Recentes */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Últimos Pedidos Importados
          </CardTitle>
          <CardDescription>Sincronizados em tempo real do Tray</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pedidosRecentes.map((pedido) => (
              <div key={pedido.id} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{pedido.id}</h4>
                    <p className="text-xs text-slate-500">{pedido.cliente} • {pedido.data}</p>
                  </div>
                  <Badge variant={pedido.status === "Entregue" ? "default" : "secondary"}>
                    {pedido.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Produtos</p>
                    <p className="font-bold text-slate-900 text-xs">{pedido.produtos}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Persona</p>
                    <p className="font-bold text-slate-900">{pedido.persona}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Valor</p>
                    <p className="font-bold text-green-600">{pedido.valor}</p>
                  </div>
                  <div className="flex items-end">
                    <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 w-full">
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise por Persona */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Análise de Pedidos por Persona
          </CardTitle>
          <CardDescription>Performance de cada persona nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {analisePersonas.map((persona, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{persona.persona}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Pedidos</p>
                    <p className="font-bold text-slate-900">{persona.pedidos}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-green-600">{persona.receita}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ticket Médio</p>
                    <p className="font-bold text-slate-900">{persona.ticket}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Margem</p>
                    <p className="font-bold text-blue-600">{persona.margem}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Diário */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Histórico de Sincronização
          </CardTitle>
          <CardDescription>Últimos 5 dias de importação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {statusSincronizacao.map((dia, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-200/50 rounded-lg hover:bg-slate-50/50 transition">
                <div>
                  <p className="font-semibold text-slate-900">{dia.data}</p>
                  <p className="text-xs text-slate-500">{dia.pedidos} pedidos • {dia.receita}</p>
                </div>
                <Badge className="bg-green-100 text-green-700">{dia.status} Sucesso</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-slate-900">🎯 Benefícios da Integração Tray</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>Dados em Tempo Real:</strong> Pedidos importados a cada 15 minutos automaticamente</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>Rastreamento de Persona:</strong> Sabe exatamente qual persona fez cada venda</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>Segmentação Automática:</strong> Clientes movem para segmento correto após compra</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>LTV Atualizado:</strong> Lifetime Value recalculado com cada novo pedido</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>99.8% de Sincronização:</strong> Praticamente nenhum pedido é perdido</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>Análise Completa:</strong> Dashboard mostra performance por persona e produto</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
