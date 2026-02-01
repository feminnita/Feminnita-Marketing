import { Users, Search, Phone, Mail, Calendar, DollarSign, MessageSquare, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function CRMClientesSection() {
  const clientes = [
    {
      id: 1,
      nome: "Maria Silva",
      email: "maria@email.com",
      telefone: "(11) 98765-4321",
      segmento: "VIP",
      ultimaCompra: "15/01/2026",
      ltv: "R$ 8.500",
      compras: 12,
      notas: "Gosta de pijama rosa, compra a cada 2 semanas"
    },
    {
      id: 2,
      nome: "João Santos",
      email: "joao@email.com",
      telefone: "(21) 99876-5432",
      segmento: "Ativos",
      ultimaCompra: "10/01/2026",
      ltv: "R$ 3.200",
      compras: 5,
      notas: "Revendedor, pedidos em lote"
    },
    {
      id: 3,
      nome: "Ana Costa",
      email: "ana@email.com",
      telefone: "(31) 97654-3210",
      segmento: "Em Risco",
      ultimaCompra: "05/12/2025",
      ltv: "R$ 1.800",
      compras: 3,
      notas: "Sem compra há 57 dias, enviar cupom"
    },
    {
      id: 4,
      nome: "Paula Oliveira",
      email: "paula@email.com",
      telefone: "(41) 98765-0987",
      segmento: "VIP",
      ultimaCompra: "20/01/2026",
      ltv: "R$ 12.300",
      compras: 18,
      notas: "Cliente premium, melhor LTV"
    },
    {
      id: 5,
      nome: "Carlos Mendes",
      email: "carlos@email.com",
      telefone: "(51) 99876-1234",
      segmento: "Dormentes",
      ultimaCompra: "15/10/2025",
      ltv: "R$ 900",
      compras: 2,
      notas: "Sem atividade há 108 dias"
    }
  ];

  const segmentStats = [
    { nome: "VIP", clientes: 512, ltv: "R$ 7.27M", taxa: "35%" },
    { nome: "Ativos", clientes: 2528, ltv: "R$ 20.71M", taxa: "45%" },
    { nome: "Em Risco", clientes: 756, ltv: "R$ 3.10M", taxa: "15%" },
    { nome: "Dormentes", clientes: 389, ltv: "R$ 1.09M", taxa: "5%" }
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">4.185</div>
            <p className="text-xs text-slate-500 mt-1">+285 este mês</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">LTV Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">R$ 32.1M</div>
            <p className="text-xs text-slate-500 mt-1">Valor total acumulado</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">R$ 185</div>
            <p className="text-xs text-slate-500 mt-1">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa Churn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">12%</div>
            <p className="text-xs text-slate-500 mt-1">-3% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Segmentação */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Distribuição por Segmento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {segmentStats.map((seg) => (
              <div key={seg.nome} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{seg.nome}</h4>
                  <Badge variant="secondary">{seg.taxa}</Badge>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{seg.clientes}</p>
                <p className="text-xs text-slate-500">LTV: {seg.ltv}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Clientes Recentes
              </CardTitle>
              <CardDescription>Últimos clientes cadastrados</CardDescription>
            </div>
            <button className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 flex items-center gap-1">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input placeholder="Buscar cliente..." className="pl-10" />
            </div>
          </div>

          <div className="space-y-3">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{cliente.nome}</h4>
                    <p className="text-sm text-slate-500">{cliente.email}</p>
                  </div>
                  <Badge variant={cliente.segmento === "VIP" ? "default" : "secondary"}>
                    {cliente.segmento}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{cliente.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{cliente.ultimaCompra}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{cliente.ltv}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{cliente.compras} compras</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded p-2 text-xs text-slate-600 mb-2">
                  <strong>Nota:</strong> {cliente.notas}
                </div>

                <div className="flex gap-2">
                  <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                    Editar
                  </button>
                  <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                    Enviar Email
                  </button>
                  <button className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">
                    Agendar Ação
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Recomendadas */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-slate-900">💡 Ações Recomendadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <div className="bg-green-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-green-700 font-bold">1</div>
            <div>
              <p className="font-semibold text-slate-900">Enviar cupom para 756 clientes "Em Risco"</p>
              <p className="text-slate-600">Impacto esperado: +R$ 45K em receita</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-green-700 font-bold">2</div>
            <div>
              <p className="font-semibold text-slate-900">Reativar 389 clientes "Dormentes"</p>
              <p className="text-slate-600">Impacto esperado: +R$ 28K em receita</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-green-700 font-bold">3</div>
            <div>
              <p className="font-semibold text-slate-900">Programa VIP exclusivo para 512 clientes</p>
              <p className="text-slate-600">Impacto esperado: +15% em retenção</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
