import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Link2, TrendingUp, Users, ExternalLink, AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: number;
  nome: string;
  email: string;
  persona: string;
  status: "Novo Lead" | "Qualificado" | "Negociação" | "Convertido";
  valor: string;
  data: string;
}

const CRM_OPTIONS = [
  { id: "salesforce", nome: "Salesforce", logo: "☁️", features: ["Leads", "Oportunidades", "Contas", "Contatos"], url: "https://www.salesforce.com" },
  { id: "pipedrive", nome: "Pipedrive", logo: "🔄", features: ["Pipeline", "Deals", "Pessoas", "Empresas"], url: "https://www.pipedrive.com" },
  { id: "hubspot", nome: "HubSpot", logo: "🎯", features: ["CRM", "Email", "Automação", "Relatórios"], url: "https://www.hubspot.com" },
  { id: "zoho", nome: "Zoho CRM", logo: "📊", features: ["Leads", "Vendas", "Suporte", "Automação"], url: "https://www.zoho.com/crm" },
];

const PERSONAS = ["Carol (Renda Extra)", "Renata (Lojista)", "Vanessa (Compra Coletiva)", "Luiza (Trendsetter)"];
const STATUS_OPCOES = ["Novo Lead", "Qualificado", "Negociação", "Convertido"] as const;

export default function IntegracaoCRMSection() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<number | null>(null);
  const [novoLead, setNovoLead] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', persona: PERSONAS[0], status: 'Novo Lead' as Lead['status'], valor: '', data: '' });

  const adicionarLead = () => {
    if (!form.nome.trim()) { toast.error('Informe o nome do lead.'); return; }
    const novo: Lead = {
      id: Date.now(),
      nome: form.nome,
      email: form.email,
      persona: form.persona,
      status: form.status,
      valor: form.valor ? `R$ ${form.valor}` : '—',
      data: form.data || new Date().toISOString().split('T')[0],
    };
    setLeads(prev => [novo, ...prev]);
    setForm({ nome: '', email: '', persona: PERSONAS[0], status: 'Novo Lead', valor: '', data: '' });
    setNovoLead(false);
    toast.success('Lead adicionado.');
  };

  const atualizarStatus = (id: number, status: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const remover = (id: number) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    setSelectedLead(null);
  };

  const convertidos = leads.filter(l => l.status === 'Convertido').length;

  const getStatusColor = (status: string) => {
    if (status === 'Convertido') return 'bg-green-100 text-green-800';
    if (status === 'Qualificado') return 'bg-blue-100 text-blue-800';
    if (status === 'Negociação') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-600" />
            Integração com CRM
          </CardTitle>
          <CardDescription>
            Sincronize leads e conversões com Salesforce, Pipedrive, HubSpot ou Zoho. Rastreie funil de vendas completo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aviso de integração */}
          <Card className="border-l-4 border-l-amber-500 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Integração com CRM requer configuração no backend</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Para sincronização automática de leads, configure as credenciais de API do CRM escolhido no servidor. Por enquanto, cadastre leads manualmente para rastrear o funil de vendas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CRMs disponíveis */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Conectar CRM</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {CRM_OPTIONS.map(crm => (
                <Card key={crm.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{crm.logo} {crm.nome}</h4>
                      <Badge variant="secondary" className="text-xs mt-1">Disponível</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">{crm.features.join(", ")}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.error(`Integração com ${crm.nome} requer configuração de API no backend.`)}
                    className="w-full text-xs gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Conectar
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Estatísticas reais */}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Total de Leads</p>
              <p className="text-2xl font-bold text-blue-600">{leads.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Convertidos</p>
              <p className="text-2xl font-bold text-green-600">{convertidos}</p>
              {leads.length > 0 && <p className="text-xs text-slate-500">{((convertidos / leads.length) * 100).toFixed(0)}% taxa</p>}
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Em Negociação</p>
              <p className="text-2xl font-bold text-purple-600">{leads.filter(l => l.status === 'Negociação').length}</p>
            </div>
          </div>

          {/* Botão adicionar lead */}
          <Button onClick={() => setNovoLead(!novoLead)} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4" />
            Adicionar Lead Manualmente
          </Button>

          {/* Formulário */}
          {novoLead && (
            <Card className="p-4 bg-cyan-50 border-cyan-200">
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Nome</label>
                    <input type="text" placeholder="Nome do lead" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Email</label>
                    <input type="email" placeholder="email@exemplo.com" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Persona</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}>
                      {PERSONAS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Status</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Lead['status'] }))}>
                      {STATUS_OPCOES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Valor Estimado (R$)</label>
                    <input type="number" min="0" placeholder="0,00" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Data</label>
                    <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={adicionarLead} className="flex-1 bg-green-600 hover:bg-green-700">Adicionar Lead</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setNovoLead(false)}>Cancelar</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Lista de leads */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Leads Cadastrados</h3>
            {leads.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-300 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500 text-sm">Nenhum lead cadastrado.</p>
                <p className="text-xs text-slate-400 mt-1">Adicione leads manualmente ou conecte um CRM para sincronização automática.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map(lead => (
                  <Card
                    key={lead.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{lead.nome}</h4>
                          <Badge className={getStatusColor(lead.status)} variant="outline">{lead.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                          {lead.email && <span>📧 {lead.email}</span>}
                          <span>👤 {lead.persona}</span>
                          {lead.valor !== '—' && <span>💰 {lead.valor}</span>}
                          <span>📅 {lead.data}</span>
                        </div>
                        {selectedLead === lead.id && (
                          <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2 flex-wrap">
                            {STATUS_OPCOES.filter(s => s !== lead.status).map(s => (
                              <Button key={s} size="sm" variant="outline" className="text-xs" onClick={e => { e.stopPropagation(); atualizarStatus(lead.id, s); }}>
                                → {s}
                              </Button>
                            ))}
                            <Button size="sm" variant="outline" className="text-red-600 text-xs" onClick={e => { e.stopPropagation(); remover(lead.id); }}>
                              Remover
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Mapeamento de Campos */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Mapeamento de Campos (referência)</h3>
            <Card className="p-4 bg-slate-50">
              <div className="space-y-2 text-sm">
                {[['Nome', 'Lead Name'], ['Email', 'Email Address'], ['Persona', 'Custom Field: Persona'], ['Valor', 'Deal Value'], ['Status', 'Lead Status']].map(([from, to]) => (
                  <div key={from} className="flex items-center justify-between">
                    <span className="text-slate-600">{from}</span>
                    <span className="font-semibold text-slate-900">→ {to}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Guia */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">📋 Como Usar</h4>
            <ol className="text-sm space-y-1 text-slate-700">
              <li>1. <strong>Adicione leads manualmente</strong> à medida que surgem</li>
              <li>2. <strong>Atualize o status</strong> clicando no lead conforme avança no funil</li>
              <li>3. <strong>Conecte um CRM</strong> (requer configuração de API no backend) para automatizar</li>
              <li>4. <strong>Monitore a taxa de conversão</strong> nas estatísticas acima</li>
            </ol>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
