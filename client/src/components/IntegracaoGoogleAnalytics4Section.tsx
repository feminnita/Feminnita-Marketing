import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, MousePointerClick, Eye, Zap, Settings, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function IntegracaoGoogleAnalytics4Section() {
  const [selectedMetrica, setSelectedMetrica] = useState(0);

  const metricas = [
    {
      id: 1,
      nome: "Usuários Únicos",
      valor: "45.2K",
      mudanca: "+18%",
      cor: "blue",
      descricao: "Visitantes únicos este mês",
    },
    {
      id: 2,
      nome: "Sessões",
      valor: "128.5K",
      mudanca: "+24%",
      cor: "green",
      descricao: "Sessões totais este mês",
    },
    {
      id: 3,
      nome: "Taxa de Conversão",
      valor: "8.2%",
      mudanca: "+2.1%",
      cor: "purple",
      descricao: "Conversões / Sessões",
    },
    {
      id: 4,
      nome: "Tempo Médio de Sessão",
      valor: "4m 32s",
      mudanca: "+45s",
      cor: "pink",
      descricao: "Engajamento médio",
    },
  ];

  const fontes = [
    {
      nome: "Tráfego Direto",
      usuarios: 12500,
      sessoes: 18200,
      conversoes: 1456,
      taxa: 8.0,
      cor: "bg-blue-500",
    },
    {
      nome: "Organic Search",
      usuarios: 18300,
      sessoes: 42100,
      conversoes: 3368,
      taxa: 8.0,
      cor: "bg-green-500",
    },
    {
      nome: "Social Media",
      usuarios: 8900,
      sessoes: 35200,
      conversoes: 2456,
      taxa: 7.0,
      cor: "bg-purple-500",
    },
    {
      nome: "Paid Ads",
      usuarios: 5500,
      sessoes: 33000,
      conversoes: 3630,
      taxa: 11.0,
      cor: "bg-pink-500",
    },
  ];

  const comportamento = [
    {
      pagina: "/produtos",
      visualizacoes: 25400,
      usuarios: 18200,
      duracao: "3m 12s",
      taxa_saida: 12.5,
    },
    {
      pagina: "/checkout",
      visualizacoes: 12800,
      usuarios: 9200,
      duracao: "2m 45s",
      taxa_saida: 8.2,
    },
    {
      pagina: "/sobre",
      visualizacoes: 8900,
      usuarios: 6500,
      duracao: "1m 30s",
      taxa_saida: 35.6,
    },
    {
      pagina: "/blog",
      visualizacoes: 15600,
      usuarios: 11200,
      duracao: "4m 20s",
      taxa_saida: 5.2,
    },
  ];

  const conversoes = [
    {
      evento: "Adicionar ao Carrinho",
      total: 8450,
      valor: "R$ 127.5K",
      taxa: 6.6,
    },
    {
      evento: "Iniciar Checkout",
      total: 4230,
      valor: "R$ 63.5K",
      taxa: 3.3,
    },
    {
      evento: "Compra Completa",
      total: 3456,
      valor: "R$ 51.8K",
      taxa: 2.7,
    },
    {
      evento: "Inscrição Newsletter",
      total: 2890,
      valor: "-",
      taxa: 2.3,
    },
  ];

  const dispositivos = [
    { tipo: "Mobile", usuarios: 28500, sessoes: 68200, taxa: 8.5 },
    { tipo: "Desktop", usuarios: 14200, sessoes: 52100, taxa: 7.8 },
    { tipo: "Tablet", usuarios: 2500, sessoes: 8200, taxa: 6.2 },
  ];

  const topPaises = [
    { pais: "Brasil", usuarios: 38200, sessoes: 95400, taxa: 8.3 },
    { pais: "Portugal", usuarios: 4200, sessoes: 18900, taxa: 7.5 },
    { pais: "Outros", usuarios: 2800, sessoes: 14000, taxa: 6.8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Integração Google Analytics 4</h2>
        <p className="text-slate-600">Sincronize dados de tráfego, conversões e comportamento de usuários</p>
      </div>

      {/* Status de Conexão */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle className="w-5 h-5" />
            Conexão Ativa
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-2">
          <p>✓ Google Analytics 4 conectado com sucesso</p>
          <p>✓ Sincronização em tempo real ativa</p>
          <p>✓ Últimas 24 horas: 128.5K sessões, 45.2K usuários</p>
          <p className="text-sm">Próxima sincronização: em 5 minutos</p>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Métricas Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metricas.map((metrica, idx) => (
              <button
                key={metrica.id}
                onClick={() => setSelectedMetrica(idx)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedMetrica === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <p className="text-sm text-slate-600">{metrica.nome}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{metrica.valor}</p>
                <p className={`text-sm font-semibold text-${metrica.cor}-600 mt-1`}>{metrica.mudanca}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fontes de Tráfego */}
      <Card>
        <CardHeader>
          <CardTitle>Fontes de Tráfego</CardTitle>
          <CardDescription>Distribuição de usuários por fonte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fontes.map((fonte) => (
              <div key={fonte.nome} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-900">{fonte.nome}</p>
                  <Badge variant="outline">{fonte.taxa}% taxa</Badge>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                  <div
                    className={`${fonte.cor} h-2 rounded-full`}
                    style={{ width: `${(fonte.usuarios / 45200) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Usuários</p>
                    <p className="font-bold text-slate-900">{(fonte.usuarios / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Sessões</p>
                    <p className="font-bold text-slate-900">{(fonte.sessoes / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Conversões</p>
                    <p className="font-bold text-slate-900">{(fonte.conversoes / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Valor</p>
                    <p className="font-bold text-slate-900">R$ {(fonte.conversoes * 15).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comportamento de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Comportamento de Usuários</CardTitle>
          <CardDescription>Páginas mais visitadas e engajamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-2 font-semibold text-slate-900">Página</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-900">Visualizações</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-900">Usuários</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-900">Duração</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-900">Taxa Saída</th>
                </tr>
              </thead>
              <tbody>
                {comportamento.map((item) => (
                  <tr key={item.pagina} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 text-slate-900 font-medium">{item.pagina}</td>
                    <td className="text-right py-3 px-2 text-slate-600">{(item.visualizacoes / 1000).toFixed(1)}K</td>
                    <td className="text-right py-3 px-2 text-slate-600">{(item.usuarios / 1000).toFixed(1)}K</td>
                    <td className="text-right py-3 px-2 text-slate-600">{item.duracao}</td>
                    <td className="text-right py-3 px-2 text-red-600 font-semibold">{item.taxa_saida}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Funil de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Eventos e valores de conversão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversoes.map((conv, idx) => (
              <div key={conv.evento} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-900">{idx + 1}. {conv.evento}</p>
                  <Badge variant="outline">{conv.taxa}%</Badge>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full"
                    style={{ width: `${(conv.total / 8450) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Total</p>
                    <p className="font-bold text-slate-900">{(conv.total / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Valor</p>
                    <p className="font-bold text-slate-900">{conv.valor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Redução</p>
                    <p className="font-bold text-red-600">{((1 - conv.total / 8450) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dispositivos */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Dispositivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dispositivos.map((dev) => (
              <div key={dev.tipo} className="flex items-center gap-4">
                <div className="w-24">
                  <p className="font-semibold text-slate-900">{dev.tipo}</p>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(dev.usuarios / 28500) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-32 text-right text-sm">
                  <p className="font-bold text-slate-900">{(dev.usuarios / 1000).toFixed(1)}K usuários</p>
                  <p className="text-xs text-slate-600">{dev.taxa}% taxa</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geolocalização */}
      <Card>
        <CardHeader>
          <CardTitle>Geolocalização</CardTitle>
          <CardDescription>Usuários por país</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPaises.map((pais) => (
              <div key={pais.pais} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-900">{pais.pais}</p>
                  <Badge variant="outline">{pais.taxa}% taxa</Badge>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${(pais.usuarios / 45200) * 100}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Usuários</p>
                    <p className="font-bold text-slate-900">{(pais.usuarios / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Sessões</p>
                    <p className="font-bold text-slate-900">{(pais.sessoes / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Valor</p>
                    <p className="font-bold text-slate-900">R$ {(pais.usuarios * 1.2).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-900">Sincronização Automática</span>
            <input type="checkbox" checked readOnly className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-900">Rastreamento de Eventos Customizados</span>
            <input type="checkbox" checked readOnly className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-900">Relatórios Automáticos</span>
            <input type="checkbox" checked readOnly className="w-5 h-5" />
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold">
            Reconectar Google Analytics
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
