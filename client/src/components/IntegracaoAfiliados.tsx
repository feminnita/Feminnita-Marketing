import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export default function IntegracaoAfiliados() {
  const [afiliados] = useState([
    {
      id: 1,
      nome: 'Influenciadora Carol',
      email: 'carol@influenciadora.com',
      status: 'Ativo',
      vendas: 1520,
      receita: 285000,
      comissao: 5,
      comissaoPaga: 14250,
      comissaoPendente: 0,
      ultimaVenda: '2026-02-01',
      taxa: 'Excelente',
    },
    {
      id: 2,
      nome: 'Influenciadora Renata',
      email: 'renata@influenciadora.com',
      status: 'Ativo',
      vendas: 1040,
      receita: 312000,
      comissao: 6,
      comissaoPaga: 18720,
      comissaoPendente: 0,
      ultimaVenda: '2026-02-01',
      taxa: 'Excelente',
    },
    {
      id: 3,
      nome: 'Influenciadora Vanessa',
      email: 'vanessa@influenciadora.com',
      status: 'Ativo',
      vendas: 880,
      receita: 198000,
      comissao: 5,
      comissaoPaga: 9900,
      comissaoPendente: 0,
      ultimaVenda: '2026-02-01',
      taxa: 'Bom',
    },
    {
      id: 4,
      nome: 'Influenciadora Luiza',
      email: 'luiza@influenciadora.com',
      status: 'Ativo',
      vendas: 520,
      receita: 156000,
      comissao: 7,
      comissaoPaga: 10920,
      comissaoPendente: 0,
      ultimaVenda: '2026-02-01',
      taxa: 'Bom',
    },
  ]);

  const totalVendas = afiliados.reduce((sum, a) => sum + a.vendas, 0);
  const totalReceita = afiliados.reduce((sum, a) => sum + a.receita, 0);
  const totalComissao = afiliados.reduce((sum, a) => sum + a.comissaoPaga, 0);
  const totalPendente = afiliados.reduce((sum, a) => sum + a.comissaoPendente, 0);

  const metricas = [
    { titulo: 'Total de Vendas', valor: totalVendas.toLocaleString(), icon: '📊' },
    { titulo: 'Receita Gerada', valor: `R$ ${(totalReceita / 1000).toFixed(0)}K`, icon: '💰' },
    { titulo: 'Comissões Pagas', valor: `R$ ${(totalComissao / 1000).toFixed(0)}K`, icon: '✅' },
    { titulo: 'Comissões Pendentes', valor: `R$ ${(totalPendente / 1000).toFixed(0)}K`, icon: '⏳' },
  ];

  const regrasComissao = [
    { faixa: 'Até 500 vendas/mês', comissao: '5%', condicao: 'Padrão' },
    { faixa: '501 a 1000 vendas/mês', comissao: '6%', condicao: 'Bom desempenho' },
    { faixa: '1001+ vendas/mês', comissao: '7%', condicao: 'Excelente desempenho' },
    { faixa: 'Bônus: 50+ vendas/semana', comissao: '+1%', condicao: 'Incentivo' },
  ];

  const campanhasAfiliados = [
    {
      id: 1,
      nome: 'Campanha Pijama Carol',
      afiliados: 4,
      vendas: 1520,
      receita: 285000,
      comissao: 14250,
      roi: 20.0,
      status: 'Ativa',
    },
    {
      id: 2,
      nome: 'Campanha Robe Renata',
      afiliados: 4,
      vendas: 1040,
      receita: 312000,
      comissao: 18720,
      roi: 16.7,
      status: 'Ativa',
    },
    {
      id: 3,
      nome: 'Campanha Pijama Vanessa',
      afiliados: 3,
      vendas: 880,
      receita: 198000,
      comissao: 9900,
      roi: 20.0,
      status: 'Ativa',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600">{metrica.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{metrica.valor}</div>
              <p className="text-xs text-slate-500 mt-1">{metrica.icon}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Afiliados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Afiliados Registrados</CardTitle>
          <CardDescription>Rastreamento de vendas e comissões automáticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Afiliado</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Vendas</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Receita</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Comissão %</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Comissão Paga</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {afiliados.map((afl) => (
                  <tr key={afl.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-900">{afl.nome}</p>
                        <p className="text-xs text-slate-500">{afl.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">{afl.vendas.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-slate-900 font-semibold">R$ {(afl.receita / 1000).toFixed(0)}K</td>
                    <td className="py-3 px-4 text-right">
                      <Badge className="bg-blue-100 text-blue-700">{afl.comissao}%</Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-semibold">R$ {(afl.comissaoPaga / 1000).toFixed(1)}K</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className="bg-green-100 text-green-700">{afl.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Regras de Comissão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regras de Comissão</CardTitle>
          <CardDescription>Estrutura de comissões por desempenho</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {regrasComissao.map((regra, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{regra.faixa}</p>
                    <p className="text-sm text-slate-600 mt-1">{regra.condicao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-rose-600">{regra.comissao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campanhas de Afiliados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campanhas de Afiliados</CardTitle>
          <CardDescription>Performance por campanha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campanhasAfiliados.map((camp) => (
              <div key={camp.id} className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{camp.nome}</h4>
                    <p className="text-sm text-slate-600 mt-1">{camp.afiliados} afiliados participando</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{camp.status}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Vendas</p>
                    <p className="font-bold text-slate-900">{camp.vendas.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Receita</p>
                    <p className="font-bold text-slate-900">R$ {(camp.receita / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Comissão</p>
                    <p className="font-bold text-green-600">R$ {(camp.comissao / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ROI</p>
                    <p className="font-bold text-rose-600">{camp.roi.toFixed(1)}x</p>
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
