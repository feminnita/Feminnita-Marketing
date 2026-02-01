import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Target, AlertCircle, CheckCircle } from 'lucide-react';

export default function RentabilidadeDetalhadaSection() {
  const [filtroPersona, setFiltroPersona] = useState('todos');
  const [filtroCanal, setFiltroCanal] = useState('todos');

  const produtos = [
    {
      nome: 'Pijama Carol',
      persona: 'Carol',
      canal: 'Instagram',
      receita: 285000,
      custo: 95000,
      margem: 66.7,
      volume: 1520,
      ticketMedio: 187.50,
      roi: 3.0,
    },
    {
      nome: 'Robe Renata',
      persona: 'Renata',
      canal: 'TikTok',
      receita: 312000,
      custo: 78000,
      margem: 75.0,
      volume: 1040,
      ticketMedio: 300.00,
      roi: 4.0,
    },
    {
      nome: 'Pijama Vanessa',
      persona: 'Vanessa',
      canal: 'Facebook',
      receita: 198000,
      custo: 66000,
      margem: 66.7,
      volume: 880,
      ticketMedio: 225.00,
      roi: 3.0,
    },
    {
      nome: 'Pijama Luiza',
      persona: 'Luiza',
      canal: 'Email',
      receita: 156000,
      custo: 31200,
      margem: 80.0,
      volume: 520,
      ticketMedio: 300.00,
      roi: 5.0,
    },
  ];

  const personas = ['Carol', 'Renata', 'Vanessa', 'Luiza'];
  const canais = ['Instagram', 'TikTok', 'Facebook', 'Email'];

  const produtosFiltrados = produtos.filter(p => {
    if (filtroPersona !== 'todos' && p.persona !== filtroPersona) return false;
    if (filtroCanal !== 'todos' && p.canal !== filtroCanal) return false;
    return true;
  });

  const totalReceita = produtosFiltrados.reduce((sum, p) => sum + p.receita, 0);
  const totalCusto = produtosFiltrados.reduce((sum, p) => sum + p.custo, 0);
  const totalLucro = totalReceita - totalCusto;
  const margemMedia = (totalLucro / totalReceita) * 100;

  const recomendacoes = [
    {
      titulo: 'Aumentar Volume de Robe Renata',
      descricao: 'Maior margem (75%) e ROI (4x). Recomenda-se aumentar budget em 30%',
      impacto: '+R$ 93.600/mês',
      tipo: 'oportunidade',
    },
    {
      titulo: 'Otimizar Email Marketing',
      descricao: 'Maior ROI (5x) com menor custo. Potencial de crescimento 50%',
      impacto: '+R$ 78.000/mês',
      tipo: 'oportunidade',
    },
    {
      titulo: 'Revisar Custos Facebook',
      descricao: 'Margem de 66.7% é a menor. Considere pausar ou otimizar',
      impacto: '-R$ 22.000/mês',
      tipo: 'alerta',
    },
  ];

  const matrizCrossell = [
    { de: 'Pijama Carol', para: 'Robe Renata', potencial: '+R$ 45.600', conversao: '12%' },
    { de: 'Robe Renata', para: 'Pijama Vanessa', potencial: '+R$ 37.440', conversao: '9%' },
    { de: 'Pijama Vanessa', para: 'Pijama Luiza', potencial: '+R$ 31.200', conversao: '8%' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {(totalReceita / 1000).toFixed(0)}K</div>
            <p className="text-xs text-slate-500 mt-1">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Lucro Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {(totalLucro / 1000).toFixed(0)}K</div>
            <p className="text-xs text-slate-500 mt-1">{margemMedia.toFixed(1)}% margem média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">ROI Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3.75x</div>
            <p className="text-xs text-slate-500 mt-1">+0.5x vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Melhor Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">Robe Renata</div>
            <p className="text-xs text-slate-500 mt-1">75% margem, 4x ROI</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise de Rentabilidade por Produto</CardTitle>
          <CardDescription>Margem de lucro, ROI e recomendações de mix de produtos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Persona</label>
              <select
                value={filtroPersona}
                onChange={(e) => setFiltroPersona(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="todos">Todas</option>
                {personas.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Canal</label>
              <select
                value={filtroCanal}
                onChange={(e) => setFiltroCanal(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="todos">Todos</option>
                {canais.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela de Produtos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Produto</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Persona</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Canal</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Receita</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Lucro</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Margem</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">ROI</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((p, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.nome}</td>
                    <td className="py-3 px-4 text-slate-600">{p.persona}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{p.canal}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 font-semibold">R$ {(p.receita / 1000).toFixed(0)}K</td>
                    <td className="py-3 px-4 text-right text-green-600 font-semibold">R$ {((p.receita - p.custo) / 1000).toFixed(0)}K</td>
                    <td className="py-3 px-4 text-right">
                      <Badge className="bg-blue-100 text-blue-700">{p.margem.toFixed(1)}%</Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600">{p.roi.toFixed(1)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recomendações de Mix de Produtos</CardTitle>
          <CardDescription>Otimizações para maximizar rentabilidade</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recomendacoes.map((rec, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${
              rec.tipo === 'oportunidade' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                {rec.tipo === 'oportunidade' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{rec.titulo}</h4>
                  <p className="text-sm text-slate-600 mt-1">{rec.descricao}</p>
                  <p className={`text-sm font-semibold mt-2 ${
                    rec.tipo === 'oportunidade' ? 'text-green-600' : 'text-amber-600'
                  }`}>{rec.impacto}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Matriz de Cross-sell */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Matriz de Cross-sell e Upsell</CardTitle>
          <CardDescription>Oportunidades de venda adicional entre produtos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matrizCrossell.map((item, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{item.de} → {item.para}</p>
                    <p className="font-semibold text-slate-900 mt-1">Taxa de conversão: {item.conversao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Potencial</p>
                    <p className="text-lg font-bold text-green-600">{item.potencial}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
