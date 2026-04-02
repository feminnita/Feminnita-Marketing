import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Mail, MessageCircle, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Relatorio {
  id: number;
  nome: string;
  frequencia: string;
  horario: string;
  canal: string;
  destinatarios: string;
  ativo: boolean;
}

const TEMPLATES = [
  { nome: 'Relatório Diário', campos: 'Vendas, ROI, Top Produtos, Alertas' },
  { nome: 'Relatório Semanal', campos: 'Performance, Comparativo, Tendências' },
  { nome: 'Relatório Mensal', campos: 'Resumo, Análise, Recomendações' },
  { nome: 'Alerta de Oportunidade', campos: 'Produto, Persona, Recomendação' },
];

export default function AutomacaoRelatoriosAgendadosSection() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [novoRelatorio, setNovoRelatorio] = useState(false);
  const [form, setForm] = useState({
    nome: '', frequencia: 'Diária', horario: '08:00', canal: 'Email', destinatarios: '',
  });

  const criarRelatorio = () => {
    if (!form.nome.trim() || !form.destinatarios.trim()) {
      toast.error('Preencha nome e destinatários.');
      return;
    }
    const novo: Relatorio = {
      id: Date.now(),
      nome: form.nome,
      frequencia: form.frequencia,
      horario: form.horario,
      canal: form.canal,
      destinatarios: form.destinatarios,
      ativo: true,
    };
    setRelatorios(prev => [...prev, novo]);
    setForm({ nome: '', frequencia: 'Diária', horario: '08:00', canal: 'Email', destinatarios: '' });
    setNovoRelatorio(false);
    toast.success('Relatório agendado criado. Configure o envio automático no backend para ativá-lo.');
  };

  const toggleAtivo = (id: number) => {
    setRelatorios(prev => prev.map(r => r.id === id ? { ...r, ativo: !r.ativo } : r));
  };

  const remover = (id: number) => {
    setRelatorios(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Aviso */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Envio automático requer configuração no backend</p>
              <p className="text-sm text-slate-600 mt-1">
                Para que os relatórios sejam enviados automaticamente, configure um job no servidor com as credenciais de email/WhatsApp. Esta tela cria os agendamentos — o envio real precisa de integração adicional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contadores reais */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Relatórios Configurados</p>
          <p className="text-2xl font-bold text-slate-900">{relatorios.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Ativos</p>
          <p className="text-2xl font-bold text-green-600">{relatorios.filter(r => r.ativo).length}</p>
        </div>
      </div>

      {/* Botão criar */}
      <Button onClick={() => setNovoRelatorio(!novoRelatorio)} className="w-full bg-blue-600 hover:bg-blue-700 gap-2" size="lg">
        <Plus className="w-5 h-5" />
        Criar Relatório Agendado
      </Button>

      {/* Formulário */}
      {novoRelatorio && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Nome do Relatório</label>
              <input
                type="text" placeholder="Ex: Relatório Diário de Vendas"
                className="w-full px-3 py-2 border border-slate-300 rounded"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Frequência</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.frequencia}
                  onChange={e => setForm(f => ({ ...f, frequencia: e.target.value }))}
                >
                  <option>Diária</option>
                  <option>Semanal</option>
                  <option>Mensal</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Horário</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.horario}
                  onChange={e => setForm(f => ({ ...f, horario: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Canal</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.canal}
                  onChange={e => setForm(f => ({ ...f, canal: e.target.value }))}
                >
                  <option>Email</option>
                  <option>WhatsApp</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Destinatários</label>
              <input
                type="text" placeholder="email@exemplo.com ou +55 11 99999-9999"
                className="w-full px-3 py-2 border border-slate-300 rounded"
                value={form.destinatarios}
                onChange={e => setForm(f => ({ ...f, destinatarios: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={criarRelatorio} className="flex-1 bg-green-600 hover:bg-green-700">Salvar Agendamento</Button>
              <Button variant="outline" className="flex-1" onClick={() => setNovoRelatorio(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Relatórios Agendados</CardTitle>
          <CardDescription>Automação de envio por email e WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          {relatorios.length === 0 ? (
            <div className="py-10 text-center">
              <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Nenhum relatório agendado.</p>
              <p className="text-sm text-slate-400 mt-1">Crie um agendamento acima para automatizar o envio de relatórios.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relatorios.map((rel) => (
                <div key={rel.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-900">{rel.nome}</h4>
                        {rel.ativo ? (
                          <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600">
                        <div>
                          <p className="text-xs text-slate-500">Frequência</p>
                          <p className="font-semibold text-slate-900">{rel.frequencia}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Horário</p>
                          <p className="font-semibold text-slate-900">{rel.horario}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Canal</p>
                          <div className="flex items-center gap-1 mt-1">
                            {rel.canal === 'Email' ? (
                              <Mail className="w-4 h-4 text-blue-600" />
                            ) : (
                              <MessageCircle className="w-4 h-4 text-green-600" />
                            )}
                            <span className="font-semibold text-slate-900">{rel.canal}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Destinatário</p>
                          <p className="font-semibold text-slate-900 truncate">{rel.destinatarios}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => toggleAtivo(rel.id)}>
                        {rel.ativo ? 'Pausar' : 'Ativar'}
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => remover(rel.id)}>
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Templates de Relatórios</CardTitle>
          <CardDescription>Modelos prontos para usar como base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((template, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-1">{template.nome}</h4>
                <p className="text-sm text-slate-600">{template.campos}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 text-xs"
                  onClick={() => {
                    setForm(f => ({ ...f, nome: template.nome }));
                    setNovoRelatorio(true);
                  }}
                >
                  Usar Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
