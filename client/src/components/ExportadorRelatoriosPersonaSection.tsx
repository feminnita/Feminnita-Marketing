import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, BarChart3, TrendingUp, Calendar, Mail } from "lucide-react";
import { useState } from "react";
import PersonaAvatar from "./PersonaAvatar";
import { toast } from "sonner";

export default function ExportadorRelatoriosPersonaSection() {
  const [selectedPersona, setSelectedPersona] = useState("Carol");
  const [reportFormat, setReportFormat] = useState("pdf");

  const personas = ["Carol", "Renata", "Vanessa", "Luiza"];

  const reportSections = [
    {
      id: 1,
      name: "Resumo Executivo",
      description: "Visão geral de performance, metas e recomendações",
      icon: BarChart3,
    },
    {
      id: 2,
      name: "Análise de Performance",
      description: "Conversão, engajamento, ROI e comparação com período anterior",
      icon: TrendingUp,
    },
    {
      id: 3,
      name: "Calendário de Conteúdo",
      description: "Posts planejados, trends aproveitadas e resultados",
      icon: Calendar,
    },
    {
      id: 4,
      name: "Recomendações Estratégicas",
      description: "Próximos passos, oportunidades e ajustes de budget",
      icon: FileText,
    },
  ];

  const reportTemplates = [
    {
      id: 1,
      name: "Relatório Semanal",
      description: "Performance da semana com insights e próximos passos",
      frequency: "Toda segunda-feira",
      pages: "4-6 páginas",
    },
    {
      id: 2,
      name: "Relatório Mensal",
      description: "Análise completa do mês com comparações e tendências",
      frequency: "Primeiro dia do mês",
      pages: "10-15 páginas",
    },
    {
      id: 3,
      name: "Relatório de Trends",
      description: "Trends aproveitadas, resultados e próximas oportunidades",
      frequency: "Conforme necessário",
      pages: "3-5 páginas",
    },
    {
      id: 4,
      name: "Relatório Comparativo",
      description: "Comparação entre todas as 4 personas",
      frequency: "Mensal",
      pages: "8-12 páginas",
    },
  ];

  const handleExport = () => {
    try {
      const content = JSON.stringify(
        {
          persona: selectedPersona,
          formato: reportFormat.toUpperCase(),
          secoes: reportSections.map(s => ({ nome: s.name, descricao: s.description })),
          templates: reportTemplates.map(t => ({ nome: t.name, descricao: t.description, frequencia: t.frequency })),
          geradoEm: new Date().toISOString(),
        },
        null,
        2
      );
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_${selectedPersona.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Relatório de ${selectedPersona} exportado com sucesso!`);
    } catch {
      toast.error("Erro ao exportar relatório");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Exportador de Relatórios por Persona</h2>
        <p className="text-slate-600">Gere PDFs com análise completa, recomendações e próximos passos</p>
      </div>

      {/* Quick Export */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatório Rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Persona Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Selecione a Persona</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {personas.map((persona) => (
                <button
                  key={persona}
                  onClick={() => setSelectedPersona(persona)}
                  className={`p-4 rounded-lg border-2 transition text-center ${
                    selectedPersona === persona
                      ? "border-pink-500 bg-pink-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <PersonaAvatar name={persona} size="md" />
                  <p className="font-semibold text-sm mt-2">{persona}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Formato de Exportação</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: "pdf", label: "PDF", icon: "📄" },
                { value: "powerpoint", label: "PowerPoint", icon: "📊" },
                { value: "excel", label: "Excel", icon: "📈" },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setReportFormat(format.value)}
                  className={`p-4 rounded-lg border-2 transition ${
                    reportFormat === format.value
                      ? "border-pink-500 bg-pink-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-2xl">{format.icon}</span>
                  <p className="font-semibold text-sm mt-2">{format.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Gerar Relatório de {selectedPersona}
          </button>
        </CardContent>
      </Card>

      {/* Report Sections Preview */}
      <Card>
        <CardHeader>
          <CardTitle>O que está incluído no relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <div key={section.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 text-pink-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">{section.name}</p>
                      <p className="text-sm text-slate-600 mt-1">{section.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Modelos de Relatório</CardTitle>
          <CardDescription>Escolha o tipo de relatório que você precisa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportTemplates.map((template) => (
              <div key={template.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{template.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                  </div>
                  <Badge variant="outline">{template.pages}</Badge>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-600">
                    <strong>Frequência:</strong> {template.frequency}
                  </span>
                  <button className="text-xs bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 transition">
                    Usar Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Relatórios Agendados
          </CardTitle>
          <CardDescription>Configure relatórios automáticos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Relatório Semanal - Carol",
                schedule: "Toda segunda-feira às 9h",
                recipients: "seu@email.com",
              },
              {
                name: "Relatório Mensal - Todas as Personas",
                schedule: "Primeiro dia do mês às 8h",
                recipients: "seu@email.com, gerente@empresa.com",
              },
            ].map((report, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{report.name}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    <strong>Agendamento:</strong> {report.schedule}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Destinatários:</strong> {report.recipients}
                  </p>
                </div>
                <button className="text-slate-600 hover:text-slate-900">⋮</button>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 hover:border-slate-400 transition font-medium">
            + Agendar Novo Relatório
          </button>
        </CardContent>
      </Card>

      {/* Email Integration */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Integração com Email
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-3">
          <p>Seus relatórios podem ser:</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Enviados automaticamente por email</li>
            <li>Compartilhados com sua equipe</li>
            <li>Anexados em propostas para clientes</li>
            <li>Integrados com Google Drive ou Dropbox</li>
            <li>Convertidos para diferentes formatos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
