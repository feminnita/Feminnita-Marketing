import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, BarChart3, Link2 } from "lucide-react";

const CROSS_SELL_GUIDE = [
  {
    produto: "Pijama básico (entrada)",
    sugestao: "Robe ou pijama premium da mesma persona",
    descricao: "Quem compra básico e fica satisfeito está pronto para o upgrade",
    momento: "Após 2ª compra confirmada",
  },
  {
    produto: "Pijama premium",
    sugestao: "Kit presente (pijama + robe + mascara)",
    descricao: "Cliente premium valoriza experiência completa",
    momento: "Em datas especiais ou recompra",
  },
  {
    produto: "Robe",
    sugestao: "Pijama da mesma coleção (look completo)",
    descricao: "Cliente que comprou robe provavelmente quer completar o look",
    momento: "7 dias após a entrega do robe",
  },
  {
    produto: "Qualquer produto",
    sugestao: "Produto de coleção lançamento",
    descricao: "Clientes ativos têm maior propensão a experimentar novidades",
    momento: "Anúncio de novo drop / coleção",
  },
];

const UPSELL_GUIDE = [
  { de: "Pijama entrada (R$ 80-120)", para: "Linha premium (R$ 150-200)", acao: "Email com diferencial do tecido + cupom 10%" },
  { de: "Compra avulsa", para: "Kit completo (pijama + robe)", acao: "Oferta de kit com desconto progressivo" },
  { de: "Cliente eventual", para: "Assinante trimestral", acao: "Convite exclusivo com benefícios VIP" },
];

export function RentabilidadeProdutoSection() {
  const { data: statusBling } = trpc.blingOAuth.getStatus.useQuery();
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();

  const byCampaign = (campanhas as any[]).slice(0, 8).map((c) => ({
    nome: c.nome,
    plataforma: c.plataforma,
    conversoes: c.performance?.conversoes ?? 0,
    roi: c.performance?.roi ?? 0,
    ctr: c.performance?.ctr ?? 0,
    status: c.status,
  }));

  const isLinked = (statusBling as any)?.conectado;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Rentabilidade de Produtos</h2>
        <p className="text-slate-500 text-sm mt-1">Análise de performance e estratégias de cross-sell / upsell</p>
      </div>

      {/* Bling status */}
      <Card className={`border-0 shadow-sm border-l-4 ${isLinked ? 'border-green-400 bg-green-50' : 'border-amber-400 bg-amber-50'}`}>
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isLinked ? 'text-green-600' : 'text-amber-600'}`} />
          <div className="text-sm">
            {isLinked ? (
              <p className="text-green-800">
                <strong>Bling conectado.</strong> Dados de vendas, estoque e margem disponíveis na plataforma Bling.
                Esta seção mostra campanhas de marketing como proxy de performance.
              </p>
            ) : (
              <p className="text-amber-800">
                <strong>Bling ERP não conectado.</strong> Dados de vendas, receita, margem e lucro por produto
                requerem integração com o Bling. Conecte em <strong>Automação Bling</strong>.
                Abaixo são dados das campanhas de marketing.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaigns as proxy */}
      {byCampaign.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Performance de campanhas por produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500">
                    <th className="text-left py-2 font-medium">Campanha</th>
                    <th className="text-right py-2 font-medium">Plataforma</th>
                    <th className="text-right py-2 font-medium">Conversões</th>
                    <th className="text-right py-2 font-medium">CTR</th>
                    <th className="text-right py-2 font-medium">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {byCampaign.map((c, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-900 max-w-48 truncate">{c.nome}</td>
                      <td className="text-right py-2">
                        <Badge variant="secondary" className="text-xs capitalize">{c.plataforma || '—'}</Badge>
                      </td>
                      <td className="text-right py-2 text-slate-600">{c.conversoes.toLocaleString('pt-BR')}</td>
                      <td className="text-right py-2 text-slate-600">{c.ctr.toFixed(2)}%</td>
                      <td className="text-right py-2 font-semibold text-green-700">{c.roi.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cross-sell guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Estratégia de cross-sell
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CROSS_SELL_GUIDE.map((cs, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-900">{cs.produto}</p>
                  <Badge variant="outline" className="text-xs flex-shrink-0">{cs.momento}</Badge>
                </div>
                <p className="text-xs text-slate-500 mb-1">→ <strong>{cs.sugestao}</strong></p>
                <p className="text-xs text-slate-400">{cs.descricao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upsell guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Estratégia de upsell
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {UPSELL_GUIDE.map((us, idx) => (
              <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-xs text-slate-500">{us.de}</p>
                  <p className="text-sm font-medium text-slate-900">→ {us.para}</p>
                </div>
                <p className="text-xs text-slate-600 max-w-48">{us.acao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
