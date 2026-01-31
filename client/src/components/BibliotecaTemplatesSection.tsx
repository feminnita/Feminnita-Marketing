import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Heart, Trash2, Plus } from "lucide-react";
import { useState } from "react";

export default function BibliotecaTemplatesSection() {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      titulo: "Story - Renda Extra",
      tipo: "Story",
      categoria: "Renda Extra",
      descricao: "Gancho: 'Tá quebrada?' → Problema → Solução → CTA",
      duracao: "15s",
      plataforma: "Instagram",
      favorito: true,
      uso: 12,
      rating: 4.8
    },
    {
      id: 2,
      titulo: "Reels - Bastidores",
      tipo: "Reels",
      categoria: "Lifestyle",
      descricao: "Caos criativo → Setup → Ação → Resultado → CTA",
      duracao: "45s",
      plataforma: "Instagram",
      favorito: false,
      uso: 8,
      rating: 4.6
    },
    {
      id: 3,
      titulo: "TikTok - ASMR",
      tipo: "TikTok",
      categoria: "Sensorial",
      descricao: "Sons satisfatórios + Pijama + Conforto + CTA",
      duracao: "30s",
      plataforma: "TikTok",
      favorito: true,
      uso: 15,
      rating: 4.9
    },
    {
      id: 4,
      titulo: "Legenda - Promoção",
      tipo: "Legenda",
      categoria: "Promoção",
      descricao: "Urgência → Benefício → Prova Social → CTA",
      duracao: "N/A",
      plataforma: "Instagram",
      favorito: false,
      uso: 24,
      rating: 4.7
    },
    {
      id: 5,
      titulo: "Story - Enquete",
      tipo: "Story",
      categoria: "Engajamento",
      descricao: "Pergunta → Enquete → Follow-up → Resultado",
      duracao: "20s",
      plataforma: "Instagram",
      favorito: true,
      uso: 18,
      rating: 4.5
    },
    {
      id: 6,
      titulo: "Ads - Conversão",
      tipo: "Ads",
      categoria: "Conversão",
      descricao: "Gancho viral → Benefício → Prova Social → CTA forte",
      duracao: "30s",
      plataforma: "Instagram/TikTok",
      favorito: false,
      uso: 10,
      rating: 4.8
    }
  ]);

  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");

  const templatesFiltrados = templates.filter(t => 
    (filtroTipo === "todos" || t.tipo === filtroTipo) &&
    (filtroCategoria === "todos" || t.categoria === filtroCategoria)
  );

  const toggleFavorito = (id: number) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, favorito: !t.favorito } : t
    ));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Biblioteca de Templates de Conteúdo</h2>
        <p className="text-slate-600">
          Crie banco de templates reutilizáveis para Stories, Reels, Legendas e Roteiros que a equipe possa customizar rapidamente.
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrar Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Tipo de Conteúdo</label>
            <div className="flex gap-2 flex-wrap">
              {["todos", "Story", "Reels", "TikTok", "Legenda", "Ads"].map((tipo) => (
                <Button
                  key={tipo}
                  onClick={() => setFiltroTipo(tipo)}
                  variant={filtroTipo === tipo ? "default" : "outline"}
                  className={filtroTipo === tipo ? "bg-blue-600 hover:bg-blue-700" : ""}
                  size="sm"
                >
                  {tipo === "todos" ? "Todos" : tipo}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Categoria</label>
            <div className="flex gap-2 flex-wrap">
              {["todos", "Renda Extra", "Lifestyle", "Sensorial", "Promoção", "Engajamento", "Conversão"].map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  variant={filtroCategoria === cat ? "default" : "outline"}
                  className={filtroCategoria === cat ? "bg-purple-600 hover:bg-purple-700" : ""}
                  size="sm"
                >
                  {cat === "todos" ? "Todas" : cat}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Templates ({templatesFiltrados.length})</h3>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />
            Novo Template
          </Button>
        </div>

        {templatesFiltrados.map((template) => (
          <Card key={template.id} className="hover:border-blue-300 hover:shadow-md transition">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{template.titulo}</h4>
                    <Badge className="bg-blue-600 text-xs">{template.tipo}</Badge>
                    <Badge variant="outline" className="text-xs">{template.categoria}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">{template.descricao}</p>
                </div>
                <button 
                  onClick={() => toggleFavorito(template.id)}
                  className="text-2xl hover:scale-110 transition"
                >
                  {template.favorito ? "❤️" : "🤍"}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                <div>
                  <p className="text-slate-600">Duração</p>
                  <p className="font-bold text-slate-900">{template.duracao}</p>
                </div>
                <div>
                  <p className="text-slate-600">Plataforma</p>
                  <p className="font-bold text-slate-900">{template.plataforma}</p>
                </div>
                <div>
                  <p className="text-slate-600">Usado</p>
                  <p className="font-bold text-slate-900">{template.uso}x</p>
                </div>
                <div>
                  <p className="text-slate-600">Rating</p>
                  <p className="font-bold text-yellow-600">⭐ {template.rating}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1">
                  <Copy className="w-3 h-3" />
                  Usar
                </Button>
                <Button size="sm" variant="outline">Editar</Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Estatísticas da Biblioteca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { titulo: "Total Templates", valor: templates.length, icon: "📋", cor: "text-blue-600" },
              { titulo: "Favoritos", valor: templates.filter(t => t.favorito).length, icon: "❤️", cor: "text-red-600" },
              { titulo: "Mais Usado", valor: "Legenda - Promoção", icon: "🏆", cor: "text-yellow-600" },
              { titulo: "Melhor Rating", valor: "TikTok - ASMR", icon: "⭐", cor: "text-orange-600" },
              { titulo: "Uso Total", valor: `${templates.reduce((a, t) => a + t.uso, 0)}x`, icon: "📊", cor: "text-green-600" }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className={`text-lg font-bold ${item.cor}`}>{item.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Como Usar Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Clique 'Usar' para copiar template e customizar",
            "✅ Marque como favorito para acesso rápido",
            "✅ Veja rating de outros usuários antes de usar",
            "✅ Crie novos templates baseado em sucesso anterior",
            "✅ Compartilhe templates com equipe",
            "✅ Atualize templates conforme aprende",
            "✅ Organize por categoria para encontrar rapidamente",
            "✅ Exporte templates em CSV para backup"
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
            { titulo: "Economia de Tempo", descricao: "Crie conteúdo 5x mais rápido com templates" },
            { titulo: "Consistência", descricao: "Todos seguem mesma estrutura e qualidade" },
            { titulo: "Aprendizado", descricao: "Equipe aprende melhores práticas" },
            { titulo: "Escalabilidade", descricao: "Gerencie múltiplos conteúdos simultaneamente" },
            { titulo: "Otimização", descricao: "Use templates que já provaram funcionar" },
            { titulo: "Colaboração", descricao: "Equipe compartilha templates e ideias" }
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
