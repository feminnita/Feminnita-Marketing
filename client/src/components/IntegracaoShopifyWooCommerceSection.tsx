import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertCircle, CheckCircle, Zap } from "lucide-react";

export default function IntegracaoShopifyWooCommerceSection() {
  const platforms = [
    {
      name: "Shopify",
      status: "Conectado",
      lastSync: "Há 2 minutos",
      products: 45,
      orders: 128,
      revenue: "R$ 12.450",
      color: "text-green-600"
    },
    {
      name: "WooCommerce",
      status: "Desconectado",
      lastSync: "Nunca",
      products: 0,
      orders: 0,
      revenue: "R$ 0",
      color: "text-slate-600"
    }
  ];

  const syncData = [
    { metric: "Produtos Sincronizados", value: "45/45", status: "✓" },
    { metric: "Pedidos Importados", value: "128", status: "✓" },
    { metric: "Estoque Atualizado", value: "Tempo real", status: "✓" },
    { metric: "Preços Sincronizados", value: "45/45", status: "✓" }
  ];

  const recentOrders = [
    { id: "#1001", product: "Pijama Suede Rosa", amount: "R$ 89,90", date: "Hoje 14:32" },
    { id: "#1000", product: "Pijama Algodão Azul", amount: "R$ 79,90", date: "Hoje 12:15" },
    { id: "#999", product: "Pijama Inverno Cinza", amount: "R$ 99,90", date: "Ontem 19:45" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Integração Shopify/WooCommerce
          </CardTitle>
          <CardDescription>
            Sincronize automaticamente inventário, pedidos e dados de vendas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plataformas */}
          <div className="grid md:grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{platform.name}</h3>
                  <Badge variant={platform.status === "Conectado" ? "default" : "outline"}>
                    {platform.status}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>Última sincronização: {platform.lastSync}</p>
                  <p>Produtos: <span className="font-semibold">{platform.products}</span></p>
                  <p>Pedidos: <span className="font-semibold">{platform.orders}</span></p>
                  <p>Receita: <span className="font-semibold text-green-600">{platform.revenue}</span></p>
                </div>
                <Button 
                  variant={platform.status === "Conectado" ? "outline" : "default"}
                  className="w-full text-sm"
                >
                  {platform.status === "Conectado" ? "Desconectar" : "Conectar"}
                </Button>
              </div>
            ))}
          </div>

          {/* Status de Sincronização */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Status de Sincronização</h3>
            <div className="space-y-2">
              {syncData.map((item) => (
                <div key={item.metric} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{item.value}</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pedidos Recentes */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Pedidos Recentes (Shopify)</h3>
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-semibold text-slate-900">{order.id}</p>
                    <p className="text-slate-600">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{order.amount}</p>
                    <p className="text-slate-600 text-xs">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex gap-2">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 text-sm">Dicas de Integração</p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Sincronização automática a cada 5 minutos</li>
                  <li>• Evita overselling com atualização em tempo real</li>
                  <li>• Rastreie ROI por plataforma de venda</li>
                  <li>• Integre com analytics para funil completo</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
