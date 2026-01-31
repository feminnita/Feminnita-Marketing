import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Sheet, Presentation, Mail, CheckCircle, Clock, DollarSign } from "lucide-react";

const RELATORIOS_DISPONIVEIS = [
  {
    id: "completo",
    titulo: "Relatório Completo",
    descricao: "Todas as seções: personas, planejamento, roteiros, análise, tendências",
    secoes: 8,
    tamanho: "2.4 MB"
  },
  {
    id: "executivo",
    titulo: "Resumo Executivo",
    descricao: "Métricas principais, ROI, recomendações - ideal para apresentações",
    secoes: 3,
    tamanho: "0.8 MB"
  },
  {
    id: "performance",
    titulo: "Performance",
    descricao: "Análise detalhada de métricas, gráficos, benchmarks",
    secoes: 4,
    tamanho: "1.5 MB"
  },
  {
    id: "estrategia",
    titulo: "Estratégia",
    descricao: "Personas, planejamento, roteiros, tendências",
    secoes: 5,
    tamanho: "1.8 MB"
  },
];

const FORMATOS = [
  {
    id: "pdf",
    nome: "PDF",
    icon: FileText,
    cor: "text-red-600",
    descricao: "Profissional, compartilhável, compatível com todos os dispositivos",
    tempo: "2-5 seg"
  },
  {
    id: "excel",
    nome: "Excel",
    icon: Sheet,
    cor: "text-green-600",
    descricao: "Editável, com gráficos, ideal para análise de dados",
    tempo: "3-7 seg"
  },
  {
    id: "ppt",
    nome: "PowerPoint",
    icon: Presentation,
    cor: "text-orange-600",
    descricao: "Apresentação pronta, com slides, animações, design profissional",
    tempo: "5-10 seg"
  },
];

const AGENDAMENTOS = [
  {
    id: 1,
    relatorio: "Relatório Completo",
    formato: "PDF",
    frequencia: "Toda segunda-feira",
    email: "seu@email.com",
    proxima: "06 de Fevereiro",
    ativo: true
  },
  {
    id: 2,
    relatorio: "Resumo Executivo",
    formato: "PowerPoint",
    frequencia: "Toda sexta-feira",
    email: "seu@email.com",
    proxima: "07 de Fevereiro",
    ativo: true
  },
];

export default function ExportacaoRelatoriosSection() {
  const [selectedRelatorio, setSelectedRelatorio] = useState("completo");
  const [selectedFormato, setSelectedFormato] = useState("pdf");
  const [exportando, setExportando] = useState(false);

  const handleExport = async () => {
    setExportando(true);
    // Simular exportação
    setTimeout(() => {
      setExportando(false);
      alert(`Relatório exportado com sucesso em ${selectedFormato.toUpperCase()}!`);
    }, 2000);
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
          {/* Exportação Rápida */}
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
                      className={`p-4 cursor-pointer transition-all ${
                        selectedRelatorio === rel.id
                          ? "border-2 border-orange-500 bg-orange-50"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedRelatorio(rel.id)}
                    >
                      <h4 className="font-semibold text-sm mb-1">{rel.titulo}</h4>
                      <p className="text-xs text-slate-600 mb-2">{rel.descricao}</p>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">{rel.secoes} seções</Badge>
                        <Badge variant="outline">{rel.tamanho}</Badge>
                      </div>
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
                      className={`p-4 cursor-pointer transition-all ${
                        selectedFormato === fmt.id
                          ? "border-2 border-orange-500 bg-orange-50"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedFormato(fmt.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">{fmt.nome}</h4>
                          <p className={`text-xs font-semibold ${fmt.cor} mt-1`}>
                            {fmt.tempo}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{fmt.descricao}</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Preview e Botão de Exportação */}
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

                <Button
                  onClick={handleExport}
                  disabled={exportando}
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  {exportando ? "Exportando..." : "Exportar Agora"}
                </Button>
              </Card>

              {/* Opções Adicionais */}
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
              {/* Agendamentos Existentes */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Agendamentos Ativos</h3>
                <div className="space-y-3">
                  {AGENDAMENTOS.map(agend => (
                    <Card key={agend.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{agend.relatorio}</h4>
                            <Badge variant="default" className="text-xs">
                              {agend.formato}
                            </Badge>
                            {agend.ativo && (
                              <Badge variant="outline" className="text-xs">
                                ✓ Ativo
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mb-1">{agend.frequencia}</p>
                          <p className="text-xs text-slate-600">
                            📧 {agend.email} | Próximo: {agend.proxima}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <Button size="sm" variant="outline" className="text-xs flex-1">
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs flex-1">
                          Desativar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Criar Novo Agendamento */}
              <div>
                <h3 className="font-semibold text-sm mb-3">➕ Novo Agendamento</h3>
                <Card className="p-4 bg-slate-50">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold block mb-2">Relatório</label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                        {RELATORIOS_DISPONIVEIS.map(rel => (
                          <option key={rel.id} value={rel.id}>
                            {rel.titulo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold block mb-2">Formato</label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                        {FORMATOS.map(fmt => (
                          <option key={fmt.id} value={fmt.id}>
                            {fmt.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold block mb-2">Frequência</label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                        <option>Diário</option>
                        <option>Toda segunda-feira</option>
                        <option>Toda sexta-feira</option>
                        <option>Primeira segunda do mês</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold block mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                      />
                    </div>

                    <Button className="w-full gap-2">
                      <Clock className="w-4 h-4" />
                      Agendar Relatório
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Histórico de Exportações */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📜 Histórico de Exportações</h3>
            <div className="space-y-2">
              {[
                { data: "05 Fev 2026", relatorio: "Relatório Completo", formato: "PDF", tamanho: "2.4 MB" },
                { data: "03 Fev 2026", relatorio: "Resumo Executivo", formato: "PowerPoint", tamanho: "0.8 MB" },
                { data: "31 Jan 2026", relatorio: "Performance", formato: "Excel", tamanho: "1.5 MB" },
              ].map((item, idx) => (
                <Card key={idx} className="p-3 flex items-center justify-between">
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">{item.relatorio}</p>
                    <p className="text-xs text-slate-600">{item.data} • {item.formato}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600">{item.tamanho}</p>
                    <Button size="sm" variant="ghost" className="text-xs">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

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
