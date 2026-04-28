import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

const PERSONAS = ['Carol', 'Renata', 'Vanessa', 'Luiza'];

const CROSSELL_GUIDE = [
  { de: 'Pijama', para: 'Robe combinando', dica: 'Ofereça kit com 10% de desconto no checkout' },
  { de: 'Pijama básico', para: 'Pijama premium', dica: 'Mostre o upgrade após 2ª compra via email' },
  { de: 'Pijama infantil', para: 'Pijama adulto', dica: 'Campanha "mãe e filha" para persona Carol' },
];

const MIX_GUIDE = [
  { titulo: 'Priorize produtos com maior margem', descricao: 'Identifique no Bling quais SKUs têm maior margem bruta e aumente o budget de ads para eles' },
  { titulo: 'Volume × Margem', descricao: 'Um produto de volume alto com margem baixa pode ser mais lucrativo que produto premium de baixo giro' },
  { titulo: 'Sazonalidade', descricao: 'Pijamas de inverno (plush/fleece) têm margem maior; planeje estoque e budget com 60 dias de antecedência' },
  { titulo: 'Canais por produto', descricao: 'Produtos visuais (kits, robes) performam melhor em Instagram/TikTok; básicos em Google Shopping' },
];

export default function RentabilidadeDetalhadaSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();
  const { data: blingStatus } = trpc.blingOAuth.getStatus.useQuery();
  const isLinked = (blingStatus as any)?.conectado;

  // Group campaigns by persona
  const porPersona = PERSONAS.map(persona => {
    const grupo = (campanhas as any[]).filter((c: any) =>
      (c.persona ?? '').toLowerCase() === persona.toLowerCase()
    );
    const conversoes = grupo.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0);
    const ctr = grupo.length > 0 ? grupo.reduce((s: number, c: any) => s + (c.performance?.ctr ?? 0), 0) / grupo.length : 0;
    const roi = grupo.length > 0 ? grupo.reduce((s: number, c: any) => s + (c.performance?.roi ?? 0), 0) / grupo.length : 0;
    const plataformas = [...new Set(grupo.map((c: any) => c.plataforma).filter(Boolean))];
    return { persona, conversoes, ctr, roi, plataformas, campanhas: grupo.length };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Rentabilidade Detalhada</h2>
        <p className="text-slate-500 text-sm mt-1">Análise de rentabilidade por persona/produto e oportunidades de mix</p>
      </div>

      <Card className={`border-0 shadow-sm border-l-4 ${isLinked ? 'border-green-400 bg-green-50' : 'border-amber-400 bg-amber-50'}`}>
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isLinked ? 'text-green-600' : 'text-amber-600'}`} />
          <p className={`text-sm ${isLinked ? 'text-green-800' : 'text-amber-800'}`}>
            {isLinked
              ? <><strong>Bling conectado.</strong> Dados de receita, custo e margem por produto disponíveis no Bling ERP.</>
              : <><strong>Rentabilidade real requer Bling ERP.</strong> Receita, custo, margem e lucro por produto dependem do histórico de pedidos. Conecte o Bling em <strong>Automação Bling</strong>. Abaixo são métricas das campanhas de marketing por persona.</>
            }
          </p>
        </CardContent>
      </Card>

      {/* Campaign KPIs by persona */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Performance de campanhas por persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(campanhas as any[]).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Nenhuma campanha cadastrada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="text-left py-2 font-medium">Persona</th>
                    <th className="text-right py-2 font-medium">Campanhas</th>
                    <th className="text-right py-2 font-medium">Conversões</th>
                    <th className="text-right py-2 font-medium">CTR médio</th>
                    <th className="text-right py-2 font-medium">ROI médio</th>
                    <th className="text-left py-2 font-medium">Plataformas</th>
                  </tr>
                </thead>
                <tbody>
                  {porPersona.filter(p => p.campanhas > 0).map(p => (
                    <tr key={p.persona} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 font-semibold text-slate-900">{p.persona}</td>
                      <td className="text-right py-2 text-slate-600">{p.campanhas}</td>
                      <td className="text-right py-2 font-semibold text-slate-900">{p.conversoes.toLocaleString('pt-BR')}</td>
                      <td className="text-right py-2 text-blue-700">{p.ctr.toFixed(2)}%</td>
                      <td className="text-right py-2 text-green-700">{p.roi.toFixed(1)}%</td>
                      <td className="py-2 pl-3">
                        <div className="flex flex-wrap gap-1">
                          {p.plataformas.slice(0, 3).map((pl: string) => (
                            <Badge key={pl} variant="secondary" className="text-xs capitalize">{pl}</Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {porPersona.every(p => p.campanhas === 0) && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-sm">
                        Campanhas não associadas a personas. Edite as campanhas e atribua a persona correspondente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mix strategy guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Estratégias de mix de produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MIX_GUIDE.map((item, idx) => (
              <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                <p className="text-sm font-semibold text-slate-900">{item.titulo}</p>
                <p className="text-xs text-slate-500 mt-1">{item.descricao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-sell guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Oportunidades de cross-sell e upsell</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CROSSELL_GUIDE.map((item, idx) => (
              <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">{item.de} → {item.para}</p>
                <p className="text-sm text-slate-700">→ {item.dica}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Taxas de conversão de cross-sell disponíveis após integração com Bling ERP (histórico de pedidos por cliente).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
