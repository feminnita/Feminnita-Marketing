import { BarChart3, TrendingUp, Users, Target, Zap, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function GoogleAnalytics4Section() {
  const jornada = [
    {
      etapa: "Awareness (Descoberta)",
      usuarios: 125.450,
      fonte: "Instagram, TikTok, Google Ads",
      taxa: "100%",
      duracao: "Primeira visita",
      acao: "Ver conteúdo, explorar produtos"
    },
    {
      etapa: "Consideration (Consideração)",
      usuarios: 45.230,
      fonte: "Email, Retargeting, Organic",
      taxa: "36%",
      duracao: "2-7 dias",
      acao: "Visitar produto, ler reviews, comparar"
    },
    {
      etapa: "Conversion (Conversão)",
      usuarios: 8.450,
      fonte: "Direto, Email, Facebook",
      taxa: "19%",
      duracao: "Média 4 dias",
      acao: "Adicionar carrinho, comprar"
    },
    {
      etapa: "Retention (Retenção)",
      usuarios: 6.340,
      fonte: "Email, SMS, Push",
      taxa: "75%",
      duracao: "Após compra",
      acao: "Compra repetida, referência"
    }
  ];

  const canaisAtribuicao = [
    {
      canal: "Instagram",
      primeiroToque: "42%",
      ultimoToque: "28%",
      linear: "35%",
      receita: "R$ 450K",
      roi: "3.2x"
    },
    {
      canal: "TikTok",
      primeiroToque: "35%",
      ultimoToque: "38%",
      linear: "36%",
      receita: "R$ 520K",
      roi: "4.1x"
    },
    {
      canal: "Email",
      primeiroToque: "8%",
      ultimoToque: "22%",
      linear: "15%",
      receita: "R$ 280K",
      roi: "8.5x"
    },
    {
      canal: "Facebook",
      primeiroToque: "12%",
      ultimoToque: "10%",
      linear: "11%",
      receita: "R$ 180K",
      roi: "2.1x"
    },
    {
      canal: "Google Ads",
      primeiroToque: "3%",
      ultimoToque: "2%",
      linear: "3%",
      receita: "R$ 45K",
      roi: "1.2x"
    }
  ];

  const metricas = [
    {
      titulo: "Taxa de Conversão",
      valor: "6.7%",
      descricao: "Visitantes → Clientes",
      cor: "text-green-600"
    },
    {
      titulo: "Tempo Médio Jornada",
      valor: "4.2 dias",
      descricao: "Awareness → Conversão",
      cor: "text-blue-600"
    },
    {
      titulo: "Valor Médio Pedido",
      valor: "R$ 150",
      descricao: "Por transação",
      cor: "text-purple-600"
    },
    {
      titulo: "Taxa de Retenção",
      valor: "75%",
      descricao: "Clientes que compram novamente",
      cor: "text-emerald-600"
    }
  ];

  const comportamentoUsuario = [
    {
      comportamento: "Visitou 3+ páginas",
      usuarios: 28.450,
      conversao: "18%",
      ltv: "R$ 2.100",
      acao: "Email de recomendação"
    },
    {
      comportamento: "Visitou página de preço",
      usuarios: 12.340,
      conversao: "42%",
      ltv: "R$ 1.800",
      acao: "Cupom de desconto"
    },
    {
      comportamento: "Adicionou ao carrinho",
      usuarios: 5.670,
      conversao: "68%",
      ltv: "R$ 2.400",
      acao: "Lembrete de carrinho"
    },
    {
      comportamento: "Visitou FAQ/Reviews",
      usuarios: 8.920,
      conversao: "35%",
      ltv: "R$ 1.950",
      acao: "Depoimento de cliente"
    }
  ];

  const touchpointsCriticos = [
    {
      touchpoint: "Landing Page",
      taxa: "8.2%",
      tempo: "45 seg",
      acao: "Otimizar headline e CTA"
    },
    {
      touchpoint: "Página de Produto",
      taxa: "24%",
      tempo: "2.5 min",
      acao: "Adicionar mais fotos e reviews"
    },
    {
      touchpoint: "Carrinho",
      taxa: "12%",
      tempo: "3.2 min",
      acao: "Simplificar checkout"
    },
    {
      touchpoint: "Confirmação de Compra",
      taxa: "100%",
      tempo: "1.8 min",
      acao: "Upsell pós-compra"
    }
  ];

  const segmentosJornada = [
    {
      segmento: "Carol",
      tempo: "2.1 dias",
      canais: "TikTok → Instagram → Compra",
      taxa: "8.5%",
      valor: "R$ 165"
    },
    {
      segmento: "Renata",
      tempo: "6.3 dias",
      canais: "Google → Email → Compra",
      taxa: "5.2%",
      valor: "R$ 210"
    },
    {
      segmento: "Vanessa",
      tempo: "3.8 dias",
      canais: "Instagram → Facebook → Compra",
      taxa: "7.1%",
      valor: "R$ 145"
    },
    {
      segmento: "Luiza",
      tempo: "4.5 dias",
      canais: "TikTok → Email → Compra",
      taxa: "6.8%",
      valor: "R$ 155"
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

      {/* Jornada do Cliente */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Jornada Completa do Cliente (Funil)
          </CardTitle>
          <CardDescription>Rastreamento de 125.450 usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jornada.map((etapa, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{etapa.etapa}</h4>
                  <Badge className="bg-blue-100 text-blue-700">{etapa.taxa}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Usuários</p>
                    <p className="font-bold text-slate-900">{etapa.usuarios.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Fonte</p>
                    <p className="font-bold text-slate-900 text-xs">{etapa.fonte}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Duração</p>
                    <p className="font-bold text-slate-900">{etapa.duracao}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Ação Principal</p>
                    <p className="font-bold text-slate-900 text-xs">{etapa.acao}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: etapa.taxa }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Atribuição por Canal */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Atribuição Multi-canal (Primeiro, Último e Linear)
          </CardTitle>
          <CardDescription>Qual canal realmente gera vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {canaisAtribuicao.map((canal, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{canal.canal}</h4>
                  <Badge className="bg-green-100 text-green-700">{canal.roi}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Primeiro Toque</p>
                    <p className="font-bold text-slate-900">{canal.primeiroToque}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Último Toque</p>
                    <p className="font-bold text-slate-900">{canal.ultimoToque}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Linear</p>
                    <p className="font-bold text-slate-900">{canal.linear}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-green-600">{canal.receita}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comportamento do Usuário */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Comportamento do Usuário
          </CardTitle>
          <CardDescription>Ações que levam à conversão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comportamentoUsuario.map((comp, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{comp.comportamento}</h4>
                  <Badge className="bg-green-100 text-green-700">{comp.conversao}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Usuários</p>
                    <p className="font-bold text-slate-900">{comp.usuarios.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">LTV</p>
                    <p className="font-bold text-green-600">{comp.ltv}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-blue-600 text-xs">{comp.acao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Touchpoints Críticos */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Touchpoints Críticos
          </CardTitle>
          <CardDescription>Onde otimizar a experiência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {touchpointsCriticos.map((touch, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{touch.touchpoint}</h4>
                  <Badge className="bg-orange-100 text-orange-700">{touch.taxa}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-slate-500">Tempo médio: {touch.tempo}</p>
                  <p className="font-bold text-blue-600 text-xs">{touch.acao}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Jornada por Persona */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Jornada por Persona
          </CardTitle>
          <CardDescription>Cada persona tem caminho diferente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segmentosJornada.map((seg, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{seg.segmento}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500">Tempo</p>
                    <p className="font-bold text-slate-900">{seg.tempo}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500">Canais</p>
                    <p className="font-bold text-slate-900 text-xs">{seg.canais}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500">Taxa Conv.</p>
                    <p className="font-bold text-green-600">{seg.taxa}</p>
                  </div>
                  <div className="flex items-center justify-between bg-slate-100 rounded p-2">
                    <p className="text-slate-500">Ticket</p>
                    <p className="font-bold text-slate-900">{seg.valor}</p>
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
          <CardTitle className="text-slate-900">✅ Otimizações Recomendadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Otimizar Página de Produto</p>
              <p className="text-slate-600">24% taxa de conversão - adicionar mais fotos e reviews</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Simplificar Checkout</p>
              <p className="text-slate-600">12% conversão no carrinho - reduzir etapas</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Email é o Melhor ROI</p>
              <p className="text-slate-600">8.5x ROI - aumentar frequência de envios</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Retargeting para Consideration</p>
              <p className="text-slate-600">36% chegam à etapa 2 - aumentar ads para os 64% que saem</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
