import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Link2, CheckCircle, Send, Users } from "lucide-react";
import { useState } from "react";

export default function IntegracaoWhatsAppAPISection() {
  const [conectado, setConectado] = useState(false);
  const [automacoes] = useState([
    { id: 1, nome: "Confirmação de Compra", status: "ativo" },
    { id: 2, nome: "Carrinho Abandonado", status: "ativo" },
    { id: 3, nome: "Promoção Flash", status: "ativo" },
    { id: 4, nome: "Recomendação Produto", status: "ativo" },
    { id: 5, nome: "Feedback Pós-Compra", status: "ativo" },
    { id: 6, nome: "Reabastecimento", status: "ativo" },
  ]);

  const [conversas] = useState<Array<{ id: number; cliente: string; mensagem: string; hora: string; status: string }>>([]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integração com WhatsApp API</h2>
        <p className="text-slate-600">
          Conecte o Chat IA ao WhatsApp Business para atender clientes direto no WhatsApp com recomendações de produtos automáticas.
        </p>
      </div>

      {/* Status da Conexão */}
      <Card className={`border-l-4 ${conectado ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Status da Conexão WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-slate-200">
            <div>
              <p className="font-bold text-slate-900">WhatsApp Business API</p>
              <p className="text-xs text-slate-600">Status: {conectado ? "✅ Conectado" : "❌ Desconectado"}</p>
            </div>
            {!conectado ? (
              <Button onClick={() => setConectado(true)} className="bg-green-600 hover:bg-green-700">
                Conectar
              </Button>
            ) : (
              <Badge className="bg-green-600">✅ Ativo</Badge>
            )}
          </div>

          {conectado && (
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { titulo: "Conversas Ativas", valor: conversas.length.toString(), icon: "💬" },
                { titulo: "Automações Ativas", valor: automacoes.length.toString(), icon: "📨" },
                { titulo: "Status", valor: "Conectado", icon: "✅" }
              ].map((item, idx) => (
                <div key={idx} className="text-center p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-2xl mb-1">{item.icon}</p>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                  <p className="text-lg font-bold text-slate-900">{item.valor}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automações Configuradas */}
      {conectado && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Automações Configuradas</CardTitle>
            <CardDescription>Mensagens automáticas enviadas via WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {automacoes.map((auto) => (
              <div key={auto.id} className="border border-slate-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">{auto.nome}</h4>
                  <Badge className="bg-green-600">✅ {auto.status}</Badge>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline">Editar</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Conversas Recentes */}
      {conectado && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversas Recentes</CardTitle>
            <CardDescription>Últimas interações com clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 text-center py-4">Mensagens reais aparecerão aqui após conectar o WhatsApp Business API.</p>
          </CardContent>
        </Card>
      )}

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Conecte sua conta WhatsApp Business",
            "✅ Configure automações de mensagens",
            "✅ IA responde perguntas automaticamente",
            "✅ Envie links de produtos via WhatsApp",
            "✅ Rastreie conversões por conversa",
            "✅ Integre com Chat IA para recomendações",
            "✅ Responda mensagens direto da plataforma",
            "✅ Exporte histórico de conversas"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Benefícios Esperados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Atendimento Direto", descricao: "Clientes recebem respostas no WhatsApp" },
            { titulo: "Aumento de Conversão", descricao: "15-25% mais vendas com recomendações" },
            { titulo: "Redução de Carga", descricao: "Automações reduzem trabalho manual em 70%" },
            { titulo: "Satisfação do Cliente", descricao: "Respostas rápidas 24/7" },
            { titulo: "Rastreamento", descricao: "Veja qual mensagem converteu em venda" },
            { titulo: "Escalabilidade", descricao: "Gerencie múltiplos clientes simultaneamente" }
          ].map((beneficio, idx) => (
            <div key={idx} className="flex gap-3 p-3 border border-green-200 rounded bg-white">
              <span className="text-lg">✨</span>
              <div>
                <p className="font-semibold text-slate-900">{beneficio.titulo}</p>
                <p className="text-xs text-slate-600">{beneficio.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
