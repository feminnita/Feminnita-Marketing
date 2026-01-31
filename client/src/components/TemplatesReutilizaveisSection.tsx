import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Save, Trash2, Plus, Star, Clock, Users } from "lucide-react";
import { useState } from "react";

export default function TemplatesReutilizaveisSection() {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      nome: "Story - Renda Extra",
      tipo: "story",
      descricao: "Template para captar pessoas buscando renda extra",
      conteudo: "Como ganhei R$ 500 em 1 semana revendendo pijamas...",
      uso: 12,
      favorito: true,
      criado: "2026-01-31"
    },
    {
      id: 2,
      nome: "Reels - Bastidores",
      tipo: "reels",
      descricao: "Template de bastidores da produção",
      conteudo: "Mostrando o caos criativo por trás das fotos...",
      uso: 8,
      favorito: true,
      criado: "2026-01-30"
    },
    {
      id: 3,
      nome: "Ads - Compra Familiar",
      tipo: "ads",
      descricao: "Template para captar famílias",
      conteudo: "Pijama para toda a família por menos que uma blusa...",
      uso: 5,
      favorito: false,
      criado: "2026-01-29"
    },
    {
      id: 4,
      nome: "Story - Enquete",
      tipo: "story",
      descricao: "Template com enquete interativa",
      conteudo: "Qual cor você prefere? Azul, Rosa ou Verde?",
      uso: 15,
      favorito: true,
      criado: "2026-01-28"
    },
    {
      id: 5,
      nome: "Reels - Transformação",
      tipo: "reels",
      descricao: "Template antes/depois",
      conteudo: "Mostrando transformação com pijama novo...",
      uso: 10,
      favorito: false,
      criado: "2026-01-27"
    },
    {
      id: 6,
      nome: "TikTok - ASMR",
      tipo: "tiktok",
      descricao: "Template com sons satisfatórios",
      conteudo: "Sons do tecido premium do pijama...",
      uso: 7,
      favorito: false,
      criado: "2026-01-26"
    }
  ]);

  const [filtro, setFiltro] = useState("todos");
  const [copiado, setCopiado] = useState(false);

  const templatesFiltrados = filtro === "todos" 
    ? templates 
    : filtro === "favoritos"
    ? templates.filter(t => t.favorito)
    : templates.filter(t => t.tipo === filtro);

  const copiarTemplate = (conteudo: string) => {
    navigator.clipboard.writeText(conteudo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const toggleFavorito = (id: number) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, favorito: !t.favorito } : t
    ));
  };

  const deletarTemplate = (id: number) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const tipos = [
    { id: "story", nome: "Stories", icon: "📱" },
    { id: "reels", nome: "Reels", icon: "🎬" },
    { id: "tiktok", nome: "TikTok", icon: "🎵" },
    { id: "ads", nome: "Ads", icon: "📢" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sistema de Templates Reutilizáveis</h2>
        <p className="text-slate-600">
          Crie, salve e reutilize templates de Stories, Reels, TikTok e Ads. Economize tempo e mantenha consistência.
        </p>
      </div>

      {/* Filtros */}
      <Card className="border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-purple-600" />
            Filtrar Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filtro === "todos" ? "default" : "outline"}
              onClick={() => setFiltro("todos")}
            >
              Todos ({templates.length})
            </Button>
            <Button
              variant={filtro === "favoritos" ? "default" : "outline"}
              onClick={() => setFiltro("favoritos")}
            >
              ⭐ Favoritos ({templates.filter(t => t.favorito).length})
            </Button>
            {tipos.map(tipo => (
              <Button
                key={tipo.id}
                variant={filtro === tipo.id ? "default" : "outline"}
                onClick={() => setFiltro(tipo.id)}
              >
                {tipo.icon} {tipo.nome} ({templates.filter(t => t.tipo === tipo.id).length})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Templates */}
      <div className="space-y-3">
        {templatesFiltrados.length > 0 ? (
          templatesFiltrados.map((template) => (
            <Card key={template.id} className="hover:border-purple-300 hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-slate-900">{template.nome}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {tipos.find(t => t.id === template.tipo)?.icon} {template.tipo}
                      </Badge>
                      {template.favorito && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{template.descricao}</p>
                    <p className="text-xs text-slate-600 italic mb-3 p-2 bg-slate-50 rounded border border-slate-200">
                      "{template.conteudo}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.criado}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {template.uso} usos
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copiarTemplate(template.conteudo)}
                      className="gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiado ? "Copiado!" : "Copiar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFavorito(template.id)}
                    >
                      {template.favorito ? "⭐" : "☆"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletarTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 mb-4">Nenhum template encontrado nesta categoria</p>
              <Button onClick={() => setFiltro("todos")}>Ver todos os templates</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Criar Novo Template */}
      <Card className="border-l-4 border-l-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Criar Novo Template
          </CardTitle>
          <CardDescription>Salve seus melhores roteiros como templates para reutilizar depois</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Nome do Template</label>
              <input 
                type="text" 
                placeholder="Ex: Story - Renda Extra"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Tipo</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Story</option>
                <option>Reels</option>
                <option>TikTok</option>
                <option>Ads</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Descrição</label>
            <input 
              type="text" 
              placeholder="Descreva o propósito deste template"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Conteúdo</label>
            <textarea 
              placeholder="Cole o roteiro ou conteúdo aqui..."
              rows={5}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
            />
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700 gap-2">
            <Save className="w-4 h-4" />
            Salvar Template
          </Button>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { titulo: "Total de Templates", valor: templates.length, cor: "blue" },
          { titulo: "Favoritos", valor: templates.filter(t => t.favorito).length, cor: "yellow" },
          { titulo: "Mais Usado", valor: Math.max(...templates.map(t => t.uso)), cor: "green" },
          { titulo: "Criado Esta Semana", valor: templates.filter(t => {
            const dias = Math.floor((new Date().getTime() - new Date(t.criado).getTime()) / (1000 * 60 * 60 * 24));
            return dias <= 7;
          }).length, cor: "purple" }
        ].map((stat, idx) => (
          <Card key={idx} className="border-2">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{stat.titulo}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dicas de Uso */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Usar Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { titulo: "Salve Seus Melhores", descricao: "Quando um roteiro funciona bem, salve como template para reutilizar." },
            { titulo: "Customize Conforme Necessário", descricao: "Use templates como base, mas sempre customize para cada campanha." },
            { titulo: "Organize por Tipo", descricao: "Crie templates separados para Stories, Reels, TikTok e Ads." },
            { titulo: "Marque Favoritos", descricao: "Marque seus templates mais usados como favoritos para acesso rápido." },
            { titulo: "Acompanhe Uso", descricao: "Veja quantas vezes cada template foi usado para identificar os mais eficazes." },
            { titulo: "Atualize Regularmente", descricao: "Revise e atualize templates conforme aprende o que funciona melhor." }
          ].map((dica, idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b border-blue-200 last:border-0">
              <span className="text-blue-600 font-bold">{idx + 1}.</span>
              <div>
                <p className="font-semibold text-slate-900">{dica.titulo}</p>
                <p className="text-xs text-slate-600">{dica.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Próximas Ações */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Próximas Ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>✅ Explore os templates existentes</p>
          <p>⭐ Marque seus favoritos para acesso rápido</p>
          <p>📋 Copie templates para usar em suas campanhas</p>
          <p>➕ Crie novos templates a partir de roteiros bem-sucedidos</p>
          <p>📊 Acompanhe qual template é mais eficaz</p>
          <p>🔄 Reutilize e customize conforme necessário</p>
        </CardContent>
      </Card>
    </div>
  );
}
