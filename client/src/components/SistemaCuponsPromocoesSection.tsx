import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Plus, Copy, TrendingUp, Users, DollarSign } from "lucide-react";
import { useState } from "react";

export default function SistemaCuponsPromocoesSection() {
  const [cupons] = useState([
    { id: 1, codigo: "INVERNO20", desconto: "20%", tipo: "Desconto", persona: "Carol", campanha: "Renda Extra", usos: 342, conversao: "18,5%", receita: 12400 },
    { id: 2, codigo: "LOJA40", desconto: "R$ 40", tipo: "Valor Fixo", persona: "Renata", campanha: "Lojistas", usos: 156, conversao: "22,3%", receita: 8900 },
    { id: 3, codigo: "FAMILIA15", desconto: "15%", tipo: "Desconto", persona: "Vanessa", campanha: "Compra Coletiva", usos: 89, conversao: "25,1%", receita: 5600 },
    { id: 4, codigo: "PRIMEIRACOMPRA25", desconto: "25%", tipo: "Desconto", persona: "Luiza", campanha: "Trendsetter", usos: 234, conversao: "19,8%", receita: 14200 },
    { id: 5, codigo: "FRETE10", desconto: "Frete Grátis", tipo: "Frete", persona: "Todos", campanha: "Geral", usos: 567, conversao: "12,3%", receita: 8900 },
    { id: 6, codigo: "REABASTECIMENTO30", desconto: "30%", tipo: "Desconto", persona: "Renata", campanha: "Lojistas", usos: 78, conversao: "31,2%", receita: 7200 }
  ]);

  const [novosCupons] = useState([
    { titulo: "Gerar Cupom Automático", descricao: "Crie cupons únicos por persona/campanha", icone: "🎟️" },
    { titulo: "Cupom por Referência", descricao: "Cliente refere amigo e recebe desconto", icone: "👥" },
    { titulo: "Cupom Progressivo", descricao: "Desconto aumenta com quantidade", icone: "📈" },
    { titulo: "Cupom Sazonal", descricao: "Desconto automático em datas especiais", icone: "🎄" },
    { titulo: "Cupom de Reabastecimento", descricao: "Desconto para clientes que recompram", icone: "🔄" },
    { titulo: "Cupom VIP", descricao: "Desconto exclusivo para top clientes", icone: "👑" }
  ]);

  const [copiado, setCopiado] = useState<string | null>(null);

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sistema de Cupons e Promoções</h2>
        <p className="text-slate-600">
          Gere cupons automáticos para cada persona/campanha e rastreie qual cupom gera mais conversões.
        </p>
      </div>

      {/* Cupons Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-600" />
            Cupons Ativos
          </CardTitle>
          <CardDescription>Cupons em uso e sua performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {cupons.map((cupom) => (
            <div key={cupom.id} className="border-2 border-slate-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="bg-slate-900 text-white px-3 py-1 rounded text-sm font-bold">{cupom.codigo}</code>
                    <Badge className="bg-green-600">{cupom.desconto}</Badge>
                    <Badge variant="outline" className="text-xs">{cupom.tipo}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">👤 {cupom.persona} • 📢 {cupom.campanha}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copiarCodigo(cupom.codigo)}
                  className={copiado === cupom.codigo ? "bg-green-100 border-green-500" : ""}
                >
                  {copiado === cupom.codigo ? "✅ Copiado" : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-slate-600">Usos</p>
                  <p className="font-bold text-blue-600">{cupom.usos}</p>
                </div>
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-slate-600">Taxa Conversão</p>
                  <p className="font-bold text-green-600">{cupom.conversao}</p>
                </div>
                <div className="p-2 bg-orange-50 rounded border border-orange-200">
                  <p className="text-slate-600">Receita Gerada</p>
                  <p className="font-bold text-orange-600">R$ {cupom.receita.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded border border-purple-200">
                  <p className="text-slate-600">ROI</p>
                  <p className="font-bold text-purple-600">{((cupom.receita / cupom.usos) * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tipos de Cupons Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Gerar Novo Cupom
          </CardTitle>
          <CardDescription>Tipos de cupons que você pode criar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {novosCupons.map((cupom, idx) => (
              <div key={idx} className="border-2 border-slate-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50 transition cursor-pointer">
                <p className="text-3xl mb-2">{cupom.icone}</p>
                <p className="font-bold text-slate-900 mb-1">{cupom.titulo}</p>
                <p className="text-xs text-slate-600 mb-3">{cupom.descricao}</p>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">Criar</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise de Performance por Persona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { persona: "Carol (Renda Extra)", cupom: "INVERNO20", usos: 342, conversao: "18,5%", receita: "R$ 12.400", trending: "↑ 5.2%" },
            { persona: "Renata (Lojistas)", cupom: "LOJA40", usos: 156, conversao: "22,3%", receita: "R$ 8.900", trending: "↑ 8.1%" },
            { persona: "Vanessa (Coletiva)", cupom: "FAMILIA15", usos: 89, conversao: "25,1%", receita: "R$ 5.600", trending: "↑ 12,3%" },
            { persona: "Luiza (Trendsetter)", cupom: "PRIMEIRACOMPRA25", usos: 234, conversao: "19,8%", receita: "R$ 14.200", trending: "↑ 3.7%" }
          ].map((item, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-slate-900">{item.persona}</p>
                  <p className="text-xs text-slate-600">Cupom: <code className="bg-slate-100 px-2 py-1 rounded">{item.cupom}</code></p>
                </div>
                <Badge className="bg-green-600">{item.trending}</Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div><p className="text-slate-600">Usos</p><p className="font-bold">{item.usos}</p></div>
                <div><p className="text-slate-600">Conversão</p><p className="font-bold text-green-600">{item.conversao}</p></div>
                <div><p className="text-slate-600">Receita</p><p className="font-bold text-orange-600">{item.receita}</p></div>
                <div><p className="text-slate-600">ROI</p><p className="font-bold text-purple-600">{((parseInt(item.receita.replace(/\D/g, '')) / item.usos) * 100).toFixed(0)}%</p></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="text-lg">Estatísticas Gerais de Cupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { titulo: "Total de Cupons", valor: "6", icon: "🎟️" },
              { titulo: "Total de Usos", valor: "1.466", icon: "📊" },
              { titulo: "Receita Gerada", valor: "R$ 57.200", icon: "💰" },
              { titulo: "Taxa Conversão Média", valor: "19,9%", icon: "📈" }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-4 bg-white rounded-lg border-2 border-slate-200">
                <p className="text-3xl mb-2">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className="text-lg font-bold text-slate-900">{item.valor}</p>
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
            "✅ Crie cupom único para cada persona",
            "✅ Teste diferentes tipos (%, valor fixo, frete)",
            "✅ Rastreie qual cupom converte melhor",
            "✅ Aumente desconto em cupons com baixa conversão",
            "✅ Reduza desconto em cupons com alta conversão",
            "✅ Use cupons de reabastecimento para clientes recorrentes",
            "✅ Crie cupons sazonais para datas especiais",
            "✅ Exporte dados de cupons para análise"
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
            { titulo: "Aumento de Conversão", descricao: "Cupons aumentam conversão em 15-30%" },
            { titulo: "Rastreamento Preciso", descricao: "Veja qual cupom gera mais vendas" },
            { titulo: "Otimização Contínua", descricao: "Ajuste descontos baseado em performance" },
            { titulo: "Fidelização", descricao: "Cupons de reabastecimento retêm clientes" },
            { titulo: "Redução de Estoque", descricao: "Promova produtos com estoque alto" },
            { titulo: "Análise de ROI", descricao: "Veja exato retorno de cada cupom" }
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
