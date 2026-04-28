import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X, Loader2, Plus, Instagram, Music2 } from "lucide-react";

type Influencer = {
  id: number;
  name: string;
  bio: string | null;
  personality: string | null;
  avatar: string | null;
  instagramHandle: string | null;
  tiktokHandle: string | null;
  isActive: boolean | null;
};

function EditModal({ influencer, onClose }: { influencer: Influencer; onClose: () => void }) {
  const [form, setForm] = useState({
    name: influencer.name,
    bio: influencer.bio ?? "",
    personality: influencer.personality ?? "",
    avatar: influencer.avatar ?? "",
    instagramHandle: influencer.instagramHandle ?? "",
    tiktokHandle: influencer.tiktokHandle ?? "",
  });

  const utils = trpc.useUtils();
  const update = trpc.influencers.update.useMutation({
    onSuccess: () => { utils.influencers.list.invalidate(); onClose(); },
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold" style={{ color: '#6B1D28' }}>Editar {influencer.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Nome</label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Bio</label>
            <Textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Quem é essa influencer? O que ela representa?" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Personalidade (usada pela IA ao gerar conteúdo)</label>
            <Textarea rows={2} value={form.personality} onChange={e => setForm(f => ({ ...f, personality: e.target.value }))}
              placeholder="Tom de voz, gírias, temas que aborda, público que conecta..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Instagram</label>
              <Input value={form.instagramHandle} onChange={e => setForm(f => ({ ...f, instagramHandle: e.target.value }))}
                placeholder="@usuario" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">TikTok</label>
              <Input value={form.tiktokHandle} onChange={e => setForm(f => ({ ...f, tiktokHandle: e.target.value }))}
                placeholder="@usuario" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">URL da foto (opcional)</label>
            <Input value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
              placeholder="https://..." />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button
            className="flex-1 text-white"
            style={{ backgroundColor: '#6B1D28' }}
            disabled={update.isPending}
            onClick={() => update.mutate({ id: influencer.id, ...form })}
          >
            {update.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

const ACCENT_COLORS = ['#6B1D28', '#A63D4A', '#6B7A3A', '#3A5A6B'];
const BG_COLORS = ['#fdf0e8', '#fce8ea', '#eef5e8', '#e8f2f5'];

export default function PersonasSection() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data: list = [], isLoading, refetch } = trpc.influencers.list.useQuery();
  type Inf = (typeof list)[number];
  const seed = trpc.influencers.upsertDefaults.useMutation({ onSuccess: () => refetch() });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6B1D28' }} />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhuma influencer cadastrada</h3>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          Crie as 4 personas padrão da Feminnita (Carol, Renata, Vanessa, Luiza) automaticamente.
        </p>
        <Button
          style={{ backgroundColor: '#6B1D28' }}
          className="text-white"
          disabled={seed.isPending}
          onClick={() => seed.mutate()}
        >
          {seed.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          Criar Influencers Padrão
        </Button>
      </div>
    );
  }

  const editing = editingId !== null ? list.find((i: Inf) => i.id === editingId) ?? null : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Influencers</h2>
          <p className="text-slate-500 text-sm mt-1">
            Perfis das influenciadoras. A IA usa esses dados para gerar conteúdo com a voz de cada uma.
          </p>
        </div>
        <Badge variant="secondary">{list.length} cadastradas</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((inf: Inf, idx: number) => (
          <Card key={inf.id} className="border-0 shadow-sm overflow-hidden">
            <div className="h-1.5" style={{ backgroundColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }} />
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0"
                  style={{ borderColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>
                  {inf.avatar ? (
                    <img src={inf.avatar} alt={inf.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white"
                      style={{ backgroundColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>
                      {inf.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">{inf.name}</CardTitle>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    {inf.instagramHandle && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Instagram className="w-3 h-3" />{inf.instagramHandle}
                      </span>
                    )}
                    {inf.tiktokHandle && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Music2 className="w-3 h-3" />{inf.tiktokHandle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {inf.bio && (
                <p className="text-sm text-slate-600 leading-relaxed">{inf.bio}</p>
              )}
              {inf.personality && (
                <div className="rounded-lg p-3 text-xs text-slate-600"
                  style={{ backgroundColor: BG_COLORS[idx % BG_COLORS.length] }}>
                  <span className="font-semibold text-slate-700 block mb-1">Tom de voz / Personalidade</span>
                  {inf.personality}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                style={{ borderColor: ACCENT_COLORS[idx % ACCENT_COLORS.length], color: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}
                onClick={() => setEditingId(inf.id)}
              >
                <Pencil className="w-3 h-3 mr-2" /> Editar Perfil
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && <EditModal influencer={editing} onClose={() => setEditingId(null)} />}
    </div>
  );
}
