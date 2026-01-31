import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, BarChart3, TrendingUp, AlertCircle, CheckCircle, Calendar, Send, Download } from "lucide-react";

const RELATORIOS = [
  {
    id: 1,
    semana: "31 Jan - 06 Fev",
    data: "2026-02-06",
    status: "Enviado",
    vendas: 1245,
    roi: "285%",
    engajamento: "11.2%",
    conversoes: 892,
    receita: "R$ 45.678",
    destaque: "Semana recorde de vendas!"
  },
  {
    id: 2,
    semana: "24 - 30 Jan",
    data: "2026-01-30",
    status: "Enviado",
    vendas: 987,
    roi: "245%",
    engajamento: "9.8%",
    conversoes: 712,
    receita: "R$ 36.450",
    destaque: "Reels tiveram melhor performance"
  },
  {
    id: 3,
    semana: "17 - 23 Jan",
    data: "2026-01-23",
    status: "Enviado",
    vendas: 756,
    roi: "198%",
    engajamento: "8.5%",
    conversoes: 534,
    receita: "R$ 27.890",
    destaque: "Início promissor da estratégia"
  },
];

const METRICAS_DETALHADAS = [
  {
    categoria: "Visualizações",
    valor: "125.4K",
    variacao: "+18.5%",
    meta: "100K",
    status: "Acima"
  },
  {
    categoria: "Cliques",
    valor: "8.9K",
    variacao: "+22.3%",
    meta: "7K",
    status: "Acima"
  },
  {
    categoria: "Conversões",
    valor: "892",
    variacao: "+28.9%",
    meta: "700",
    status: "Acima"
  },
  {
    categoria: "Engajamento",
    valor: "11.2%",
    variacao: "+1.4pp",
    meta: "10%",
    status: "Acima"
  },
  {
    categoria: "CPV",
    valor: "R$ 0.0033",
    variacao: "-12.5%",
    meta: "R$ 0.005",
    status: "Abaixo"
  },
  {
    categoria: "CPS",
    valor: "R$ 0.83",
    variacao: "-15.2%",
    meta: "R$ 1.00",
    status: "Abaixo"
  },
];

const RECOMENDACOES = [
  {
    tipo: "Oportunidade",
    titulo: "Aumentar investimento em Reels",
    descricao: "Reels tiveram 14.2% engagement. Considere aumentar budget em 20%.",
    impacto: "Potencial +R$ 8K em receita"
  },
  {
    tipo: "Alerta",
    titulo: "TikTok com performance abaixo",
    descricao: "Taxa de conversão caiu 8% comparado à semana anterior.",
    impacto: "Investigar mudanças no algoritmo"
  },
  {
    tipo: "Sucesso",
    titulo: "Persona Luiza em alta",
    descricao: "Luiza gerou 245 conversões, 28% acima da meta.",
    impacto: "Replicar estratégia para outras personas"
  },
];

export default function RelatorioSemanalSection() {
  const [selectedRelatorio, setSelectedRelatorio] = useState<number | null>(null);
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

          {/* Histórico de Relatórios */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📋 Histórico de Relatórios</h3>
            <div className="space-y-3">
              {RELATORIOS.map(relatorio => (
                <Card
                  key={relatorio.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedRelatorio(selectedRelatorio === relatorio.id ? null : relatorio.id)}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{relatorio.semana}</h4>
                        <Badge variant="outline" className="text-xs">
                          {relatorio.status}
                        </Badge>
                        <span className="text-xs text-slate-600">{relatorio.data}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{relatorio.destaque}</p>

                      <div className="flex flex-wrap gap-3 text-xs">
                        <div className="bg-green-50 px-2 py-1 rounded">
                          <span className="text-slate-600">Vendas:</span>
                          <span className="font-semibold text-green-600 ml-1">{relatorio.vendas}</span>
                        </div>
                        <div className="bg-blue-50 px-2 py-1 rounded">
                          <span className="text-slate-600">ROI:</span>
                          <span className="font-semibold text-blue-600 ml-1">{relatorio.roi}</span>
                        </div>
                        <div className="bg-purple-50 px-2 py-1 rounded">
                          <span className="text-slate-600">Engajamento:</span>
                          <span className="font-semibold text-purple-600 ml-1">{relatorio.engajamento}</span>
                        </div>
                        <div className="bg-orange-50 px-2 py-1 rounded">
                          <span className="text-slate-600">Receita:</span>
                          <span className="font-semibold text-orange-600 ml-1">{relatorio.receita}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="gap-1 text-xs"
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </Button>
                  </div>

                  {selectedRelatorio === relatorio.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="font-semibold text-sm mb-3">Métricas Detalhadas</h4>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-3 rounded">
                          <p className="text-xs text-slate-600 mb-1">Total de Conversões</p>
                          <div className="text-lg font-bold text-slate-900">{relatorio.conversoes}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded">
                          <p className="text-xs text-slate-600 mb-1">Receita Total</p>
                          <div className="text-lg font-bold text-slate-900">{relatorio.receita}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded">
                          <p className="text-xs text-slate-600 mb-1">ROI</p>
                          <div className="text-lg font-bold text-slate-900">{relatorio.roi}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Métricas Detalhadas */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📊 Métricas Detalhadas (Semana Atual)</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {METRICAS_DETALHADAS.map((metrica, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">{metrica.categoria}</p>
                      <div className="text-lg font-bold text-slate-900">{metrica.valor}</div>
                    </div>
                    <Badge
                      variant={metrica.status === "Acima" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {metrica.variacao}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Meta: {metrica.meta} {metrica.status === "Acima" ? "✓" : "⚠️"}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Recomendações */}
          <div>
            <h3 className="font-semibold text-sm mb-3">💡 Recomendações para Próxima Semana</h3>
            <div className="space-y-3">
              {RECOMENDACOES.map((rec, idx) => (
                <Card key={idx} className={`p-4 border-l-4 ${
                  rec.tipo === "Oportunidade" ? "border-l-green-500 bg-green-50" :
                  rec.tipo === "Alerta" ? "border-l-red-500 bg-red-50" :
                  "border-l-blue-500 bg-blue-50"
                }`}>
                  <div className="flex items-start gap-3">
                    <div>
                      {rec.tipo === "Oportunidade" && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {rec.tipo === "Alerta" && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {rec.tipo === "Sucesso" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{rec.titulo}</h4>
                      <p className="text-xs text-slate-600 mb-2">{rec.descricao}</p>
                      <p className="text-xs font-semibold text-slate-700">📈 {rec.impacto}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Preview do Email */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📧 Preview do Email</h3>
            <Card className="p-6 bg-white border-2 border-slate-200">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">📊 Relatório Semanal - Feminnita</h2>
                  <p className="text-sm text-slate-600">31 Jan - 06 Fev 2026</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-700 mb-3">
                    Olá! Aqui está seu relatório semanal com as principais métricas e recomendações.
                  </p>

                  <div className="grid md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-xs text-slate-600">Vendas</p>
                      <p className="text-lg font-bold text-green-600">1.245</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-xs text-slate-600">ROI</p>
                      <p className="text-lg font-bold text-blue-600">285%</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-xs text-slate-600">Engajamento</p>
                      <p className="text-lg font-bold text-purple-600">11.2%</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded">
                      <p className="text-xs text-slate-600">Receita</p>
                      <p className="text-lg font-bold text-orange-600">R$ 45.6K</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 mt-4">
                    Semana recorde de vendas! Continue acompanhando a plataforma para mais detalhes.
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
