import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Zap, ArrowRight, Users } from "lucide-react";

const REGRAS = [
  {
    nome: "VIP → Em Risco",
    condicao: "Sem compra há 30 dias",
    acao: "Enviar cupom exclusivo 15% + email personalizado",
    frequencia: "Diária",
    cor: "bg-purple-50 border-purple-200",
    corText: "text-purple-700",
  },
  {
    nome: "Em Risco → Ativo",
    condicao: "Compra acima de R$ 500 no mês",
    acao: "Remover da lista de risco + oferecer programa loyalty",
    frequencia: "Diária",
    cor: "bg-orange-50 border-orange-200",
    corText: "text-orange-700",
  },
  {
    nome: "Dormentes → Em Risco",
    condicao: "Sem compra há 60 dias",
    acao: "Enviar SMS + email com top 3 produtos recomendados",
    frequencia: "Semanal",
    cor: "bg-red-50 border-red-200",
    corText: "text-red-700",
  },
  {
    nome: "Ativos → VIP",
    condicao: "LTV > R$ 5.000 + 5+ compras",
    acao: "Convite exclusivo VIP + acesso early access",
    frequencia: "Diária",
    cor: "bg-green-50 border-green-200",
    corText: "text-green-700",
  },
  {
    nome: "Qualquer → Dormentes",
    condicao: "Sem atividade há 90 dias",
    acao: "Mover para segmento dormentes + pausar emails",
    frequencia: "Semanal",
    cor: "bg-slate-50 border-slate-200",
    corText: "text-slate-600",
  },
];

export const AutomacaoSegmentacaoClientesSection = () => {
  const [selectedRule, setSelectedRule] = useState(0);
  const { data: automacoes = [] } = trpc.automations.listar.useQuery();
  const ativas = automacoes.filter((a: any) => a.ativa).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Automação de Segmentação</h2>
        <p className="text-slate-500 text-sm mt-1">
          Regras para mover clientes entre segmentos automaticamente com base em comportamento
        </p>
      </div>

      {/* Real data from automations */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500">Automações ativas</p>
              <p className="text-2xl font-bold text-slate-900">{ativas}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5 flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-slate-500">Total automações</p>
              <p className="text-2xl font-bold text-slate-900">{automacoes.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regras estratégicas */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-amber-500" />
            Regras de segmentação recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {REGRAS.map((regra, idx) => (
                <button key={idx} onClick={() => setSelectedRule(idx)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedRule === idx ? regra.cor : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}>
                  <p className={`font-semibold text-sm ${selectedRule === idx ? regra.corText : 'text-slate-900'}`}>
                    {regra.nome}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{regra.condicao}</p>
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-lg border-2 ${REGRAS[selectedRule].cor}`}>
              <div className="space-y-4">
                <div>
                  <p className={`text-base font-bold ${REGRAS[selectedRule].corText}`}>
                    {REGRAS[selectedRule].nome}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Condição</p>
                  <p className="text-sm text-slate-800">{REGRAS[selectedRule].condicao}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Ação automática</p>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                    <p className="text-sm text-slate-800">{REGRAS[selectedRule].acao}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Frequência</p>
                  <Badge variant="outline" className="text-xs">{REGRAS[selectedRule].frequencia}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bling placeholder */}
      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Segmentação automática por comportamento</strong> (VIP, Em Risco, Dormentes, Ativos)
            requer integração com <strong>Bling ERP</strong> para acesso ao histórico de pedidos e LTV.
            As regras acima são o guia estratégico de implementação.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
