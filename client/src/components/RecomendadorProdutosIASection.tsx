import React from 'react';
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Zap, AlertCircle, ShoppingCart } from 'lucide-react';

export function RecomendadorProdutosIASection() {
  const { data: statusData } = trpc.blingOAuth.getStatus.useQuery();
  const blingConectado = (statusData as any)?.connected === true;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Recomendador de Produtos com IA</h2>
          <p className="text-slate-500 text-sm mt-1">Sugira produtos personalizados para aumentar conversão e ticket médio</p>
        </div>
      </div>

      {/* Bling requirement */}
      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            <p>
              Recomendações personalizadas requerem <strong>Bling ERP</strong> conectado para acessar
              o histórico de compras por cliente.
              {blingConectado
                ? ' Bling conectado — configure as regras de recomendação abaixo.'
                : ' Configure a integração em Integrações → Bling para ativar este módulo.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Empty state for recommendations */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="w-4 h-4" style={{ color: '#8B2635' }} />
            Recomendações Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-slate-400 space-y-2">
            <ShoppingCart className="w-10 h-10 mx-auto" />
            <p className="text-sm">Nenhuma recomendação gerada.</p>
            <p className="text-xs">
              {blingConectado
                ? 'Configure as regras de recomendação para gerar sugestões automáticas.'
                : 'Conecte o Bling ERP para importar histórico de compras e ativar a IA.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Como Funciona — legitimate educational content */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4" style={{ color: '#8B2635' }} />
            Como a IA Recomenda Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                step: 1,
                titulo: 'Analisa Histórico de Compra',
                desc: 'Examina todos os produtos já comprados, frequência e padrões via Bling ERP',
              },
              {
                step: 2,
                titulo: 'Identifica Padrão da Persona',
                desc: 'Compara com outras clientes da mesma persona para encontrar padrões de compra',
              },
              {
                step: 3,
                titulo: 'Calcula Probabilidade',
                desc: 'Usa modelo de colaboração para prever chance de compra do produto recomendado',
              },
              {
                step: 4,
                titulo: 'Envia Recomendação Personalizada',
                desc: 'Notifica cliente com motivo específico por email/SMS/WhatsApp',
              },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                <div
                  className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: '#8B2635' }}
                >
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">{item.titulo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact potential guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" style={{ color: '#8B2635' }} />
            Potencial de Impacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Cross-sell:</span> Produtos complementares (ex: pijama → robe) aumentam ticket médio em 15–30%</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Upsell:</span> Upgrade de versão casual para premium com clientes recorrentes</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Bundle:</span> Clientes que compram 2x/mês respondem bem a kits com desconto progressivo</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>VIP:</span> Clientes com ticket alto têm alta aceitação de edições limitadas e exclusivas</p>
        </CardContent>
      </Card>
    </div>
  );
}
