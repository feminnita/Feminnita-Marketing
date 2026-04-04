import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function PrevisaoVendasSection() {
  const [metaMensal, setMetaMensal] = useState(3000);
  const [vendidoAteAgora, setVendidoAteAgora] = useState(0);
  const [diasRestantes, setDiasRestantes] = useState(15);
  const [ticketMedio, setTicketMedio] = useState(150);

  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();

  // Derived calculations from user inputs
  const diasDecorridos = 30 - diasRestantes;
  const mediaDiaria = diasDecorridos > 0 ? vendidoAteAgora / diasDecorridos : 0;
  const projecaoFinal = Math.round(mediaDiaria * 30);
  const diferencaMeta = projecaoFinal - metaMensal;
  const percentualMeta = metaMensal > 0 ? (projecaoFinal / metaMensal) * 100 : 0;
  const vendasFaltando = Math.max(0, metaMensal - vendidoAteAgora);
  const vendasDiariasFaltando = diasRestantes > 0 ? vendasFaltando / diasRestantes : 0;
  const budgetEstimado = Math.round(vendasDiariasFaltando * ticketMedio * 0.3); // CPA ~30% do ticket

  // Campaign conversions as signal
  const totalCampanhaConversoes = (campanhas as any[]).reduce((s, c) => s + (c.performance?.conversoes ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Previsão de Vendas</h2>
        <p className="text-slate-500 text-sm mt-1">Acompanhe progresso vs meta e calcule budget necessário</p>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Dados de vendas reais (unidades vendidas) vêm do <strong>Bling ERP</strong>.
            Preencha manualmente abaixo com seus dados do mês atual para as projeções.
          </p>
        </CardContent>
      </Card>

      {/* Config inputs */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: '#8B2635' }} />
            Configurar meta do mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Meta mensal (un.)</label>
              <input type="number" value={metaMensal} onChange={e => setMetaMensal(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Vendido até hoje (un.)</label>
              <input type="number" value={vendidoAteAgora} onChange={e => setVendidoAteAgora(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Dias restantes</label>
              <input type="number" min="1" max="30" value={diasRestantes} onChange={e => setDiasRestantes(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Ticket médio (R$)</label>
              <input type="number" value={ticketMedio} onChange={e => setTicketMedio(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Meta mensal</p>
            <p className="text-2xl font-bold text-slate-900">{metaMensal.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Projeção final</p>
            <p className={`text-2xl font-bold ${projecaoFinal >= metaMensal ? 'text-green-700' : 'text-red-600'}`}>
              {projecaoFinal.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">% da meta</p>
            <p className={`text-2xl font-bold ${percentualMeta >= 100 ? 'text-green-700' : percentualMeta >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
              {percentualMeta.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Diferença</p>
            <p className={`text-2xl font-bold ${diferencaMeta >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {diferencaMeta >= 0 ? '+' : ''}{diferencaMeta.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget estimate */}
      {vendasFaltando > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-blue-400 bg-blue-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">Budget estimado para atingir a meta</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-blue-600">Vendas faltando</p>
                <p className="text-xl font-bold text-blue-900">{vendasFaltando.toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Vendas/dia necessárias</p>
                <p className="text-xl font-bold text-blue-900">{vendasDiariasFaltando.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Budget estimado</p>
                <p className="text-xl font-bold text-blue-900">R$ {budgetEstimado.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-blue-400">CPA ~30% do ticket</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign signal */}
      {totalCampanhaConversoes > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: '#8B2635' }} />
              Sinal de campanhas de marketing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">Conversões via campanhas</p>
                <p className="text-2xl font-bold text-slate-900">{totalCampanhaConversoes.toLocaleString('pt-BR')}</p>
              </div>
              <div className="text-xs text-slate-400">
                <p>Campanhas ativas: {(campanhas as any[]).filter((c: any) => c.status === 'ativa').length}</p>
                <p>Plataformas: {[...new Set((campanhas as any[]).map((c: any) => c.plataforma).filter(Boolean))].join(', ') || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
