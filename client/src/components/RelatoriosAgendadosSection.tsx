import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, FileText, TrendingUp, Clock, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function RelatoriosAgendadosSection() {
  const [relatorios] = useState([
    {
      id: 1,
      titulo: "Relatório Semanal",
      descricao: "Métricas de vendas, ROI, engagement da semana",
      frequencia: "Toda segunda-feira 09:00",
      proxima: "2026-02-03 09:00",
      destinatarios: ["seu@email.com", "equipe@feminnita.com"],
      secoes: ["Resumo Executivo", "Vendas", "ROI", "Engagement", "Recomendações"],
      status: "ativo"
    },
    {
      id: 2,
      titulo: "Relatório de Personas",
      descricao: "Performance de cada persona (Carol, Renata, Vanessa, Luiza)",
      frequencia: "Toda segunda-feira 10:00",
      proxima: "2026-02-03 10:00",
      destinatarios: ["seu@email.com"],
      secoes: ["Carol", "Renata", "Vanessa", "Luiza", "Comparativo"],
      status: "ativo"
    },
    {
      id: 3,
      titulo: "Relatório de Campanhas",
      descricao: "ROI, CPA, conversões por campanha (Instagram, TikTok, Google Ads)",
      frequencia: "Toda segunda-feira 11:00",
      proxima: "2026-02-03 11:00",
      destinatarios: ["seu@email.com", "marketing@feminnita.com"],
      secoes: ["Instagram Ads", "TikTok Ads", "Google Ads", "Organic", "Comparativo"],
      status: "ativo"
    },
    {
      id: 4,
      titulo: "Relatório de Atribuição",
      descricao: "Qual persona/roteiro/campanha gerou cada venda",
      frequencia: "Toda terça-feira 09:00",
      proxima: "2026-02-04 09:00",
      destinatarios: ["seu@email.com"],
      secoes: ["Vendas Rastreadas", "Por Persona", "Por Roteiro", "Por Campanha"],
      status: "ativo"
    }
  ]);

  const [relatorioUltima] = useState({
    data: "2026-01-27 09:00",
    vendas: 24,
    receita: 7890,
    roi: "285%",
    engagement: "8.5%",
    novosSeguidores: 342,
    topPersona: "Renata (32,3%)",
    topCampanha: "Google Ads (400% ROI)"
  });

  const [metricas] = useState({
    relatoriosEnviados: 156,
    taxaAbertura: 78.5,
    tempoLeitura: "4.2 min",
    acoes: 45,
    conversaoRelatorio: 12.3
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sistema de Relatórios Agendados</h2>
        <p className="text-slate-600">
          Envie relatórios automáticos por email toda segunda-feira com métricas da semana anterior (vendas, ROI, engagement) para acompanhamento contínuo.
        </p>
      </div>

      {/* Relatórios Agendados */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Relatórios Configurados
          </CardTitle>
          <CardDescription>Emails automáticos que você recebe regularmente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {relatorios.map((rel) => (
            <div key={rel.id} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900">{rel.titulo}</h4>
                  <p className="text-xs text-slate-600">{rel.descricao}</p>
                </div>
                <Badge className="bg-green-600">✅ Ativo</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div>
                  <p className="text-slate-600">Frequência</p>
                  <p className="font-bold text-slate-900">🔔 {rel.frequencia}</p>
                </div>
                <div>
                  <p className="text-slate-600">Próximo envio</p>
                  <p className="font-bold text-slate-900">📅 {rel.proxima}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-slate-600 mb-1">Destinatários:</p>
                <div className="flex flex-wrap gap-2">
                  {rel.destinatarios.map((dest, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">📧 {dest}</Badge>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-slate-600 mb-1">Seções incluídas:</p>
                <div className="flex flex-wrap gap-1">
                  {rel.secoes.map((sec, idx) => (
                    <Badge key={idx} className="text-xs bg-slate-600">✓ {sec}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">Editar</Button>
                <Button size="sm" variant="outline">Enviar Agora</Button>
                <Button size="sm" variant="outline">Visualizar</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Último Relatório */}
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Último Relatório Enviado
          </CardTitle>
          <CardDescription>{relatorioUltima.data}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { titulo: "Vendas", valor: relatorioUltima.vendas, icon: "🛒", cor: "text-blue-600" },
              { titulo: "Receita", valor: `R$ ${relatorioUltima.receita.toLocaleString()}`, icon: "💰", cor: "text-green-600" },
              { titulo: "ROI", valor: relatorioUltima.roi, icon: "📈", cor: "text-orange-600" },
              { titulo: "Engagement", valor: relatorioUltima.engagement, icon: "💬", cor: "text-purple-600" }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className={`text-lg font-bold ${item.cor}`}>{item.valor}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-white border border-slate-200 rounded">
              <p className="text-xs text-slate-600">Top Persona</p>
              <p className="font-bold text-slate-900">{relatorioUltima.topPersona}</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded">
              <p className="text-xs text-slate-600">Top Campanha</p>
              <p className="font-bold text-slate-900">{relatorioUltima.topCampanha}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Métricas de Engajamento com Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { titulo: "Enviados", valor: metricas.relatoriosEnviados, icon: "📧", cor: "text-blue-600" },
              { titulo: "Taxa Abertura", valor: `${metricas.taxaAbertura}%`, icon: "👁️", cor: "text-green-600" },
              { titulo: "Tempo Leitura", valor: metricas.tempoLeitura, icon: "⏱️", cor: "text-orange-600" },
              { titulo: "Ações", valor: metricas.acoes, icon: "🖱️", cor: "text-purple-600" },
              { titulo: "Conversão", valor: `${metricas.conversaoRelatorio}%`, icon: "🎯", cor: "text-red-600" }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className={`text-lg font-bold ${item.cor}`}>{item.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Criar Novo Relatório */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Criar Novo Relatório Personalizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Título do Relatório</label>
            <input 
              type="text" 
              placeholder="Ex: Relatório de Performance de Inverno"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Frequência</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm">
              <option>Toda segunda-feira</option>
              <option>Toda terça-feira</option>
              <option>Toda quarta-feira</option>
              <option>Toda quinta-feira</option>
              <option>Toda sexta-feira</option>
              <option>Mensalmente</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Destinatários</label>
            <input 
              type="text" 
              placeholder="seu@email.com, equipe@feminnita.com"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
            />
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700">Criar Relatório</Button>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Máxima Utilidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Receba relatórios toda segunda-feira para revisar semana anterior",
            "✅ Compartilhe relatórios com equipe para alinhamento",
            "✅ Use dados para tomar decisões de budget",
            "✅ Identifique personas/campanhas com melhor ROI",
            "✅ Pause campanhas com ROI < 250%",
            "✅ Aumente budget em campanhas top performers",
            "✅ Crie relatórios personalizados por departamento",
            "✅ Exporte relatórios em PDF para apresentações"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Benefícios Esperados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Decisões Baseadas em Dados", descricao: "Veja métricas reais toda semana" },
            { titulo: "Acompanhamento Contínuo", descricao: "Nunca perca performance de campanhas" },
            { titulo: "Alinhamento de Equipe", descricao: "Todos veem mesmas métricas" },
            { titulo: "Otimização Rápida", descricao: "Identifique problemas rapidamente" },
            { titulo: "Histórico Completo", descricao: "Acompanhe evolução ao longo do tempo" },
            { titulo: "Economia de Tempo", descricao: "Relatórios automáticos economizam horas" }
          ].map((beneficio, idx) => (
            <div key={idx} className="flex gap-3 p-3 border border-green-200 rounded bg-white">
              <span className="text-lg">✨</span>
              <div>
                <p className="font-semibold text-slate-900">{beneficio.titulo}</p>
                <p className="text-xs text-slate-600">{beneficio.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
