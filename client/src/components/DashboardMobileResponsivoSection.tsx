import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, TrendingUp, Users, Eye, BarChart3, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function DashboardMobileResponsivoSection() {
  const [selectedView, setSelectedView] = useState("overview");

  const kpis = [
    { titulo: "Conversões", valor: "3.2K", mudanca: "+15%", cor: "green" },
    { titulo: "Tráfego", valor: "128K", mudanca: "+22%", cor: "blue" },
    { titulo: "Engajamento", valor: "8.5%", mudanca: "+3.2%", cor: "purple" },
    { titulo: "ROI", valor: "385%", mudanca: "+45%", cor: "pink" },
  ];

  const alertas = [
    { titulo: "🎉 Meta Atingida", descricao: "Conversões acima de 250/dia", tipo: "sucesso" },
    { titulo: "🔥 Trend Viral", descricao: "#PijamaChallenge +156%", tipo: "oportunidade" },
    { titulo: "⚠️ Anomalia", descricao: "Performance de Renata -28%", tipo: "alerta" },
  ];

  const personas = [
    { nome: "Carol", seguidores: "45K", engajamento: "12.5%", status: "Ativo" },
    { nome: "Renata", seguidores: "38K", engajamento: "10.2%", status: "Ativo" },
    { nome: "Vanessa", seguidores: "52K", engajamento: "14.1%", status: "Ativo" },
    { nome: "Luiza", seguidores: "41K", engajamento: "11.8%", status: "Ativo" },
  ];

  const posts = [
    { titulo: "Pijama Conforto", views: "45K", likes: "2.3K", taxa: "5.1%" },
    { titulo: "Dica de Estilo", views: "38K", likes: "1.9K", taxa: "5.0%" },
    { titulo: "Unboxing", views: "62K", likes: "3.1K", taxa: "5.0%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Mobile Responsivo</h2>
        <p className="text-slate-600">Visualize métricas principais otimizadas para celular</p>
      </div>

      {/* Simulador de Celular */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Visualização Mobile
          </CardTitle>
          <CardDescription>Teste o dashboard em diferentes tamanhos de tela</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Simulação de Celular */}
          <div className="flex justify-center mb-6">
            <div className="w-80 bg-black rounded-3xl p-3 shadow-2xl" style={{ aspectRatio: "9/16" }}>
              <div className="bg-white rounded-2xl h-full overflow-hidden flex flex-col">
                {/* Status Bar */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 text-xs flex justify-between items-center">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-3">
                  <h1 className="font-bold text-lg">Feminnita</h1>
                  <p className="text-xs opacity-90">Dashboard Executivo</p>
                </div>

                {/* Conteúdo Scrollável */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 gap-2">
                    {kpis.map((kpi) => (
                      <div key={kpi.titulo} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2">
                        <p className="text-xs text-slate-600">{kpi.titulo}</p>
                        <p className="text-lg font-bold text-slate-900">{kpi.valor}</p>
                        <p className={`text-xs font-semibold text-${kpi.cor}-600`}>{kpi.mudanca}</p>
                      </div>
                    ))}
                  </div>

                  {/* Alertas */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-900">Alertas</p>
                    {alertas.map((alerta) => (
                      <div key={alerta.titulo} className="bg-slate-50 rounded-lg p-2 text-xs">
                        <p className="font-semibold text-slate-900">{alerta.titulo}</p>
                        <p className="text-slate-600 text-xs">{alerta.descricao}</p>
                      </div>
                    ))}
                  </div>

                  {/* Personas */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-900">Top Personas</p>
                    {personas.slice(0, 2).map((persona) => (
                      <div key={persona.nome} className="bg-slate-50 rounded-lg p-2 text-xs">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-slate-900">{persona.nome}</p>
                          <Badge className="text-xs" variant="outline">{persona.engajamento}</Badge>
                        </div>
                        <p className="text-slate-600">{persona.seguidores} seguidores</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="border-t border-slate-200 px-2 py-2 flex justify-around text-xs">
                  <button className="flex flex-col items-center gap-1 text-pink-500">
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 text-slate-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Alertas</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>Personas</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de Responsividade */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-slate-600">Mobile</p>
              <p className="text-lg font-bold text-slate-900">320px</p>
              <p className="text-xs text-slate-600">Otimizado</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-slate-600">Tablet</p>
              <p className="text-lg font-bold text-slate-900">768px</p>
              <p className="text-xs text-slate-600">Otimizado</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-slate-600">Desktop</p>
              <p className="text-lg font-bold text-slate-900">1024px</p>
              <p className="text-xs text-slate-600">Otimizado</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-3">
              <p className="text-xs text-slate-600">Wide</p>
              <p className="text-lg font-bold text-slate-900">1920px</p>
              <p className="text-xs text-slate-600">Otimizado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widgets Mobile */}
      <Card>
        <CardHeader>
          <CardTitle>Widgets Principais</CardTitle>
          <CardDescription>Componentes otimizados para celular</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* KPI Widget */}
          <div className="bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-lg p-4">
            <p className="text-sm opacity-90">Conversões Hoje</p>
            <p className="text-3xl font-bold mt-1">285</p>
            <p className="text-sm opacity-90 mt-1">+14% vs meta</p>
          </div>

          {/* Alert Widget */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Anomalia Detectada</p>
                <p className="text-sm text-red-700">Performance de Renata caiu 28%</p>
                <button className="text-xs text-red-600 font-semibold mt-2">Ver detalhes →</button>
              </div>
            </div>
          </div>

          {/* Success Widget */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Meta Atingida!</p>
                <p className="text-sm text-green-700">Conversões acima de 250/dia</p>
                <button className="text-xs text-green-600 font-semibold mt-2">Celebrar →</button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personas Mobile */}
      <Card>
        <CardHeader>
          <CardTitle>Personas - Visualização Mobile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {personas.map((persona) => (
              <div key={persona.nome} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div>
                  <p className="font-semibold text-slate-900">{persona.nome}</p>
                  <p className="text-xs text-slate-600">{persona.seguidores} seguidores</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 text-xs">{persona.engajamento}</Badge>
                  <p className="text-xs text-slate-600 mt-1">{persona.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts Mobile */}
      <Card>
        <CardHeader>
          <CardTitle>Posts - Visualização Mobile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.titulo} className="bg-slate-50 rounded-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-50" />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-slate-900 text-sm">{post.titulo}</p>
                  <div className="flex justify-between mt-2 text-xs text-slate-600">
                    <span>👁️ {post.views}</span>
                    <span>❤️ {post.likes}</span>
                    <span>📊 {post.taxa}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Mobile */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">📱 Performance Mobile</CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-semibold">Tempo de Carregamento</p>
              <p className="text-2xl font-bold">1.2s</p>
              <p className="text-xs mt-1">Excelente</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Taxa de Rejeição</p>
              <p className="text-2xl font-bold">12%</p>
              <p className="text-xs mt-1">Muito baixa</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Tráfego Mobile</p>
              <p className="text-2xl font-bold">63%</p>
              <p className="text-xs mt-1">Dominante</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Conversão Mobile</p>
              <p className="text-2xl font-bold">8.5%</p>
              <p className="text-xs mt-1">Acima da média</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Breakpoints Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="font-semibold">Mobile</span>
              <span className="text-slate-600">0px - 640px</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="font-semibold">Tablet</span>
              <span className="text-slate-600">641px - 1024px</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="font-semibold">Desktop</span>
              <span className="text-slate-600">1025px - 1920px</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="font-semibold">Wide</span>
              <span className="text-slate-600">1921px+</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
