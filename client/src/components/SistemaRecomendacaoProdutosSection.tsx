import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, Users, ShoppingCart } from "lucide-react";

export default function SistemaRecomendacaoProdutosSection() {
  const recommendations = [
    {
      persona: "Carol (Empreendedora)",
      product: "Pijama Suede Rosa",
      reason: "Alto potencial de revenda",
      confidence: "94%",
      expectedConversion: "28%",
      estimatedRevenue: "R$ 2.450"
    },
    {
      persona: "Renata (Lojista)",
      product: "Pijama Algodão Variado",
      reason: "Melhor margem de lucro",
      confidence: "89%",
      expectedConversion: "35%",
      estimatedRevenue: "R$ 3.890"
    },
    {
      persona: "Vanessa (Grupo)",
      product: "Kit Pijama Família",
      reason: "Maior economia em grupo",
      confidence: "92%",
      expectedConversion: "42%",
      estimatedRevenue: "R$ 4.120"
    },
    {
      persona: "Luiza (Trendsetter)",
      product: "Pijama Inverno Premium",
      reason: "Exclusividade e tendência",
      confidence: "87%",
      expectedConversion: "31%",
      estimatedRevenue: "R$ 2.890"
    }
  ];

  const personaProducts = [
    {
      persona: "Carol",
      products: [
        { name: "Pijama Suede Rosa", sales: 156, rating: 4.8, revenue: "R$ 12.450" },
        { name: "Pijama Algodão Azul", sales: 142, rating: 4.7, revenue: "R$ 11.320" },
        { name: "Pijama Inverno Cinza", sales: 98, rating: 4.6, revenue: "R$ 9.702" }
      ]
    },
    {
      persona: "Renata",
      products: [
        { name: "Pijama Algodão Variado", sales: 234, rating: 4.9, revenue: "R$ 18.660" },
        { name: "Kit Pijama 5 Peças", sales: 156, rating: 4.8, revenue: "R$ 15.600" },
        { name: "Pijama Premium Suede", sales: 89, rating: 4.7, revenue: "R$ 8.901" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            Sistema de Recomendação de Produtos
          </CardTitle>
          <CardDescription>
            IA sugere qual persona deve receber qual produto baseado em histórico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recomendações Principais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Recomendações Otimizadas por Persona</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div key={rec.persona} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{rec.persona}</p>
                      <p className="text-sm text-slate-600">{rec.product}</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-50">{rec.confidence}</Badge>
                  </div>
                  
                  <p className="text-sm text-slate-600">{rec.reason}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-slate-600">Conversão Esperada</p>
                      <p className="font-semibold text-blue-600">{rec.expectedConversion}</p>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <p className="text-slate-600">Receita Estimada</p>
                      <p className="font-semibold text-green-600">{rec.estimatedRevenue}</p>
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full">
                    Enviar Recomendação
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Produtos Mais Vendidos por Persona */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Top Produtos por Persona</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {personaProducts.map((pp) => (
                <div key={pp.persona} className="border rounded-lg p-4 space-y-3">
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    {pp.persona}
                  </p>
                  <div className="space-y-2">
                    {pp.products.map((prod) => (
                      <div key={prod.name} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                        <div>
                          <p className="font-semibold text-slate-900">{prod.name}</p>
                          <p className="text-slate-600 text-xs">⭐ {prod.rating} • {prod.sales} vendas</p>
                        </div>
                        <p className="font-semibold text-green-600">{prod.revenue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Aumento de Conversão</p>
              <p className="text-2xl font-bold text-blue-600">+34%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <ShoppingCart className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-green-600">R$ 245,50</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Personas Ativas</p>
              <p className="text-2xl font-bold text-purple-600">4/4</p>
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-amber-900 text-sm">💡 Como Funciona</p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• IA analisa histórico de compras de cada persona</li>
              <li>• Sugere produtos com maior probabilidade de conversão</li>
              <li>• Estima receita esperada para cada recomendação</li>
              <li>• Rastreia taxa de conversão real vs. prevista</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
