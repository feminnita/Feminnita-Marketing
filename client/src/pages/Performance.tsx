import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, Eye, MousePointerClick, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Performance() {
  const { data: campaigns = [], isLoading, refetch } = trpc.campaigns.listar.useQuery();

  const metaCampaigns = campaigns.filter((c: any) =>
    c.plataforma?.toLowerCase().includes("meta") || c.plataforma?.toLowerCase().includes("facebook") || c.plataforma?.toLowerCase().includes("instagram")
  );
  const googleCampaigns = campaigns.filter((c: any) =>
    c.plataforma?.toLowerCase().includes("google")
  );

  const totalImpressions = campaigns.reduce((s: any, c: any) => s + (c.performance?.impressoes ?? 0), 0);
  const totalClicks = campaigns.reduce((s: any, c: any) => s + (c.performance?.cliques ?? 0), 0);
  const totalConversions = campaigns.reduce((s: any, c: any) => s + (c.performance?.conversoes ?? 0), 0);
  const avgROI = campaigns.length > 0
    ? (campaigns.reduce((s: any, c: any) => s + (c.performance?.roi ?? 0), 0) / campaigns.length).toFixed(1)
    : "0.0";

  const metaChartData = metaCampaigns.map((c: any) => ({
    name: c.nome.length > 15 ? c.nome.slice(0, 14) + "…" : c.nome,
    impressoes: c.performance?.impressoes ?? 0,
    cliques: c.performance?.cliques ?? 0,
    conversoes: c.performance?.conversoes ?? 0,
  }));

  const googleChartData = googleCampaigns.map((c: any) => ({
    name: c.nome.length > 15 ? c.nome.slice(0, 14) + "…" : c.nome,
    gasto: c.orcamento ?? 0,
    conversoes: c.performance?.conversoes ?? 0,
    roas: c.performance?.roi ?? 0,
  }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
          <p className="text-muted-foreground mt-2">Desempenho das suas campanhas</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões Totais</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">{campaigns.length} campanhas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">
              CTR: {totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0"}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">
              Taxa: {totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0"}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgROI}x</div>
            <p className="text-xs text-muted-foreground">sobre todas as campanhas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="meta" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meta">Meta Ads</TabsTrigger>
          <TabsTrigger value="google">Google Ads</TabsTrigger>
        </TabsList>

        {/* Meta Ads */}
        <TabsContent value="meta" className="space-y-4">
          {metaChartData.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Nenhuma campanha Meta encontrada. Crie campanhas em{" "}
                <span className="font-medium">Campanhas</span>.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Impressões × Cliques × Conversões</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metaChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impressoes" fill="#A63D4A" name="Impressões" />
                      <Bar dataKey="cliques" fill="#F59E0B" name="Cliques" />
                      <Bar dataKey="conversoes" fill="#10B981" name="Conversões" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {metaCampaigns.map((c: any) => (
                  <Card key={c.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">{c.plataforma} · {c.status}</p>
                      </div>
                      <div className="flex gap-3 text-sm text-right">
                        <div>
                          <p className="font-semibold">{(c.performance?.impressoes ?? 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">impressões</p>
                        </div>
                        <div>
                          <p className="font-semibold">{(c.performance?.cliques ?? 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">cliques</p>
                        </div>
                        <div>
                          <p className="font-semibold">{(c.performance?.roi ?? 0).toFixed(1)}x</p>
                          <p className="text-xs text-muted-foreground">ROI</p>
                        </div>
                        <Badge variant={c.status === "ativa" ? "default" : "secondary"}>
                          {c.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Google Ads */}
        <TabsContent value="google" className="space-y-4">
          {googleChartData.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Nenhuma campanha Google encontrada. Crie campanhas com plataforma "Google" em{" "}
                <span className="font-medium">Campanhas</span>.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Gasto × Conversões × ROAS</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={googleChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="gasto" fill="#3B82F6" name="Orçamento (R$)" />
                      <Bar dataKey="conversoes" fill="#10B981" name="Conversões" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {googleCampaigns.map((c: any) => (
                  <Card key={c.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">{c.plataforma} · {c.status}</p>
                      </div>
                      <div className="flex gap-3 text-sm text-right">
                        <div>
                          <p className="font-semibold">R${(c.orcamento ?? 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">orçamento</p>
                        </div>
                        <div>
                          <p className="font-semibold">{(c.performance?.conversoes ?? 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">conversões</p>
                        </div>
                        <Badge variant={c.status === "ativa" ? "default" : "secondary"}>
                          {c.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
