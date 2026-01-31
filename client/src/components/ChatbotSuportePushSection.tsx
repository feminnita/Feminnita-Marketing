import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, CheckCircle, AlertCircle, TrendingUp, Zap } from "lucide-react";

export default function ChatbotSuportePushSection() {
  const supportMetrics = [
    { label: "Mensagens Respondidas", value: "2,847", icon: MessageCircle, color: "text-blue-500" },
    { label: "Tempo Médio Resposta", value: "2m 15s", icon: Clock, color: "text-orange-500" },
    { label: "Taxa Resolução", value: "92.3%", icon: CheckCircle, color: "text-green-500" },
    { label: "Satisfação Cliente", value: "4.7/5.0", icon: TrendingUp, color: "text-pink-500" },
  ];

  const ticketCategories = [
    { category: "Dúvidas sobre Produtos", count: 1245, avgTime: "3m", resolved: "94%", priority: "Alta" },
    { category: "Rastreamento de Pedido", count: 892, avgTime: "2m", resolved: "98%", priority: "Alta" },
    { category: "Problemas de Pagamento", count: 456, avgTime: "5m", resolved: "87%", priority: "Crítica" },
    { category: "Trocas e Devoluções", count: 234, avgTime: "4m", resolved: "91%", priority: "Média" },
    { category: "Feedback e Sugestões", count: 145, avgTime: "2m", resolved: "100%", priority: "Baixa" },
  ];

  const automatedResponses = [
    { trigger: "Olá", response: "Olá! Bem-vinda à Feminnita! Como posso ajudar? 😊", uses: 1245 },
    { trigger: "Quanto custa frete?", response: "O frete varia de R$10 a R$35 dependendo da região. Compras acima de R$150 têm frete grátis! 🚚", uses: 892 },
    { trigger: "Como rastrear pedido?", response: "Você pode rastrear seu pedido no link: feminnita.com.br/rastrear com seu código de pedido. 📦", uses: 756 },
    { trigger: "Qual é o prazo de entrega?", response: "Prazo padrão é de 7-15 dias úteis. Regiões Norte/Nordeste podem levar até 20 dias. 📅", uses: 634 },
    { trigger: "Tem desconto para revenda?", response: "Sim! Temos condições especiais para revendedoras. Clique aqui para saber mais: feminnita.com.br/revenda 💼", uses: 523 },
    { trigger: "Como devolver produto?", response: "Você tem 30 dias para devolver. Abra um ticket de devolução em sua conta e enviaremos a etiqueta! 🔄", uses: 412 },
  ];

  const recentTickets = [
    { id: "#12847", customer: "Maria Silva", category: "Rastreamento", status: "Resolvido", time: "5m", satisfaction: 5 },
    { id: "#12846", customer: "Ana Costa", category: "Dúvida Produto", status: "Resolvido", time: "12m", satisfaction: 5 },
    { id: "#12845", customer: "Juliana Santos", category: "Pagamento", status: "Em Progresso", time: "8m", satisfaction: null },
    { id: "#12844", customer: "Fernanda Oliveira", category: "Devolução", status: "Resolvido", time: "18m", satisfaction: 4 },
    { id: "#12843", customer: "Beatriz Martins", category: "Dúvida Produto", status: "Resolvido", time: "3m", satisfaction: 5 },
  ];

  const notificationTemplates = [
    { name: "Confirmação de Compra", trigger: "Após pagamento", channels: ["WhatsApp", "Email"], active: true },
    { name: "Pedido Enviado", trigger: "Quando sai da loja", channels: ["WhatsApp", "SMS"], active: true },
    { name: "Entrega Próxima", trigger: "1 dia antes", channels: ["WhatsApp", "Email"], active: true },
    { name: "Avaliação de Produto", trigger: "5 dias após entrega", channels: ["WhatsApp", "Email"], active: true },
    { name: "Carrinho Abandonado", trigger: "4 horas depois", channels: ["WhatsApp", "Email"], active: true },
    { name: "Promoção Flash", trigger: "Manual", channels: ["WhatsApp", "Email", "SMS"], active: false },
  ];

  const conversationFlow = [
    { step: 1, message: "Cliente: Olá, tudo bem?", type: "customer" },
    { step: 2, message: "Bot: Olá! Bem-vinda à Feminnita! Como posso ajudar? 😊", type: "bot" },
    { step: 3, message: "Cliente: Quero saber sobre pijamas de inverno", type: "customer" },
    { step: 4, message: "Bot: Ótimo! Temos uma coleção exclusiva de inverno com até 30% off! Qual tamanho você usa?", type: "bot" },
    { step: 5, message: "Cliente: P", type: "customer" },
    { step: 6, message: "Bot: Perfeito! Aqui estão nossas opções em tamanho P: [Link para produtos]", type: "bot" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Chatbot de Suporte 24/7</h2>
        <p className="text-slate-600">Integração com WhatsApp para responder dúvidas, rastrear pedidos e oferecer suporte automático fora de horário</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {supportMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ticket Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Categorias de Tickets
          </CardTitle>
          <CardDescription>Distribuição de tipos de suporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ticketCategories.map((ticket, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{ticket.category}</p>
                    <p className="text-xs text-slate-600">{ticket.count} tickets • Tempo médio: {ticket.avgTime}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        ticket.priority === "Crítica"
                          ? "destructive"
                          : ticket.priority === "Alta"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                    <p className="text-sm font-bold text-green-600 mt-2">{ticket.resolved} resolvido</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: ticket.resolved }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automated Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Respostas Automáticas Configuradas
          </CardTitle>
          <CardDescription>Triggers que disparam respostas automáticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {automatedResponses.map((response, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900 bg-blue-50 px-3 py-1 rounded inline-block text-sm">
                      "{response.trigger}"
                    </p>
                    <p className="text-sm text-slate-600 mt-2">{response.response}</p>
                  </div>
                  <Badge variant="outline">{response.uses} usos</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Tickets Recentes
          </CardTitle>
          <CardDescription>Últimas conversas de suporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">ID</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Cliente</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Categoria</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-900">Status</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-900">Tempo</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-900">Satisfação</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-3 px-3 font-mono text-slate-700">{ticket.id}</td>
                    <td className="py-3 px-3 text-slate-700">{ticket.customer}</td>
                    <td className="py-3 px-3 text-slate-600">{ticket.category}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={ticket.status === "Resolvido" ? "default" : "secondary"}>
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600">{ticket.time}</td>
                    <td className="py-3 px-3 text-center">
                      {ticket.satisfaction ? (
                        <span className="text-yellow-500">{"⭐".repeat(ticket.satisfaction)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notification Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Templates de Notificação
          </CardTitle>
          <CardDescription>Automações de mensagens por WhatsApp, Email e SMS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificationTemplates.map((template, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                <div>
                  <p className="font-medium text-slate-900">{template.name}</p>
                  <p className="text-xs text-slate-600">Trigger: {template.trigger}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {template.channels.map((channel, cidx) => (
                      <Badge key={cidx} variant="outline" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                  <Badge variant={template.active ? "default" : "secondary"}>
                    {template.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Example Conversation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Exemplo de Conversa
          </CardTitle>
          <CardDescription>Como o chatbot interage com clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {conversationFlow.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "customer" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === "customer"
                      ? "bg-pink-500 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle className="w-5 h-5" />
            Como Implementar
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-3">
          <ol className="list-decimal list-inside space-y-2">
            <li>Integrar com WhatsApp Business API</li>
            <li>Configurar triggers de automação</li>
            <li>Criar templates de respostas</li>
            <li>Treinar bot com FAQ da empresa</li>
            <li>Testar fluxos de conversa</li>
            <li>Ativar notificações automáticas</li>
            <li>Monitorar satisfação do cliente</li>
            <li>Ajustar respostas baseado em feedback</li>
          </ol>
          <p className="text-sm mt-4">
            <strong>Plataformas recomendadas:</strong> Twilio, ManyChat, Chatfuel, ou integração nativa do WhatsApp Business API
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
