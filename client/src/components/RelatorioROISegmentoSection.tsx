import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, AlertCircle, Users } from "lucide-react";

const SEGMENTOS_GUIDE = [
  {
    nome: "VIP",
    cor: "bg-purple-50 border-purple-200",
    corText: "text-purple-700",
    criterio: "LTV > R$ 5.000 + 5+ compras",
    estrategia: "Acesso antecipado a lançamentos, cupons exclusivos, atendimento prioritário",
    canais: ["Email personalizado", "WhatsApp direto", "Instagram DM exclusivo"],
  },
  {
    nome: "Ativos",
    cor: "bg-green-50 border-green-200",
    corText: "text-green-700",
    criterio: "Compra nos últimos 60 dias",
    estrategia: "Manter engajamento com novidades, cross-sell e upsell",
    canais: ["Email newsletter", "Remarketing Meta/Google", "Notificações"],
  },
  {
    nome: "Em Risco",
    cor: "bg-orange-50 border-orange-200",
    corText: "text-orange-700",
    criterio: "Sem compra há 30-60 dias",
    estrategia: "Cupom de reativação, conteúdo de valor, lembrar da marca",
    canais: ["Email win-back", "Retargeting com desconto", "WhatsApp automático"],
  },
  {
    nome: "Dormentes",
    cor: "bg-red-50 border-red-200",
    corText: "text-red-700",
    criterio: "Sem compra há 90+ dias",
    estrategia: "Oferta especial de reativação, pesquisa de satisfação",
    canais: ["Email final (última chance)", "SMS com oferta"],
  },
];

export const RelatorioROISegmentoSection = () => {
  const { data: campanhas = [], isLoading } = trpc.campaigns.listar.useQuery();

  const totalConversoes = (campanhas as any[]).reduce((s, c) => s + (c.performance?.conversoes ?? 0), 0);
  const totalCampanhas = campanhas.length;
  const ativas = (campanhas as any[]).filter((c) => c.status === "ativa").length;
  const avgROI = totalCampanhas > 0
    ? (campanhas as any[]).reduce((s, c) => s + (c.performance?.roi ?? 0), 0) / totalCampanhas
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>ROI por Segmento</h2>
        <p className="text-slate-500 text-sm mt-1">Estratégias e performance por segmento de cliente</p>
      </div>

      {/* Bling placeholder */}
      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>LTV, CAC e ROI por segmento de cliente</strong> requerem integração com <strong>Bling ERP</strong>
            para acesso ao histórico de pedidos. Os dados abaixo são das campanhas de marketing.
          </p>
        </CardContent>
      </Card>

      {/* Real campaign KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Campanhas</p>
            <p className="text-2xl font-bold text-slate-900">{totalCampanhas}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Ativas</p>
            <p className="text-2xl font-bold text-green-700">{ativas}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Total conversões</p>
            <p className="text-2xl font-bold text-slate-900">{totalConversoes.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">ROI médio</p>
            <p className="text-2xl font-bold text-blue-700">{avgROI.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Segmentos guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: '#8B2635' }} />
            Estratégia por segmento de cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SEGMENTOS_GUIDE.map((seg, idx) => (
              <div key={idx} className={`border-2 rounded-lg p-4 ${seg.cor}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-bold text-base ${seg.corText}`}>{seg.nome}</h4>
                  <Badge variant="outline" className="text-xs">{seg.criterio}</Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2">{seg.estrategia}</p>
                <div className="flex flex-wrap gap-1.5">
                  {seg.canais.map(c => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign breakdown by platform */}
      {(campanhas as any[]).length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: '#8B2635' }} />
              Performance de campanhas (dados reais)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500">
                    <th className="text-left py-2 font-medium">Campanha</th>
                    <th className="text-right py-2 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Conversões</th>
                    <th className="text-right py-2 font-medium">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {(campanhas as any[]).slice(0, 6).map((c, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-900 max-w-48 truncate">{c.nome}</td>
                      <td className="text-right py-2">
                        <Badge variant={c.status === 'ativa' ? 'default' : 'secondary'} className="text-xs">{c.status}</Badge>
                      </td>
                      <td className="text-right py-2 text-slate-600">{(c.performance?.conversoes ?? 0).toLocaleString('pt-BR')}</td>
                      <td className="text-right py-2 font-semibold text-green-700">{(c.performance?.roi ?? 0).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
