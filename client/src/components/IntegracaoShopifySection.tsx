import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Zap, Users, TrendingUp, AlertCircle } from 'lucide-react';

const BENEFITS = [
  {
    titulo: 'Dados em Tempo Real',
    descricao: 'Pedidos, clientes e inventário sincronizados automaticamente',
  },
  {
    titulo: 'Previsões Mais Precisas',
    descricao: 'IA treinada com dados reais do Shopify aumenta a acurácia das previsões de demanda',
  },
  {
    titulo: 'Segmentação Automática',
    descricao: 'Clientes classificados automaticamente por persona (Carol, Renata, Vanessa, Luiza)',
  },
  {
    titulo: 'Campanhas Personalizadas',
    descricao: 'Email marketing automático baseado no histórico de compras do cliente',
  },
  {
    titulo: 'LTV e Churn Reais',
    descricao: 'Cálculo de Lifetime Value e detecção de clientes em risco com base em pedidos reais',
  },
];

const SETUP_STEPS = [
  'Acesse sua loja Shopify → Configurações → Apps e canais de vendas',
  'Clique em "Desenvolver apps" e crie um app privado',
  'Habilite as permissões: read_orders, read_customers, read_products, read_inventory',
  'Copie o Access Token gerado',
  'Cole o token em Configurações → Integrações → Shopify neste painel',
  'Clique em "Testar conexão" para validar',
];

export function IntegracaoShopifySection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Integração com Shopify</h2>
        <p className="text-slate-500 text-sm mt-1">Sincronize pedidos, clientes e produtos automaticamente</p>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            A Feminnita utiliza <strong>Bling ERP</strong> como sistema de gestão principal.
            A integração com Shopify é opcional e complementar — útil se você também opera uma loja Shopify.
            Dados de vendas reais vêm do Bling.
          </p>
        </CardContent>
      </Card>

      {/* Setup guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4" style={{ color: '#8B2635' }} />
            Como conectar o Shopify
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {SETUP_STEPS.map((step, idx) => (
              <li key={idx} className="flex gap-3 items-start text-sm text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#8B2635' }}>
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" style={{ color: '#8B2635' }} />
            O que a integração habilita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {BENEFITS.map((b, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#8B2635' }}></div>
                <div>
                  <p className="font-medium text-sm text-slate-900">{b.titulo}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{b.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data that becomes available */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="w-4 h-4" style={{ color: '#8B2635' }} />
            Dados disponíveis após integração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {['Pedidos recentes', 'Clientes por persona', 'Produtos e estoque', 'Taxa de conversão do site',
              'Abandono de carrinho', 'Receita por canal', 'LTV por segmento', 'Recompra e retenção'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-600">
                <span className="text-slate-300">—</span>
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Nota: a Feminnita opera principalmente via Bling ERP + loja própria. Conectar o Shopify é recomendado
            apenas se você já usa o Shopify como plataforma de e-commerce.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
