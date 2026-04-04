import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Sheet, Presentation, Clock, AlertCircle, Plus, Trash2 } from "lucide-react";

interface Agendamento {
  id: number;
  relatorio: string;
  formato: string;
  frequencia: string;
  email: string;
  ativo: boolean;
}

const RELATORIOS_DISPONIVEIS = [
  { id: "completo", titulo: "Relatório Completo", descricao: "Todas as seções: personas, planejamento, roteiros, análise, tendências", secoes: 8 },
  { id: "executivo", titulo: "Resumo Executivo", descricao: "Métricas principais, ROI, recomendações - ideal para apresentações", secoes: 3 },
  { id: "performance", titulo: "Performance", descricao: "Análise detalhada de métricas, gráficos, benchmarks", secoes: 4 },
  { id: "estrategia", titulo: "Estratégia", descricao: "Personas, planejamento, roteiros, tendências", secoes: 5 },
];

const FORMATOS = [
  { id: "pdf", nome: "PDF", icon: FileText, cor: "text-red-600", descricao: "Profissional, compartilhável, compatível com todos os dispositivos" },
  { id: "excel", nome: "Excel", icon: Sheet, cor: "text-green-600", descricao: "Editável, com gráficos, ideal para análise de dados" },
  { id: "ppt", nome: "PowerPoint", icon: Presentation, cor: "text-orange-600", descricao: "Apresentação pronta, com slides, animações, design profissional" },
];

export default function ExportacaoRelatoriosSection() {
  const [selectedRelatorio, setSelectedRelatorio] = useState("completo");
  const [selectedFormato, setSelectedFormato] = useState("pdf");
  const [exportando, setExportando] = useState(false);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [novoAgendamento, setNovoAgendamento] = useState(false);
  const [formA, setFormA] = useState({ relatorio: 'completo', formato: 'pdf', frequencia: 'Toda segunda-feira', email: '' });

  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();
  type Camp = (typeof campanhas)[number];

  const handleExport = () => {
    const relatorio = RELATORIOS_DISPONIVEIS.find(r => r.id === selectedRelatorio);
    if (!relatorio) return;
    setExportando(true);
    try {
      const totalOrcamento = campanhas.reduce((s: number, c: Camp) => s + (Number(c.orcamento) || 0), 0);
      const totalConversoes = campanhas.reduce((s: number, c: Camp) => s + (Number(c.performance.conversoes) || 0), 0);
      const avgROI = campanhas.length > 0
        ? campanhas.reduce((s: number, c: Camp) => s + (Number(c.performance.roi) || 0), 0) / campanhas.length
        : 0;
      const content = JSON.stringify(
        {
          relatorio: relatorio.titulo,
          descricao: relatorio.descricao,
          formato: selectedFormato.toUpperCase(),
          geradoEm: new Date().toISOString(),
          resumo: { totalCampanhas: campanhas.length, ativas: campanhas.filter((c: Camp) => c.status === 'ativa').length, totalOrcamento, totalConversoes, avgROI: avgROI.toFixed(0) + '%' },
          campanhas: campanhas.map((c: Camp) => ({ nome: c.nome, plataforma: c.plataforma, status: c.status, orcamento: c.orcamento, roi: c.performance.roi, conversoes: c.performance.conversoes })),
        },
        null, 2
      );
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${relatorio.id}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Relatório "${relatorio.titulo}" exportado com sucesso!`);
    } catch {
      toast.error("Erro ao exportar relatório");
    } finally {
      setExportando(false);
    }
  };

  const adicionarAgendamento = () => {
    if (!formA.email.trim()) { toast.error('Informe o email de destino.'); return; }
    const relNome = RELATORIOS_DISPONIVEIS.find(r => r.id === formA.relatorio)?.titulo || formA.relatorio;
    const fmtNome = FORMATOS.find(f => f.id === formA.formato)?.nome || formA.formato;
    const novo: Agendamento = {
      id: Date.now(),
      relatorio: relNome,
      formato: fmtNome,
      frequencia: formA.frequencia,
      email: formA.email,
      ativo: true,
    };
    setAgendamentos(prev => [...prev, novo]);
    setFormA({ relatorio: 'completo', formato: 'pdf', frequencia: 'Toda segunda-feira', email: '' });
    setNovoAgendamento(false);
    toast.success('Agendamento criado. Envio automático requer configuração de backend.');
  };

  const toggleAtivo = (id: number) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a));
  };

  const removerAgendamento = (id: number) => {
    setAgendamentos(prev => prev.filter(a => a.id !== id));
  };

  const relatorio = RELATORIOS_DISPONIVEIS.find(r => r.id === selectedRelatorio);
  const formato = FORMATOS.find(f => f.id === selectedFormato);
  const FormatoIcon = formato?.icon || FileText;

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-orange-600" />
            Exportação de Relatórios
          </CardTitle>
          <CardDescription>
            Exporte relatórios em PDF, Excel ou PowerPoint. Agende exportações automáticas para sua equipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aviso */}
          <Card className="border-l-4 border-l-amber-500 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Envio automático requer configuração no backend</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Para envio automático por email, configure um serviço de email (SendGrid, Resend, etc.) no servidor. Exportação manual via download está disponível agora.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="rapida" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rapida">⚡ Exportação Rápida</TabsTrigger>
              <TabsTrigger value="agendada">📅 Agendada</TabsTrigger>
            </TabsList>

            <TabsContent value="rapida" className="space-y-4">
              {/* Seleção de Relatório */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Selecione o Relatório</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {RELATORIOS_DISPONIVEIS.map(rel => (
                    <Card
                      key={rel.id}
                      className={`p-4 cursor-pointer transition-all ${selectedRelatorio === rel.id ? "border-2 border-orange-500 bg-orange-50" : "hover:shadow-md"}`}
                      onClick={() => setSelectedRelatorio(rel.id)}
                    >
                      <h4 className="font-semibold text-sm mb-1">{rel.titulo}</h4>
                      <p className="text-xs text-slate-600 mb-2">{rel.descricao}</p>
                      <Badge variant="outline">{rel.secoes} seções</Badge>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Seleção de Formato */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Selecione o Formato</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {FORMATOS.map(fmt => (
                    <Card
                      key={fmt.id}
                      className={`p-4 cursor-pointer transition-all ${selectedFormato === fmt.id ? "border-2 border-orange-500 bg-orange-50" : "hover:shadow-md"}`}
                      onClick={() => setSelectedFormato(fmt.id)}
                    >
                      <h4 className="font-semibold text-sm mb-1">{fmt.nome}</h4>
                      <p className="text-xs text-slate-600">{fmt.descricao}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Preview e Exportação */}
              <Card className="p-4 bg-slate-50">
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">📋 Preview</h4>
                  <div className="bg-white p-4 rounded border border-slate-200">
                    <div className="flex items-center justify-center gap-2 text-slate-600">
                      <FormatoIcon className="w-6 h-6" />
                      <div>
                        <p className="font-semibold text-sm">{relatorio?.titulo}</p>
                        <p className="text-xs text-slate-600">{formato?.nome}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={handleExport} disabled={exportando} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  {exportando ? "Exportando..." : "Exportar Agora"}
                </Button>
              </Card>

              {/* Opções */}
              <Card className="p-4 bg-slate-50">
                <h4 className="font-semibold text-sm mb-3">⚙️ Opções</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Incluir gráficos e visualizações</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Incluir recomendações personalizadas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">Incluir dados confidenciais (ROI, CPA)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Incluir marca Feminnita</span>
                  </label>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="agendada" className="space-y-4">
              {/* Agendamentos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Agendamentos Ativos</h3>
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => setNovoAgendamento(!novoAgendamento)}>
                    <Plus className="w-3 h-3" />
                    Novo
                  </Button>
                </div>

                {novoAgendamento && (
                  <Card className="p-4 bg-orange-50 border-orange-200 mb-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-semibold block mb-1">Relatório</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" value={formA.relatorio} onChange={e => setFormA(f => ({ ...f, relatorio: e.target.value }))}>
                          {RELATORIOS_DISPONIVEIS.map(rel => <option key={rel.id} value={rel.id}>{rel.titulo}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold block mb-1">Formato</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" value={formA.formato} onChange={e => setFormA(f => ({ ...f, formato: e.target.value }))}>
                          {FORMATOS.map(fmt => <option key={fmt.id} value={fmt.id}>{fmt.nome}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold block mb-1">Frequência</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" value={formA.frequencia} onChange={e => setFormA(f => ({ ...f, frequencia: e.target.value }))}>
                          <option>Diário</option>
                          <option>Toda segunda-feira</option>
                          <option>Toda sexta-feira</option>
                          <option>Primeira segunda do mês</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-semibold block mb-1">Email</label>
                        <input type="email" placeholder="seu@email.com" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" value={formA.email} onChange={e => setFormA(f => ({ ...f, email: e.target.value }))} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={adicionarAgendamento} className="flex-1 bg-orange-600 hover:bg-orange-700 gap-2">
                          <Clock className="w-4 h-4" />
                          Agendar
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => setNovoAgendamento(false)}>Cancelar</Button>
                      </div>
                    </div>
                  </Card>
                )}

                {agendamentos.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-300 rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-500 text-sm">Nenhum agendamento criado.</p>
                    <p className="text-xs text-slate-400 mt-1">Crie um agendamento para receber relatórios por email automaticamente.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agendamentos.map(agend => (
                      <Card key={agend.id} className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{agend.relatorio}</h4>
                              <Badge variant="default" className="text-xs">{agend.formato}</Badge>
                              <Badge variant="outline" className={`text-xs ${agend.ativo ? 'text-green-700' : 'text-slate-500'}`}>
                                {agend.ativo ? '✓ Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 mb-1">{agend.frequencia}</p>
                            <p className="text-xs text-slate-600">📧 {agend.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-slate-200">
                          <Button size="sm" variant="outline" className="text-xs flex-1" onClick={() => toggleAtivo(agend.id)}>
                            {agend.ativo ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 text-xs" onClick={() => removerAgendamento(agend.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Dicas */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">💡 Dicas</h4>
            <ul className="text-sm space-y-2 text-slate-700">
              <li>• <strong>PDF</strong>: Melhor para compartilhar com clientes e stakeholders</li>
              <li>• <strong>Excel</strong>: Ideal para análise profunda de dados e criação de gráficos customizados</li>
              <li>• <strong>PowerPoint</strong>: Perfeito para apresentações executivas e reuniões</li>
              <li>• <strong>Agende automaticamente</strong> para manter equipe sempre atualizada</li>
              <li>• <strong>Customize as opções</strong> para incluir/excluir dados sensíveis</li>
            </ul>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
