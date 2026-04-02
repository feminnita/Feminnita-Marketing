import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, AlertCircle, DollarSign, Package } from "lucide-react";

export default function IntegracaoStripeSection() {
  const [conectado, setConectado] = useState(false);
  const [processando, setProcessando] = useState(false);

  const processarPagamento = async () => {
    toast.error("Integração Stripe não configurada. Adicione sua chave de API Stripe nas configurações para processar pagamentos reais.");
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Integração Stripe
          </CardTitle>
          <CardDescription>
            Processe pagamentos diretos na plataforma. Clientes compram pijamas sem sair do dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status da Conexão */}
          <Card className={`p-4 ${conectado ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {conectado ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">
                    {conectado ? "✓ Stripe Conectado" : "✗ Stripe Desconectado"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {conectado
                      ? "Chave: sk_live_****...****"
                      : "Clique para conectar sua conta Stripe"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={conectado ? "outline" : "default"}
                onClick={() => setConectado(!conectado)}
              >
                {conectado ? "Desconectar" : "Conectar"}
              </Button>
            </div>
          </Card>

          {/* Métricas — disponíveis após conectar o Stripe */}
          <Card className="p-4 bg-slate-50 border border-dashed border-slate-300">
            <div className="flex items-center gap-3 text-slate-500">
              <DollarSign className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Métricas de receita, pedidos pagos e ticket médio serão exibidas aqui após conectar o Stripe.</p>
            </div>
          </Card>

          {/* Catálogo de Produtos */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📦 Catálogo de Produtos</h3>
            <Card className="p-4 border-dashed border-slate-300 bg-slate-50 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500 font-medium">Produtos sincronizados via Bling ERP</p>
              <p className="text-xs text-slate-400 mt-1">Conecte o Bling na aba <strong>Integrações &gt; Bling ERP</strong> para exibir seu catálogo com preços e estoque reais.</p>
            </Card>
          </div>

          {/* Pedidos Recentes */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📋 Pedidos Recentes</h3>
            <Card className="p-4 bg-slate-50 text-center">
              <p className="text-sm text-slate-500">Conecte o Stripe para ver pedidos reais aqui.</p>
            </Card>
          </div>

          {/* Configurações */}
          <div>
            <h3 className="font-semibold text-sm mb-3">⚙️ Configurações</h3>
            <Card className="p-4 bg-slate-50 space-y-3">
              <div>
                <label className="text-sm font-semibold block mb-2">Taxa de Comissão (%)</label>
                <input
                  type="number"
                  defaultValue="2.9"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
                <p className="text-xs text-slate-600 mt-1">Taxa padrão do Stripe</p>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Moeda</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                  <option>BRL - Real Brasileiro</option>
                  <option>USD - Dólar Americano</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm">Ativar pagamento recorrente (assinatura)</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm">Enviar recibos por email automaticamente</span>
                </label>
              </div>
            </Card>
          </div>

          {/* Dicas */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">✅ Próximos Passos</h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>1. <strong>Conecte sua conta Stripe</strong> clicando no botão acima</li>
              <li>2. <strong>Configure seus produtos</strong> com preços e imagens</li>
              <li>3. <strong>Teste um pagamento</strong> com cartão de teste (4242 4242 4242 4242)</li>
              <li>4. <strong>Monitore pedidos</strong> em tempo real no dashboard</li>
              <li>5. <strong>Configure automações</strong> (recibos, notificações, etc)</li>
            </ol>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
