import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, Eye, Clock, ShoppingCart, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardPerformanceRealtimeSection() {
  const [metricas, setMetricas] = useState<{
    visualizacoes: number;
    cliques: number;
    conversoes: number;
    receita: number;
    engagement: number;
    roi: number;
  }>({
    visualizacoes: 12543,
    cliques: 892,
    conversoes: 156,
    receita: 45678,
    engagement: 8.5,
    roi: 285
  });

  const [posts] = useState([
    { id: 1, titulo: "Pijama Inverno Azul", tipo: "Reels", plataforma: "Instagram", views: 4200, clicks: 342, conversoes: 58, receita: 16800 },
    { id: 2, titulo: "Renda Extra", tipo: "Ads", plataforma: "TikTok", views: 3800, clicks: 285, conversoes: 42, receita: 12100 },
    { id: 3, titulo: "Bastidores Produção", tipo: "Reels", plataforma: "Instagram", views: 2500, clicks: 156, conversoes: 28, receita: 8050 },
    { id: 4, titulo: "Compra Coletiva", tipo: "Story", plataforma: "Instagram", views: 1543, clicks: 109, conversoes: 18, receita: 5200 },
    { id: 5, titulo: "Análise Qualidade", tipo: "TikTok", plataforma: "TikTok", views: 1000, clicks: 67, conversoes: 12, receita: 3450 }
  ]);

  // Simular atualização em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetricas(prev => ({
        visualizacoes: prev.visualizacoes + Math.floor(Math.random() * 50),
        cliques: prev.cliques + Math.floor(Math.random() * 10),
        conversoes: prev.conversoes + Math.floor(Math.random() * 3),
        receita: prev.receita + Math.floor(Math.random() * 500),
        engagement: parseFloat((prev.engagement + (Math.random() - 0.5) * 0.2).toFixed(1)),
        roi: parseFloat((prev.roi + (Math.random() - 0.5) * 10).toFixed(0))
      }));
    }, 5000); // Atualiza a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard de Performance em Tempo Real</h2>
        <p className="text-slate-600">
          Monitore visualizações, cliques e conversões de cada post/campanha com gráficos atualizados a cada 5 minutos.
        </p>
      </div>

      {/* Métricas Principais */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Métricas em Tempo Real (Hoje)
          </CardTitle>
          <CardDescription>Atualizado a cada 5 segundos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-6 gap-3">
            {[
              { titulo: "Visualizações", valor: metricas.visualizacoes.toLocaleString(), icon: "👁️", cor: "text-blue-600", trending: "↑ 2.3%" },
              { titulo: "Cliques", valor: metricas.cliques.toLocaleString(), icon: "🖱️", cor: "text-green-600", trending: "↑ 1.8%" },
              { titulo: "Conversões", valor: metricas.conversoes.toLocaleString(), icon: "🛒", cor: "text-orange-600", trending: "↑ 3.1%" },
              { titulo: "Receita", valor: `R$ ${(metricas.receita / 1000).toFixed(1)}k`, icon: "💰", cor: "text-green-600", trending: "↑ 2.5%" },
              { titulo: "Engagement", valor: `${metricas.engagement}%`, icon: "💬", cor: "text-purple-600", trending: "↑ 0.3%" },
              { titulo: "ROI", valor: `${metricas.roi}%`, icon: "📈", cor: "text-red-600", trending: "↑ 5.2%" }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-blue-300 transition">
                <p className="text-3xl mb-2">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className={`text-lg font-bold ${item.cor} mb-1`}>{item.valor}</p>
                <p className="text-xs text-green-600">{item.trending}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance por Post */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Performance por Post
          </CardTitle>
          <CardDescription>Top 5 posts com melhor performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {posts.map((post, idx) => (
            <div key={post.id} className="border-2 border-slate-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-purple-600 text-xs">{idx + 1}º</Badge>
                    <h4 className="font-bold text-slate-900">{post.titulo}</h4>
                    <Badge variant="outline" className="text-xs">{post.tipo}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">📱 {post.plataforma}</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-slate-600">Views</p>
                  <p className="font-bold text-blue-600">{post.views.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-slate-600">Cliques</p>
                  <p className="font-bold text-green-600">{post.clicks}</p>
                </div>
                <div className="p-2 bg-orange-50 rounded border border-orange-200">
                  <p className="text-slate-600">Conversões</p>
                  <p className="font-bold text-orange-600">{post.conversoes}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded border border-purple-200">
                  <p className="text-slate-600">Receita</p>
                  <p className="font-bold text-purple-600">R$ {post.receita.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <p className="text-slate-600">CTR</p>
                  <p className="font-bold text-slate-900">{((post.clicks / post.views) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Gráfico de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funil de Conversão (Hoje)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { stage: "Visualizações", valor: metricas.visualizacoes, percentual: 100, cor: "bg-blue-500" },
              { stage: "Cliques", valor: metricas.cliques, percentual: (metricas.cliques / metricas.visualizacoes * 100).toFixed(1), cor: "bg-green-500" },
              { stage: "Conversões", valor: metricas.conversoes, percentual: (metricas.conversoes / metricas.visualizacoes * 100).toFixed(2), cor: "bg-orange-500" }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-900">{item.stage}</p>
                  <p className="text-sm font-bold text-slate-600">{item.valor.toLocaleString()} ({item.percentual}%)</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div className={`${item.cor} h-full transition-all duration-500`} style={{ width: `${item.percentual}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Monitore métricas em tempo real (atualiza a cada 5 segundos)",
            "✅ Identifique posts com melhor performance",
            "✅ Veja funil de conversão completo",
            "✅ Compare CTR entre diferentes posts",
            "✅ Acompanhe receita gerada por post",
            "✅ Pause campanhas com ROI baixo",
            "✅ Aumente budget em posts top performers",
            "✅ Exporte dados para análise detalhada"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Benefícios Esperados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Decisões Rápidas", descricao: "Veja dados em tempo real e ajuste campanhas" },
            { titulo: "Otimização Contínua", descricao: "Identifique o que funciona e replique" },
            { titulo: "Redução de Desperdício", descricao: "Pause campanhas com ROI baixo imediatamente" },
            { titulo: "Aumento de Conversão", descricao: "Foque em posts que convertem" },
            { titulo: "Histórico Completo", descricao: "Acompanhe performance ao longo do tempo" },
            { titulo: "Comparação Fácil", descricao: "Veja qual post/campanha performa melhor" }
          ].map((beneficio, idx) => (
            <div key={idx} className="flex gap-3 p-3 border border-green-200 rounded bg-white">
              <span className="text-lg">✨</span>
              <div>
                <p className="font-semibold text-slate-900">{beneficio.titulo}</p>
                <p className="text-xs text-slate-600">{beneficio.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
