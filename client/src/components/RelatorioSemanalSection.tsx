import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, CheckCircle, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function RelatorioSemanalSection() {
  const { data: campaigns = [] } = trpc.campaigns.listar.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  const { data: alertsData } = trpc.smartAlerts.listActiveAlerts.useQuery({}, {
    refetchInterval: 60_000,
  });

  const ativas = (campaigns as any[]).filter((c) => c.status === "ativa");
  const totalImpressoes = ativas.reduce((s: number, c: any) => s + (c.impressoes ?? 0), 0);
  const totalCliques = ativas.reduce((s: number, c: any) => s + (c.cliques ?? 0), 0);
  const totalConversoes = ativas.reduce((s: number, c: any) => s + (c.conversoes ?? 0), 0);
  const totalOrcamento = ativas.reduce((s: number, c: any) => s + parseFloat(c.orcamento ?? "0"), 0);
  const avgRoi = ativas.length > 0
    ? ativas.reduce((s: number, c: any) => s + parseFloat(c.roi ?? "0"), 0) / ativas.length
    : 0;
  const ctr = totalImpressoes > 0 ? ((totalCliques / totalImpressoes) * 100).toFixed(1) : "0.0";

  const alertas: any[] = alertsData?.alerts ?? [];

  const [emailConfig, setEmailConfig] = useState({
    email: "seu@email.com",
    dia: "Segunda",
    hora: "09:00",
    ativo: true
  });

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-600" />
            Relatório Semanal Automático
          </CardTitle>
          <CardDescription>
            Receba relatórios completos toda segunda-feira com métricas, insights e recomendações personalizadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuração de Email */}
          <div>
            <h3 className="font-semibold text-sm mb-3">⚙️ Configurar Relatório Automático</h3>
            <Card className="p-4 bg-slate-50">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">Email para receber</label>
                  <input
                    type="email"
                    value={emailConfig.email}
                    onChange={(e) => setEmailConfig({ ...emailConfig, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">Dia da semana</label>
                  <select
                    value={emailConfig.dia}
                    onChange={(e) => setEmailConfig({ ...emailConfig, dia: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option>Segunda</option>
                    <option>Terça</option>
                    <option>Quarta</option>
                    <option>Quinta</option>
                    <option>Sexta</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">Horário</label>
                  <input
                    type="time"
                    value={emailConfig.hora}
                    onChange={(e) => setEmailConfig({ ...emailConfig, hora: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailConfig.ativo}
                      onChange={(e) => setEmailConfig({ ...emailConfig, ativo: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold">Ativar relatório automático</span>
                  </label>
                </div>
              </div>

              <Button className="w-full mt-4 gap-2">
                <Send className="w-4 h-4" />
                Salvar Configurações
              </Button>
            </Card>
          </div>

          {/* Métricas Atuais das Campanhas */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📊 Métricas Atuais (Campanhas Ativas)</h3>
            {ativas.length === 0 ? (
              <Card className="p-4 bg-slate-50 text-center">
                <p className="text-sm text-slate-500">Nenhuma campanha ativa. Crie campanhas para ver métricas aqui.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { categoria: "Impressões", valor: totalImpressoes.toLocaleString("pt-BR"), cor: "text-blue-600", bg: "bg-blue-50" },
                  { categoria: "Cliques", valor: totalCliques.toLocaleString("pt-BR"), cor: "text-green-600", bg: "bg-green-50" },
                  { categoria: "Conversões", valor: totalConversoes.toLocaleString("pt-BR"), cor: "text-orange-600", bg: "bg-orange-50" },
                  { categoria: "Orçamento Total", valor: `R$ ${totalOrcamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, cor: "text-purple-600", bg: "bg-purple-50" },
                  { categoria: "CTR", valor: `${ctr}%`, cor: "text-slate-900", bg: "bg-slate-50" },
                  { categoria: "ROI Médio", valor: `${avgRoi.toFixed(0)}%`, cor: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((m, idx) => (
                  <Card key={idx} className={`p-4 ${m.bg}`}>
                    <p className="text-xs text-slate-600 mb-1">{m.categoria}</p>
                    <div className={`text-lg font-bold ${m.cor}`}>{m.valor}</div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Alertas como Recomendações */}
          <div>
            <h3 className="font-semibold text-sm mb-3">💡 Alertas e Recomendações</h3>
            {alertas.length === 0 ? (
              <Card className="p-4 bg-slate-50 text-center">
                <p className="text-sm text-slate-500">Nenhum alerta ativo. Os alertas de performance aparecerão aqui.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {alertas.slice(0, 5).map((alerta: any) => (
                  <Card key={alerta.id} className={`p-4 border-l-4 ${
                    alerta.severity === "critical" ? "border-l-red-500 bg-red-50" :
                    alerta.severity === "warning" ? "border-l-amber-500 bg-amber-50" :
                    "border-l-blue-500 bg-blue-50"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div>
                        {alerta.severity === "critical" && <AlertCircle className="w-5 h-5 text-red-600" />}
                        {alerta.severity === "warning" && <AlertCircle className="w-5 h-5 text-amber-600" />}
                        {alerta.severity === "info" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{alerta.title}</h4>
                        <p className="text-xs text-slate-600 mb-1">{alerta.message}</p>
                        {alerta.recommendation && (
                          <p className="text-xs font-semibold text-slate-700">💡 {alerta.recommendation}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Preview do Email */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📧 Preview do Email</h3>
            <Card className="p-6 bg-white border-2 border-slate-200">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">📊 Relatório Semanal - Feminnita</h2>
                  <p className="text-sm text-slate-600">{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-700 mb-3">
                    Olá! Aqui está seu relatório com as principais métricas das campanhas ativas.
                  </p>

                  <div className="grid md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-slate-600">Conversões</p>
                      <p className="text-lg font-bold text-green-600">{totalConversoes.toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-slate-600">ROI Médio</p>
                      <p className="text-lg font-bold text-blue-600">{avgRoi.toFixed(0)}%</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-xs text-slate-600">CTR</p>
                      <p className="text-lg font-bold text-purple-600">{ctr}%</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded">
                      <p className="text-xs text-slate-600">Orçamento</p>
                      <p className="text-lg font-bold text-orange-600">R$ {(totalOrcamento / 1000).toFixed(1)}K</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mt-4">
                    {ativas.length} campanha{ativas.length !== 1 ? "s" : ""} ativa{ativas.length !== 1 ? "s" : ""} · {totalCliques.toLocaleString("pt-BR")} cliques no total.
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <Button className="w-full">Ver Relatório Completo</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Próximos Passos */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">✅ Próximos Passos</h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>1. Configure seu email acima</li>
              <li>2. Escolha dia e horário preferidos</li>
              <li>3. Ative o relatório automático</li>
              <li>4. Receba relatórios toda semana com insights</li>
              <li>5. Implemente recomendações para otimizar performance</li>
            </ol>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
