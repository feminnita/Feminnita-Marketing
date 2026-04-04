import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, AlertCircle, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const PLATAFORMA_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
};

export function IntegracaoFacebookAdsSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });
  const { data: tokenStatus } = trpc.oauthCallbacks.getTokenStatus.useQuery({ platform: 'meta' });

  const metaCampanhas = (campanhas as any[]).filter(c =>
    c.plataforma === 'facebook' || c.plataforma === 'instagram'
  );
  const ativas = metaCampanhas.filter(c => c.status === 'ativa');

  const totalImpressoes = metaCampanhas.reduce((s, c) => s + (Number(c.performance?.impressoes) || 0), 0);
  const totalCliques = metaCampanhas.reduce((s, c) => s + (Number(c.performance?.cliques) || 0), 0);
  const totalConversoes = metaCampanhas.reduce((s, c) => s + (Number(c.performance?.conversoes) || 0), 0);
  const totalOrcamento = metaCampanhas.reduce((s, c) => s + parseFloat(c.orcamento ?? '0'), 0);
  const roisValidos = metaCampanhas.filter(c => ( Number(c.performance?.roi) || 0) > 0);
  const roiMedio = roisValidos.length > 0
    ? roisValidos.reduce((s, c) => s + ( Number(c.performance?.roi) || 0), 0) / roisValidos.length
    : 0;

  const isConnected = tokenStatus?.connected === true;

  const handleConnectMeta = () => {
    window.location.href = '/api/oauth/meta/connect';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Integração Facebook Ads</h2>
          <p className="text-slate-600 mt-1">Campanhas Facebook e Instagram geridas juntas via Meta Business Suite</p>
        </div>
        {metaCampanhas.length > 0 && (
          <Badge className="bg-blue-100 text-blue-800 text-base px-4 py-2">
            {metaCampanhas.length} campanha{metaCampanhas.length !== 1 ? 's' : ''} Meta
          </Badge>
        )}
      </div>

      {/* Status da Conexão */}
      <Card className={`border-l-4 ${isConnected ? 'border-l-green-500 bg-green-50' : 'border-l-amber-500 bg-amber-50'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">
                {isConnected ? 'Meta conectado via OAuth' : 'Meta não conectado'}
              </p>
              <p className="text-sm text-slate-600">
                {isConnected
                  ? 'Sincronização automática ativa com Facebook Ads e Instagram'
                  : 'Configure em Integrações > Credenciais OAuth para sincronizar campanhas reais'}
              </p>
            </div>
            {!isConnected && (
              <Button onClick={handleConnectMeta} className="bg-blue-600 hover:bg-blue-700 text-sm">
                Conectar Meta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {metaCampanhas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 mb-1">Nenhuma campanha Meta/Instagram encontrada.</p>
            <p className="text-sm text-slate-400">Crie campanhas com plataforma "instagram" ou "facebook" na aba Campanhas.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Meta (Facebook + Instagram)
              </CardTitle>
              <CardDescription>
                {ativas.length} ativa{ativas.length !== 1 ? 's' : ''} de {metaCampanhas.length} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Impressões', valor: totalImpressoes.toLocaleString('pt-BR'), icon: '👁️' },
                  { label: 'Cliques', valor: totalCliques.toLocaleString('pt-BR'), icon: '🖱️' },
                  { label: 'Conversões', valor: totalConversoes.toLocaleString('pt-BR'), icon: '💰' },
                  { label: 'Orçamento', valor: `R$ ${totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: '💵' },
                  { label: 'ROI Médio', valor: roiMedio > 0 ? `${roiMedio.toFixed(0)}%` : '—', icon: '📈' },
                  { label: 'Campanhas Ativas', valor: String(ativas.length), icon: '📊' },
                ].map((m, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4 text-center hover:border-blue-300 transition">
                    <p className="text-2xl mb-1">{m.icon}</p>
                    <p className="text-xs text-slate-500 uppercase font-medium mb-1">{m.label}</p>
                    <p className="text-xl font-bold text-slate-900">{m.valor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de campanhas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Campanhas Meta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metaCampanhas.map((c: any) => (
                  <div key={c.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{c.nome}</h4>
                        <p className="text-xs text-slate-500">
                          {PLATAFORMA_LABELS[c.plataforma] ?? c.plataforma}
                          {c.dataInicio ? ` · Início: ${c.dataInicio}` : ''}
                        </p>
                      </div>
                      <Badge
                        className={
                          c.status === 'ativa' ? 'bg-green-100 text-green-800 text-xs'
                          : c.status === 'pausada' ? 'bg-amber-100 text-amber-800 text-xs'
                          : 'bg-slate-100 text-slate-600 text-xs'
                        }
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Impressões</p>
                        <p className="font-bold">{(Number(c.performance?.impressoes) || 0).toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Cliques</p>
                        <p className="font-bold">{(Number(c.performance?.cliques) || 0).toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Conversões</p>
                        <p className="font-bold text-green-700">{(Number(c.performance?.conversoes) || 0).toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">ROI</p>
                        <p className="font-bold text-purple-700">{( Number(c.performance?.roi) || 0).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Dicas */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          Por que Facebook + Instagram juntos?
        </h4>
        <ul className="text-sm space-y-2 text-slate-700">
          <li>• <strong>Maior alcance</strong> — Facebook atinge públicos de 35-50 anos que não usam Instagram</li>
          <li>• <strong>Meta Business Suite</strong> gerencia ambas as plataformas em um só painel</li>
          <li>• <strong>Pixels compartilhados</strong> — remarketing funciona nas duas redes</li>
          <li>• <strong>Configure OAuth</strong> em Integrações &gt; Credenciais OAuth para sincronizar automaticamente</li>
          <li>• <strong>Use Meta CAPI</strong> para rastrear conversões server-side com precisão</li>
        </ul>
      </Card>
    </div>
  );
}
