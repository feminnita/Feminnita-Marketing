import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Sheet, Mail, CheckCircle } from 'lucide-react';

export default function ExportarRelatorioSection() {
  const [relatorios] = useState([
    {
      id: 1,
      nome: 'Dashboard Executivo',
      descricao: 'Resumo completo de performance e KPIs',
      tamanho: '2.4 MB',
      formato: ['PDF', 'Excel'],
      ultimaAtualizacao: '2026-02-01 14:30',
    },
    {
      id: 2,
      nome: 'Análise de Personas',
      descricao: 'Performance detalhada de cada persona (Carol, Renata, Vanessa, Luiza)',
      tamanho: '1.8 MB',
      formato: ['PDF', 'Excel'],
      ultimaAtualizacao: '2026-02-01 14:30',
    },
    {
      id: 3,
      nome: 'Relatório de Vendas Diário',
      descricao: 'Vendas, conversão e ticket médio por canal',
      tamanho: '0.9 MB',
      formato: ['PDF', 'Excel', 'CSV'],
      ultimaAtualizacao: '2026-02-01 14:30',
    },
    {
      id: 4,
      nome: 'Análise de ROI por Canal',
      descricao: 'ROI detalhado: Meta, Google, Email, WhatsApp, TikTok',
      tamanho: '1.5 MB',
      formato: ['PDF', 'Excel'],
      ultimaAtualizacao: '2026-02-01 14:30',
    },
    {
      id: 5,
      nome: 'Relatório de Afiliados',
      descricao: 'Performance e comissões de cada afiliado',
      tamanho: '0.7 MB',
      formato: ['PDF', 'Excel'],
      ultimaAtualizacao: '2026-02-01 14:30',
    },
  ]);

  const [agendamentos] = useState([
    {
      id: 1,
      nome: 'Relatório Diário de Vendas',
      frequencia: 'Diária',
      horario: '08:00',
      destinatarios: 'gerente@feminnita.com.br',
      formato: 'PDF',
      ativo: true,
    },
    {
      id: 2,
      nome: 'Relatório Semanal Executivo',
      frequencia: 'Semanal',
      horario: 'Segunda 09:00',
      destinatarios: 'diretoria@feminnita.com.br',
      formato: 'PDF',
      ativo: true,
    },
    {
      id: 3,
      nome: 'Análise Mensal de ROI',
      frequencia: 'Mensal',
      horario: '1º dia 10:00',
      destinatarios: 'equipe@feminnita.com.br',
      formato: 'Excel',
      ativo: true,
    },
  ]);

  const [selecionados, setSelecionados] = useState<number[]>([]);

  const toggleSelecionado = (id: number) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Exportar Relatórios</h2>
        <p className="text-sm text-slate-600 mt-1">Baixe relatórios em PDF ou Excel</p>
      </div>

      {/* Relatórios Disponíveis */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
          <CardDescription>Clique para baixar ou agendar envio automático</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {relatorios.map((rel) => (
            <div key={rel.id} className="p-4 bg-amber-50 rounded-lg border border-amber-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{rel.nome}</h4>
                  <p className="text-sm text-slate-600 mt-1">{rel.descricao}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>Tamanho: {rel.tamanho}</span>
                    <span>Atualizado: {rel.ultimaAtualizacao}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selecionados.includes(rel.id)}
                  onChange={() => toggleSelecionado(rel.id)}
                  className="w-5 h-5 rounded border-amber-300 text-amber-600 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {rel.formato.map((fmt) => (
                  <button
                    key={fmt}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200 rounded hover:bg-amber-50 transition-colors text-sm font-semibold text-amber-700"
                  >
                    {fmt === 'PDF' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <Sheet className="w-4 h-4" />
                    )}
                    Baixar {fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ações em Lote */}
      {selecionados.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">{selecionados.length} relatório(s) selecionado(s)</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
              <Download className="w-4 h-4" />
              Baixar Selecionados (ZIP)
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold">
              <Mail className="w-4 h-4" />
              Enviar por Email
            </button>
          </CardContent>
        </Card>
      )}

      {/* Agendamentos */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle>Envios Automáticos Agendados</CardTitle>
          <CardDescription>Relatórios enviados automaticamente por email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agendamentos.map((agenda) => (
              <div key={agenda.id} className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{agenda.nome}</h4>
                      {agenda.ativo && (
                        <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{agenda.destinatarios}</p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">⋮</button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Frequência</p>
                    <p className="font-semibold text-slate-900">{agenda.frequencia}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Horário</p>
                    <p className="font-semibold text-slate-900">{agenda.horario}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Formato</p>
                    <p className="font-semibold text-slate-900">{agenda.formato}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Criar Novo Agendamento */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle>Criar Novo Agendamento</CardTitle>
          <CardDescription>Configure um novo envio automático de relatório</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Relatório</label>
              <select className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white text-slate-900">
                <option>Selecione um relatório...</option>
                {relatorios.map(rel => (
                  <option key={rel.id}>{rel.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Frequência</label>
              <select className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white text-slate-900">
                <option>Diária</option>
                <option>Semanal</option>
                <option>Mensal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Horário</label>
              <input type="time" className="w-full px-3 py-2 border border-amber-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Formato</label>
              <select className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white text-slate-900">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Destinatários</label>
            <input
              type="email"
              placeholder="email@feminnita.com.br"
              className="w-full px-3 py-2 border border-amber-300 rounded-lg"
            />
          </div>
          <button className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold">
            Criar Agendamento
          </button>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle>Estatísticas de Exportação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-700">1.240</p>
            <p className="text-xs text-slate-600 mt-1">Downloads este mês</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-700">89%</p>
            <p className="text-xs text-slate-600 mt-1">PDF (vs Excel)</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-700">15</p>
            <p className="text-xs text-slate-600 mt-1">Agendamentos ativos</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-700">98%</p>
            <p className="text-xs text-slate-600 mt-1">Taxa de entrega</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
