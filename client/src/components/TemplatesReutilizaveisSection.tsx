import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Save, Trash2, Plus, Star, Clock, Users } from "lucide-react";

const TIPOS = [
  { id: "story", nome: "Story", icon: "📱" },
  { id: "reels", nome: "Reels", icon: "🎬" },
  { id: "tiktok", nome: "TikTok", icon: "🎵" },
  { id: "ads", nome: "Ads", icon: "📢" },
  { id: "email", nome: "Email", icon: "📧" },
  { id: "whatsapp", nome: "WhatsApp", icon: "💬" },
] as const;

const TIPO_ICONS: Record<string, string> = Object.fromEntries(TIPOS.map(t => [t.id, t.icon]));

export default function TemplatesReutilizaveisSection() {
  const { data: templates = [], refetch } = trpc.contentTemplates.listar.useQuery();
  const [filtro, setFiltro] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [copiadoId, setCopiadoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome: "",
    tipo: "story" as typeof TIPOS[number]["id"],
    descricao: "",
    conteudo: "",
    tags: "",
  });

  const criar = trpc.contentTemplates.criar.useMutation({
    onSuccess: () => {
      toast.success("Template salvo!");
      setShowForm(false);
      setForm({ nome: "", tipo: "story", descricao: "", conteudo: "", tags: "" });
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const atualizar = trpc.contentTemplates.atualizar.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });

  const incrementarUso = trpc.contentTemplates.incrementarUso.useMutation({
    onSuccess: () => refetch(),
  });

  const deletar = trpc.contentTemplates.deletar.useMutation({
    onSuccess: () => { toast.success("Template removido"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const copiarTemplate = (template: any) => {
    navigator.clipboard.writeText(template.conteudo);
    setCopiadoId(template.id);
    setTimeout(() => setCopiadoId(null), 2000);
    incrementarUso.mutate({ id: template.id });
  };

  const templatesFiltrados = (templates as any[]).filter(t => {
    if (filtro === "todos") return true;
    if (filtro === "favoritos") return t.favorito;
    return t.tipo === filtro;
  });

  const totalFavoritos = (templates as any[]).filter(t => t.favorito).length;
  const maxUsos = (templates as any[]).reduce((max, t) => Math.max(max, t.usos ?? 0), 0);
  const criados7dias = (templates as any[]).filter(t => {
    const dias = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return dias <= 7;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Templates Reutilizáveis</h2>
        <p className="text-slate-600 text-sm">
          Salve seus melhores roteiros como templates para reutilizar em campanhas futuras.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Templates", valor: (templates as any[]).length, cor: "text-blue-600" },
          { label: "Favoritos", valor: totalFavoritos, cor: "text-yellow-600" },
          { label: "Mais Usado (usos)", valor: maxUsos, cor: "text-green-600" },
          { label: "Criados esta semana", valor: criados7dias, cor: "text-purple-600" },
        ].map((kpi, i) => (
          <Card key={i}><CardContent className="pt-4">
            <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.cor}`}>{kpi.valor}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Filtros + botão novo */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filtro === "todos" ? "default" : "outline"}
            onClick={() => setFiltro("todos")}
          >
            Todos ({(templates as any[]).length})
          </Button>
          <Button
            size="sm"
            variant={filtro === "favoritos" ? "default" : "outline"}
            onClick={() => setFiltro("favoritos")}
          >
            ⭐ Favoritos ({totalFavoritos})
          </Button>
          {TIPOS.map(tipo => {
            const count = (templates as any[]).filter(t => t.tipo === tipo.id).length;
            if (count === 0 && filtro !== tipo.id) return null;
            return (
              <Button
                key={tipo.id}
                size="sm"
                variant={filtro === tipo.id ? "default" : "outline"}
                onClick={() => setFiltro(tipo.id)}
              >
                {tipo.icon} {tipo.nome} ({count})
              </Button>
            );
          })}
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Template
        </Button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <Card className="border-2 border-green-300 bg-green-50 p-4 space-y-4">
          <h3 className="font-semibold text-slate-900">Novo Template</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nome *</Label>
              <Input
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Story — Renda Extra"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Tipo *</Label>
              <select
                value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value as typeof form.tipo })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
              >
                {TIPOS.map(t => <option key={t.id} value={t.id}>{t.icon} {t.nome}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Descrição</Label>
              <Input
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descreva o propósito deste template"
                className="mt-1 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Conteúdo *</Label>
              <Textarea
                value={form.conteudo}
                onChange={e => setForm({ ...form, conteudo: e.target.value })}
                placeholder="Cole o roteiro ou conteúdo aqui..."
                rows={5}
                className="mt-1 text-sm font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Tags (separadas por vírgula)</Label>
              <Input
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="Ex: inverno, renda-extra, carol"
                className="mt-1 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => criar.mutate(form)}
              disabled={!form.nome.trim() || !form.conteudo.trim() || criar.isPending}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Save className="w-4 h-4" />
              {criar.isPending ? "Salvando..." : "Salvar Template"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      {/* Lista */}
      {templatesFiltrados.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            {(templates as any[]).length === 0 ? (
              <>
                <p className="text-slate-500 mb-2">Nenhum template criado ainda.</p>
                <p className="text-sm text-slate-400">Crie seu primeiro template para reutilizar conteúdo.</p>
              </>
            ) : (
              <p className="text-slate-500">Nenhum template nesta categoria.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templatesFiltrados.map((template: any) => (
            <Card key={template.id} className="hover:border-purple-300 transition">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-slate-900">{template.nome}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {TIPO_ICONS[template.tipo]} {template.tipo}
                      </Badge>
                      {template.favorito && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                    </div>
                    {template.descricao && (
                      <p className="text-sm text-slate-600 mb-2">{template.descricao}</p>
                    )}
                    <p className="text-xs italic text-slate-600 p-2 bg-slate-50 rounded border border-slate-200 mb-3 line-clamp-2">
                      "{template.conteudo}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(template.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {template.usos ?? 0} usos
                    </span>
                    {template.tags && (
                      <span className="text-amber-600">{template.tags}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copiarTemplate(template)}
                      className="gap-1 text-xs"
                    >
                      <Copy className="w-3 h-3" />
                      {copiadoId === template.id ? "Copiado!" : "Copiar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => atualizar.mutate({ id: template.id, favorito: !template.favorito })}
                      title={template.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                      {template.favorito ? "⭐" : "☆"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletar.mutate({ id: template.id })}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dicas */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <h4 className="font-semibold text-sm mb-3">💡 Boas Práticas</h4>
        <ul className="text-sm space-y-2 text-slate-700">
          <li>• <strong>Salve o que funciona</strong> — quando um roteiro gera engajamento, transforme em template</li>
          <li>• <strong>Use tags</strong> — facilita encontrar templates por campanha ou persona</li>
          <li>• <strong>Copiar registra uso</strong> — você pode ver quais templates são mais usados</li>
          <li>• <strong>Marque favoritos</strong> — para acesso rápido aos melhores</li>
          <li>• <strong>Customize após copiar</strong> — templates são pontos de partida, não finais</li>
        </ul>
      </Card>
    </div>
  );
}
