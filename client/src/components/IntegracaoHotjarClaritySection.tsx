import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Eye, MousePointer, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export default function IntegracaoHotjarClaritySection() {
  const heatmapData = [
    { area: "Botão CTA Principal", clicks: 1245, percentage: 34.2, heatLevel: "hot" },
    { area: "Seção de Preços", clicks: 892, percentage: 24.5, heatLevel: "warm" },
    { area: "Galeria de Produtos", clicks: 567, percentage: 15.6, heatLevel: "warm" },
    { area: "Formulário de Contato", clicks: 234, percentage: 6.4, heatLevel: "cool" },
    { area: "Footer", clicks: 156, percentage: 4.3, heatLevel: "cold" },
  ];

  const sessionRecordings = [
    { id: 1, duration: "4m 23s", device: "Desktop", conversion: "Sim", insights: "Usuário passou 2m na seção de preços antes de converter" },
    { id: 2, duration: "2m 15s", device: "Mobile", conversion: "Não", insights: "Abandonou no formulário de checkout" },
    { id: 3, duration: "5m 47s", device: "Desktop", conversion: "Sim", insights: "Visitou 3 produtos antes de comprar" },
    { id: 4, duration: "1m 32s", device: "Mobile", conversion: "Não", insights: "Saiu após ver preço do frete" },
  ];

  const conversionOptimizations = [
    { issue: "CTA não está visível acima da dobra", impact: "Alto", status: "Implementado", improvement: "+18%" },
    { issue: "Formulário com muitos campos", impact: "Médio", status: "Em progresso", improvement: "+12%" },
    { issue: "Imagens lentas no mobile", impact: "Alto", status: "Resolvido", improvement: "+22%" },
    { issue: "Falta de prova social (reviews)", impact: "Médio", status: "Planejado", improvement: "+15%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Hotjar & Clarity - Análise de Comportamento</h2>
        <p className="text-slate-600">Rastreie heatmaps, session recordings e otimize UX para aumentar conversão em 10-15%</p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Dados de exemplo — conecte Hotjar ou Clarity para dados reais</p>
              <p className="text-sm text-slate-600 mt-1">
                Os heatmaps, gravações de sessão e otimizações abaixo são ilustrativos. Para análise de comportamento real, instale o script do Hotjar ou Microsoft Clarity no seu site.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Sessões Rastreadas</p>
                <p className="text-2xl font-bold text-slate-900">12,543</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Taxa Conversão Média</p>
                <p className="text-2xl font-bold text-slate-900">8.5%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Recordings Disponíveis</p>
                <p className="text-2xl font-bold text-slate-900">342</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Otimizações Implementadas</p>
                <p className="text-2xl font-bold text-slate-900">8</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="w-5 h-5" />
            Análise de Heatmap
          </CardTitle>
          <CardDescription>Áreas mais clicadas na página</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {heatmapData.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{item.area}</span>
                  <Badge variant={item.heatLevel === "hot" ? "default" : item.heatLevel === "warm" ? "secondary" : "outline"}>
                    {item.clicks.toLocaleString()} cliques
                  </Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.heatLevel === "hot"
                        ? "bg-red-500"
                        : item.heatLevel === "warm"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">{item.percentage}% do total de cliques</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Recordings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Session Recordings
          </CardTitle>
          <CardDescription>Últimas sessões registradas com insights de comportamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessionRecordings.map((session) => (
              <div key={session.id} className="border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{session.device}</Badge>
                    <span className="font-medium text-slate-900">{session.duration}</span>
                  </div>
                  <Badge variant={session.conversion === "Sim" ? "default" : "secondary"}>
                    {session.conversion === "Sim" ? "✓ Converteu" : "✗ Não converteu"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{session.insights}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Oportunidades de Otimização
          </CardTitle>
          <CardDescription>Problemas identificados e melhorias esperadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conversionOptimizations.map((opt, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-slate-900">{opt.issue}</p>
                    <p className="text-xs text-slate-600 mt-1">Impacto: {opt.impact}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        opt.status === "Implementado"
                          ? "default"
                          : opt.status === "Em progresso"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {opt.status}
                    </Badge>
                    <p className="text-sm font-bold text-green-600 mt-2">{opt.improvement}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="w-5 h-5" />
            Como Integrar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-3">
          <ol className="list-decimal list-inside space-y-2">
            <li>Acesse <strong>Hotjar.com</strong> ou <strong>Clarity.microsoft.com</strong></li>
            <li>Crie uma conta e adicione seu site</li>
            <li>Copie o código de rastreamento</li>
            <li>Cole no <code className="bg-blue-100 px-2 py-1 rounded text-xs">&lt;head&gt;</code> do seu site</li>
            <li>Aguarde 24-48h para dados aparecerem</li>
            <li>Analise heatmaps e session recordings</li>
            <li>Implemente otimizações baseadas nos insights</li>
          </ol>
          <p className="text-sm mt-4">
            <strong>Dica:</strong> Use ambas as ferramentas em paralelo - Hotjar é melhor para heatmaps visuais, Clarity para análise profunda.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
