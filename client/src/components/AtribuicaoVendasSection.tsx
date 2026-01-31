import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, Users, Video, DollarSign } from "lucide-react";
import { useState } from "react";

export default function AtribuicaoVendasSection() {
  const [vendas] = useState([
    {
      id: 1,
      cliente: "Maria Silva",
      valor: 249.90,
      data: "2026-01-31 14:30",
      persona: "Carol (Renda Extra)",
      roteiro: "Como Ganhei R$ 2.500",
      campanha: "Instagram Ads",
      plataforma: "Instagram",
      status: "completa"
    },
    {
      id: 2,
      cliente: "João Santos",
      valor: 399.90,
      data: "2026-01-31 13:15",
      persona: "Renata (Lojista)",
      roteiro: "Análise de Qualidade",
      campanha: "Google Ads",
      plataforma: "Google",
      status: "completa"
    },
    {
      id: 3,
      cliente: "Ana Costa",
      valor: 549.90,
      data: "2026-01-31 12:00",
      persona: "Vanessa (Compra Coletiva)",
      roteiro: "Compra Coletiva com Amigas",
      campanha: "TikTok Organic",
      plataforma: "TikTok",
      status: "completa"
    },
    {
      id: 4,
      cliente: "Carlos Oliveira",
      valor: 199.90,
      data: "2026-01-31 11:45",
      persona: "Carol (Renda Extra)",
      roteiro: "Bastidores da Produção",
      campanha: "Instagram Reels",
      plataforma: "Instagram",
      status: "completa"
    },
    {
      id: 5,
      cliente: "Beatriz Lima",
      valor: 299.90,
      data: "2026-01-31 10:30",
      persona: "Luiza (Trendsetter)",
      roteiro: "ASMR Pijama",
      campanha: "TikTok Ads",
      plataforma: "TikTok",
      status: "completa"
    },
    {
      id: 6,
      cliente: "Diego Martins",
      valor: 449.90,
      data: "2026-01-31 09:15",
      persona: "Renata (Lojista)",
      roteiro: "Educacional",
      campanha: "Facebook Ads",
      plataforma: "Facebook",
      status: "completa"
    }
  ]);

  const [atribuicaoPorPersona] = useState([
    {
      persona: "Carol (Renda Extra)",
      vendas: 3,
      receita: 749.70,
      percentual: 28.5,
      roi: "320%",
      cpa: 8.33
    },
    {
      persona: "Renata (Lojista)",
      vendas: 2,
      receita: 849.80,
      percentual: 32.3,
      roi: "400%",
      cpa: 7.50
    },
    {
      persona: "Vanessa (Compra Coletiva)",
      vendas: 1,
      receita: 549.90,
      percentual: 20.9,
      roi: "350%",
      cpa: 8.00
    },
    {
      persona: "Luiza (Trendsetter)",
      vendas: 1,
      receita: 299.90,
      percentual: 11.4,
      roi: "280%",
      cpa: 9.50
    }
  ]);

  const [atribuicaoPorRoteiro] = useState([
    {
      roteiro: "Como Ganhei R$ 2.500",
      vendas: 2,
      receita: 449.80,
      percentual: 17.1,
      roi: "350%"
    },
    {
      roteiro: "Análise de Qualidade",
      vendas: 2,
      receita: 849.80,
      percentual: 32.3,
      roi: "400%"
    },
    {
      roteiro: "Compra Coletiva com Amigas",
      vendas: 1,
      receita: 549.90,
      percentual: 20.9,
      roi: "350%"
    },
    {
      roteiro: "Bastidores da Produção",
      vendas: 1,
      receita: 199.90,
      percentual: 7.6,
      roi: "300%"
    },
    {
      roteiro: "ASMR Pijama",
      vendas: 1,
      receita: 299.90,
      percentual: 11.4,
      roi: "280%"
    },
    {
      roteiro: "Educacional",
      vendas: 1,
      receita: 449.90,
      percentual: 17.1,
      roi: "320%"
    }
  ]);

  const [atribuicaoPorCampanha] = useState([
    {
      campanha: "Instagram Ads",
      vendas: 1,
      receita: 249.90,
      percentual: 9.5,
      roi: "320%"
    },
    {
      campanha: "Google Ads",
      vendas: 2,
      receita: 849.80,
      percentual: 32.3,
      roi: "400%"
    },
    {
      campanha: "TikTok Organic",
      vendas: 1,
      receita: 549.90,
      percentual: 20.9,
      roi: "350%"
    },
    {
      campanha: "Instagram Reels",
      vendas: 1,
      receita: 199.90,
      percentual: 7.6,
      roi: "300%"
    },
    {
      campanha: "TikTok Ads",
      vendas: 1,
      receita: 299.90,
      percentual: 11.4,
      roi: "280%"
    },
    {
      campanha: "Facebook Ads",
      vendas: 1,
      receita: 449.90,
      percentual: 17.1,
      roi: "320%"
    }
  ]);

  const totalVendas = vendas.length;
  const totalReceita = vendas.reduce((a, v) => a + v.valor, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Atribuição de Vendas</h2>
        <p className="text-slate-600">
          Rastreie qual persona/roteiro/campanha gerou cada venda para otimizar orçamento e identificar melhor ROI.
        </p>
      </div>

      {/* Resumo */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Resumo de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { titulo: "Total Vendas", valor: totalVendas, icon: "🛒", cor: "text-blue-600" },
              { titulo: "Receita Total", valor: `R$ ${totalReceita.toLocaleString('pt-BR', {maximumFractionDigits: 2})}`, icon: "💰", cor: "text-green-600" },
              { titulo: "Ticket Médio", valor: `R$ ${(totalReceita / totalVendas).toLocaleString('pt-BR', {maximumFractionDigits: 2})}`, icon: "📊", cor: "text-orange-600" },
              { titulo: "Período", valor: "Hoje", icon: "📅", cor: "text-purple-600" }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className={`text-lg font-bold ${item.cor}`}>{item.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vendas Rastreadas</CardTitle>
          <CardDescription>Cada venda com atribuição completa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {vendas.map((venda) => (
            <div key={venda.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900">{venda.cliente}</h4>
                  <p className="text-xs text-slate-600">{venda.data}</p>
                </div>
                <p className="text-2xl font-bold text-green-600">R$ {venda.valor.toLocaleString('pt-BR', {maximumFractionDigits: 2})}</p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                <div>
                  <p className="text-slate-600">Persona</p>
                  <p className="font-bold text-slate-900">{venda.persona}</p>
                </div>
                <div>
                  <p className="text-slate-600">Roteiro</p>
                  <p className="font-bold text-slate-900">{venda.roteiro}</p>
                </div>
                <div>
                  <p className="text-slate-600">Campanha</p>
                  <p className="font-bold text-slate-900">{venda.campanha}</p>
                </div>
                <div>
                  <p className="text-slate-600">Plataforma</p>
                  <p className="font-bold text-slate-900">{venda.plataforma}</p>
                </div>
              </div>

              <Badge className="bg-green-600">✅ {venda.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Atribuição por Persona */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Atribuição por Persona
          </CardTitle>
          <CardDescription>Qual persona gerou mais vendas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {atribuicaoPorPersona.map((attr) => (
            <div key={attr.persona} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{attr.persona}</h4>
                  <p className="text-xs text-slate-600">{attr.vendas} vendas • R$ {attr.receita.toLocaleString('pt-BR', {maximumFractionDigits: 2})}</p>
                </div>
                <Badge className="bg-blue-600">{attr.percentual}%</Badge>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                <div 
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${attr.percentual}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-600">ROI</p>
                  <p className="font-bold text-green-600">{attr.roi}</p>
                </div>
                <div>
                  <p className="text-slate-600">CPA</p>
                  <p className="font-bold text-slate-900">R$ {attr.cpa.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Atribuição por Roteiro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" />
            Atribuição por Roteiro
          </CardTitle>
          <CardDescription>Qual roteiro teve melhor performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {atribuicaoPorRoteiro.map((attr) => (
            <div key={attr.roteiro} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{attr.roteiro}</h4>
                  <p className="text-xs text-slate-600">{attr.vendas} vendas • R$ {attr.receita.toLocaleString('pt-BR', {maximumFractionDigits: 2})}</p>
                </div>
                <Badge className="bg-purple-600">{attr.percentual}%</Badge>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full bg-purple-600"
                  style={{ width: `${attr.percentual}%` }}
                />
              </div>

              <p className="text-xs text-slate-600">ROI: <strong className="text-green-600">{attr.roi}</strong></p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Atribuição por Campanha */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Atribuição por Campanha
          </CardTitle>
          <CardDescription>Qual campanha teve melhor ROI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {atribuicaoPorCampanha.map((attr) => (
            <div key={attr.campanha} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{attr.campanha}</h4>
                  <p className="text-xs text-slate-600">{attr.vendas} vendas • R$ {attr.receita.toLocaleString('pt-BR', {maximumFractionDigits: 2})}</p>
                </div>
                <Badge className="bg-orange-600">{attr.percentual}%</Badge>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full bg-orange-600"
                  style={{ width: `${attr.percentual}%` }}
                />
              </div>

              <p className="text-xs text-slate-600">ROI: <strong className="text-green-600">{attr.roi}</strong></p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Recomendações Baseadas em Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              titulo: "Aumentar Budget em Google Ads",
              descricao: "Melhor ROI (400%) e CPA (R$ 7,50)",
              acao: "Aumentar"
            },
            {
              titulo: "Focar em Persona Renata",
              descricao: "Maior receita por venda (R$ 849,80)",
              acao: "Focar"
            },
            {
              titulo: "Otimizar Roteiro Análise de Qualidade",
              descricao: "Melhor performance (32,3% das vendas)",
              acao: "Otimizar"
            },
            {
              titulo: "Reduzir Budget em Facebook",
              descricao: "Menor ROI (320%) e CPA mais alto",
              acao: "Reduzir"
            }
          ].map((rec, idx) => (
            <div key={idx} className="border border-green-200 rounded-lg p-3 bg-white">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-semibold text-slate-900">{rec.titulo}</p>
                  <p className="text-xs text-slate-600">{rec.descricao}</p>
                </div>
                <Badge variant="outline">{rec.acao}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Maximizar ROI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Rastreie cada venda até sua origem (persona/roteiro/campanha)",
            "✅ Calcule ROI por persona para identificar melhor público",
            "✅ Aumente budget em roteiros com melhor performance",
            "✅ Pause roteiros com ROI < 250%",
            "✅ Teste novas variações dos roteiros top",
            "✅ Compare CPA entre personas para otimizar gastos",
            "✅ Monitore atribuição semanalmente",
            "✅ Use dados para prever performance de novos roteiros"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
