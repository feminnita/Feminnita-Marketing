import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, ThumbsUp, TrendingUp, BarChart3, Send, Star } from "lucide-react";

const FEEDBACKS = [
  {
    id: 1,
    persona: "Carol",
    roteiro: "Meu Primeiro Pedido Chegou!",
    tipo: "Story",
    conversoes: 87,
    engajamento: "9.2%",
    satisfacao: 4.8,
    comentario: "Vídeo muito autêntico! Gerou muitas vendas para iniciantes.",
    data: "2026-02-01"
  },
  {
    id: 2,
    persona: "Renata",
    roteiro: "Análise Rápida de Qualidade",
    tipo: "TikTok",
    conversoes: 156,
    engajamento: "11.5%",
    satisfacao: 4.9,
    comentario: "Perfeito para lojistas! Maior taxa de conversão da semana.",
    data: "2026-02-02"
  },
  {
    id: 3,
    persona: "Vanessa",
    roteiro: "Compra Coletiva com as Amigas",
    tipo: "Reels",
    conversoes: 203,
    engajamento: "12.8%",
    satisfacao: 4.7,
    comentario: "Comunidade adorou! Muitos comentários de amigas querendo participar.",
    data: "2026-02-03"
  },
  {
    id: 4,
    persona: "Luiza",
    roteiro: "Pijama Inverno 2026",
    tipo: "Reels",
    conversoes: 245,
    engajamento: "14.2%",
    satisfacao: 4.9,
    comentario: "Melhor performance de lançamento! Muito impacto visual.",
    data: "2026-02-04"
  },
  {
    id: 5,
    persona: "Carol",
    roteiro: "Como Ganhei R$ 500 em 1 Semana",
    tipo: "TikTok",
    conversoes: 134,
    engajamento: "10.7%",
    satisfacao: 4.6,
    comentario: "Bom engajamento, mas poderia ter mais prova social.",
    data: "2026-02-05"
  },
];

const INSIGHTS = [
  {
    titulo: "Persona Mais Eficaz",
    valor: "Luiza",
    detalhes: "245 conversões em média",
    cor: "bg-purple-50"
  },
  {
    titulo: "Tipo de Conteúdo Top",
    valor: "Reels",
    detalhes: "12.8% engagement médio",
    cor: "bg-pink-50"
  },
  {
    titulo: "Roteiro Melhor Avaliado",
    valor: "Pijama Inverno",
    detalhes: "4.9 ⭐ satisfação",
    cor: "bg-yellow-50"
  },
  {
    titulo: "Taxa de Conversão Média",
    valor: "165",
    detalhes: "Conversões por vídeo",
    cor: "bg-green-50"
  },
];

export default function FeedbackClientesSection() {
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);
  const [newFeedback, setNewFeedback] = useState("");

  const avgSatisfacao = (FEEDBACKS.reduce((acc, f) => acc + f.satisfacao, 0) / FEEDBACKS.length).toFixed(1);
  const totalConversoes = FEEDBACKS.reduce((acc, f) => acc + f.conversoes, 0);

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Sistema de Feedback de Clientes
          </CardTitle>
          <CardDescription>
            Colete feedback sobre personas, roteiros e campanhas. Identifique o que funciona melhor e otimize futuras estratégias.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Insights Principais */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📊 Insights Principais</h3>
            <div className="grid md:grid-cols-4 gap-3">
              {INSIGHTS.map((insight, idx) => (
                <Card key={idx} className={`${insight.cor} p-4`}>
                  <h4 className="font-semibold text-xs mb-1">{insight.titulo}</h4>
                  <div className="text-xl font-bold text-slate-900 mb-1">{insight.valor}</div>
                  <p className="text-xs text-slate-600">{insight.detalhes}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Estatísticas Gerais */}
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="bg-blue-50 p-4">
              <h4 className="font-semibold text-sm mb-2">📈 Total de Conversões</h4>
              <div className="text-2xl font-bold text-blue-600">{totalConversoes}</div>
              <p className="text-xs text-slate-600 mt-1">De todos os vídeos</p>
            </Card>

            <Card className="bg-purple-50 p-4">
              <h4 className="font-semibold text-sm mb-2">⭐ Satisfação Média</h4>
              <div className="text-2xl font-bold text-purple-600">{avgSatisfacao}</div>
              <p className="text-xs text-slate-600 mt-1">De 5.0 possível</p>
            </Card>

            <Card className="bg-green-50 p-4">
              <h4 className="font-semibold text-sm mb-2">📹 Vídeos Avaliados</h4>
              <div className="text-2xl font-bold text-green-600">{FEEDBACKS.length}</div>
              <p className="text-xs text-slate-600 mt-1">Total de feedbacks</p>
            </Card>
          </div>

          {/* Feedbacks Detalhados */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Feedbacks Detalhados</h3>
            <div className="space-y-3">
              {FEEDBACKS.map(feedback => (
                <Card
                  key={feedback.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedFeedback(selectedFeedback === feedback.id ? null : feedback.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{feedback.persona} - {feedback.roteiro}</h4>
                        <Badge variant="outline" className="text-xs">
                          {feedback.tipo}
                        </Badge>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(feedback.satisfacao)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs mb-2">
                        <div className="bg-green-50 px-2 py-1 rounded">
                          <span className="text-slate-600">Conversões:</span>
                          <span className="font-semibold text-green-600 ml-1">{feedback.conversoes}</span>
                        </div>
                        <div className="bg-blue-50 px-2 py-1 rounded">
                          <span className="text-slate-600">Engajamento:</span>
                          <span className="font-semibold text-blue-600 ml-1">{feedback.engajamento}</span>
                        </div>
                        <div className="bg-slate-100 px-2 py-1 rounded">
                          <span className="text-slate-600">📅 {feedback.data}</span>
                        </div>
                      </div>

                      {selectedFeedback === feedback.id && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-sm text-slate-700 mb-3">
                            <strong>Comentário:</strong> {feedback.comentario}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-xs gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              Útil
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Replicar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Novo Feedback */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Adicionar Novo Feedback</h3>
            <Card className="p-4 bg-slate-50">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold block mb-2">Qual persona/roteiro você quer avaliar?</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                    <option>Selecione uma opção...</option>
                    {FEEDBACKS.map(f => (
                      <option key={f.id}>{f.persona} - {f.roteiro}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">Quantas conversões gerou?</label>
                  <input
                    type="number"
                    placeholder="Ex: 150"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">Seu feedback (opcional)</label>
                  <textarea
                    placeholder="Compartilhe sua opinião sobre este vídeo..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm h-20"
                  />
                </div>

                <Button className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Enviar Feedback
                </Button>
              </div>
            </Card>
          </div>

          {/* Recomendações */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">💡 Recomendações Baseadas em Feedback</h4>
            <ul className="text-sm space-y-2 text-slate-700">
              <li>✓ <strong>Aumentar produção de Reels:</strong> Melhor performance (12.8% engagement)</li>
              <li>✓ <strong>Focar em Luiza:</strong> Persona com maior taxa de conversão (245 vendas)</li>
              <li>✓ <strong>Adicionar mais prova social:</strong> Sugestão recorrente no feedback</li>
              <li>✓ <strong>Manter autenticidade:</strong> Fator crítico para sucesso de Carol</li>
              <li>✓ <strong>Investir em lançamentos:</strong> Pijama Inverno teve melhor performance</li>
            </ul>
          </Card>

          {/* Comparação de Personas */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Comparação de Personas</h3>
            <div className="space-y-2">
              {["Carol", "Renata", "Vanessa", "Luiza"].map(persona => {
                const personaData = FEEDBACKS.filter(f => f.persona === persona);
                const avgConversoes = personaData.length > 0
                  ? (personaData.reduce((acc, f) => acc + f.conversoes, 0) / personaData.length).toFixed(0)
                  : 0;
                const avgEngajamento = personaData.length > 0
                  ? (personaData.reduce((acc, f) => acc + parseFloat(f.engajamento), 0) / personaData.length).toFixed(1)
                  : 0;

                return (
                  <Card key={persona} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{persona}</h4>
                        <p className="text-xs text-slate-600">
                          {personaData.length} vídeo(s) | {avgConversoes} conversões médias | {avgEngajamento}% engajamento
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">{avgConversoes}</div>
                        <div className="text-xs text-slate-600">conversões</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
