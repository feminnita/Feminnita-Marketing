import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, TrendingUp, BarChart3, Calendar, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function SistemaRelatoriosMensaisSection() {
  const [selectedMonth, setSelectedMonth] = useState(0);

  const relatorios = [
    {
      id: 1,
      mes: "Janeiro 2026",
      status: "Disponível",
      dataGeracao: "31 Jan",
      personas: 4,
      campanhas: 12,
      roi: 385,
      conversoes: 2850,
      views: 485000,
      engajamento: 13.8,
      tamanho: "2.4 MB",
    },
    {
      id: 2,
      mes: "Dezembro 2025",
      status: "Disponível",
      dataGeracao: "31 Dec",
      personas: 4,
      campanhas: 10,
      roi: 372,
      conversoes: 2650,
      views: 420000,
      engajamento: 12.9,
      tamanho: "2.1 MB",
    },
    {
      id: 3,
      mes: "Novembro 2025",
      status: "Disponível",
      dataGeracao: "30 Nov",
      personas: 4,
      campanhas: 9,
      roi: 358,
      conversoes: 2420,
      views: 385000,
      engajamento: 12.5,
      tamanho: "1.9 MB",
    },
  ];

  const currentRelatorio = relatorios[selectedMonth];

  const secoes = [
    {
      titulo: "Resumo Executivo",
      descricao: "KPIs principais, ROI, conversões e recomendações",
      paginas: 2,
      incluido: true,
    },
    {
      titulo: "Performance por Persona",
      descricao: "Análise detalhada de cada persona (Carol, Renata, Vanessa, Luiza)",
      paginas: 8,
      incluido: true,
    },
    {
      titulo: "Análise de Campanhas",
      descricao: "Performance de Google Ads, Meta Ads, TikTok Ads",
      paginas: 6,
      incluido: true,
    },
    {
      titulo: "Trends e Oportunidades",
      descricao: "Trends virais identificadas e recomendações de conteúdo",
      paginas: 4,
      incluido: true,
    },
    {
      titulo: "Análise de Concorrentes",
      descricao: "Benchmarking e estratégias dos concorrentes",
      paginas: 3,
      incluido: true,
    },
    {
      titulo: "Recomendações de Otimização",
      descricao: "Ações específicas para aumentar ROI e conversão",
      paginas: 5,
      incluido: true,
    },
  ];

  const metricas = [
    {
      titulo: "Visualizações",
      valor: (currentRelatorio.views / 1000).toFixed(0) + "K",
      mudanca: "+15%",
      cor: "blue",
    },
    {
      titulo: "Conversões",
      valor: currentRelatorio.conversoes,
      mudanca: "+18%",
      cor: "green",
    },
    {
      titulo: "Engajamento",
      valor: currentRelatorio.engajamento + "%",
      mudanca: "+8%",
      cor: "purple",
    },
    {
      titulo: "ROI",
      valor: currentRelatorio.roi + "%",
      mudanca: "+12%",
      cor: "pink",
    },
  ];

  const agendamento = [
    { dia: "Último dia do mês", hora: "23:59", ativo: true },
    { dia: "Primeiro dia do mês", hora: "08:00", ativo: true },
    { dia: "Toda segunda-feira", hora: "09:00", ativo: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Sistema de Relatórios Mensais Automáticos</h2>
        <p className="text-slate-600">Gere PDFs com análise completa de performance, ROI por persona e recomendações</p>
      </div>

      {/* Relatórios Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Relatórios Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relatorios.map((rel, idx) => (
              <button
                key={rel.id}
                onClick={() => setSelectedMonth(idx)}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  selectedMonth === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{rel.mes}</p>
                    <p className="text-sm text-slate-600">Gerado em {rel.dataGeracao}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{rel.status}</Badge>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Personas</p>
                    <p className="font-bold text-slate-900">{rel.personas}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Campanhas</p>
                    <p className="font-bold text-slate-900">{rel.campanhas}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">ROI</p>
                    <p className="font-bold text-green-600">{rel.roi}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Tamanho</p>
                    <p className="font-bold text-slate-900">{rel.tamanho}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>{currentRelatorio.mes}</CardTitle>
          <CardDescription>Relatório completo com {secoes.length} seções</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metricas.map((metrica, idx) => (
              <div key={idx} className={`bg-${metrica.cor}-50 rounded-lg p-4`}>
                <p className="text-sm text-slate-600">{metrica.titulo}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{metrica.valor}</p>
                <p className={`text-sm font-semibold text-${metrica.cor}-600 mt-1`}>{metrica.mudanca}</p>
              </div>
            ))}
          </div>

          {/* Seções do Relatório */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Seções Incluídas</h3>
            <div className="space-y-2">
              {secoes.map((secao, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{secao.titulo}</p>
                    <p className="text-sm text-slate-600">{secao.descricao}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{secao.paginas}p</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition font-semibold flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Baixar PDF
            </button>
            <button className="py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold flex items-center justify-center gap-2">
              <Mail className="w-5 h-5" />
              Enviar por Email
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Agendamento Automático */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agendamento Automático
          </CardTitle>
          <CardDescription>Configure quando os relatórios devem ser gerados automaticamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {agendamento.map((agenda, idx) => (
            <label key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={agenda.ativo}
                className="w-5 h-5"
                readOnly
              />
              <div className="flex-1">
                <p className="font-medium text-slate-900">{agenda.dia}</p>
                <p className="text-sm text-slate-600">Às {agenda.hora}</p>
              </div>
              <Badge className={agenda.ativo ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                {agenda.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Distribuição de Email */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição Automática por Email</CardTitle>
          <CardDescription>Envie relatórios automaticamente para stakeholders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Destinatários</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-slate-900">seu.email@feminnita.com.br</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-slate-900">gerente@feminnita.com.br</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-slate-900">financeiro@feminnita.com.br</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Adicionar Novo Destinatário</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="novo.email@feminnita.com.br"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
              />
              <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold">
                Adicionar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalização */}
      <Card>
        <CardHeader>
          <CardTitle>Personalização do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5" />
            <div>
              <p className="font-medium text-slate-900">Incluir Gráficos de Performance</p>
              <p className="text-sm text-slate-600">Visualizações de ROI, conversões e engajamento</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5" />
            <div>
              <p className="font-medium text-slate-900">Análise Comparativa Mensal</p>
              <p className="text-sm text-slate-600">Compare performance com mês anterior</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5" />
            <div>
              <p className="font-medium text-slate-900">Recomendações Personalizadas</p>
              <p className="text-sm text-slate-600">Sugestões de otimização por persona</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5" />
            <div>
              <p className="font-medium text-slate-900">Análise de Concorrentes</p>
              <p className="text-sm text-slate-600">Benchmarking com marcas similares</p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Histórico de Relatórios */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📊 Histórico de Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Total Gerado</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs mt-1">relatórios</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Tamanho Total</p>
              <p className="text-2xl font-bold">24.8</p>
              <p className="text-xs mt-1">MB</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Tempo Economizado</p>
              <p className="text-2xl font-bold">48h</p>
              <p className="text-xs mt-1">por ano</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Emails Enviados</p>
              <p className="text-2xl font-bold">36</p>
              <p className="text-xs mt-1">automaticamente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
