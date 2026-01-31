import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp, Users, Eye, Link2, Settings } from "lucide-react";
import { useState } from "react";

export default function GoogleAnalyticsSection() {
  const [conectado, setConectado] = useState(false);
  const [gaId, setGaId] = useState("");
  const [periodo, setPeriodo] = useState("7dias");

  // Dados simulados do Google Analytics
  const dadosGA = {
    "7dias": [
      { data: "Seg", usuarios: 245, sessoes: 312, visualizacoes: 1200, taxa_rejeicao: 32 },
      { data: "Ter", usuarios: 289, sessoes: 401, visualizacoes: 1890, taxa_rejeicao: 28 },
      { data: "Qua", usuarios: 312, sessoes: 478, visualizacoes: 2340, taxa_rejeicao: 25 },
      { data: "Qui", usuarios: 401, sessoes: 589, visualizacoes: 3120, taxa_rejeicao: 22 },
      { data: "Sex", usuarios: 523, sessoes: 756, visualizacoes: 4560, taxa_rejeicao: 18 },
      { data: "Sab", usuarios: 612, sessoes: 834, visualizacoes: 5120, taxa_rejeicao: 20 },
      { data: "Dom", usuarios: 445, sessoes: 612, visualizacoes: 3890, taxa_rejeicao: 24 }
    ],
    "30dias": [
      { data: "Sem 1", usuarios: 1200, sessoes: 1500, visualizacoes: 8900, taxa_rejeicao: 30 },
      { data: "Sem 2", usuarios: 1450, sessoes: 1890, visualizacoes: 11200, taxa_rejeicao: 28 },
      { data: "Sem 3", usuarios: 1680, sessoes: 2100, visualizacoes: 12500, taxa_rejeicao: 26 },
      { data: "Sem 4", usuarios: 1920, sessoes: 2400, visualizacoes: 14200, taxa_rejeicao: 24 }
    ]
  };

  const dadosAtivos = dadosGA[periodo as keyof typeof dadosGA];

  const metricas = [
    { titulo: "Usuários Únicos", valor: "2.218", mudanca: "+15%", cor: "blue" },
    { titulo: "Sessões", valor: "2.878", mudanca: "+22%", cor: "green" },
    { titulo: "Visualizações", valor: "16.740", mudanca: "+18%", cor: "purple" },
    { titulo: "Taxa de Rejeição", valor: "24%", mudanca: "-8%", cor: "red" }
  ];

  const conectarGA = () => {
    if (gaId.trim()) {
      setConectado(true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integração com Google Analytics</h2>
        <p className="text-slate-600">
          Conecte sua conta do Google Analytics para monitorar dados reais de suas campanhas em tempo real.
        </p>
      </div>

      {/* Conexão com GA */}
      <Card className="border-l-4 border-l-orange-400 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="w-5 h-5 text-orange-600" />
            Conectar Google Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!conectado ? (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">ID do Google Analytics (GA4)</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="G-XXXXXXXXXX"
                    value={gaId}
                    onChange={(e) => setGaId(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={conectarGA}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Conectar
                  </Button>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Encontre seu ID em: Google Analytics → Admin → Propriedade → ID da Propriedade
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded">
              <div>
                <p className="font-semibold text-green-900">✅ Conectado com Sucesso</p>
                <p className="text-sm text-green-700">ID: {gaId}</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  setConectado(false);
                  setGaId("");
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
          {/* Período de Análise */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Período de Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap">
                {[
                  { id: "7dias", nome: "Últimos 7 dias" },
                  { id: "30dias", nome: "Últimos 30 dias" }
                ].map((opt) => (
                  <Button
                    key={opt.id}
                    variant={periodo === opt.id ? "default" : "outline"}
                    onClick={() => setPeriodo(opt.id)}
                  >
                    {opt.nome}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas Principais */}
          <div className="grid md:grid-cols-4 gap-4">
            {metricas.map((metrica, idx) => (
              <Card key={idx} className="border-2">
                <CardContent className="pt-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{metrica.titulo}</p>
                  <p className="text-2xl font-bold text-slate-900">{metrica.valor}</p>
                  <p className={`text-sm font-semibold mt-2 ${metrica.mudanca.includes("+") ? "text-green-600" : "text-red-600"}`}>
                    {metrica.mudanca} vs período anterior
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico de Usuários e Sessões */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usuários e Sessões</CardTitle>
              <CardDescription>Evolução ao longo do período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosAtivos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis yAxisId="left" label={{ value: 'Usuários', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Sessões', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="usuarios" stroke="#3b82f6" name="Usuários" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="sessoes" stroke="#10b981" name="Sessões" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Visualizações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visualizações de Página</CardTitle>
              <CardDescription>Total de visualizações por período</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosAtivos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visualizacoes" fill="#8b5cf6" name="Visualizações" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Páginas Mais Visitadas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Páginas Mais Visitadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { pagina: "/", visualizacoes: 2340, usuarios: 512, duracao: "2m 34s" },
                  { pagina: "/produtos", visualizacoes: 1890, usuarios: 423, duracao: "3m 12s" },
                  { pagina: "/sobre", visualizacoes: 1240, usuarios: 289, duracao: "1m 45s" },
                  { pagina: "/contato", visualizacoes: 890, usuarios: 156, duracao: "1m 23s" },
                  { pagina: "/blog", visualizacoes: 756, usuarios: 134, duracao: "4m 56s" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded hover:bg-slate-50">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.pagina}</p>
                      <p className="text-xs text-slate-600">Tempo médio: {item.duracao}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{item.visualizacoes}</p>
                      <p className="text-xs text-slate-600">{item.usuarios} usuários</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fontes de Tráfego */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fontes de Tráfego</CardTitle>
              <CardDescription>Origem do tráfego para seu site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { fonte: "Organic Search", usuarios: 1245, percentual: 42, cor: "bg-blue-500" },
                  { fonte: "Direct", usuarios: 834, percentual: 28, cor: "bg-green-500" },
                  { fonte: "Social Media", usuarios: 523, percentual: 18, cor: "bg-purple-500" },
                  { fonte: "Referral", usuarios: 267, percentual: 9, cor: "bg-orange-500" },
                  { fonte: "Email", usuarios: 149, percentual: 5, cor: "bg-red-500" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-slate-900">{item.fonte}</p>
                      <Badge variant="secondary">{item.percentual}%</Badge>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`${item.cor} h-2 rounded-full`}
                        style={{ width: `${item.percentual}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600">{item.usuarios} usuários</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Recomendações Baseadas em Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { titulo: "Otimizar Página Inicial", descricao: "A página inicial tem 2.340 visualizações. Considere melhorar CTA para aumentar conversões." },
                { titulo: "Expandir Conteúdo Social", descricao: "Social Media gera 18% do tráfego. Aumente investimento em redes sociais." },
                { titulo: "Melhorar SEO", descricao: "Organic Search é 42% do tráfego. Otimize palavras-chave para crescer mais." },
                { titulo: "Aumentar Engajamento de Email", descricao: "Email é apenas 5% do tráfego. Crie campanhas de email marketing mais robustas." }
              ].map((rec, idx) => (
                <div key={idx} className="flex gap-3 pb-3 border-b border-blue-200 last:border-0">
                  <span className="text-blue-600 font-bold">{idx + 1}.</span>
                  <div>
                    <p className="font-semibold text-slate-900">{rec.titulo}</p>
                    <p className="text-xs text-slate-600">{rec.descricao}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Próximas Ações */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg">Próximas Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✅ Dados do Google Analytics integrados com sucesso</p>
              <p>📊 Monitore regularmente o dashboard para acompanhar performance</p>
              <p>🎯 Use as recomendações para otimizar sua estratégia</p>
              <p>📈 Compare dados de campanhas com métricas gerais do site</p>
              <p>💡 Identifique páginas com alto potencial de conversão</p>
            </CardContent>
          </Card>
        </>
      )}

      {!conectado && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg">Por que conectar Google Analytics?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              "Monitore dados reais de suas campanhas em tempo real",
              "Veja quais páginas geram mais engajamento e conversões",
              "Identifique fontes de tráfego mais rentáveis",
              "Otimize sua estratégia com base em dados concretos",
              "Acompanhe ROI de cada campanha com precisão",
              "Tome decisões informadas sobre alocação de orçamento"
            ].map((beneficio, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-amber-600">✓</span>
                <p className="text-slate-700">{beneficio}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
