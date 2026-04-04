import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const MESES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function agruparPorMes(campanhas: any[]) {
  const mapa: Record<string, { mes: string; label: string; campanhas: any[] }> = {};
  for (const c of campanhas) {
    if (!c.dataInicio) continue;
    const d = new Date(c.dataInicio);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!mapa[chave]) {
      mapa[chave] = {
        mes: chave,
        label: `${MESES_PT[d.getMonth()]} ${d.getFullYear()}`,
        campanhas: [],
      };
    }
    mapa[chave].campanhas.push(c);
  }
  return Object.values(mapa).sort((a, b) => b.mes.localeCompare(a.mes)).slice(0, 6);
}

const SECOES_RELATORIO = [
  { titulo: "Resumo Executivo", descricao: "KPIs principais, ROI, conversões e recomendações", paginas: 2 },
  { titulo: "Performance por Plataforma", descricao: "Análise de Instagram, Facebook, TikTok, Email e WhatsApp", paginas: 6 },
  { titulo: "Análise de Campanhas", descricao: "Performance individual de cada campanha ativa e encerrada", paginas: 4 },
  { titulo: "Conversões e Investimento", descricao: "ROI por canal, cliques, impressões e conversões", paginas: 3 },
  { titulo: "Recomendações de Otimização", descricao: "Ações específicas para aumentar ROI e conversão", paginas: 3 },
];

export default function SistemaRelatoriosMensaisSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });
  const [mesSelecionado, setMesSelecionado] = useState(0);

  const grupos = agruparPorMes(campanhas as any[]);
  const grupoAtual = grupos[mesSelecionado];

  const calcularStats = (camp: any[]) => {
    const total = camp.length;
    const impressoes = camp.reduce((s, c) => s + (Number(c.performance?.impressoes) || 0), 0);
    const conversoes = camp.reduce((s, c) => s + (Number(c.performance?.conversoes) || 0), 0);
    const orcamento = camp.reduce((s, c) => s + parseFloat(c.orcamento ?? "0"), 0);
    const rois = camp.filter(c => (Number(c.performance?.roi) || 0) > 0);
    const roiMedio = rois.length > 0 ? rois.reduce((s, c) => s + (Number(c.performance?.roi) || 0), 0) / rois.length : 0;
    const cliques = camp.reduce((s, c) => s + (Number(c.performance?.cliques) || 0), 0);
    return { total, impressoes, conversoes, orcamento, roiMedio, cliques };
  };

  const stats = grupoAtual ? calcularStats(grupoAtual.campanhas) : null;

  const exportarJSON = () => {
    if (!grupoAtual) return;
    const dados = {
      periodo: grupoAtual.label,
      geradoEm: new Date().toISOString(),
      resumo: stats,
      campanhas: grupoAtual.campanhas,
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${grupoAtual.mes}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Relatórios Mensais</h2>
        <p className="text-slate-600 text-sm">Análise de performance de campanhas agrupadas por mês.</p>
      </div>

      {grupos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">Nenhuma campanha com data de início cadastrada.</p>
            <p className="text-sm text-slate-400 mt-1">Crie campanhas na aba "Campanhas" e defina a data de início para gerar relatórios mensais.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Lista de meses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Períodos Disponíveis
              </CardTitle>
              <CardDescription>Cada período agrupa campanhas com dataInício no mesmo mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {grupos.map((grupo, idx) => {
                  const s = calcularStats(grupo.campanhas);
                  return (
                    <button
                      key={grupo.mes}
                      onClick={() => setMesSelecionado(idx)}
                      className={`w-full p-4 rounded-lg border-2 transition text-left ${
                        mesSelecionado === idx ? "border-pink-500 bg-pink-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900">{grupo.label}</p>
                        <Badge className="bg-green-100 text-green-800 text-xs">{s.total} campanha{s.total !== 1 ? "s" : ""}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs text-slate-600">
                        <div><span className="font-bold text-slate-900">{s.impressoes.toLocaleString("pt-BR")}</span> impressões</div>
                        <div><span className="font-bold text-slate-900">{s.conversoes.toLocaleString("pt-BR")}</span> conversões</div>
                        <div><span className="font-bold text-green-700">{s.roiMedio > 0 ? `${s.roiMedio.toFixed(0)}% ROI` : "—"}</span></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do período selecionado */}
          {grupoAtual && stats && (
            <Card>
              <CardHeader>
                <CardTitle>{grupoAtual.label}</CardTitle>
                <CardDescription>{stats.total} campanha{stats.total !== 1 ? "s" : ""} · {SECOES_RELATORIO.length} seções de análise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* KPIs reais */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Impressões", valor: stats.impressoes.toLocaleString("pt-BR"), cor: "bg-blue-50 text-blue-700" },
                    { label: "Cliques", valor: stats.cliques.toLocaleString("pt-BR"), cor: "bg-purple-50 text-purple-700" },
                    { label: "Conversões", valor: stats.conversoes.toLocaleString("pt-BR"), cor: "bg-green-50 text-green-700" },
                    { label: "Orçamento", valor: `R$ ${stats.orcamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, cor: "bg-orange-50 text-orange-700" },
                    { label: "ROI Médio", valor: stats.roiMedio > 0 ? `${stats.roiMedio.toFixed(0)}%` : "—", cor: "bg-pink-50 text-pink-700" },
                    { label: "Campanhas", valor: String(stats.total), cor: "bg-slate-50 text-slate-700" },
                  ].map((kpi, i) => (
                    <div key={i} className={`${kpi.cor} rounded-lg p-4`}>
                      <p className="text-xs font-medium opacity-70 mb-1">{kpi.label}</p>
                      <p className="text-xl font-bold">{kpi.valor}</p>
                    </div>
                  ))}
                </div>

                {/* Seções do relatório */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Seções do Relatório</h3>
                  <div className="space-y-2">
                    {SECOES_RELATORIO.map((secao, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{secao.titulo}</p>
                          <p className="text-sm text-slate-600">{secao.descricao}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{secao.paginas}p</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campanhas do período */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Campanhas do Período</h3>
                  <div className="space-y-2">
                    {grupoAtual.campanhas.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg text-sm">
                        <div>
                          <p className="font-medium text-slate-900">{c.nome}</p>
                          <p className="text-xs text-slate-500">{c.plataforma} · {c.status}</p>
                        </div>
                        <div className="text-right text-xs">
                          <p className="font-bold text-green-700">{Number(c.performance?.conversoes) || 0} conv.</p>
                          <p className="text-slate-500">ROI {(Number(c.performance?.roi) || 0).toFixed(0)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exportar */}
                <Button onClick={exportarJSON} className="w-full gap-2" variant="outline">
                  <Download className="w-4 h-4" />
                  Exportar Dados do Período (JSON)
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Agendamento (UI informativo) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Geração Automática
          </CardTitle>
          <CardDescription>Configure relatórios automáticos por email</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Para receber relatórios automáticos por email, configure na aba <strong>Relatórios &gt; Relatório Semanal</strong>.
          </p>
          <div className="space-y-2 text-sm text-slate-500">
            <p>• Relatórios semanais com métricas de campanhas ativas</p>
            <p>• Alertas automáticos de performance via Smart Alerts</p>
            <p>• Export manual disponível acima para cada período</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
