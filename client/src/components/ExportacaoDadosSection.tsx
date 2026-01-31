import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Sheet, PieChart, Calendar, Filter, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ExportacaoDadosSection() {
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedPeriodo, setSelectedPeriodo] = useState("mes");
  const [selectedPersona, setSelectedPersona] = useState("todas");

  const formatos = [
    { id: "pdf", nome: "PDF", descricao: "Relatório formatado e pronto para impressão", icone: "📄" },
    { id: "excel", nome: "Excel", descricao: "Planilha com dados brutos para análise", icone: "📊" },
    { id: "csv", nome: "CSV", descricao: "Arquivo de texto separado por vírgulas", icone: "📋" },
    { id: "json", nome: "JSON", descricao: "Formato estruturado para integração", icone: "{}"},
  ];

  const relatorios = [
    {
      id: 1,
      nome: "Relatório de Performance Geral",
      descricao: "Análise completa de todas as personas",
      secoes: 8,
      tamanho: "2.4 MB",
      data: "31 Jan 2026",
      status: "Pronto",
    },
    {
      id: 2,
      nome: "Análise de Conversão por Persona",
      descricao: "Detalhamento de conversões e ROI",
      secoes: 6,
      tamanho: "1.8 MB",
      data: "31 Jan 2026",
      status: "Pronto",
    },
    {
      id: 3,
      nome: "Relatório de Tendências Virais",
      descricao: "Trends detectadas e oportunidades",
      secoes: 4,
      tamanho: "1.2 MB",
      data: "31 Jan 2026",
      status: "Pronto",
    },
    {
      id: 4,
      nome: "Análise de Influenciadores",
      descricao: "Performance e ROI de parcerias",
      secoes: 5,
      tamanho: "1.5 MB",
      data: "31 Jan 2026",
      status: "Pronto",
    },
  ];

  const secoes = [
    { nome: "Resumo Executivo", ativo: true },
    { nome: "Métricas Principais", ativo: true },
    { nome: "Análise por Persona", ativo: true },
    { nome: "Funil de Conversão", ativo: true },
    { nome: "Tendências Virais", ativo: true },
    { nome: "Análise de Concorrentes", ativo: true },
    { nome: "Recomendações", ativo: true },
    { nome: "Dados Brutos", ativo: false },
  ];

  const periodos = [
    { id: "hoje", nome: "Hoje" },
    { id: "semana", nome: "Última Semana" },
    { id: "mes", nome: "Último Mês" },
    { id: "trimestre", nome: "Último Trimestre" },
    { id: "ano", nome: "Último Ano" },
    { id: "customizado", nome: "Customizado" },
  ];

  const personas = [
    { id: "todas", nome: "Todas as Personas" },
    { id: "carol", nome: "Carol" },
    { id: "renata", nome: "Renata" },
    { id: "vanessa", nome: "Vanessa" },
    { id: "luiza", nome: "Luiza" },
  ];

  const exportacoes = [
    {
      nome: "Relatório Mensal - Janeiro",
      formato: "PDF",
      tamanho: "2.4 MB",
      data: "31 Jan 14:32",
      status: "Concluído",
    },
    {
      nome: "Dados de Performance - Carol",
      formato: "Excel",
      tamanho: "1.8 MB",
      data: "30 Jan 10:15",
      status: "Concluído",
    },
    {
      nome: "Análise de Conversão",
      formato: "CSV",
      tamanho: "0.9 MB",
      data: "29 Jan 16:45",
      status: "Concluído",
    },
    {
      nome: "Dados Brutos - Semana",
      formato: "JSON",
      tamanho: "3.2 MB",
      data: "28 Jan 09:20",
      status: "Concluído",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Exportação de Dados</h2>
        <p className="text-slate-600">Exporte relatórios e dados em múltiplos formatos</p>
      </div>

      {/* Criador de Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Criar Nova Exportação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formato */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">Formato de Saída</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formatos.map((formato) => (
                <button
                  key={formato.id}
                  onClick={() => setSelectedFormat(formato.id)}
                  className={`p-4 rounded-lg border-2 transition text-center ${
                    selectedFormat === formato.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="text-2xl mb-2">{formato.icone}</p>
                  <p className="font-semibold text-slate-900 text-sm">{formato.nome}</p>
                  <p className="text-xs text-slate-600 mt-1">{formato.descricao}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">Período</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {periodos.map((periodo) => (
                <button
                  key={periodo.id}
                  onClick={() => setSelectedPeriodo(periodo.id)}
                  className={`p-3 rounded-lg border-2 transition text-left ${
                    selectedPeriodo === periodo.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="font-medium text-slate-900 text-sm">{periodo.nome}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Persona */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">Persona</label>
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            >
              {personas.map((persona) => (
                <option key={persona.id} value={persona.id}>
                  {persona.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Seções */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">Seções a Incluir</label>
            <div className="space-y-2">
              {secoes.map((secao) => (
                <label key={secao.nome} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={secao.ativo}
                    readOnly
                    className="w-4 h-4"
                  />
                  <span className="text-slate-900 font-medium">{secao.nome}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botão de Exportação */}
          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Gerar e Baixar Exportação
          </button>
        </CardContent>
      </Card>

      {/* Relatórios Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
          <CardDescription>Modelos pré-configurados prontos para download</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relatorios.map((relatorio) => (
              <div key={relatorio.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{relatorio.nome}</p>
                    <p className="text-sm text-slate-600 mt-1">{relatorio.descricao}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{relatorio.status}</Badge>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Seções</p>
                    <p className="font-bold text-slate-900">{relatorio.secoes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Tamanho</p>
                    <p className="font-bold text-slate-900">{relatorio.tamanho}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Data</p>
                    <p className="font-bold text-slate-900">{relatorio.data}</p>
                  </div>
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded hover:from-pink-600 hover:to-purple-600 transition font-semibold text-sm flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Baixar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Exportações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Exportações</CardTitle>
          <CardDescription>Últimas exportações realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exportacoes.map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-2xl">
                    {exp.formato === "PDF" && "📄"}
                    {exp.formato === "Excel" && "📊"}
                    {exp.formato === "CSV" && "📋"}
                    {exp.formato === "JSON" && "{}"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{exp.nome}</p>
                    <p className="text-xs text-slate-600">{exp.data} • {exp.tamanho}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">{exp.formato}</Badge>
                  <button className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded hover:from-blue-600 hover:to-cyan-600 transition font-semibold text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Baixar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros Avançados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Data Inicial</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Data Final</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Métrica Mínima de Conversão</label>
            <input type="number" placeholder="Ex: 100" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Incluir Dados Brutos</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-slate-900">Incluir todos os dados brutos na exportação</span>
            </label>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition font-semibold">
            Aplicar Filtros
          </button>
        </CardContent>
      </Card>

      {/* Agendamento de Exportações */}
      <Card>
        <CardHeader>
          <CardTitle>Agendar Exportações Automáticas</CardTitle>
          <CardDescription>Configure exportações recorrentes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Frequência</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option>Semanal</option>
              <option>Quinzenal</option>
              <option>Mensal</option>
              <option>Trimestral</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Dia da Semana</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option>Segunda-feira</option>
              <option>Terça-feira</option>
              <option>Quarta-feira</option>
              <option>Quinta-feira</option>
              <option>Sexta-feira</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Horário</label>
            <input type="time" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Enviar para Email</label>
            <input type="email" placeholder="seu.email@feminnita.com.br" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition font-semibold">
            Agendar Exportação Automática
          </button>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">📊 Estatísticas de Exportação</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Exportações Este Mês</p>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs mt-1">+18% vs mês anterior</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Dados Exportados</p>
              <p className="text-2xl font-bold">45.2 GB</p>
              <p className="text-xs mt-1">Armazenado</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Formato Mais Usado</p>
              <p className="text-2xl font-bold">PDF</p>
              <p className="text-xs mt-1">62% das exportações</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Tempo Médio</p>
              <p className="text-2xl font-bold">2.3s</p>
              <p className="text-xs mt-1">Geração</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
