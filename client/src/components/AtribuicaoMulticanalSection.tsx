import { BarChart3, TrendingUp, Zap, Target, PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AtribuicaoMulticanalSection() {
  const modelos = [
    {
      id: 1,
      nome: "Last-Click",
      descricao: "Último canal clicado recebe 100% do crédito",
      facebook: "0%",
      email: "0%",
      google: "100%",
      vantagem: "Simples, mostra canal mais próximo",
      desvantagem: "Ignora papel dos outros canais"
    },
    {
      id: 2,
      nome: "First-Click",
      descricao: "Primeiro canal clicado recebe 100% do crédito",
      facebook: "100%",
      email: "0%",
      google: "0%",
      vantagem: "Mostra qual canal traz cliente",
      desvantagem: "Ignora papel dos outros canais"
    },
    {
      id: 3,
      nome: "Linear",
      descricao: "Todos os canais recebem crédito igual",
      facebook: "33%",
      email: "33%",
      google: "33%",
      vantagem: "Reconhece papel de todos",
      desvantagem: "Não diferencia importância"
    },
    {
      id: 4,
      nome: "Time-Decay",
      descricao: "Canais próximos da compra recebem mais crédito",
      facebook: "10%",
      email: "30%",
      google: "60%",
      vantagem: "Realista, reconhece importância",
      desvantagem: "Mais complexo de entender"
    }
  ];

  const receitas = [
    { modelo: "Last-Click", facebook: "R$ 250K", email: "R$ 0", google: "R$ 400K", total: "R$ 650K" },
    { modelo: "First-Click", facebook: "R$ 400K", email: "R$ 0", google: "R$ 0", total: "R$ 400K" },
    { modelo: "Linear", facebook: "R$ 330K", email: "R$ 330K", google: "R$ 330K", total: "R$ 990K" },
    { modelo: "Time-Decay", facebook: "R$ 250K", email: "R$ 350K", google: "R$ 400K", total: "R$ 1.000K" }
  ];

  const timDecayDetalhes = [
    {
      dia: "Dia 1",
      canal: "Facebook",
      acao: "Vê anúncio",
      credito: "10%",
      receita: "R$ 100K"
    },
    {
      dia: "Dia 3",
      canal: "Email",
      acao: "Recebe email",
      credito: "30%",
      receita: "R$ 300K"
    },
    {
      dia: "Dia 5",
      canal: "Google Ads",
      acao: "Clica e compra",
      credito: "60%",
      receita: "R$ 600K"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Modelo Recomendado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">Time-Decay</div>
            <p className="text-xs text-slate-500 mt-1">Mais realista e confiável</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ 1.000K</div>
            <p className="text-xs text-slate-500 mt-1">Com Time-Decay</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Canais Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">3</div>
            <p className="text-xs text-slate-500 mt-1">Facebook, Email, Google</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparação de Modelos */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Comparação de Modelos
          </CardTitle>
          <CardDescription>Crédito por canal em cada modelo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modelos.map((modelo) => (
              <div key={modelo.id} className="border border-slate-200/50 rounded-lg p-4">
                <div className="mb-3">
                  <h4 className="font-semibold text-slate-900">{modelo.nome}</h4>
                  <p className="text-xs text-slate-500 mt-1">{modelo.descricao}</p>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Facebook</span>
                    <Badge variant="secondary">{modelo.facebook}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Email</span>
                    <Badge variant="secondary">{modelo.email}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Google Ads</span>
                    <Badge variant="secondary">{modelo.google}</Badge>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div>
                    <p className="text-slate-500">✅ Vantagem</p>
                    <p className="text-slate-700">{modelo.vantagem}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">⚠️ Desvantagem</p>
                    <p className="text-slate-700">{modelo.desvantagem}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Receita por Modelo */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Receita por Modelo
          </CardTitle>
          <CardDescription>Impacto financeiro de cada modelo (Receita Total: R$ 1.000K)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {receitas.map((item) => (
              <div key={item.modelo} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{item.modelo}</h4>
                  <Badge className="bg-green-100 text-green-700">{item.total}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Facebook</p>
                    <p className="font-semibold text-slate-900">{item.facebook}</p>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Email</p>
                    <p className="font-semibold text-slate-900">{item.email}</p>
                  </div>
                  <div className="bg-orange-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Google</p>
                    <p className="font-semibold text-slate-900">{item.google}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time-Decay Detalhado */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-indigo-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⭐ Time-Decay (Recomendado)
          </CardTitle>
          <CardDescription>Como funciona o modelo mais realista</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timDecayDetalhes.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-indigo-600 border-2 border-indigo-200">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{item.dia}</Badge>
                    <Badge className="bg-indigo-100 text-indigo-700">{item.canal}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{item.acao}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Crédito: {item.credito}</span>
                    <span className="font-semibold text-slate-900">{item.receita}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-indigo-200">
            <p className="text-sm text-slate-700">
              <strong>Resultado Final:</strong> Time-Decay reconhece que Google Ads (último clique) foi mais importante (60%), mas também valoriza o papel do Email (30%) e Facebook (10%) na jornada do cliente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-slate-900">📊 Recomendações de Ação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <div className="bg-orange-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-orange-700 font-bold">1</div>
            <div>
              <p className="font-semibold text-slate-900">Use Time-Decay como modelo padrão</p>
              <p className="text-slate-600">Mais realista que Last-Click, mais equilibrado que Linear</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-orange-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-orange-700 font-bold">2</div>
            <div>
              <p className="font-semibold text-slate-900">Google Ads merece 40% do budget (60% crédito)</p>
              <p className="text-slate-600">Aumentar investimento em Google Ads em 20%</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-orange-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-orange-700 font-bold">3</div>
            <div>
              <p className="font-semibold text-slate-900">Email merece 30% do budget (30% crédito)</p>
              <p className="text-slate-600">Aumentar frequência de emails em 15%</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-orange-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-orange-700 font-bold">4</div>
            <div>
              <p className="font-semibold text-slate-900">Facebook merece 30% do budget (10% crédito)</p>
              <p className="text-slate-600">Manter investimento, focar em awareness</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
