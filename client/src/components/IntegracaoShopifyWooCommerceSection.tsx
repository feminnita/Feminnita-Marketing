import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertCircle, Zap } from "lucide-react";

const PLATFORMS = [
  {
    name: "Shopify",
    descricao: "Plataforma de e-commerce",
    setupSteps: [
      "Acesse Shopify → Settings → Apps and sales channels → Develop apps",
      "Crie um app privado, habilite Admin API scopes: read_orders, read_products, read_inventory",
      "Copie o API Key e Admin API access token",
    ],
  },
  {
    name: "WooCommerce",
    descricao: "Plugin para WordPress",
    setupSteps: [
      "Acesse WooCommerce → Settings → Advanced → REST API → Add key",
      "Permissões: Read/Write. Copie Consumer Key e Consumer Secret",
      "URL base: https://seu-site.com/wp-json/wc/v3",
    ],
  },
];

export default function IntegracaoShopifyWooCommerceSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Integração Shopify/WooCommerce</h2>
        <p className="text-slate-500 text-sm mt-1">Sincronize inventário, pedidos e dados de vendas</p>
      </div>

      {/* Not connected notice */}
      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Sincronização de pedidos, estoque e receita requer conexão direta com a <strong>API do Shopify</strong> ou
            <strong> WooCommerce</strong>. Configure as credenciais abaixo para ativar a integração.
          </p>
        </CardContent>
      </Card>

      {/* Platforms — setup guides */}
      <div className="grid md:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => (
          <Card key={platform.name} className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{platform.name}</CardTitle>
                <Badge variant="outline" className="text-xs text-slate-500">Não conectado</Badge>
              </div>
              <CardDescription className="text-xs">{platform.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {platform.setupSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 text-xs text-slate-600">
                    <span className="font-bold text-slate-400 flex-shrink-0">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full text-sm" size="sm">
                Conectar {platform.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What you get after connecting */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4" style={{ color: '#8B2635' }} />
            O que você terá após conectar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { icon: <ShoppingCart className="w-4 h-4 text-blue-600" />, titulo: "Pedidos em tempo real", desc: "Todos os pedidos importados automaticamente a cada 5 minutos" },
              { icon: <ShoppingCart className="w-4 h-4 text-green-600" />, titulo: "Estoque sincronizado", desc: "Evite overselling com atualização de estoque em tempo real" },
              { icon: <ShoppingCart className="w-4 h-4 text-purple-600" />, titulo: "Receita por canal", desc: "Rastreie ROI de cada campanha com dados reais de venda" },
              { icon: <ShoppingCart className="w-4 h-4 text-amber-600" />, titulo: "Funil completo", desc: "Integre com GA4 para ver jornada completa do cliente" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                {item.icon}
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.titulo}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
