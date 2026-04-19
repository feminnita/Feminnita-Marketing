import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertTriangle, CheckCircle, XCircle, Loader2, Sparkles,
  Image, Send, RefreshCw, Eye, Play, ThumbsUp, ThumbsDown,
  FolderOpen, Shield, Palette, Target, Type, Megaphone,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Creative {
  id: number;
  briefTitle: string;
  campaignType: string | null;
  product: string | null;
  textOverlay: string | null;
  generatedHeadline: string | null;
  generatedBody: string | null;
  status: string;
  imageUrl: string | null;
  imageHash: string | null;
  metaAdId: string | null;
  campaignId: string | null;
  adSetId: string | null;
  rejectionReason: string | null;
  errorMessage: string | null;
  createdAt: string | Date;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending_generation: { label: "Gerando...", color: "text-yellow-600 bg-yellow-50" },
  generated:          { label: "Gerado (sem imagem)", color: "text-blue-600 bg-blue-50" },
  pending_approval:   { label: "Aguarda Aprovação", color: "text-orange-600 bg-orange-50" },
  approved:           { label: "Aprovado", color: "text-green-600 bg-green-50" },
  rejected:           { label: "Rejeitado", color: "text-red-600 bg-red-50" },
  uploading:          { label: "Enviando ao Meta...", color: "text-purple-600 bg-purple-50" },
  executed:           { label: "Publicado no Meta", color: "text-emerald-600 bg-emerald-50" },
  failed:             { label: "Falhou", color: "text-red-700 bg-red-100" },
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function CreativeAdsPage() {
  const [tab, setTab] = useState<"pending" | "all" | "new" | "config">("pending");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState<number | null>(null);
  const [execParams, setExecParams] = useState<{ id: number; campaignId: string; adSetId: string } | null>(null);

  // Form estado
  const [form, setForm] = useState({
    title: "",
    description: "",
    campaignType: "remarketing",
    targetAudience: "",
    product: "",
    colorPalette: "#8B2635, branco, dourado",
    textOverlay: "",
    campaignId: "",
    adSetId: "",
    referenceFileId: "",
  });

  // Queries
  const listAll    = trpc.creativeAds.list.useQuery({});
  const listPending = trpc.creativeAds.list.useQuery({ status: "pending_approval" });
  const status     = trpc.creativeAds.status.useQuery();
  const metaPerms  = trpc.creativeAds.checkMetaPermissions.useQuery();
  const driveFiles = trpc.creativeAds.listDriveFiles.useQuery();
  const selected   = trpc.creativeAds.get.useQuery(
    { id: selectedId! },
    { enabled: selectedId !== null },
  );

  const requestMut = trpc.creativeAds.request.useMutation({
    onSuccess: (r) => {
      toast.success(r.message);
      listAll.refetch();
      listPending.refetch();
      setTab("pending");
      setForm(f => ({ ...f, title: "", description: "", product: "", textOverlay: "" }));
    },
    onError: (e) => toast.error(e.message),
  });

  const approveMut = trpc.creativeAds.approve.useMutation({
    onSuccess: (r) => { toast.success(r.message); listAll.refetch(); listPending.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const rejectMut = trpc.creativeAds.reject.useMutation({
    onSuccess: () => { toast("Criativo rejeitado."); listAll.refetch(); listPending.refetch(); setShowRejectForm(null); setRejectReason(""); },
    onError: (e) => toast.error(e.message),
  });

  const executeMut = trpc.creativeAds.execute.useMutation({
    onSuccess: (r) => { toast.success(r.message); listAll.refetch(); setExecParams(null); },
    onError: (e) => toast.error(e.message),
  });

  const creatives: Creative[] = (tab === "pending" ? listPending.data : listAll.data) ?? [];
  const pendingCount = listPending.data?.length ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Criativos — Pipeline Fernanda</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fernanda solicita → IA gera → você aprova → Meta publica
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold">
            <AlertTriangle className="w-4 h-4" />
            {pendingCount} aguardando aprovação
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: "pending", label: `Pendentes${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
          { key: "all",     label: "Todos" },
          { key: "new",     label: "Solicitar Criativo" },
          { key: "config",  label: "Configurações" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-[#8B2635] text-[#8B2635]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: PENDENTES / TODOS ─────────────────────────────────────────── */}
      {(tab === "pending" || tab === "all") && (
        <div className="space-y-4">
          {(listAll.isLoading || listPending.isLoading) && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#8B2635]" />
            </div>
          )}

          {!listAll.isLoading && creatives.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhum criativo {tab === "pending" ? "pendente" : "encontrado"}</p>
              <p className="text-sm">Use a aba "Solicitar Criativo" para gerar um novo banner</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {creatives.map(c => {
              const st = STATUS_LABEL[c.status] ?? { label: c.status, color: "text-gray-600 bg-gray-50" };
              return (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Preview imagem ou placeholder */}
                  <div
                    className="h-40 bg-gradient-to-br from-[#8B2635]/10 to-rose-50 flex items-center justify-center cursor-pointer relative"
                    onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                  >
                    {selectedId === c.id && selected.data?.imageBase64 ? (
                      <img
                        src={`data:image/png;base64,${selected.data.imageBase64}`}
                        alt={c.briefTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Image className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <span className="text-xs">
                          {selected.isLoading && selectedId === c.id ? "Carregando..." : "Clique para ver"}
                        </span>
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{c.briefTitle}</h3>
                    {c.generatedHeadline && (
                      <p className="text-xs text-gray-600 font-medium">"{c.generatedHeadline}"</p>
                    )}
                    {c.generatedBody && (
                      <p className="text-xs text-gray-500 line-clamp-2">{c.generatedBody}</p>
                    )}
                    {c.product && (
                      <p className="text-xs text-[#8B2635]">📦 {c.product}</p>
                    )}
                    {c.errorMessage && (
                      <p className="text-xs text-red-500">⚠ {c.errorMessage}</p>
                    )}
                    {c.metaAdId && (
                      <p className="text-xs text-emerald-600">✅ Meta Ad ID: {c.metaAdId}</p>
                    )}

                    {/* Ações por status */}
                    {c.status === "pending_approval" && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => approveMut.mutate({ id: c.id })}
                          disabled={approveMut.isPending}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" /> Aprovar
                        </button>
                        <button
                          onClick={() => setShowRejectForm(c.id)}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium py-2 px-3 rounded-lg border border-red-200 transition-colors"
                        >
                          <ThumbsDown className="w-3 h-3" /> Rejeitar
                        </button>
                      </div>
                    )}

                    {c.status === "approved" && (
                      <button
                        onClick={() => setExecParams({ id: c.id, campaignId: c.campaignId ?? "", adSetId: c.adSetId ?? "" } as any)}
                        className="w-full flex items-center justify-center gap-1 bg-[#8B2635] hover:bg-[#7a1f2d] text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                      >
                        <Play className="w-3 h-3" /> Publicar no Meta
                      </button>
                    )}

                    {/* Form de rejeição */}
                    {showRejectForm === c.id && (
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <textarea
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Motivo (opcional)"
                          rows={2}
                          className="w-full text-xs border border-gray-200 rounded p-2 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => rejectMut.mutate({ id: c.id, reason: rejectReason })}
                            className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded"
                          >
                            Confirmar
                          </button>
                          <button onClick={() => setShowRejectForm(null)} className="flex-1 bg-gray-100 text-gray-700 text-xs py-1.5 rounded">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: SOLICITAR CRIATIVO ────────────────────────────────────────── */}
      {tab === "new" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#8B2635]" />
            <h2 className="text-lg font-semibold text-gray-900">Solicitar Novo Criativo</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Type className="w-3.5 h-3.5 inline mr-1" />Título do criativo *
              </label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Banner Remarketing — Kit Família Verão"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2635]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Megaphone className="w-3.5 h-3.5 inline mr-1" />Descrição / brief *
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descreva o que o banner deve transmitir, tom, objetivo..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2635]/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de campanha</label>
                <select
                  value={form.campaignType}
                  onChange={e => setForm(f => ({ ...f, campaignType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="remarketing">Remarketing</option>
                  <option value="prospeccao">Prospecção</option>
                  <option value="revenda_sul_sudeste">Revenda Sul/Sudeste</option>
                  <option value="lancamento">Lançamento de Coleção</option>
                  <option value="oferta">Oferta / Promoção</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Target className="w-3.5 h-3.5 inline mr-1" />Público-alvo
                </label>
                <input
                  value={form.targetAudience}
                  onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
                  placeholder="Ex: revendedoras Sul/Sudeste"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📦 Produto / coleção
                </label>
                <input
                  value={form.product}
                  onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                  placeholder="Ex: Kit Família Inverno 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Palette className="w-3.5 h-3.5 inline mr-1" />Paleta de cores
                </label>
                <input
                  value={form.colorPalette}
                  onChange={e => setForm(f => ({ ...f, colorPalette: e.target.value }))}
                  placeholder="#8B2635, branco, dourado"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto no banner (call-to-action)
              </label>
              <input
                value={form.textOverlay}
                onChange={e => setForm(f => ({ ...f, textOverlay: e.target.value }))}
                placeholder="Ex: Kit a partir de R$89 | Frete Grátis"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Imagem de referência do Drive */}
            {(driveFiles.data?.length ?? 0) > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FolderOpen className="w-3.5 h-3.5 inline mr-1" />Imagem de referência (Drive)
                </label>
                <select
                  value={form.referenceFileId}
                  onChange={e => setForm(f => ({ ...f, referenceFileId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">— Usar estilo padrão Feminnita —</option>
                  {driveFiles.data!.map(f => (
                    <option key={f.id} value={f.id}>[{f.folder}] {f.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign ID (Meta)</label>
                <input
                  value={form.campaignId}
                  onChange={e => setForm(f => ({ ...f, campaignId: e.target.value }))}
                  placeholder="Deixe vazio para definir depois"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Set ID (Meta)</label>
                <input
                  value={form.adSetId}
                  onChange={e => setForm(f => ({ ...f, adSetId: e.target.value }))}
                  placeholder="Deixe vazio para definir depois"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              onClick={() => requestMut.mutate(form)}
              disabled={!form.title || !form.description || requestMut.isPending}
              className="w-full flex items-center justify-center gap-2 bg-[#8B2635] hover:bg-[#7a1f2d] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {requestMut.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Gerando banner...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Gerar Banner com IA</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: CONFIGURAÇÕES ────────────────────────────────────────────── */}
      {tab === "config" && (
        <div className="space-y-6 max-w-2xl">
          {/* Status Meta */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#8B2635]" />
              <h2 className="text-base font-semibold">Permissões Meta Ads</h2>
            </div>
            {metaPerms.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : metaPerms.data ? (
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm font-medium ${metaPerms.data.ok ? "text-green-600" : "text-red-600"}`}>
                  {metaPerms.data.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {metaPerms.data.ok ? "Token com acesso total" : "Permissões insuficientes"}
                  {metaPerms.data.usingSystemUserToken && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">System User ✓</span>
                  )}
                </div>
                {(metaPerms.data.missing?.length ?? 0) > 0 && (
                  <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
                    <p className="font-medium mb-1">Permissões faltando:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {metaPerms.data.missing!.map(p => <li key={p}><code>{p}</code></li>)}
                    </ul>
                  </div>
                )}
                {metaPerms.data.hint && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">{metaPerms.data.hint}</p>
                )}
                {(metaPerms.data.permissions?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {metaPerms.data.permissions!.map(p => (
                      <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                )}
                {metaPerms.data.error && (
                  <p className="text-xs text-red-500">Erro: {metaPerms.data.error}</p>
                )}
                <div className="pt-2 text-xs text-gray-500 space-y-1">
                  <p className="font-medium text-gray-700">Para acesso total (System User Token):</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Acesse Meta Business Manager → Configurações → Usuários do Sistema</li>
                    <li>Crie um System User com função <strong>Admin</strong></li>
                    <li>Adicione à conta <code>act_231648936319132</code> como <strong>Advertiser</strong></li>
                    <li>Gere token com: <code>ads_management, ads_read, pages_manage_ads</code></li>
                    <li>Adicione ao <code>.env</code>: <code>META_SYSTEM_USER_TOKEN=EAAxxxx</code></li>
                  </ol>
                </div>
              </div>
            ) : null}
          </div>

          {/* Status Google Drive */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold">Google Drive</h2>
            </div>
            {status.data && (
              <div className="space-y-3">
                <div className={`flex items-center gap-2 text-sm font-medium ${status.data.driveConnected ? "text-green-600" : "text-yellow-600"}`}>
                  {status.data.driveConnected ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {status.data.driveConnected ? "Drive conectado (server-side)" : "Drive não conectado no servidor"}
                </div>
                {!status.data.driveConnected && (
                  <div className="text-xs text-gray-600 space-y-2">
                    <p>Para conectar o Drive ao servidor (leitura automática de imagens):</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Adicione ao <code>.env</code>: <code>GOOGLE_OAUTH_CLIENT_ID</code> e <code>GOOGLE_OAUTH_CLIENT_SECRET</code></li>
                      <li>Abra: <a href="/api/google/start" className="text-blue-600 underline" target="_blank">/api/google/start</a></li>
                      <li>Copie o <code>GOOGLE_DRIVE_REFRESH_TOKEN</code> gerado para o <code>.env</code></li>
                      <li>Adicione também: <code>GOOGLE_DRIVE_REFERENCE_FOLDER=&lt;ID da pasta de referências&gt;</code></li>
                    </ol>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  <p>Pasta Artes Prontas: <code>{status.data.artesFolder}</code></p>
                  {status.data.referenceFolder && (
                    <p>Pasta Referências: <code>{status.data.referenceFolder}</code></p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Publicar no Meta */}
      {execParams && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Publicar Anúncio no Meta</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign ID *</label>
              <input
                value={execParams.campaignId}
                onChange={e => setExecParams(p => p ? { ...p, campaignId: e.target.value } : null)}
                placeholder="Ex: 120210000000000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Set ID *</label>
              <input
                value={execParams.adSetId}
                onChange={e => setExecParams(p => p ? { ...p, adSetId: e.target.value } : null)}
                placeholder="Ex: 120210000000001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-xs text-yellow-700">
              O anúncio será criado <strong>pausado</strong> no Meta Ads. Ative manualmente após revisar.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => executeMut.mutate({
                  id: execParams.id,
                  linkUrl: "https://www.feminnita.com.br",
                })}
                disabled={!execParams.campaignId || !execParams.adSetId || executeMut.isPending}
                className="flex-1 bg-[#8B2635] hover:bg-[#7a1f2d] disabled:opacity-50 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {executeMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Publicar
              </button>
              <button onClick={() => setExecParams(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
