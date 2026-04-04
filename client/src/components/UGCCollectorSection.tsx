import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Plus, X, Check, ImagePlus, Star, Send } from "lucide-react";

type UGCStatus = "pendente" | "aprovado" | "rejeitado" | "republicado";
type UGCPlataforma = "instagram" | "tiktok" | "whatsapp" | "twitter" | "outro";
type UGCTipo = "foto" | "video" | "story" | "reels" | "depoimento";

const plataformaConfig: Record<UGCPlataforma, { label: string; emoji: string }> = {
  instagram: { label: "Instagram", emoji: "📸" },
  tiktok:    { label: "TikTok",    emoji: "🎵" },
  whatsapp:  { label: "WhatsApp",  emoji: "💬" },
  twitter:   { label: "Twitter",   emoji: "🐦" },
  outro:     { label: "Outro",     emoji: "📦" },
};

const statusConfig: Record<UGCStatus, { label: string; className: string }> = {
  pendente:    { label: "Pendente",    className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  aprovado:    { label: "Aprovado",    className: "bg-green-100 text-green-800 border-green-300" },
  rejeitado:   { label: "Rejeitado",   className: "bg-red-100 text-red-700 border-red-300" },
  republicado: { label: "Republicado", className: "bg-purple-100 text-purple-800 border-purple-300" },
};

const tipoConfig: Record<UGCTipo, string> = {
  foto:       "Foto",
  video:      "Vídeo",
  story:      "Story",
  reels:      "Reels",
  depoimento: "Depoimento",
};

type UGCItem = {
  id: number;
  plataforma: string;
  autorHandle?: string | null;
  autorNome?: string | null;
  conteudoTexto?: string | null;
  conteudoUrl?: string | null;
  tipo: string;
  status: string;
  autorizacaoObtida: boolean;
  tags?: string | null;
};

interface UGCCardProps {
  item: UGCItem;
  onAprovar: () => void;
  onRejeitar: () => void;
  onRepublicar: () => void;
  onAutorizacao: (autorizado: boolean) => void;
  onDeletar: () => void;
}

function UGCCard({ item, onAprovar, onRejeitar, onRepublicar, onAutorizacao, onDeletar }: UGCCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const plat = plataformaConfig[item.plataforma as UGCPlataforma] ?? { label: item.plataforma, emoji: "📦" };
  const st = statusConfig[item.status as UGCStatus] ?? { label: item.status, className: "" };
  const handle = item.autorHandle || "autor";

  const dmText = `Olá @${handle}! Amamos seu conteúdo usando nossos pijamas Feminnita 💕 Você toparia nos autorizar a compartilhar no nosso perfil? Ficaríamos honradas! 🙏`;

  const copyDM = () => {
    navigator.clipboard.writeText(dmText).then(() => toast.success("Mensagem copiada!")).catch(() => toast.error("Erro ao copiar."));
  };

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            <span className="text-lg">{plat.emoji}</span>
            <span className="text-sm font-semibold text-slate-700">{plat.label}</span>
            {item.autorHandle && <span className="text-xs text-slate-500">@{item.autorHandle}</span>}
            {item.autorNome && <span className="text-xs text-slate-400">({item.autorNome})</span>}
          </div>
          <div className="flex gap-1 shrink-0">
            {confirmDelete ? (
              <>
                <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={onDeletar}>
                  <Check className="h-3 w-3 mr-1" /> Sim
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setConfirmDelete(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className={`text-xs ${st.className}`}>{st.label}</Badge>
          <Badge variant="secondary" className="text-xs">{tipoConfig[item.tipo as UGCTipo] ?? item.tipo}</Badge>
          {item.autorizacaoObtida && (
            <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-300">
              ✅ Autorizado
            </Badge>
          )}
        </div>

        {/* Texto */}
        {item.conteudoTexto && (
          <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 rounded p-2 border border-slate-100">
            {item.conteudoTexto.length > 120 ? item.conteudoTexto.slice(0, 120) + "..." : item.conteudoTexto}
          </p>
        )}

        {item.conteudoUrl && (
          <a href={item.conteudoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
            Ver conteúdo original
          </a>
        )}

        {item.tags && (
          <p className="text-xs text-slate-400">{item.tags}</p>
        )}

        {/* Actions for pendente */}
        {item.status === "pendente" && (
          <div className="flex gap-2 pt-1 flex-wrap">
            <Button size="sm" variant="default" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={onAprovar}>
              ✅ Aprovar
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-300 hover:bg-red-50" onClick={onRejeitar}>
              ❌ Rejeitar
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-slate-500" onClick={() => setShowDM(!showDM)}>
              <Send className="h-3 w-3 mr-1" /> DM de autorização
            </Button>
          </div>
        )}

        {/* Actions for aprovado */}
        {item.status === "aprovado" && (
          <div className="flex gap-2 pt-1 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className={`h-8 text-xs ${item.autorizacaoObtida ? "bg-teal-50 border-teal-300 text-teal-700" : "border-slate-300"}`}
              onClick={() => onAutorizacao(!item.autorizacaoObtida)}
            >
              🔗 {item.autorizacaoObtida ? "Autorização obtida" : "Marcar autorizado"}
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-purple-600 border-purple-300 hover:bg-purple-50" onClick={onRepublicar}>
              📤 Marcar Republicado
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-slate-500" onClick={() => setShowDM(!showDM)}>
              <Send className="h-3 w-3 mr-1" /> DM de autorização
            </Button>
          </div>
        )}

        {/* DM message */}
        {showDM && (
          <div className="mt-2 p-3 bg-pink-50 border border-pink-200 rounded-md space-y-2">
            <p className="text-xs text-pink-800 leading-relaxed">{dmText}</p>
            <Button size="sm" variant="outline" className="h-7 text-xs border-pink-300 text-pink-700" onClick={copyDM}>
              <Copy className="h-3 w-3 mr-1" /> Copiar mensagem
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const TABS: { key: UGCStatus | "todos"; label: string }[] = [
  { key: "pendente",    label: "Pendentes" },
  { key: "aprovado",   label: "Aprovados" },
  { key: "republicado", label: "Republicados" },
  { key: "todos",       label: "Todos" },
];

export default function UGCCollectorSection() {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<UGCStatus | "todos">("pendente");
  const [showForm, setShowForm] = useState(false);

  const { data: stats } = trpc.ugc.stats.useQuery();
  const { data: items = [], isLoading } = trpc.ugc.listar.useQuery({
    status: activeTab !== "todos" ? activeTab : undefined,
  });

  const invalidate = () => {
    utils.ugc.listar.invalidate();
    utils.ugc.stats.invalidate();
  };

  const adicionar = trpc.ugc.adicionar.useMutation({
    onSuccess: () => { toast.success("UGC adicionado!"); invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const aprovar = trpc.ugc.aprovar.useMutation({
    onSuccess: () => { toast.success("Aprovado!"); invalidate(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const rejeitar = trpc.ugc.rejeitar.useMutation({
    onSuccess: () => { toast.success("Rejeitado."); invalidate(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const republicar = trpc.ugc.marcarRepublicado.useMutation({
    onSuccess: () => { toast.success("Marcado como republicado!"); invalidate(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const autorizacao = trpc.ugc.marcarAutorizacao.useMutation({
    onSuccess: () => { toast.success("Autorização atualizada!"); invalidate(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const deletar = trpc.ugc.deletar.useMutation({
    onSuccess: () => { toast.success("Removido."); invalidate(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const [plataforma, setPlataforma] = useState<UGCPlataforma>("instagram");
  const [autorHandle, setAutorHandle] = useState("");
  const [autorNome, setAutorNome] = useState("");
  const [conteudoUrl, setConteudoUrl] = useState("");
  const [conteudoTexto, setConteudoTexto] = useState("");
  const [tipo, setTipo] = useState<UGCTipo>("foto");
  const [tags, setTags] = useState("");

  const resetForm = () => {
    setPlataforma("instagram"); setAutorHandle(""); setAutorNome("");
    setConteudoUrl(""); setConteudoTexto(""); setTipo("foto"); setTags("");
  };

  const handleAdicionar = () => {
    adicionar.mutate({ plataforma, autorHandle: autorHandle || undefined, autorNome: autorNome || undefined, conteudoUrl: conteudoUrl || undefined, conteudoTexto: conteudoTexto || undefined, tipo, tags: tags || undefined });
  };

  const kpis = [
    { label: "Total enviado",     value: stats?.total ?? 0,       color: "text-slate-700" },
    { label: "Pendentes",         value: stats?.pendentes ?? 0,   color: "text-yellow-600" },
    { label: "Aprovados",         value: stats?.aprovados ?? 0,   color: "text-green-600" },
    { label: "Republicados",      value: stats?.republicados ?? 0, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-pink-600" />
            UGC Collector
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Gerencie conteúdo gerado pelos seus clientes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Adicionar UGC
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="border border-slate-200">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-pink-200 bg-pink-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Adicionar UGC Manualmente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Plataforma *</Label>
                <Select value={plataforma} onValueChange={v => setPlataforma(v as UGCPlataforma)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(plataformaConfig) as [UGCPlataforma, { label: string; emoji: string }][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de Conteúdo *</Label>
                <Select value={tipo} onValueChange={v => setTipo(v as UGCTipo)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(tipoConfig) as [UGCTipo, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>@Handle do Autor</Label>
                <Input placeholder="@nomeusuario" value={autorHandle} onChange={e => setAutorHandle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Nome do Autor</Label>
                <Input placeholder="Maria Silva" value={autorNome} onChange={e => setAutorNome(e.target.value)} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>URL do Conteúdo</Label>
                <Input placeholder="https://instagram.com/p/..." value={conteudoUrl} onChange={e => setConteudoUrl(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Texto / Legenda do Conteúdo</Label>
              <Textarea placeholder="Cole aqui o texto ou legenda do conteúdo..." value={conteudoTexto} onChange={e => setConteudoTexto(e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <Input placeholder="pijama, feminnita, conforto..." value={tags} onChange={e => setTags(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdicionar} disabled={adicionar.isPending} size="sm">
                {adicionar.isPending ? "Salvando..." : "Adicionar"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.key === "pendente" && (stats?.pendentes ?? 0) > 0 && (
              <span className="ml-1.5 bg-yellow-100 text-yellow-800 text-xs rounded-full px-1.5 py-0.5">{stats?.pendentes}</span>
            )}
          </button>
        ))}
      </div>

      {/* Items */}
      {!isLoading && items.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-10 flex flex-col items-center text-center gap-2">
            <Star className="h-8 w-8 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhum conteúdo nesta aba</p>
            <p className="text-sm text-slate-400">
              {activeTab === "pendente" ? "Sem UGC pendente de aprovação." : "Adicione UGCs para começar a colecionar!"}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item: UGCItem) => (
          <UGCCard
            key={item.id}
            item={item as UGCItem}
            onAprovar={() => aprovar.mutate({ id: item.id })}
            onRejeitar={() => rejeitar.mutate({ id: item.id })}
            onRepublicar={() => republicar.mutate({ id: item.id })}
            onAutorizacao={(autorizado) => autorizacao.mutate({ id: item.id, autorizado })}
            onDeletar={() => deletar.mutate({ id: item.id })}
          />
        ))}
      </div>
    </div>
  );
}
