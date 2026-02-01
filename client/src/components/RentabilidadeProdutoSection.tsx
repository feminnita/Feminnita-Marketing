import { BarChart3, TrendingUp, ShoppingCart, DollarSign, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RentabilidadeProdutoSection() {
  const produtos = [
    {
      nome: "Pijama Carol Rosa",
      vendas: 1.250,
      receita: "R$ 156.250",
      margem: "35%",
      lucro: "R$ 54.688",
      ticket: "R$ 125",
      personas: "Carol (85%), Renata (10%), Outros (5%)",
      roi: "2.85x",
      crossSell: "Robe Vanessa (+45%)"
    },
    {
      nome: "Pijama Renata Azul",
      vendas: 890,
      receita: "R$ 178.000",
      margem: "42%",
      lucro: "R$ 74.760",
      ticket: "R$ 200",
      personas: "Renata (92%), Carol (5%), Outros (3%)",
      roi: "3.12x",
      crossSell: "Pijama Carol (+38%)"
    },
    {
      nome: "Robe Vanessa Branco",
      vendas: 2.150,
      receita: "R$ 215.000",
      margem: "28%",
      lucro: "R$ 60.200",
      ticket: "R$ 100",
      personas: "Vanessa (88%), Carol (8%), Outros (4%)",
      roi: "2.45x",
      crossSell: "Pijama Vanessa (+52%)"
    },
    {
      nome: "Pijama Luiza Roxo",
      vendas: 1.680,
      receita: "R$ 302.400",
      margem: "38%",
      lucro: "R$ 114.912",
      ticket: "R$ 180",
      personas: "Luiza (95%), Carol (3%), Outros (2%)",
      roi: "3.45x",
      crossSell: "Robe Vanessa (+48%)"
    }
  ];

  const matrizCrossSell = [
    { produto: "Pijama Carol Rosa", compram: "Robe Vanessa (45%)", lucroAdicional: "R$ 24.563" },
    { produto: "Pijama Renata Azul", compram: "Pijama Carol (38%)", lucroAdicional: "R$ 28.408" },
    { produto: "Robe Vanessa Branco", compram: "Pijama Vanessa (52%)", lucroAdicional: "R$ 31.304" },
    { produto: "Pijama Luiza Roxo", compram: "Robe Vanessa (48%)", lucroAdicional: "R$ 55.158" }
  ];

  const upsellOportunidades = [
    {
      de: "Pijama Carol Rosa (R$ 125)",
      para: "Pijama Renata Azul (R$ 200)",
      taxa: "22%",
      receita: "R$ 34.375",
      acao: "Oferecer após 2ª compra"
    },
    {
      de: "Pijama Renata Azul (R$ 200)",
      para: "Pijama Luiza Roxo (R$ 180)",
      taxa: "18%",
      receita: "R$ 32.040",
      acao: "Email exclusivo VIP"
    },
    {
      de: "Robe Vanessa (R$ 100)",
      para: "Pijama Carol (R$ 125)",
      taxa: "35%",
      receita: "R$ 37.625",
      acao: "Cupom 10% + Frete"
    },
    {
      de: "Pijama Luiza Roxo (R$ 180)",
      para: "Robe Vanessa (R$ 100)",
      taxa: "28%",
      receita: "R$ 47.040",
      acao: "Bundle com desconto"
    }
  ];

  const analisePersonaProducto = [
    {
      persona: "Carol",
      produtoFavorito: "Pijama Carol Rosa",
      compras: 1.250,
      ticket: "R$ 125",
      margem: "35%",
      lucro: "R$ 54.688",
      potencial: "Upsell para Renata"
    },
    {
      persona: "Renata",
      produtoFavorito: "Pijama Renata Azul",
      compras: 890,
      ticket: "R$ 200",
      margem: "42%",
      lucro: "R$ 74.760",
      potencial: "Premium (Luiza)"
    },
    {
      persona: "Vanessa",
      produtoFavorito: "Robe Vanessa",
      compras: 2.150,
      ticket: "R$ 100",
      margem: "28%",
      lucro: "R$ 60.200",
      potencial: "Volume (Carol)"
    },
    {
      persona: "Luiza",
      produtoFavorito: "Pijama Luiza Roxo",
      compras: 1.680,
      ticket: "R$ 180",
      margem: "38%",
      lucro: "R$ 114.912",
      potencial: "Bundle (Robe)"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">R$ 851.650</div>
            <p className="text-xs text-slate-500 mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Lucro Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">R$ 304.560</div>
            <p className="text-xs text-slate-500 mt-1">Margem média 35.8%</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Vendas Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">5.970</div>
            <p className="text-xs text-slate-500 mt-1">Unidades vendidas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">R$ 142,70</div>
            <p className="text-xs text-slate-500 mt-1">Por transação</p>
          </CardContent>
        </Card>
      </div>

      {/* Rentabilidade por Produto */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Rentabilidade por Produto
          </CardTitle>
          <CardDescription>Análise completa de vendas, margem e lucro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {produtos.map((produto, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{produto.nome}</h4>
                  <Badge className="bg-green-100 text-green-700">{produto.roi}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Vendas</p>
                    <p className="font-bold text-slate-900">{produto.vendas}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-slate-900">{produto.receita}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Margem</p>
                    <p className="font-bold text-blue-600">{produto.margem}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Lucro</p>
                    <p className="font-bold text-green-600">{produto.lucro}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ticket</p>
                    <p className="font-bold text-slate-900">{produto.ticket}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div>
                    <p className="text-slate-500">👥 Personas</p>
                    <p className="text-slate-700">{produto.personas}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">🔗 Cross-Sell Recomendado</p>
                    <p className="text-blue-600 font-semibold">{produto.crossSell}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matriz de Cross-Sell */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Matriz de Cross-Sell
          </CardTitle>
          <CardDescription>Qual produto vender junto para aumentar ticket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matrizCrossSell.map((item, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{item.produto}</h4>
                  <Badge className="bg-purple-100 text-purple-700">{item.lucroAdicional}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">Clientes que compram:</span>
                  <span className="font-bold text-slate-900">{item.compram}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades de Upsell */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Oportunidades de Upsell
          </CardTitle>
          <CardDescription>Vender produtos de maior valor para aumentar ticket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upsellOportunidades.map((oportunidade, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-slate-600">De: <strong>{oportunidade.de}</strong></p>
                    <p className="text-sm text-slate-600">Para: <strong className="text-blue-600">{oportunidade.para}</strong></p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">{oportunidade.taxa}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                  <div>
                    <p className="text-slate-500 text-xs">Receita Potencial</p>
                    <p className="font-bold text-green-600">{oportunidade.receita}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ação Recomendada</p>
                    <p className="font-bold text-slate-900">{oportunidade.acao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise Persona x Produto */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            Análise Persona x Produto
          </CardTitle>
          <CardDescription>Qual persona compra qual produto e potencial de crescimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analisePersonaProducto.map((item, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{item.persona}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Produto Favorito</p>
                    <p className="font-bold text-slate-900">{item.produtoFavorito}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-slate-500 text-xs">Compras</p>
                      <p className="font-bold text-slate-900">{item.compras}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Ticket</p>
                      <p className="font-bold text-slate-900">{item.ticket}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-slate-500 text-xs">Margem</p>
                      <p className="font-bold text-blue-600">{item.margem}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Lucro</p>
                      <p className="font-bold text-green-600">{item.lucro}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded p-2 mt-2">
                    <p className="text-xs text-blue-700">
                      <strong>Potencial:</strong> {item.potencial}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-slate-900">💡 Recomendações Estratégicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="text-lg">1️⃣</span>
            <div>
              <p className="font-semibold text-slate-900">Foco em Pijama Luiza Roxo</p>
              <p className="text-slate-600">Maior lucro (R$ 114.912) e ROI (3.45x) - aumentar investimento em 25%</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">2️⃣</span>
            <div>
              <p className="font-semibold text-slate-900">Cross-Sell Robe Vanessa</p>
              <p className="text-slate-600">45-52% de taxa de cross-sell - implementar automação de recomendação</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">3️⃣</span>
            <div>
              <p className="font-semibold text-slate-900">Upsell para Pijama Renata</p>
              <p className="text-slate-600">22% de taxa com clientes de Carol - oferecer após 2ª compra</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">4️⃣</span>
            <div>
              <p className="font-semibold text-slate-900">Aumentar Ticket de Vanessa</p>
              <p className="text-slate-600">Menor ticket (R$ 100) - bundle com desconto pode aumentar para R$ 180+</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
