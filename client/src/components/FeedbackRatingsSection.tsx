import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

export default function FeedbackRatingsSection() {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      nome: "Story - Renda Extra",
      tipo: "story",
      rating: 4.8,
      votos: 156,
      conversoes: 342,
      feedback: [
        { usuario: "Maria S.", rating: 5, texto: "Excelente! Aumentei minhas vendas em 40%", data: "2026-01-30" },
        { usuario: "João P.", rating: 5, texto: "Roteiro muito bem estruturado", data: "2026-01-29" },
        { usuario: "Ana C.", rating: 4, texto: "Bom, mas precisei adaptar para meu público", data: "2026-01-28" }
      ]
    },
    {
      id: 2,
      nome: "Reels - Bastidores",
      tipo: "reels",
      rating: 4.6,
      votos: 89,
      conversoes: 156,
      feedback: [
        { usuario: "Carlos M.", rating: 5, texto: "Viralização garantida!", data: "2026-01-30" },
        { usuario: "Beatriz L.", rating: 4, texto: "Bom formato, mas muito longo", data: "2026-01-29" }
      ]
    },
    {
      id: 3,
      nome: "Ads - Compra Familiar",
      tipo: "ads",
      rating: 4.3,
      votos: 67,
      conversoes: 98,
      feedback: [
        { usuario: "Roberto A.", rating: 4, texto: "Funciona bem para meu público", data: "2026-01-28" }
      ]
    },
    {
      id: 4,
      nome: "Story - Enquete",
      tipo: "story",
      rating: 4.9,
      votos: 234,
      conversoes: 512,
      feedback: [
        { usuario: "Fernanda T.", rating: 5, texto: "Melhor template! Engajamento máximo", data: "2026-01-30" },
        { usuario: "Lucas B.", rating: 5, texto: "Perfeito para coletar dados", data: "2026-01-29" }
      ]
    },
    {
      id: 5,
      nome: "Reels - Transformação",
      tipo: "reels",
      rating: 4.4,
      votos: 78,
      conversoes: 134,
      feedback: [
        { usuario: "Patricia G.", rating: 4, texto: "Bom, mas precisa de qualidade de vídeo alta", data: "2026-01-28" }
      ]
    },
    {
      id: 6,
      nome: "TikTok - ASMR",
      tipo: "tiktok",
      rating: 4.7,
      votos: 112,
      conversoes: 267,
      feedback: [
        { usuario: "Diego S.", rating: 5, texto: "Virou viral em 24 horas!", data: "2026-01-30" }
      ]
    }
  ]);

  const [novoFeedback, setNovoFeedback] = useState("");
  const [novaRating, setNovaRating] = useState(5);
  const [templateSelecionado, setTemplateSelecionado] = useState(1);

  const templateAtual = templates.find(t => t.id === templateSelecionado);

  const adicionarFeedback = () => {
    if (novoFeedback.trim()) {
      setTemplates(templates.map(t => 
        t.id === templateSelecionado 
          ? {
              ...t,
              rating: ((t.rating * t.votos) + novaRating) / (t.votos + 1),
              votos: t.votos + 1,
              feedback: [
                { usuario: "Você", rating: novaRating, texto: novoFeedback, data: new Date().toISOString().split('T')[0] },
                ...t.feedback
              ]
            }
          : t
      ));
      setNovoFeedback("");
      setNovaRating(5);
    }
  };

  const topTemplates = [...templates].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const maisConversoes = [...templates].sort((a, b) => b.conversoes - a.conversoes).slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sistema de Feedback e Ratings</h2>
        <p className="text-slate-600">
          Veja avaliações de outros usuários, compartilhe seu feedback e identifique os templates mais eficazes.
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { titulo: "Total de Templates", valor: templates.length, icon: "📊" },
          { titulo: "Rating Médio", valor: (templates.reduce((a, t) => a + t.rating, 0) / templates.length).toFixed(1), icon: "⭐" },
          { titulo: "Total de Votos", valor: templates.reduce((a, t) => a + t.votos, 0), icon: "🗳️" },
          { titulo: "Total de Conversões", valor: templates.reduce((a, t) => a + t.conversoes, 0), icon: "💰" }
        ].map((stat, idx) => (
          <Card key={idx} className="border-2">
            <CardContent className="pt-6">
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{stat.titulo}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Templates */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Top 3 Melhor Avaliados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topTemplates.map((template, idx) => (
              <div key={template.id} className="flex items-center justify-between p-3 bg-white rounded border border-yellow-200">
                <div>
                  <p className="font-semibold text-slate-900">#{idx + 1} {template.nome}</p>
                  <p className="text-xs text-slate-600">{template.votos} votos</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-600">⭐ {template.rating.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top 3 Mais Conversões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {maisConversoes.map((template, idx) => (
              <div key={template.id} className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                <div>
                  <p className="font-semibold text-slate-900">#{idx + 1} {template.nome}</p>
                  <p className="text-xs text-slate-600">{template.votos} votos</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">💰 {template.conversoes}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detalhes do Template */}
      {templateAtual && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{templateAtual.nome}</CardTitle>
            <CardDescription>Avaliações e feedback dos usuários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumo */}
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Rating Médio</p>
                <p className="text-3xl font-bold text-slate-900">⭐ {templateAtual.rating.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Total de Votos</p>
                <p className="text-3xl font-bold text-slate-900">{templateAtual.votos}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Conversões</p>
                <p className="text-3xl font-bold text-slate-900">{templateAtual.conversoes}</p>
              </div>
            </div>

            {/* Adicionar Feedback */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-bold text-slate-900 mb-4">Compartilhe Seu Feedback</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Sua Avaliação</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNovaRating(star)}
                        className={`text-3xl transition ${novaRating >= star ? "text-yellow-400" : "text-slate-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Seu Feedback</label>
                  <Textarea 
                    placeholder="Compartilhe sua experiência com este template..."
                    value={novoFeedback}
                    onChange={(e) => setNovoFeedback(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button 
                  onClick={adicionarFeedback}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar Feedback
                </Button>
              </div>
            </div>

            {/* Feedback dos Usuários */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-bold text-slate-900 mb-4">Feedback dos Usuários ({templateAtual.feedback.length})</h4>
              <div className="space-y-3">
                {templateAtual.feedback.map((fb, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{fb.usuario}</p>
                        <p className="text-xs text-slate-600">{fb.data}</p>
                      </div>
                      <div className="text-yellow-400">
                        {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">{fb.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todos os Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Todos os Templates</CardTitle>
          <CardDescription>Clique para ver detalhes e feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={templateSelecionado === template.id ? "default" : "outline"}
                onClick={() => setTemplateSelecionado(template.id)}
                className="w-full justify-between h-auto py-3"
              >
                <div className="text-left">
                  <p className="font-semibold">{template.nome}</p>
                  <p className="text-xs opacity-75">{template.tipo}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">⭐ {template.rating.toFixed(1)}</p>
                  <p className="text-xs opacity-75">{template.votos} votos</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Como Usar o Sistema de Ratings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { titulo: "Veja Top Templates", descricao: "Identifique os templates com melhor desempenho" },
            { titulo: "Leia Feedback", descricao: "Aprenda com a experiência de outros usuários" },
            { titulo: "Compartilhe Seu Feedback", descricao: "Ajude a comunidade com suas avaliações" },
            { titulo: "Customize Conforme Necessário", descricao: "Use templates bem avaliados como base" },
            { titulo: "Acompanhe Conversões", descricao: "Veja qual template gera mais vendas" },
            { titulo: "Melhore Continuamente", descricao: "Use insights para otimizar seus templates" }
          ].map((dica, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="text-blue-600 font-bold">{idx + 1}.</span>
              <div>
                <p className="font-semibold text-slate-900">{dica.titulo}</p>
                <p className="text-xs text-slate-600">{dica.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
