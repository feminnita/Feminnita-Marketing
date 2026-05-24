import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, TrendingUp, Video, DollarSign, Plus, ExternalLink, ChevronDown, X, Package, FileText, Trash2 } from "lucide-react";

const TT_PINK = "#ff0050";
const TT_BLACK = "#010101";

const STATUS_CONFIG = {
  prospecto:  { label: "Prospecto",  color: "bg-gray-100 text-gray-700" },
  convidado:  { label: "Convidado",  color: "bg-blue-100 text-blue-700" },
  aceito:     { label: "Aceito",     color: "bg-yellow-100 text-yellow-700" },
  postou:     { label: "Postou",     color: "bg-purple-100 text-purple-700" },
  converteu:  { label: "Converteu",  color: "bg-green-100 text-green-700" },
  inativo:    { label: "Inativo",    color: "bg-red-100 text-red-700" },
} as const;

type Status = keyof typeof STATUS_CONFIG;

const STATUS_FLOW: Status[] = ["prospecto", "convidado", "aceito", "postou", "converteu", "inativo"];

function fmtFollowers(n: number | null) {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtBrl(v: string | null) {
  if (!v || v === "0") return "—";
  return `R$${parseFloat(v).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}

export default function TiktokAffiliateCRMPage() {
  const [filterStatus, setFilterStatus] = useState<Status | "todos">("todos");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const listQuery = trpc.tiktokAffiliates.list.useQuery();
  const creators = listQuery.data ?? [];

  const createMut = trpc.tiktokAffiliates.create.useMutation({
    onSuccess: () => { toast.success("Criador adicionado!"); setShowAdd(false); listQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const statusMut = trpc.tiktokAffiliates.updateStatus.useMutation({
    onSuccess: () => { listQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.tiktokAffiliates.update.useMutation({
    onSuccess: () => { toast.success("Atualizado!"); setEditId(null); listQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.tiktokAffiliates.delete.useMutation({
    onSuccess: () => { toast.success("Removido."); listQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = filterStatus === "todos" ? creators : creators.filter(c => c.status === filterStatus);

  const stats = {
    total: creators.length,
    ativos: creators.filter(c => ["aceito", "postou", "converteu"].includes(c.status)).length,
    videos: creators.reduce((s, c) => s + (c.videosPosted ?? 0), 0),
    gmv: creators.reduce((s, c) => s + parseFloat(c.gmvGenerated ?? "0"), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white px-6 py-5" style={{ background: TT_BLACK }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">CRM de Afiliados TikTok</h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
              Gerencie criadores, convites e performance
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: TT_PINK }}
          >
            <Plus className="w-4 h-4" /> Adicionar Criador
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total",      value: stats.total,           sub: "criadores" },
            { icon: TrendingUp, label: "Ativos", value: stats.ativos,          sub: "aceito/postou/converteu" },
            { icon: Video, label: "Vídeos",      value: stats.videos,          sub: "postados" },
            { icon: DollarSign, label: "GMV",    value: fmtBrl(String(stats.gmv)), sub: "gerado pelos afiliados" },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: TT_PINK }} />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* Filtros de status */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("todos")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === "todos" ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
            style={filterStatus === "todos" ? { background: TT_BLACK, borderColor: TT_BLACK } : {}}
          >
            Todos ({creators.length})
          </button>
          {STATUS_FLOW.map(s => {
            const count = creators.filter(c => c.status === s).length;
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === s ? cfg.color + " border-transparent" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {filterStatus === "todos" ? "Nenhum criador cadastrado ainda." : `Nenhum criador com status "${STATUS_CONFIG[filterStatus].label}".`}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Criador</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Seguidores</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Engaj.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">GMV 30d</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">GMV Gerado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vídeos</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: TT_PINK }}>
                          {(c.displayName || c.username)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{c.displayName || c.username}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            @{c.username}
                            {c.profileUrl && (
                              <a href={c.profileUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="w-3 h-3 text-gray-300 hover:text-gray-500" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{fmtFollowers(c.followers)}</td>
                    <td className="px-4 py-3 text-gray-700">{c.engagementRate ? `${c.engagementRate}%` : "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{fmtBrl(c.gmv30d)}</td>
                    <td className="px-4 py-3">
                      <StatusDropdown
                        current={c.status as Status}
                        onChange={(s) => statusMut.mutate({ id: c.id, status: s })}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-green-700">{fmtBrl(c.gmvGenerated)}</td>
                    <td className="px-4 py-3 text-gray-700">{c.videosPosted ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditId(c.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => { if (confirm(`Remover @${c.username}?`)) deleteMut.mutate({ id: c.id }); }}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Adicionar */}
      {showAdd && (
        <AddCreatorModal
          onClose={() => setShowAdd(false)}
          onSubmit={(data) => createMut.mutate(data)}
          loading={createMut.isPending}
        />
      )}

      {/* Modal Editar */}
      {editId !== null && (() => {
        const creator = creators.find(c => c.id === editId);
        if (!creator) return null;
        return (
          <EditCreatorModal
            creator={creator}
            onClose={() => setEditId(null)}
            onSubmit={(data) => updateMut.mutate({ id: editId, ...data })}
            loading={updateMut.isPending}
          />
        );
      })()}
    </div>
  );
}

function StatusDropdown({ current, onChange }: { current: Status; onChange: (s: Status) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[current];
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}
      >
        {cfg.label} <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-32">
          {STATUS_FLOW.map(s => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${s === current ? "font-semibold" : ""}`}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddCreatorModal({ onClose, onSubmit, loading }: {
  onClose: () => void;
  onSubmit: (data: { username: string; displayName?: string; profileUrl?: string; followers?: number; engagementRate?: string; gmv30d?: string; niche?: string; notes?: string }) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({ username: "", displayName: "", profileUrl: "", followers: "", engagementRate: "", gmv30d: "", niche: "", notes: "" });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title="Adicionar Criador" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="@ Username *" value={form.username} onChange={v => set("username", v)} placeholder="username" />
          <Field label="Nome de exibição" value={form.displayName} onChange={v => set("displayName", v)} placeholder="Nome Sobrenome" />
        </div>
        <Field label="URL do perfil TikTok" value={form.profileUrl} onChange={v => set("profileUrl", v)} placeholder="https://tiktok.com/@..." />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Seguidores" value={form.followers} onChange={v => set("followers", v)} placeholder="50000" type="number" />
          <Field label="Engajamento (%)" value={form.engagementRate} onChange={v => set("engagementRate", v)} placeholder="5.2" />
          <Field label="GMV 30d (R$)" value={form.gmv30d} onChange={v => set("gmv30d", v)} placeholder="3500" />
        </div>
        <Field label="Nicho" value={form.niche} onChange={v => set("niche", v)} placeholder="moda, sleepwear, lifestyle..." />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            rows={2}
            placeholder="Observações sobre o criador..."
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
        <button
          disabled={!form.username || loading}
          onClick={() => onSubmit({ ...form, followers: form.followers ? parseInt(form.followers) : undefined })}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: TT_PINK }}
        >
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </div>
    </Modal>
  );
}

function EditCreatorModal({ creator, onClose, onSubmit, loading }: {
  creator: { gmvGenerated: string | null; videosPosted: number | null; notes: string | null; creatorBriefSent: boolean | null; sampleSent: boolean | null; sampleProduct: string | null };
  onClose: () => void;
  onSubmit: (data: { gmvGenerated?: string; videosPosted?: number; notes?: string; creatorBriefSent?: boolean; sampleSent?: boolean; sampleProduct?: string }) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    gmvGenerated: creator.gmvGenerated ?? "",
    videosPosted: String(creator.videosPosted ?? 0),
    notes: creator.notes ?? "",
    creatorBriefSent: creator.creatorBriefSent ?? false,
    sampleSent: creator.sampleSent ?? false,
    sampleProduct: creator.sampleProduct ?? "",
  });

  return (
    <Modal title="Editar Performance" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="GMV Gerado (R$)" value={form.gmvGenerated} onChange={v => setForm(f => ({ ...f, gmvGenerated: v }))} placeholder="0" />
          <Field label="Vídeos Postados" value={form.videosPosted} onChange={v => setForm(f => ({ ...f, videosPosted: v }))} placeholder="0" type="number" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.creatorBriefSent} onChange={e => setForm(f => ({ ...f, creatorBriefSent: e.target.checked }))} className="rounded" />
            <FileText className="w-4 h-4 text-gray-400" /> Creator Brief enviado
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.sampleSent} onChange={e => setForm(f => ({ ...f, sampleSent: e.target.checked }))} className="rounded" />
            <Package className="w-4 h-4 text-gray-400" /> Amostra enviada
          </label>
        </div>
        {form.sampleSent && (
          <Field label="Produto enviado como amostra" value={form.sampleProduct} onChange={v => setForm(f => ({ ...f, sampleProduct: v }))} placeholder="Nome do produto..." />
        )}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notas</label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            rows={2}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
        <button
          disabled={loading}
          onClick={() => onSubmit({ ...form, videosPosted: parseInt(form.videosPosted) || 0 })}
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
          style={{ background: TT_PINK }}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}
