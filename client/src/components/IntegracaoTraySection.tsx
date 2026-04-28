import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, CheckCircle2, AlertCircle, ExternalLink, Package, Zap } from "lucide-react";

const SETUP_STEPS = [
  { step: "1", title: "Acessar painel Tray", desc: "Faça login em app.tray.com.br → Configurações → API" },
  { step: "2", title: "Gerar API Key", desc: "Crie uma nova API Key com permissões de pedidos e produtos" },
  { step: "3", title: "Adicionar ao .env", desc: "TRAY_API_KEY=sua_chave\nTRAY_STORE_ID=seu_id_loja" },
  { step: "4", title: "Configurar webhook", desc: "Em Tray → Integrações → Webhooks, adicione:\n{sua-url}/api/tray/webhook" },
];

export function IntegracaoTraySection() {
  const { data: blingStatus } = trpc.blingOAuth.getStatus.useQuery();

  const trayKey = (import.meta as any).env?.TRAY_API_KEY || (import.meta as any).env?.VITE_TRAY_API_KEY;
  const connected = !!trayKey;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Integração Tray</h2>
        <p className="text-slate-500 text-sm mt-1">Sincronize pedidos, clientes e produtos da sua loja Tray.</p>
      </div>

      {/* Status */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-5">
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${connected ? 'bg-green-50' : 'bg-slate-100'}`}>
              {connected
                ? <CheckCircle2 className="w-6 h-6 text-green-600" />
                : <AlertCircle className="w-6 h-6 text-slate-400" />}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{connected ? "Tray conectada" : "Tray não configurada"}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {connected ? "Integração ativa" : "Configure as variáveis de ambiente para conectar"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bling note */}
      {blingStatus?.conectado && (
        <Card className="border-0 shadow-sm" style={{ backgroundColor: '#fdf0e8' }}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                <strong>Você já tem Bling conectado.</strong> Se usa Bling como ERP principal, a integração Tray pode ser desnecessária — Bling já sincroniza pedidos de múltiplos canais.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup guide */}
      {!connected && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Como configurar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SETUP_STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: '#6B1D28' }}>
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono whitespace-pre-line">{desc}</p>
                </div>
              </div>
            ))}
            <a href="https://app.tray.com.br" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium mt-2" style={{ color: '#6B1D28' }}>
              <ExternalLink className="w-4 h-4" />
              Abrir painel Tray
            </a>
          </CardContent>
        </Card>
      )}

      {/* What it enables */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-500" />
            O que a integração habilita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: "📦", title: "Pedidos em tempo real", desc: "Sync automático a cada novo pedido" },
              { icon: "👥", title: "Base de clientes", desc: "Importa clientes da Tray para CRM" },
              { icon: "🏷️", title: "Produtos e estoque", desc: "Catálogo e quantidades disponíveis" },
              { icon: "🔄", title: "Status de entrega", desc: "Rastreamento e notificações" },
              { icon: "📊", title: "Relatórios de vendas", desc: "Faturamento, ticket médio, LTV" },
              { icon: "⚡", title: "Webhooks", desc: "Atualizações em tempo real via push" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
