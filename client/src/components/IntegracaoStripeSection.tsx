import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, AlertCircle, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

const PRODUTOS_FEMINNITA = [
  { id: 1, nome: "Pijama Suede Rosa", preco: 49.90, estoque: 150, imagem: "🎀" },
  { id: 2, nome: "Pijama Algodão Azul", preco: 39.90, estoque: 200, imagem: "💙" },
  { id: 3, nome: "Pijama Inverno Cinza", preco: 59.90, estoque: 80, imagem: "❄️" },
  { id: 4, nome: "Pijama Premium Vinho", preco: 69.90, estoque: 120, imagem: "🍷" },
  { id: 5, nome: "Pijama Básico Branco", preco: 29.90, estoque: 300, imagem: "⚪" },
  { id: 6, nome: "Pijama Floral Amarelo", preco: 44.90, estoque: 90, imagem: "🌼" },
];

const PEDIDOS_RECENTES = [
  { id: "PED-001", cliente: "Carol Silva", produto: "Pijama Suede Rosa", valor: 49.90, status: "Pago", data: "31 Jan 2026" },
  { id: "PED-002", cliente: "Renata Costa", produto: "Pijama Inverno Cinza", valor: 59.90, status: "Pago", data: "30 Jan 2026" },
  { id: "PED-003", cliente: "Vanessa Oliveira", produto: "Pijama Premium Vinho", valor: 69.90, status: "Pendente", data: "29 Jan 2026" },
];

export default function IntegracaoStripeSection() {
  const [carrinho, setCarrinho] = useState<typeof PRODUTOS_FEMINNITA>([]);
  const [conectado, setConectado] = useState(true);
  const [processando, setProcessando] = useState(false);

  const adicionarAoCarrinho = (produto: typeof PRODUTOS_FEMINNITA[0]) => {
    setCarrinho([...carrinho, produto]);
  };

  const removerDoCarrinho = (id: number) => {
    setCarrinho(carrinho.filter(p => p.id !== id));
  };

  const totalCarrinho = carrinho.reduce((sum, p) => sum + p.preco, 0);

  const processarPagamento = async () => {
    setProcessando(true);
    setTimeout(() => {
      setProcessando(false);
      alert("Pagamento processado com sucesso! Pedido confirmado.");
      setCarrinho([]);
    }, 2000);
  };

  const receita = PEDIDOS_RECENTES.reduce((sum, p) => sum + p.valor, 0);
  const pedidosPagos = PEDIDOS_RECENTES.filter(p => p.status === "Pago").length;

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

          {/* Métricas */}
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Receita (30 dias)</h4>
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">R$ {receita.toFixed(2)}</p>
              <p className="text-xs text-slate-600 mt-1">+15% vs mês anterior</p>
            </Card>

            <Card className="p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Pedidos Pagos</h4>
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{pedidosPagos}</p>
              <p className="text-xs text-slate-600 mt-1">Taxa de conversão: 98.5%</p>
            </Card>

            <Card className="p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Ticket Médio</h4>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">R$ {(receita / pedidosPagos).toFixed(2)}</p>
              <p className="text-xs text-slate-600 mt-1">+8% vs mês anterior</p>
            </Card>
          </div>

          {/* Catálogo de Produtos */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📦 Catálogo de Produtos</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {PRODUTOS_FEMINNITA.map(produto => (
                <Card key={produto.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="text-center mb-3">
                    <div className="text-4xl mb-2">{produto.imagem}</div>
                    <h4 className="font-semibold text-sm">{produto.nome}</h4>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-green-600">R$ {produto.preco.toFixed(2)}</p>
                    <Badge variant="outline" className="text-xs">
                      {produto.estoque} em estoque
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => adicionarAoCarrinho(produto)}
                    className="w-full text-xs"
                  >
                    Adicionar
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Carrinho de Compras */}
          <div>
            <h3 className="font-semibold text-sm mb-3">
              🛒 Carrinho ({carrinho.length} itens)
            </h3>
            {carrinho.length > 0 ? (
              <Card className="p-4 bg-slate-50">
                <div className="space-y-2 mb-4">
                  {carrinho.map((produto, idx) => (
                    <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <p className="text-sm font-semibold">{produto.nome}</p>
                        <p className="text-xs text-slate-600">R$ {produto.preco.toFixed(2)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removerDoCarrinho(produto.id)}
                        className="text-xs"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-3 rounded border border-slate-200 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Subtotal:</span>
                    <span className="font-semibold">R$ {totalCarrinho.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Frete:</span>
                    <span className="font-semibold">R$ 10.00</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      R$ {(totalCarrinho + 10).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={processarPagamento}
                  disabled={processando || !conectado}
                  className="w-full gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  {processando ? "Processando..." : "Pagar com Stripe"}
                </Button>
              </Card>
            ) : (
              <Card className="p-4 bg-slate-50 text-center">
                <p className="text-sm text-slate-600">Carrinho vazio. Adicione produtos acima.</p>
              </Card>
            )}
          </div>

          {/* Pedidos Recentes */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📋 Pedidos Recentes</h3>
            <div className="space-y-2">
              {PEDIDOS_RECENTES.map(pedido => (
                <Card key={pedido.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{pedido.id}</p>
                        <Badge
                          variant={pedido.status === "Pago" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {pedido.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        {pedido.cliente} • {pedido.produto}
                      </p>
                      <p className="text-xs text-slate-500">{pedido.data}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">R$ {pedido.valor.toFixed(2)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
