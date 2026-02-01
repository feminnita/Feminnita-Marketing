import { Mail, Zap, Users, TrendingUp, CheckCircle, Clock, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AutomacaoEmailInteligenteSection() {
  const fluxosAutomacao = [
    {
      nome: "Carrinho Abandonado",
      trigger: "Cliente deixa produto no carrinho por 2h",
      emails: 3,
      sequencia: "1º (2h) → Lembrete | 2º (24h) → Cupom 10% | 3º (48h) → Frete Grátis",
      taxa: "28%",
      receita: "R$ 125K/mês",
      status: "Ativo"
    },
    {
      nome: "Produto Visualizado",
      trigger: "Cliente visualiza produto mas não compra",
      emails: 2,
      sequencia: "1º (4h) → Recomendação | 2º (24h) → Desconto Exclusivo",
      taxa: "18%",
      receita: "R$ 68K/mês",
      status: "Ativo"
    },
    {
      nome: "Pós-Compra Upsell",
      trigger: "Cliente compra produto (imediatamente após)",
      emails: 2,
      sequencia: "1º (1h) → Obrigado + Cross-sell | 2º (24h) → Recomendação Personalizada",
      taxa: "22%",
      receita: "R$ 95K/mês",
      status: "Ativo"
    },
    {
      nome: "Cliente em Risco",
      trigger: "Sem compra há 20+ dias",
      emails: 3,
      sequencia: "1º (imediato) → Cupom 15% | 2º (3 dias) → Novidades | 3º (7 dias) → VIP",
      taxa: "32%",
      receita: "R$ 142K/mês",
      status: "Ativo"
    },
    {
      nome: "Reengajamento",
      trigger: "Não abriu email há 30 dias",
      emails: 2,
      sequencia: "1º (imediato) → Novidades | 2º (5 dias) → Exclusivo",
      taxa: "15%",
      receita: "R$ 52K/mês",
      status: "Ativo"
    },
    {
      nome: "VIP Exclusivo",
      trigger: "Cliente LTV > R$ 2.000",
      emails: 1,
      sequencia: "1º (semanal) → Acesso Exclusivo a Novidades",
      taxa: "45%",
      receita: "R$ 187K/mês",
      status: "Ativo"
    }
  ];

  const personalizacao = [
    {
      campo: "Nome",
      exemplo: "Olá [Nome]!",
      uso: "100%",
      impacto: "+15% taxa de abertura"
    },
    {
      campo: "Produto Visualizado",
      exemplo: "Você deixou [Produto] no carrinho",
      uso: "85%",
      impacto: "+28% taxa de conversão"
    },
    {
      campo: "Persona",
      exemplo: "Especial para [Persona]",
      uso: "92%",
      impacto: "+22% taxa de clique"
    },
    {
      campo: "Segmento",
      exemplo: "Oferta para [Segmento]",
      uso: "78%",
      impacto: "+18% taxa de conversão"
    },
    {
      campo: "LTV",
      exemplo: "Cupom [Desconto] para VIPs",
      uso: "88%",
      impacto: "+35% taxa de conversão"
    }
  ];

  const metricas = [
    {
      titulo: "Emails Enviados/Mês",
      valor: "125.450",
      descricao: "Automações ativas",
      cor: "text-blue-600"
    },
    {
      titulo: "Taxa de Abertura",
      valor: "34.2%",
      descricao: "Média de todos os fluxos",
      cor: "text-green-600"
    },
    {
      titulo: "Taxa de Clique",
      valor: "8.7%",
      descricao: "CTR médio",
      cor: "text-purple-600"
    },
    {
      titulo: "Receita Gerada",
      valor: "R$ 669K",
      descricao: "Mensal via automações",
      cor: "text-emerald-600"
    }
  ];

  const segmentosPersonalizacao = [
    {
      segmento: "Carol",
      template: "Descontraído, emojis, linguagem casual",
      assunto: "🎉 Carol, tá esperando o quê?",
      cta: "Aproveita agora!"
    },
    {
      segmento: "Renata",
      template: "Elegante, profissional, destaque em qualidade",
      assunto: "Renata, sua seleção exclusiva chegou",
      cta: "Descobrir coleção"
    },
    {
      segmento: "Vanessa",
      template: "Acolhedor, prático, foco em benefícios",
      assunto: "Vanessa, pensamos em você",
      cta: "Ver recomendações"
    },
    {
      segmento: "Luiza",
      template: "Criativo, viral, tendências, urgência",
      assunto: "⚡ Luiza, isso vai viralizar",
      cta: "Ser a primeira"
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

      {/* Fluxos de Automação */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Fluxos de Automação de Email
          </CardTitle>
          <CardDescription>6 fluxos automáticos gerando R$ 669K/mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fluxosAutomacao.map((fluxo, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{fluxo.nome}</h4>
                    <p className="text-xs text-slate-500 mt-1">{fluxo.trigger}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{fluxo.status}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Emails</p>
                    <p className="font-bold text-slate-900">{fluxo.emails}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Taxa Conversão</p>
                    <p className="font-bold text-green-600">{fluxo.taxa}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita/Mês</p>
                    <p className="font-bold text-green-600">{fluxo.receita}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Sequência</p>
                    <p className="font-bold text-slate-900 text-xs">{fluxo.sequencia}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalização por Persona */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Personalização por Persona
          </CardTitle>
          <CardDescription>Cada persona recebe mensagem customizada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segmentosPersonalizacao.map((seg, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3">{seg.segmento}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Estilo</p>
                    <p className="font-bold text-slate-900">{seg.template}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Assunto</p>
                    <p className="font-bold text-slate-900 text-xs">{seg.assunto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">CTA</p>
                    <p className="font-bold text-blue-600">{seg.cta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campos de Personalização */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-600" />
            Campos de Personalização Utilizados
          </CardTitle>
          <CardDescription>Dinâmica que aumenta engajamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {personalizacao.map((campo, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{campo.campo}</h4>
                    <p className="text-xs text-slate-500 mt-1">Exemplo: {campo.exemplo}</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">{campo.uso}</Badge>
                </div>
                <div className="bg-green-50 rounded p-2">
                  <p className="text-xs text-green-700 font-semibold">{campo.impacto}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Envio */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Timing Otimizado de Envio
          </CardTitle>
          <CardDescription>Quando enviar para máxima abertura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { dia: "Terça-Feira", hora: "10:00 AM", taxa: "38%", motivo: "Pico de abertura" },
              { dia: "Quarta-Feira", hora: "02:00 PM", taxa: "35%", motivo: "Pós-almoço" },
              { dia: "Quinta-Feira", hora: "10:00 AM", taxa: "36%", motivo: "Preparação para fim de semana" },
              { dia: "Sexta-Feira", hora: "05:00 PM", taxa: "42%", motivo: "Maior taxa de conversão" }
            ].map((timing, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-200/50 rounded-lg bg-white">
                <div>
                  <p className="font-semibold text-slate-900">{timing.dia} às {timing.hora}</p>
                  <p className="text-xs text-slate-500">{timing.motivo}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">{timing.taxa}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-slate-900">✅ Benefícios da Automação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">R$ 669K/mês em Receita</p>
              <p className="text-slate-600">6 fluxos automáticos gerando vendas 24/7</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">34.2% Taxa de Abertura</p>
              <p className="text-slate-600">Acima da média de mercado (20%)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Personalização por Persona</p>
              <p className="text-slate-600">Cada persona recebe mensagem customizada</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Sem Trabalho Manual</p>
              <p className="text-slate-600">Tudo automático baseado em comportamento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
