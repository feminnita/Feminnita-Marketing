import { Zap, Users, TrendingUp, CheckCircle, Target, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SistemaRecomendacaoInteligenteSection() {
  const algoritmos = [
    {
      nome: "Histórico de Compra",
      descricao: "Recomenda produtos similares ao que já comprou",
      acuracia: "78%",
      impacto: "R$ 145K/mês",
      exemplo: "Comprou Pijama Carol → Recomenda Robe Carol"
    },
    {
      nome: "Visualizações",
      descricao: "Produtos que o cliente visualizou mas não comprou",
      acuracia: "82%",
      impacto: "R$ 187K/mês",
      exemplo: "Viu Pijama Renata 3x → Cupom 15%"
    },
    {
      nome: "Clientes Similares",
      descricao: "O que clientes parecidos compraram",
      acuracia: "75%",
      impacto: "R$ 128K/mês",
      exemplo: "Clientes como você compraram Robe Vanessa"
    },
    {
      nome: "Tendências Virais",
      descricao: "Produtos em alta no TikTok/Instagram",
      acuracia: "88%",
      impacto: "R$ 210K/mês",
      exemplo: "Pijama Luiza está em alta - veja agora"
    },
    {
      nome: "Sazonalidade",
      descricao: "Produtos populares nesta época do ano",
      acuracia: "85%",
      impacto: "R$ 165K/mês",
      exemplo: "Fevereiro: Robes para pós-carnaval"
    },
    {
      nome: "Cross-sell Inteligente",
      descricao: "Produtos que combinam com a compra",
      acuracia: "80%",
      impacto: "R$ 152K/mês",
      exemplo: "Comprou Pijama → Recomenda Chinelo"
    }
  ];

  const casosUso = [
    {
      caso: "Cliente novo",
      estrategia: "Mostrar top 3 produtos mais vendidos + tendências",
      taxa: "12%",
      impacto: "R$ 45K/mês"
    },
    {
      caso: "Cliente com 1 compra",
      estrategia: "Similar ao que comprou + sugestões de clientes parecidos",
      taxa: "28%",
      impacto: "R$ 85K/mês"
    },
    {
      caso: "Cliente com 3+ compras",
      estrategia: "Histórico + Tendências + Cross-sell",
      taxa: "42%",
      impacto: "R$ 125K/mês"
    },
    {
      caso: "Cliente em risco (sem compra 20+ dias)",
      estrategia: "Produtos não vistos + Cupom 15%",
      taxa: "35%",
      impacto: "R$ 95K/mês"
    },
    {
      caso: "Cliente VIP (LTV > R$ 2K)",
      estrategia: "Exclusivos + Pré-lançamentos + Cupom VIP",
      taxa: "58%",
      impacto: "R$ 180K/mês"
    }
  ];

  const metricas = [
    {
      titulo: "Receita Gerada",
      valor: "R$ 750K",
      descricao: "Por mês via recomendações",
      cor: "text-green-600"
    },
    {
      titulo: "Taxa de Clique",
      valor: "18.5%",
      descricao: "CTR em recomendações",
      cor: "text-blue-600"
    },
    {
      titulo: "Taxa de Conversão",
      valor: "8.2%",
      descricao: "Clique → Compra",
      cor: "text-purple-600"
    },
    {
      titulo: "Ticket Médio",
      valor: "R$ 185",
      descricao: "Compra via recomendação",
      cor: "text-emerald-600"
    }
  ];

  const personalizacaoPorPersona = [
    {
      persona: "Carol",
      estilo: "Descontraído, viral, emojis",
      recomendacao: "Pijama Carol (TOP) + Robe Luiza (Trending)",
      frequencia: "2x/dia",
      taxa: "22%"
    },
    {
      persona: "Renata",
      estilo: "Premium, elegante, qualidade",
      recomendacao: "Pijama Renata (Premium) + Robe Vanessa (Luxo)",
      frequencia: "1x/dia",
      taxa: "35%"
    },
    {
      persona: "Vanessa",
      estilo: "Prático, funcional, valor",
      recomendacao: "Pijama Vanessa (Prático) + Combo Econômico",
      frequencia: "3x/semana",
      taxa: "18%"
    },
    {
      persona: "Luiza",
      estilo: "Criativo, tendências, influência",
      recomendacao: "Pijama Luiza (Viral) + Edição Limitada",
      frequencia: "2x/dia",
      taxa: "28%"
    }
  ];

  const canaisRecomendacao = [
    {
      canal: "Email",
      frequencia: "2x/semana",
      taxa: "32%",
      receita: "R$ 280K/mês",
      exemplo: "Newsletter com recomendações personalizadas"
    },
    {
      canal: "Site (Homepage)",
      frequencia: "Sempre visível",
      taxa: "15%",
      receita: "R$ 165K/mês",
      exemplo: "Seção 'Recomendado para você'"
    },
    {
      canal: "Página de Produto",
      frequencia: "Sempre visível",
      taxa: "22%",
      receita: "R$ 195K/mês",
      exemplo: "Clientes que compraram também compraram"
    },
    {
      canal: "Carrinho",
      frequencia: "Antes de checkout",
      taxa: "18%",
      receita: "R$ 85K/mês",
      exemplo: "Adicione X e ganhe frete grátis"
    },
    {
      canal: "SMS/WhatsApp",
      frequencia: "1x/semana",
      taxa: "28%",
      receita: "R$ 25K/mês",
      exemplo: "Seu produto favorito está em estoque!"
    }
  ];

  const metricsAlgoritmo = [
    {
      algoritmo: "Histórico de Compra",
      precisao: "78%",
      recall: "85%",
      f1Score: "0.81",
      usuarios: "4.250"
    },
    {
      algoritmo: "Visualizações",
      precisao: "82%",
      recall: "88%",
      f1Score: "0.85",
      usuarios: "5.120"
    },
    {
      algoritmo: "Clientes Similares",
      precisao: "75%",
      recall: "80%",
      f1Score: "0.77",
      usuarios: "3.890"
    },
    {
      algoritmo: "Tendências Virais",
      precisao: "88%",
      recall: "92%",
      f1Score: "0.90",
      usuarios: "6.450"
    },
    {
      algoritmo: "Sazonalidade",
      precisao: "85%",
      recall: "89%",
      f1Score: "0.87",
      usuarios: "5.670"
    },
    {
      algoritmo: "Cross-sell",
      precisao: "80%",
      recall: "84%",
      f1Score: "0.82",
      usuarios: "4.890"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => (
          <Card key={idx} className="border-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{metrica.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metrica.cor}`}>{metrica.valor}</div>
              <p className="text-xs text-slate-500 mt-1">{metrica.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Algoritmos de Recomendação */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            6 Algoritmos de Recomendação
          </CardTitle>
          <CardDescription>Cada um otimizado para um tipo de comportamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {algoritmos.map((algo, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{algo.nome}</h4>
                  <Badge className="bg-purple-100 text-purple-700">{algo.acuracia}</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">{algo.descricao}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Impacto/Mês</p>
                    <p className="font-bold text-green-600">{algo.impacto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Exemplo</p>
                    <p className="font-bold text-slate-900 text-xs">{algo.exemplo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Casos de Uso */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Casos de Uso por Tipo de Cliente
          </CardTitle>
          <CardDescription>Estratégia diferente para cada segmento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {casosUso.map((caso, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{caso.caso}</h4>
                  <Badge className="bg-blue-100 text-blue-700">{caso.taxa}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Estratégia</p>
                    <p className="font-bold text-slate-900 text-xs">{caso.estrategia}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-green-600">{caso.impacto}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalização por Persona */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-600" />
            Personalização por Persona
          </CardTitle>
          <CardDescription>Cada persona recebe recomendações customizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalizacaoPorPersona.map((pers, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{pers.persona}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Estilo</p>
                    <p className="font-bold text-slate-900">{pers.estilo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Recomendação</p>
                    <p className="font-bold text-slate-900 text-xs">{pers.recomendacao}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-xs">Frequência</p>
                    <p className="font-bold text-slate-900">{pers.frequencia}</p>
                  </div>
                  <div className="flex items-center justify-between bg-slate-100 rounded p-2">
                    <p className="text-slate-500 text-xs">Taxa Conv.</p>
                    <p className="font-bold text-green-600">{pers.taxa}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Canais de Recomendação */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Canais de Recomendação
          </CardTitle>
          <CardDescription>Onde mostrar recomendações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {canaisRecomendacao.map((canal, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{canal.canal}</h4>
                  <Badge className="bg-orange-100 text-orange-700">{canal.taxa}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Frequência</p>
                    <p className="font-bold text-slate-900">{canal.frequencia}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita/Mês</p>
                    <p className="font-bold text-green-600">{canal.receita}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Exemplo</p>
                    <p className="font-bold text-slate-900 text-xs">{canal.exemplo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Qualidade */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Qualidade dos Algoritmos
          </CardTitle>
          <CardDescription>Precisão, Recall e F1-Score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metricsAlgoritmo.map((metrica, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3">{metrica.algoritmo}</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Precisão</p>
                    <p className="font-bold text-slate-900">{metrica.precisao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Recall</p>
                    <p className="font-bold text-slate-900">{metrica.recall}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">F1-Score</p>
                    <p className="font-bold text-green-600">{metrica.f1Score}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Usuários</p>
                    <p className="font-bold text-slate-900">{metrica.usuarios}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-slate-900">✅ Benefícios da Recomendação Inteligente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">R$ 750K/mês em Receita Adicional</p>
              <p className="text-slate-600">Via recomendações inteligentes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">8.2% Taxa de Conversão</p>
              <p className="text-slate-600">Acima da média de mercado (2-3%)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Experiência Personalizada</p>
              <p className="text-slate-600">Cada cliente vê recomendações customizadas</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Ticket Médio +23%</p>
              <p className="text-slate-600">Clientes compram mais quando recomendado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
