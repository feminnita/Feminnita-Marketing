import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Trash2, Plus, ExternalLink } from "lucide-react";

const CATEGORIES = ["fotos", "videos", "banners", "copy", "lookbook", "calculadora", "links"] as const;
const AVAILABLE_TO = ["revendedora", "influencer", "ambos"] as const;

type Tab = "pendentes" | "usuarios" | "materiais";

export default function GestaoPortalPage() {
  const [tab, setTab] = useState<Tab>("pendentes");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestão do Portal</h1>
        <p className="text-gray-500 text-sm mt-1">Sala de Arquivos — Revendedoras e Influencers</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(["pendentes", "usuarios", "materiais"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize -mb-px ${
              tab === t ? "border-rose-500 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "pendentes" ? "Pendentes" : t === "usuarios" ? "Usuárias" : "Materiais"}
          </button>
        ))}
      </div>

      {tab === "pendentes" && <PendentesTab />}
      {tab === "usuarios" && <UsuariosTab />}
      {tab === "materiais" && <MateriaisTab />}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    blocked: "bg-red-100 text-red-600",
  };
  const labels: Record<string, string> = { pending: "Pendente", approved: "Aprovada", blocked: "Bloqueada" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? ""}`}>
      {status === "pending" && <Clock className="h-3 w-3" />}
      {status === "approved" && <CheckCircle className="h-3 w-3" />}
      {status === "blocked" && <XCircle className="h-3 w-3" />}
      {labels[status] ?? status}
    </span>
  );
}

function PendentesTab() {
  const utils = trpc.useUtils();
  const { data: users = [], isLoading } = trpc.portal.admin.listUsers.useQuery();
  const pending = users.filter((u: any) => u.status === "pending");

  const updateStatus = trpc.portal.admin.updateStatus.useMutation({
    onSuccess: () => { utils.portal.admin.listUsers.invalidate(); toast.success("Status atualizado"); },
    onError: e => toast.error(e.message),
  });

  if (isLoading) return <div className="text-gray-400 text-sm">Carregando...</div>;
  if (pending.length === 0) return (
    <div className="text-center py-12 text-gray-400">
      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
      <p>Nenhuma solicitação pendente.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {pending.map((user: any) => (
        <div key={user.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className="text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full capitalize">{user.profileType}</span>
              {user.instagramHandle && <span className="text-xs text-gray-400">{user.instagramHandle}</span>}
              {user.phone && <span className="text-xs text-gray-400">{user.phone}</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => updateStatus.mutate({ id: user.id, status: "approved" })}
              disabled={updateStatus.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus.mutate({ id: user.id, status: "blocked" })}
              disabled={updateStatus.isPending}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Recusar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsuariosTab() {
  const utils = trpc.useUtils();
  const { data: users = [], isLoading } = trpc.portal.admin.listUsers.useQuery();

  const updateStatus = trpc.portal.admin.updateStatus.useMutation({
    onSuccess: () => { utils.portal.admin.listUsers.invalidate(); toast.success("Status atualizado"); },
    onError: e => toast.error(e.message),
  });

  if (isLoading) return <div className="text-gray-400 text-sm">Carregando...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-200">
            <th className="pb-2 pr-4 font-medium">Nome</th>
            <th className="pb-2 pr-4 font-medium">Email</th>
            <th className="pb-2 pr-4 font-medium">Perfil</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user: any) => (
            <tr key={user.id} className="py-2">
              <td className="py-2 pr-4 font-medium text-gray-800">{user.name}</td>
              <td className="py-2 pr-4 text-gray-500">{user.email}</td>
              <td className="py-2 pr-4 capitalize text-gray-500">{user.profileType}</td>
              <td className="py-2 pr-4"><StatusBadge status={user.status} /></td>
              <td className="py-2">
                <div className="flex gap-1">
                  {user.status !== "approved" && (
                    <Button size="sm" variant="ghost" className="text-green-600 h-7 px-2"
                      onClick={() => updateStatus.mutate({ id: user.id, status: "approved" })}>
                      Aprovar
                    </Button>
                  )}
                  {user.status !== "blocked" && (
                    <Button size="sm" variant="ghost" className="text-red-500 h-7 px-2"
                      onClick={() => updateStatus.mutate({ id: user.id, status: "blocked" })}>
                      Bloquear
                    </Button>
                  )}
                  {user.status !== "pending" && user.status !== "approved" && (
                    <Button size="sm" variant="ghost" className="text-gray-500 h-7 px-2"
                      onClick={() => updateStatus.mutate({ id: user.id, status: "pending" })}>
                      Resetar
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p className="text-center py-8 text-gray-400">Nenhuma usuária cadastrada.</p>}
    </div>
  );
}

function MateriaisTab() {
  const utils = trpc.useUtils();
  const { data: materiais = [], isLoading } = trpc.portal.admin.listMaterials.useQuery();
  const [showForm, setShowForm] = useState(false);

  const deleteMaterial = trpc.portal.admin.deleteMaterial.useMutation({
    onSuccess: () => { utils.portal.admin.listMaterials.invalidate(); toast.success("Material removido"); },
    onError: e => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          size="sm"
          onClick={() => setShowForm(v => !v)}
          className="bg-rose-600 hover:bg-rose-700 text-white"
        >
          <Plus className="h-4 w-4 mr-1" /> Adicionar material
        </Button>
      </div>

      {showForm && (
        <AddMaterialForm
          onSuccess={() => { setShowForm(false); utils.portal.admin.listMaterials.invalidate(); }}
        />
      )}

      {isLoading ? (
        <div className="text-gray-400 text-sm">Carregando...</div>
      ) : (
        <div className="space-y-2">
          {materiais.map((m: any) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">{m.title}</p>
                  {!m.isActive && <span className="text-xs text-red-400">(inativo)</span>}
                </div>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">{m.category}</span>
                  <span className="text-xs text-gray-400">→ {m.availableTo}</span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <a href={m.url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost" className="text-gray-400 h-8 w-8 p-0">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 h-8 w-8 p-0"
                  onClick={() => deleteMaterial.mutate({ id: m.id })}
                  disabled={deleteMaterial.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {materiais.length === 0 && <p className="text-center py-8 text-gray-400">Nenhum material cadastrado.</p>}
        </div>
      )}
    </div>
  );
}

function AddMaterialForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "fotos" as typeof CATEGORIES[number],
    url: "",
    filename: "",
    availableTo: "ambos" as typeof AVAILABLE_TO[number],
  });

  const createMaterial = trpc.portal.admin.createMaterial.useMutation({
    onSuccess: () => { toast.success("Material adicionado!"); onSuccess(); },
    onError: e => toast.error(e.message),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 mb-4">
      <h3 className="font-medium text-gray-700 mb-4">Novo material</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Label className="text-sm">Título</Label>
          <Input value={form.title} onChange={set("title")} required className="mt-1" placeholder="Nome do material" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-sm">URL</Label>
          <Input value={form.url} onChange={set("url")} required className="mt-1" placeholder="https://..." />
        </div>
        <div>
          <Label className="text-sm">Categoria</Label>
          <select value={form.category} onChange={set("category")} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
            {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-sm">Disponível para</Label>
          <select value={form.availableTo} onChange={set("availableTo")} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
            {AVAILABLE_TO.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-sm">Descrição (opcional)</Label>
          <Input value={form.description} onChange={set("description")} className="mt-1" placeholder="Descrição breve" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          size="sm"
          onClick={() => createMaterial.mutate({ ...form, description: form.description || undefined, filename: form.filename || undefined })}
          disabled={createMaterial.isPending}
          className="bg-rose-600 hover:bg-rose-700 text-white"
        >
          {createMaterial.isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button size="sm" variant="outline" onClick={onSuccess}>Cancelar</Button>
      </div>
    </div>
  );
}
