import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Sheet, Mail } from 'lucide-react';

const REPORT_CATALOG = [
  {
    id: 1,
    nome: 'Dashboard Executivo',
    descricao: 'Resumo completo de performance e KPIs',
    formatos: ['PDF', 'Excel'],
  },
  {
    id: 2,
    nome: 'Análise de Personas',
    descricao: 'Performance detalhada de cada persona (Carol, Renata, Vanessa, Luiza)',
    formatos: ['PDF', 'Excel'],
  },
  {
    id: 3,
    nome: 'Relatório de Vendas',
    descricao: 'Vendas, conversão e ticket médio por canal',
    formatos: ['PDF', 'Excel', 'CSV'],
  },
  {
    id: 4,
    nome: 'Análise de ROI por Canal',
    descricao: 'ROI detalhado: Meta, Google, Email, WhatsApp, TikTok',
    formatos: ['PDF', 'Excel'],
  },
  {
    id: 5,
    nome: 'Relatório de Afiliados',
    descricao: 'Performance e comissões de cada afiliado',
    formatos: ['PDF', 'Excel'],
  },
];

export default function ExportarRelatorioSection() {
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [novoAgendamento, setNovoAgendamento] = useState({ relatorio: '', frequencia: 'Diária', horario: '', formato: 'PDF', email: '' });
  const [agendamentos, setAgendamentos] = useState<typeof novoAgendamento[]>([]);

  const toggleSelecionado = (id: number) => {
    setSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const criarAgendamento = () => {
    if (!novoAgendamento.relatorio || !novoAgendamento.email) return;
    setAgendamentos(prev => [...prev, { ...novoAgendamento }]);
    setNovoAgendamento({ relatorio: '', frequencia: 'Diária', horario: '', formato: 'PDF', email: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Exportar Relatórios</h2>
        <p className="text-slate-500 text-sm mt-1">Baixe relatórios em PDF ou Excel</p>
      </div>

      {/* Relatórios Disponíveis */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Relatórios disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {REPORT_CATALOG.map((rel) => (
            <div key={rel.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-slate-900">{rel.nome}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{rel.descricao}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selecionados.includes(rel.id)}
                  onChange={() => toggleSelecionado(rel.id)}
                  className="w-4 h-4 cursor-pointer mt-0.5"
                />
              </div>
              <div className="flex items-center gap-2">
                {rel.formatos.map((fmt) => (
                  <button key={fmt}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-100 transition text-xs font-semibold text-slate-600">
                    {fmt === 'PDF' ? <FileText className="w-3.5 h-3.5" /> : <Sheet className="w-3.5 h-3.5" />}
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ações em lote */}
      {selecionados.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-green-400 bg-green-50">
          <CardContent className="pt-4 pb-4 flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold">
              <Download className="w-4 h-4" />
              Baixar {selecionados.length} selecionado(s) (ZIP)
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-semibold">
              <Mail className="w-4 h-4" />
              Enviar por email
            </button>
          </CardContent>
        </Card>
      )}

      {/* Agendamentos criados */}
      {agendamentos.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Agendamentos ativos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {agendamentos.map((ag, idx) => (
              <div key={idx} className="p-3 border border-slate-200 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{ag.relatorio}</p>
                  <Badge variant="secondary" className="text-xs">{ag.frequencia}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{ag.email} • {ag.formato}{ag.horario ? ` • ${ag.horario}` : ''}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Criar agendamento */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Criar agendamento de envio automático</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Relatório</label>
              <select value={novoAgendamento.relatorio} onChange={e => setNovoAgendamento(f => ({ ...f, relatorio: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm">
                <option value="">Selecione...</option>
                {REPORT_CATALOG.map(rel => <option key={rel.id}>{rel.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Frequência</label>
              <select value={novoAgendamento.frequencia} onChange={e => setNovoAgendamento(f => ({ ...f, frequencia: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm">
                <option>Diária</option>
                <option>Semanal</option>
                <option>Mensal</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Horário</label>
              <input type="time" value={novoAgendamento.horario} onChange={e => setNovoAgendamento(f => ({ ...f, horario: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Formato</label>
              <select value={novoAgendamento.formato} onChange={e => setNovoAgendamento(f => ({ ...f, formato: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Email destinatário</label>
            <input type="email" placeholder="gerente@suaempresa.com.br" value={novoAgendamento.email}
              onChange={e => setNovoAgendamento(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm" />
          </div>
          <button onClick={criarAgendamento}
            disabled={!novoAgendamento.relatorio || !novoAgendamento.email}
            style={{ backgroundColor: '#8B2635' }}
            className="w-full py-2 text-white rounded text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            Criar agendamento
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
