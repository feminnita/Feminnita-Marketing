import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, DollarSign, Eye, MousePointerClick, Zap } from "lucide-react";

// Mock data para gráficos
const metaAdsData = [
  { name: "Jan", impressoes: 4000, cliques: 2400, conversoes: 240 },
  { name: "Fev", impressoes: 3000, cliques: 1398, conversoes: 221 },
  { name: "Mar", impressoes: 2000, cliques: 9800, conversoes: 229 },
  { name: "Abr", impressoes: 2780, cliques: 3908, conversoes: 200 },
  { name: "Mai", impressoes: 1890, cliques: 4800, conversoes: 221 },
  { name: "Jun", impressoes: 2390, cliques: 3800, conversoes: 250 },
];

const googleAdsData = [
  { name: "Seg", gasto: 1200, conversoes: 45, roas: 3.2 },
  { name: "Ter", gasto: 1500, conversoes: 52, roas: 3.5 },
  { name: "Qua", gasto: 1100, conversoes: 38, roas: 2.8 },
  { name: "Qui", gasto: 1800, conversoes: 65, roas: 4.1 },
  { name: "Sex", gasto: 2200, conversoes: 78, roas: 4.5 },
  { name: "Sab", gasto: 900, conversoes: 32, roas: 2.9 },
  { name: "Dom", gasto: 1400, conversoes: 55, roas: 3.8 },
];

const whatsappData = [
  { name: "Grupos VIP", mensagens: 1250, engajamento: 85 },
  { name: "Broadcast", mensagens: 3400, engajamento: 62 },
  { name: "Automações", mensagens: 5200, engajamento: 78 },
  { name: "Suporte", mensagens: 890, engajamento: 95 },
];

const COLORS = ["#A63D4A", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

export default function Performance() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe em tempo real o desempenho de suas campanhas
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões Totais</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.2K</div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2K</div>
            <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.4K</div>
            <p className="text-xs text-muted-foreground">+23% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.8x</div>
            <p className="text-xs text-muted-foreground">+0.5x vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="meta" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meta">Meta Ads</TabsTrigger>
          <TabsTrigger value="google">Google Ads</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        {/* Meta Ads */}
        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Meta Ads</CardTitle>
              <CardDescription>
                Impressões, cliques e conversões dos últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metaAdsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="impressoes" stroke="#A63D4A" />
                  <Line type="monotone" dataKey="cliques" stroke="#F59E0B" />
                  <Line type="monotone" dataKey="conversoes" stroke="#10B981" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CTR Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CPC Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 1.45</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5.8%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Google Ads */}
        <TabsContent value="google" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Google Ads</CardTitle>
              <CardDescription>
                Gasto, conversões e ROAS dos últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={googleAdsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="gasto" fill="#3B82F6" />
                  <Bar yAxisId="left" dataKey="conversoes" fill="#10B981" />
                  <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#A63D4A" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 10.2K</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CPA Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 45.80</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ROAS Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.6x</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance WhatsApp</CardTitle>
              <CardDescription>
                Distribuição de mensagens por tipo e engajamento
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={whatsappData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, mensagens }) => `${name}: ${mensagens}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="mensagens"
                    >
                      {whatsappData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {whatsappData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.engajamento}% engajamento
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.engajamento}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">10.7K</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engajamento Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">80%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
