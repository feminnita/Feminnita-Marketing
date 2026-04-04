import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Target, AlertCircle, ArrowRight } from "lucide-react";

const MODELOS = [
  {
    nome: "Last-Click",
    descricao: "Último canal clicado recebe 100% do crédito",
    facebook: "0%", email: "0%", google: "100%",
    vantagem: "Simples, mostra canal mais próximo da compra",
    desvantagem: "Ignora papel dos canais de awareness",
  },
  {
    nome: "First-Click",
    descricao: "Primeiro canal clicado recebe 100% do crédito",
    facebook: "100%", email: "0%", google: "0%",
    vantagem: "Mostra qual canal traz o cliente inicialmente",
    desvantagem: "Ignora canais que fecham a venda",
  },
  {
    nome: "Linear",
    descricao: "Todos os canais recebem crédito igual",
    facebook: "33%", email: "33%", google: "33%",
    vantagem: "Reconhece papel de todos os canais",
    desvantagem: "Não diferencia importância de cada canal",
  },
  {
    nome: "Time-Decay ✓",
    descricao: "Canais próximos da compra recebem mais crédito",
    facebook: "10%", email: "30%", google: "60%",
    vantagem: "Mais realista — valoriza conversão",
    desvantagem: "Mais complexo de configurar",
    recomendado: true,
  },
];

const TIME_DECAY_JOURNEY = [
  { dia: "Dia 1", canal: "Facebook Ads", acao: "Cliente vê anúncio (awareness)", credito: "10%" },
  { dia: "Dia 3", canal: "Email Marketing", acao: "Recebe email com oferta", credito: "30%" },
  { dia: "Dia 5", canal: "Google Ads", acao: "Busca e clica → compra", credito: "60%" },
];

export function AtribuicaoMulticanalSection() {
  const { data: campanhas = [], isLoading } = trpc.campaigns.listar.useQuery();

  // Platform breakdown from real campaigns
  const byPlatform = campanhas.reduce((acc: Record<string, { count: number; conversoes: number }>, c: any) => {
    const p = c.plataforma || "outros";
    if (!acc[p]) acc[p] = { count: 0, conversoes: 0 };
    acc[p].count++;
    acc[p].conversoes += c.performance?.conversoes ?? 0;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Atribuição Multicanal</h2>
        <p className="text-slate-500 text-sm mt-1">Modelos de atribuição para entender qual canal tem mais impacto nas vendas</p>
      </div>

      {/* Aviso */}
      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Atribuição precisa requer integração com <strong>Google Analytics 4</strong> (ecommerce tracking)
            e <strong>Meta Pixel</strong>. Os modelos abaixo são guia conceitual para configurar sua estratégia.
          </p>
        </CardContent>
      </Card>

      {/* Real platform breakdown */}
      {campanhas.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: '#8B2635' }} />
              Conversões por plataforma (dados reais)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(byPlatform).length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma conversão registrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(byPlatform).map(([platform, data]: [string, any]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 w-28 capitalize">{platform}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{
                        backgroundColor: '#8B2635',
                        width: `${Math.min(100, (data.conversoes / Math.max(1, campanhas.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0))) * 100)}%`
                      }} />
                    </div>
                    <span className="text-sm text-slate-600 w-24 text-right">
                      {data.conversoes.toLocaleString('pt-BR')} conv.
                    </span>
                    <Badge variant="secondary" className="text-xs w-20 text-center">{data.count} camp.</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modelos de atribuição */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: '#8B2635' }} />
            Modelos de atribuição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODELOS.map((modelo, idx) => (
              <div key={idx} className={`border-2 rounded-lg p-4 ${modelo.recomendado ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{modelo.nome}</h4>
                  {modelo.recomendado && <Badge className="text-xs bg-green-600">Recomendado</Badge>}
                </div>
                <p className="text-xs text-slate-500 mb-3">{modelo.descricao}</p>

                <div className="space-y-1.5 mb-3">
                  {[
                    { label: "Facebook", value: modelo.facebook },
                    { label: "Email", value: modelo.email },
                    { label: "Google Ads", value: modelo.google },
                  ].map(ch => (
                    <div key={ch.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{ch.label}</span>
                      <Badge variant="secondary" className="text-xs">{ch.value}</Badge>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
                  <p><span className="text-green-600 font-medium">✓</span> {modelo.vantagem}</p>
                  <p><span className="text-red-500 font-medium">✗</span> {modelo.desvantagem}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Journey example */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Exemplo Time-Decay: jornada do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TIME_DECAY_JOURNEY.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-16 text-xs font-medium text-slate-400 pt-0.5 flex-shrink-0">{step.dia}</div>
                <div className="flex items-center gap-2 flex-1">
                  {idx > 0 && <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                  <div className="flex-1 bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{step.canal}</p>
                        <p className="text-xs text-slate-500">{step.acao}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{step.credito} crédito</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
