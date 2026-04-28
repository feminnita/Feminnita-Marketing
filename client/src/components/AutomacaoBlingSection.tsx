import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, AlertCircle, Loader2, Package, ShoppingCart,
  Users, BarChart3, Link2, LogOut, RefreshCw, Zap
} from "lucide-react";

const SYNC_ACTIONS = [
  { key: "produtos",  label: "Produtos",  icon: <Package className="w-4 h-4" />,      desc: "Catálogo e preços" },
  { key: "pedidos",   label: "Pedidos",   icon: <ShoppingCart className="w-4 h-4" />,  desc: "Histórico de vendas" },
  { key: "contatos",  label: "Clientes",  icon: <Users className="w-4 h-4" />,         desc: "Base de contatos" },
  { key: "estoque",   label: "Estoque",   icon: <BarChart3 className="w-4 h-4" />,     desc: "Quantidades disponíveis" },
] as const;

export function AutomacaoBlingSection() {
  const [syncResults, setSyncResults] = useState<Record<string, any>>({});
  const utils = trpc.useUtils();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("bling") === "connected" || params.get("bling") === "error") {
      utils.blingOAuth.getStatus.invalidate();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const { data: status, isLoading: loadingStatus } = trpc.blingOAuth.getStatus.useQuery();
  const { data: urlData } = trpc.blingOAuth.gerarUrlAutorizacao.useQuery(undefined, {
    enabled: !status?.conectado,
  });

  const desconectar = trpc.blingOAuth.desconectar.useMutation({
    onSuccess: () => utils.blingOAuth.getStatus.invalidate(),
  });

  const syncProdutos = trpc.bling.sincronizarProdutos.useMutation();
  const syncPedidos  = trpc.bling.sincronizarPedidos.useMutation();
  const syncContatos = trpc.bling.sincronizarContatos.useMutation();
  const syncEstoque  = trpc.bling.sincronizarEstoque.useMutation();

  const doSync = async (key: string) => {
    // Token is managed server-side via stored OAuth token
    // Pass empty string; server will use stored token
    const accessToken = "";
    try {
      let result: any;
      if (key === "produtos") result = await syncProdutos.mutateAsync({ accessToken, pagina: 1, limite: 100 });
      else if (key === "pedidos") result = await syncPedidos.mutateAsync({ accessToken });
      else if (key === "contatos") result = await syncContatos.mutateAsync({ accessToken });
      else if (key === "estoque") result = await syncEstoque.mutateAsync({ accessToken });
      setSyncResults(prev => ({ ...prev, [key]: result }));
    } catch (err: any) {
      setSyncResults(prev => ({ ...prev, [key]: { error: err?.message ?? "Erro na sincronização" } }));
    }
  };

  if (loadingStatus) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6B1D28' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Bling ERP</h2>
        <p className="text-slate-500 text-sm mt-1">
          Sincronize produtos, pedidos, clientes e estoque direto do Bling.
        </p>
      </div>

      {/* Status */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status?.conectado ? 'bg-green-50' : 'bg-slate-100'}`}>
                {status?.conectado
                  ? <CheckCircle2 className="w-6 h-6 text-green-600" />
                  : <Link2 className="w-6 h-6 text-slate-400" />
                }
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {status?.conectado ? "Bling conectado" : "Bling não conectado"}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {status?.conectado
                    ? status.expirado ? "Token expirado — reconecte" : "Conexão ativa"
                    : "Clique em Conectar para autorizar"
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {status?.conectado ? (
                <Button variant="outline" size="sm" disabled={desconectar.isPending}
                  onClick={() => desconectar.mutate()}>
                  {desconectar.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    : <LogOut className="w-4 h-4 mr-2" />}
                  Desconectar
                </Button>
              ) : (
                <Button style={{ backgroundColor: '#6B1D28' }} className="text-white"
                  disabled={!urlData?.url}
                  onClick={() => { if (urlData?.url) window.location.href = urlData.url; }}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Conectar Bling
                </Button>
              )}
            </div>
          </div>

          {!status?.conectado && (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm space-y-2">
              <p className="font-semibold text-amber-800">Antes de conectar, adicione no .env:</p>
              <div className="font-mono text-xs bg-amber-100 rounded-lg p-3 space-y-1 text-amber-900">
                <p>BLING_CLIENT_ID=seu_client_id</p>
                <p>BLING_CLIENT_SECRET=seu_client_secret</p>
                <p>BLING_REDIRECT_URI=http://localhost:5000/api/bling/callback</p>
              </div>
              <p className="text-amber-700 text-xs">
                Crie o aplicativo em: <strong>bling.com.br → Configurações → API → Aplicativos</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sincronização */}
      {status?.conectado && !status.expirado && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Sincronizar dados</p>
            <Button variant="outline" size="sm"
              onClick={() => SYNC_ACTIONS.forEach(a => doSync(a.key))}>
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Sincronizar tudo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYNC_ACTIONS.map(({ key, label, icon, desc }) => {
              const result = syncResults[key];
              const isRunning =
                (key === "produtos" && syncProdutos.isPending) ||
                (key === "pedidos"  && syncPedidos.isPending)  ||
                (key === "contatos" && syncContatos.isPending) ||
                (key === "estoque"  && syncEstoque.isPending);

              return (
                <Card key={key} className="border-0 shadow-sm">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-slate-50 text-slate-500 flex-shrink-0">{icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm">{label}</p>
                          <p className="text-xs text-slate-400">{desc}</p>

                          {result && !result.error && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {[
                                result.totalSincronizados != null && `${result.totalSincronizados} itens`,
                                result.totalPedidos != null && `${result.totalPedidos} pedidos`,
                                result.totalContatos != null && `${result.totalContatos} contatos`,
                                result.totalEstoque != null && `${result.totalEstoque} itens`,
                              ].filter(Boolean).map((label, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{label as string}</Badge>
                              ))}
                              <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1 inline" />Sincronizado
                              </Badge>
                            </div>
                          )}

                          {result?.error && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" />
                              {result.error}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button size="sm" variant="outline" disabled={isRunning}
                        onClick={() => doSync(key)} className="flex-shrink-0">
                        {isRunning
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <RefreshCw className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Webhook */}
      {status?.conectado && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Webhook — atualizações em tempo real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-3">
              Configure no Bling (Configurações → Webhooks) para receber atualizações automáticas de estoque e pedidos.
            </p>
            <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs text-slate-700 select-all break-all">
              {window.location.origin}/api/bling/webhook
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
