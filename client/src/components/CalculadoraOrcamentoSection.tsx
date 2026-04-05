import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calculator, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function CalculadoraOrcamentoSection() {
  const [orcamento, setOrcamento] = useState(500);
  const [duracao, setDuracao] = useState(3);
  const [cenario, setCenario] = useState("moderado");

  // Fatores de multiplicação por cenário
  const fatores = {
    conservador: { duracao: 7, multiplicador: 1.0, taxa: 0.02 },
    moderado: { duracao: 3, multiplicador: 1.4, taxa: 0.02 },
    agressivo: { duracao: 5, multiplicador: 2.0, taxa: 0.02 }
  };

  const fator = fatores[cenario as keyof typeof fatores];

  // Cálculos dinâmicos
  const visualizacoes = Math.round(180000 * (orcamento / 500) * (fator.multiplicador / 1.4) * (duracao / 3));
  const seguidores = Math.round(900 * (orcamento / 500) * (fator.multiplicador / 1.4) * (duracao / 3));
  const engajamentos = Math.round(18000 * (orcamento / 500) * (fator.multiplicador / 1.4) * (duracao / 3));
  const saves = Math.round(1400 * (orcamento / 500) * (fator.multiplicador / 1.4) * (duracao / 3));
  
  const cpv = orcamento / visualizacoes;
  const cps = orcamento / seguidores;
  const vendas = Math.round(seguidores * fator.taxa);
  const receita = vendas * 150;
  const lucro = receita * 0.5;
  const roi = ((lucro - orcamento) / orcamento) * 100;

  const comparacao = [
    { nome: "Conservador", orcamento: 500, lucro: 975, roi: 195 },
    { nome: "Moderado", orcamento: 500, lucro: 1350, roi: 270 },
    { nome: "Agressivo", orcamento: 500, lucro: 1725, roi: 345 },
    { nome: "Seu Cenário", orcamento: orcamento, lucro: Math.round(lucro), roi: Math.round(roi) }
  ];

  const evolucaoOrcamento = [
    { orcamento: 250, visualizacoes: Math.round(visualizacoes * 0.5), seguidores: Math.round(seguidores * 0.5), roi: Math.round(roi * 0.8) },
    { orcamento: 500, visualizacoes: visualizacoes, seguidores: seguidores, roi: Math.round(roi) },
    { orcamento: 750, visualizacoes: Math.round(visualizacoes * 1.5), seguidores: Math.round(seguidores * 1.5), roi: Math.round(roi * 1.1) },
    { orcamento: 1000, visualizacoes: Math.round(visualizacoes * 2), seguidores: Math.round(seguidores * 2), roi: Math.round(roi * 1.2) },
    { orcamento: 1500, visualizacoes: Math.round(visualizacoes * 3), seguidores: Math.round(seguidores * 3), roi: Math.round(roi * 1.3) }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Calculadora de Orçamento Customizada</h2>
        <p className="text-slate-600">
          Ajuste seu orçamento e veja as métricas esperadas em tempo real. Simule diferentes cenários e encontre o melhor para seu negócio.
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Projeções estimadas — não garantia de resultados reais</p>
              <p className="text-sm text-slate-600 mt-1">
                Os valores calculados (visualizações, seguidores, ROI) são estimativas baseadas em benchmarks de mercado. Resultados reais variam conforme qualidade do conteúdo, nicho e sazonalidade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inputs Customizáveis */}
      <Card className="border-l-4 border-l-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            Configure Sua Campanha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Orçamento */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-slate-700">Orçamento Total</label>
              <span className="text-lg font-bold text-green-600">R$ {orcamento.toLocaleString('pt-BR')}</span>
            </div>
            <Slider 
              value={[orcamento]} 
              onValueChange={(val) => setOrcamento(val[0])}
              min={100}
              max={2000}
              step={50}
              className="w-full"
            />
            <p className="text-xs text-slate-600 mt-2">Mínimo: R$ 100 | Máximo: R$ 2.000</p>
          </div>

          {/* Duração */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-slate-700">Duração da Campanha</label>
              <span className="text-lg font-bold text-blue-600">{duracao} dias</span>
            </div>
            <Slider 
              value={[duracao]} 
              onValueChange={(val) => setDuracao(val[0])}
              min={1}
              max={7}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-slate-600 mt-2">Mínimo: 1 dia | Máximo: 7 dias</p>
          </div>

          {/* Cenário */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Tipo de Cenário</label>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { id: "conservador", nome: "Conservador", descricao: "Baixo risco, crescimento lento" },
                { id: "moderado", nome: "Moderado", descricao: "Balanço ideal (Recomendado)" },
                { id: "agressivo", nome: "Agressivo", descricao: "Alto risco, máxima viralidade" }
              ].map((opt) => (
                <Button
                  key={opt.id}
                  variant={cenario === opt.id ? "default" : "outline"}
                  onClick={() => setCenario(opt.id)}
                  className="h-auto py-3 flex flex-col items-start justify-start"
                >
                  <span className="font-semibold">{opt.nome}</span>
                  <span className="text-xs opacity-75">{opt.descricao}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Calculadas */}
      <div className="grid md:grid-cols-5 gap-4">
        {[
          { titulo: "Visualizações", valor: visualizacoes, meta: "180K", icon: "👁️", cor: "blue" },
          { titulo: "Engajamentos", valor: engajamentos, meta: "18K", icon: "❤️", cor: "red" },
          { titulo: "Seguidores", valor: seguidores, meta: "900", icon: "👥", cor: "green" },
          { titulo: "CPV", valor: `R$ ${cpv.toFixed(4)}`, meta: "R$ 0.0027", icon: "💰", cor: "purple" },
          { titulo: "CPS", valor: `R$ ${cps.toFixed(2)}`, meta: "R$ 0.63", icon: "📊", cor: "orange" }
        ].map((metrica, idx) => (
          <Card key={idx} className="border-2">
            <CardContent className="pt-6">
              <p className="text-2xl mb-2">{metrica.icon}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{metrica.titulo}</p>
              <p className="text-lg font-bold text-slate-900">{typeof metrica.valor === 'number' ? metrica.valor.toLocaleString('pt-BR') : metrica.valor}</p>
              <p className="text-xs text-slate-600 mt-2">Meta: {metrica.meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ROI e Conversão */}
      <Card className="border-l-4 border-l-green-600 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Retorno Esperado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Vendas Esperadas</p>
              <p className="text-3xl font-bold text-green-600">{vendas}</p>
              <p className="text-xs text-slate-600 mt-1">Com 2% de conversão</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Receita Bruta</p>
              <p className="text-3xl font-bold text-slate-900">R$ {receita.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-slate-600 mt-1">Ticket: R$ 150</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Lucro Líquido</p>
              <p className="text-3xl font-bold text-green-600">R$ {lucro.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-slate-600 mt-1">50% de margem</p>
            </div>
            <div className="bg-white p-4 rounded border-2 border-green-600">
              <p className="text-xs font-semibold text-green-600 uppercase mb-2">ROI Total</p>
              <p className="text-3xl font-bold text-green-600">{roi.toFixed(0)}%</p>
              <p className="text-xs text-slate-600 mt-1">{roi > 200 ? "✅ Excelente!" : "✅ Bom!"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparação com Cenários Padrão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparação de ROI - Seu Cenário vs Padrões</CardTitle>
          <CardDescription>Como seu cenário customizado se compara aos padrões</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparacao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis yAxisId="left" label={{ value: 'Lucro (R$)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'ROI (%)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="lucro" fill="#10b981" name="Lucro (R$)" />
              <Bar yAxisId="right" dataKey="roi" fill="#3b82f6" name="ROI (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Evolução por Orçamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolução de Métricas por Orçamento</CardTitle>
          <CardDescription>Como as métricas crescem conforme você aumenta o investimento</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolucaoOrcamento}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="orcamento" 
                label={{ value: 'Orçamento (R$)', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis yAxisId="left" label={{ value: 'Visualizações', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Seguidores', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="visualizacoes" stroke="#3b82f6" name="Visualizações" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="seguidores" stroke="#10b981" name="Seguidores" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg">Recomendações Baseadas em Seu Cenário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orcamento < 300 && (
            <div className="flex gap-3">
              <span className="text-amber-600">⚠️</span>
              <div>
                <p className="font-semibold text-slate-900">Orçamento Baixo</p>
                <p className="text-sm text-slate-700">Aumente para R$ 500+ para melhores resultados. Orçamentos menores têm CPV mais alto.</p>
              </div>
            </div>
          )}
          
          {orcamento > 1000 && (
            <div className="flex gap-3">
              <span className="text-green-600">✅</span>
              <div>
                <p className="font-semibold text-slate-900">Orçamento Robusto</p>
                <p className="text-sm text-slate-700">Excelente! Com R$ {orcamento.toLocaleString('pt-BR')}, você terá alcance máximo e ROI muito positivo.</p>
              </div>
            </div>
          )}

          {duracao === 1 && (
            <div className="flex gap-3">
              <span className="text-amber-600">⚠️</span>
              <div>
                <p className="font-semibold text-slate-900">Duração Curta</p>
                <p className="text-sm text-slate-700">1 dia é muito curto. Recomendamos 3-5 dias para melhores resultados e economia de escala.</p>
              </div>
            </div>
          )}

          {cenario === "moderado" && (
            <div className="flex gap-3">
              <span className="text-green-600">✅</span>
              <div>
                <p className="font-semibold text-slate-900">Cenário Ideal</p>
                <p className="text-sm text-slate-700">Você escolheu o cenário moderado - melhor balanço entre risco e retorno. Excelente escolha!</p>
              </div>
            </div>
          )}

          {roi > 250 && (
            <div className="flex gap-3">
              <span className="text-green-600">🚀</span>
              <div>
                <p className="font-semibold text-slate-900">ROI Excepcional</p>
                <p className="text-sm text-slate-700">Seu ROI de {roi.toFixed(0)}% é excelente! Recomendamos executar esta campanha imediatamente.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximas Ações */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Próximas Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. ✅ Confirme seu orçamento: <span className="font-bold">R$ {orcamento.toLocaleString('pt-BR')}</span></p>
          <p>2. ✅ Defina duração: <span className="font-bold">{duracao} dias</span></p>
          <p>3. ✅ Escolha cenário: <span className="font-bold">{cenario.charAt(0).toUpperCase() + cenario.slice(1)}</span></p>
          <p>4. 📋 Baixe o relatório com sua estratégia customizada</p>
          <p>5. 🎬 Produza os vídeos conforme os roteiros</p>
          <p>6. 📅 Agende as postagens</p>
          <p>7. 💰 Invista em ads no Instagram</p>
          <p>8. 📊 Monitore métricas em tempo real</p>
        </CardContent>
      </Card>
    </div>
  );
}
