import { Mail, Send, BarChart3, Users, Calendar, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EmailMarketingSection() {
  const campaigns = [
    {
      id: 1,
      name: "Bem-vindo",
      template: "Boas-vindas com cupom",
      segmento: "Todos",
      status: "Ativo",
      abertura: "45%",
      clique: "12%",
      conversao: "8%",
      roi: "2.500%"
    },
    {
      id: 2,
      name: "Novo Produto",
      template: "Lançamento",
      segmento: "VIP + Ativos",
      status: "Ativo",
      abertura: "28%",
      clique: "8%",
      conversao: "4%",
      roi: "1.200%"
    },
    {
      id: 3,
      name: "Desconto Exclusivo",
      template: "Cupom",
      segmento: "Em Risco",
      status: "Agendado",
      abertura: "35%",
      clique: "15%",
      conversao: "6%",
      roi: "1.800%"
    },
    {
      id: 4,
      name: "Reativação",
      template: "Resgate",
      segmento: "Dormentes",
      status: "Ativo",
      abertura: "22%",
      clique: "6%",
      conversao: "2%",
      roi: "800%"
    }
  ];

  const templates = [
    {
      id: 1,
      nome: "Bem-vindo",
      descricao: "Email de boas-vindas com cupom",
      uso: 1.250
    },
    {
      id: 2,
      nome: "Novo Produto",
      descricao: "Anúncio de lançamento",
      uso: 890
    },
    {
      id: 3,
      nome: "Desconto",
      descricao: "Cupom e promoção",
      uso: 2.150
    },
    {
      id: 4,
      nome: "Reativação",
      descricao: "Resgate de cliente inativo",
      uso: 650
    },
    {
      id: 5,
      nome: "Agradecimento",
      descricao: "Pós-compra e feedback",
      uso: 1.890
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">12</div>
            <p className="text-xs text-slate-500 mt-1">+3 esta semana</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa Média Abertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">34%</div>
            <p className="text-xs text-slate-500 mt-1">Acima da média (28%)</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Receita/Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">R$ 285K</div>
            <p className="text-xs text-slate-500 mt-1">+18% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">ROI Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">1.760%</div>
            <p className="text-xs text-slate-500 mt-1">R$ 1 = R$ 17,60</p>
          </CardContent>
        </Card>
      </div>

      {/* Campanhas Ativas */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-rose-600" />
                Campanhas de Email
              </CardTitle>
              <CardDescription>Histórico de campanhas enviadas</CardDescription>
            </div>
            <Badge variant="secondary">Últimas 4</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                    <p className="text-sm text-slate-500">{campaign.template}</p>
                  </div>
                  <Badge variant={campaign.status === "Ativo" ? "default" : "secondary"}>
                    {campaign.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-5 gap-2 text-sm">
                  <div>
                    <p className="text-slate-500">Segmento</p>
                    <p className="font-medium text-slate-900">{campaign.segmento}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Abertura</p>
                    <p className="font-medium text-slate-900">{campaign.abertura}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Clique</p>
                    <p className="font-medium text-slate-900">{campaign.clique}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Conversão</p>
                    <p className="font-medium text-slate-900">{campaign.conversao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">ROI</p>
                    <p className="font-medium text-green-600">{campaign.roi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Disponíveis */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Templates Disponíveis
          </CardTitle>
          <CardDescription>5 templates prontos para usar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-slate-200/50 rounded-lg p-4 hover:bg-blue-50/50 transition cursor-pointer">
                <h4 className="font-semibold text-slate-900 mb-1">{template.nome}</h4>
                <p className="text-sm text-slate-600 mb-3">{template.descricao}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Usado {template.uso}x</span>
                  <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                    Usar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guia de Boas Práticas */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-slate-900">📧 Guia de Email Marketing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">✅ Melhores Práticas</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Enviar terça-quinta, 10h-14h (melhor abertura)</li>
              <li>Assunto máximo 60 caracteres</li>
              <li>Personalizar com nome do cliente</li>
              <li>CTA claro e único por email</li>
              <li>Testar antes de enviar em massa</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">📊 Segmentação Recomendada</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>VIP:</strong> Oferta exclusiva + acesso antecipado</li>
              <li><strong>Ativos:</strong> Novo produto + dica de uso</li>
              <li><strong>Em Risco:</strong> Cupom 15% + "Sentimos sua falta"</li>
              <li><strong>Dormentes:</strong> Reativação com oferta especial</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
