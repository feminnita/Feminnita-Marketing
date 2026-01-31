import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Link2, TrendingUp, Users, DollarSign, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

const CRM_OPTIONS = [
  {
    id: "salesforce",
    nome: "Salesforce",
    logo: "☁️",
    status: "Conectado",
    features: ["Leads", "Oportunidades", "Contas", "Contatos"],
    url: "https://www.salesforce.com"
  },
  {
    id: "pipedrive",
    nome: "Pipedrive",
    logo: "🔄",
    status: "Disponível",
    features: ["Pipeline", "Deals", "Pessoas", "Empresas"],
    url: "https://www.pipedrive.com"
  },
  {
    id: "hubspot",
    nome: "HubSpot",
    logo: "🎯",
    status: "Disponível",
    features: ["CRM", "Email", "Automação", "Relatórios"],
    url: "https://www.hubspot.com"
  },
  {
    id: "zoho",
    nome: "Zoho CRM",
    logo: "📊",
    status: "Disponível",
    features: ["Leads", "Vendas", "Suporte", "Automação"],
    url: "https://www.zoho.com/crm"
  },
];

const LEADS_SYNC = [
  {
    id: 1,
    nome: "Carol - Meu Primeiro Pedido",
    email: "carol@email.com",
    persona: "Carol",
    status: "Convertido",
    valor: "R$ 450",
    data: "2026-02-01"
  },
  {
    id: 2,
    nome: "Renata - Análise Qualidade",
    email: "renata@loja.com",
    persona: "Renata",
    status: "Qualificado",
    valor: "R$ 2.500",
    data: "2026-02-02"
  },
  {
    id: 3,
    nome: "Vanessa - Compra Coletiva",
    email: "vanessa@grupo.com",
    persona: "Vanessa",
    status: "Negociação",
    valor: "R$ 1.800",
    data: "2026-02-03"
  },
  {
    id: 4,
    nome: "Luiza - Pijama Inverno",
    email: "luiza@influencer.com",
    persona: "Luiza",
    status: "Convertido",
    valor: "R$ 5.200",
    data: "2026-02-04"
  },
  {
    id: 5,
    nome: "Cliente Novo - TikTok",
    email: "novo@cliente.com",
    persona: "Carol",
    status: "Novo Lead",
    valor: "R$ 300",
    data: "2026-02-05"
  },
];

export default function IntegracaoCRMSection() {
  const [selectedCRM, setSelectedCRM] = useState("salesforce");
  const [selectedLead, setSelectedLead] = useState<number | null>(null);

  const totalLeads = LEADS_SYNC.length;
  const convertidos = LEADS_SYNC.filter(l => l.status === "Convertido").length;
  const valorTotal = LEADS_SYNC.reduce((acc, l) => acc + parseInt(l.valor.replace(/\D/g, "")), 0);

  const getStatusColor = (status: string) => {
    if (status === "Convertido") return "bg-green-100 text-green-800";
    if (status === "Qualificado") return "bg-blue-100 text-blue-800";
    if (status === "Negociação") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
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
            Sincronize leads e conversões automaticamente com Salesforce, Pipedrive, HubSpot ou Zoho. Rastreie funil de vendas completo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de CRM */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Conectar CRM</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {CRM_OPTIONS.map(crm => (
                <Card
                  key={crm.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedCRM === crm.id
                      ? "border-2 border-cyan-500 bg-cyan-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedCRM(crm.id)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{crm.logo} {crm.nome}</h4>
                      <Badge
                        variant={crm.status === "Conectado" ? "default" : "secondary"}
                        className="text-xs mt-1"
                      >
                        {crm.status === "Conectado" ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {crm.status}
                          </>
                        ) : (
                          crm.status
                        )}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    {crm.features.join(", ")}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(crm.url, "_blank");
                    }}
                    className="w-full text-xs gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {crm.status === "Conectado" ? "Gerenciar" : "Conectar"}
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-4 gap-3">
            <Card className="bg-blue-50 p-4">
              <h4 className="font-semibold text-sm mb-2">📊 Total de Leads</h4>
              <div className="text-2xl font-bold text-blue-600">{totalLeads}</div>
              <p className="text-xs text-slate-600 mt-1">Sincronizados</p>
            </Card>

            <Card className="bg-green-50 p-4">
              <h4 className="font-semibold text-sm mb-2">✅ Convertidos</h4>
              <div className="text-2xl font-bold text-green-600">{convertidos}</div>
              <p className="text-xs text-slate-600 mt-1">{((convertidos / totalLeads) * 100).toFixed(0)}% taxa</p>
            </Card>

            <Card className="bg-purple-50 p-4">
              <h4 className="font-semibold text-sm mb-2">💰 Valor Total</h4>
              <div className="text-2xl font-bold text-purple-600">R$ {(valorTotal / 1000).toFixed(1)}K</div>
              <p className="text-xs text-slate-600 mt-1">Oportunidades</p>
            </Card>

            <Card className="bg-orange-50 p-4">
              <h4 className="font-semibold text-sm mb-2">🔄 Sincronizações</h4>
              <div className="text-2xl font-bold text-orange-600">24</div>
              <p className="text-xs text-slate-600 mt-1">Últimas 24h</p>
            </Card>
          </div>

          {/* Leads Sincronizados */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Leads Sincronizados</h3>
            <div className="space-y-3">
              {LEADS_SYNC.map(lead => (
                <Card
                  key={lead.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{lead.nome}</h4>
                        <Badge className={getStatusColor(lead.status)} variant="outline">
                          {lead.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-2">
                        <span>📧 {lead.email}</span>
                        <span>👤 {lead.persona}</span>
                        <span>💰 {lead.valor}</span>
                        <span>📅 {lead.data}</span>
                      </div>

                      {selectedLead === lead.id && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="grid md:grid-cols-3 gap-2 text-xs">
                            <Button size="sm" variant="outline" className="gap-1">
                              <Link2 className="w-3 h-3" />
                              Ver no CRM
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Users className="w-3 h-3" />
                              Contato
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Histórico
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Mapeamento de Campos */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Mapeamento de Campos</h3>
            <Card className="p-4 bg-slate-50">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Nome</span>
                  <span className="font-semibold text-slate-900">→ Lead Name</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Email</span>
                  <span className="font-semibold text-slate-900">→ Email Address</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Persona</span>
                  <span className="font-semibold text-slate-900">→ Custom Field: Persona</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Valor</span>
                  <span className="font-semibold text-slate-900">→ Deal Value</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status</span>
                  <span className="font-semibold text-slate-900">→ Lead Status</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Automações */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Automações Ativas</h3>
            <div className="space-y-2">
              <Card className="p-3 bg-green-50 border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Novo Lead → CRM</p>
                    <p className="text-xs text-slate-600">Cria lead automaticamente quando alguém converte</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-green-50 border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Conversão → Deal</p>
                    <p className="text-xs text-slate-600">Cria deal com valor quando venda é confirmada</p>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-green-50 border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Sincronização Bidirecional</p>
                    <p className="text-xs text-slate-600">Atualiza dados em tempo real nos dois sentidos</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Guia Rápido */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">📋 Como Usar</h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>1. <strong>Selecione seu CRM</strong> (Salesforce, Pipedrive, HubSpot ou Zoho)</li>
              <li>2. <strong>Clique em "Conectar"</strong> e autorize a integração</li>
              <li>3. <strong>Mapeie os campos</strong> (nome, email, valor, status)</li>
              <li>4. <strong>Ative as automações</strong> (novo lead, conversão, sincronização)</li>
              <li>5. <strong>Acompanhe os leads</strong> no CRM em tempo real</li>
              <li>6. <strong>Analise funil de vendas</strong> completo com dados de campanhas</li>
            </ol>
          </Card>

          {/* Recursos Adicionais */}
          <div className="grid md:grid-cols-2 gap-3">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">📚 Documentação</h4>
              <p className="text-xs text-slate-600 mb-3">
                Guias de integração para cada CRM
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://developers.salesforce.com", "_blank")}
                className="w-full text-xs"
              >
                Ver Docs
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎓 Tutoriais</h4>
              <p className="text-xs text-slate-600 mb-3">
                Vídeos de setup e melhores práticas
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://www.youtube.com", "_blank")}
                className="w-full text-xs"
              >
                Assistir
              </Button>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
