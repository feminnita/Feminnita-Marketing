import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Bot, CheckCircle, ChevronDown, ChevronUp, Clock, Loader2,
  MessageSquare, PlayCircle, Send, XCircle, Upload, Video,
  Trash2, Film, TrendingUp, Package, Calendar, Send,
} from "lucide-react";
import lunaPhoto from "@/assets/luna.jpg";
import mayaPhoto from "@/assets/maya.jpg";
import zaraPhoto from "@/assets/zara.jpg";
import ninaPhoto from "@/assets/nina.jpg";
import marcelaPhoto from "@/assets/marcela.jpg";

function toStr(item: any): string {
  if (typeof item === "string") return item;
  if (item === null || item === undefined) return "";
  if (typeof item === "object") {
    return item.titulo || item.summary || item.descricao || item.acao || item.message || item.text || JSON.stringify(item);
  }
  return String(item);
}

export const AGENT_PHOTOS: Record<string, string> = {
  luna: lunaPhoto,
  maya: mayaPhoto,
  zara: zaraPhoto,
  nina: ninaPhoto,
  marcela: marcelaPhoto,
};

// ─── Agentes ──────────────────────────────────────────────────────────────────

export type AgentType = "luna" | "maya" | "zara" | "nina" | "marcela";

interface Agent {
  id: AgentType;
  name: string;
  role: string;
  color: string;
  emoji: string;
  description: string;
}

export const AGENTS: Agent[] = [
  { id: "luna", name: "Luna", role: "TikTok Ads", color: "#7C3AED", emoji: "📊", description: "Campanhas, ROAS, otimização de budget e criativos pagos" },
  { id: "maya", name: "Maya", role: "LIVE Commerce", color: "#DC2626", emoji: "🔴", description: "Produção de lives, scripts, conversão e amplificação ao vivo" },
  { id: "zara", name: "Zara", role: "Afiliados", color: "#059669", emoji: "🤝", description: "Recrutamento, gestão de criadores e programa de comissões" },
  { id: "nina", name: "Nina", role: "Conteúdo Orgânico", color: "#D97706", emoji: "✨", description: "FYP, tendências, SEO de vídeo e calendário de postagens" },
  { id: "marcela", name: "Marcela", role: "Shop & Produtos", color: "#0891B2", emoji: "🛍️", description: "Fichas de produto, promoções, SEO interno e operações" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const priorityColors: Record<string, string> = {
  alta: "bg-red-100 text-red-800 border-red-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  baixa: "bg-green-100 text-green-800 border-green-200",
};

function fmtDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function cleanAnalysis(text: string): string {
  return text.replace(/```json[\s\S]*?```/g, "").replace(/```[\s\S]*?```/g, "").trim();
}

function StatusBadge({ status }: { status: string }) {
  if (status === "done") return <span className="flex items-center gap-1 text-green-700 text-xs font-medium"><CheckCircle className="w-3 h-3" /> Concluída</span>;
  if (status === "running" || status === "pending") return <span className="flex items-center gap-1 text-blue-700 text-xs font-medium"><Loader2 className="w-3 h-3 animate-spin" /> Analisando…</span>;
  return <span className="flex items-center gap-1 text-red-700 text-xs font-medium"><XCircle className="w-3 h-3" /> Erro</span>;
}

// ─── Painel de um agente ──────────────────────────────────────────────────────

export function AgentPanel({ agent, account }: { agent: Agent; account: string }) {
  const [activeEvalId, setActiveEvalId] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set());
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const listQuery = trpc.tiktokTeam.listEvaluations.useQuery(
    { agentType: agent.id, account: account as any },
    { refetchInterval: polling ? 3000 : false }
  );

  const evalQuery = trpc.tiktokTeam.getEvaluation.useQuery(
    { id: activeEvalId! },
    { enabled: !!activeEvalId, refetchInterval: polling ? 2000 : false }
  );

  const messagesQuery = trpc.tiktokTeam.getMessages.useQuery(
    { evaluationId: activeEvalId! },
    { enabled: !!activeEvalId && evalQuery.data?.status === "done" }
  );

  const triggerMut = trpc.tiktokTeam.triggerEvaluation.useMutation({
    onSuccess: (data) => {
      setActiveEvalId(data.evaluationId);
      setPolling(true);
      listQuery.refetch();
      toast.success(`${agent.name} iniciou a análise…`);
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const updateKnowledgeMut = trpc.tiktokTeam.updateKnowledge.useMutation({
    onSuccess: () => toast.success(`Conhecimento de ${agent.name} atualizado!`),
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const sendMsgMut = trpc.tiktokTeam.sendMessage.useMutation({
    onSuccess: () => { setChatInput(""); messagesQuery.refetch(); },
    onError: (err) => toast.error(`Erro: ${err.message}`),
    onSettled: () => setSendingMsg(false),
  });

  useEffect(() => {
    if (evalQuery.data?.status === "done" || evalQuery.data?.status === "error") {
      setPolling(false);
      listQuery.refetch();
    }
  }, [evalQuery.data?.status]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data]);

  useEffect(() => {
    const evals = listQuery.data;
    if (!activeEvalId && evals && evals.length > 0) setActiveEvalId(evals[0].id);
  }, [listQuery.data]);

  const currentEval = evalQuery.data as any;
  const messages = (messagesQuery.data || []) as any[];
  const recentEvals = (listQuery.data || []).slice(0, 5) as any[];

  function toggleRec(i: number) {
    setExpandedRecs((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleSend() {
    if (!chatInput.trim() || !activeEvalId) return;
    setSendingMsg(true);
    sendMsgMut.mutate({ evaluationId: activeEvalId, message: chatInput.trim() });
  }

  return (
    <div className="space-y-4">
      {/* Header do agente */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">{agent.name}</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ background: agent.color }}>{agent.role}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{agent.description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => triggerMut.mutate({ agentType: agent.id, account: account as any })}
            disabled={triggerMut.isPending || polling}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ background: agent.color }}
          >
            {polling ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {polling ? "Analisando…" : "Nova análise"}
          </button>
          <button
            onClick={() => updateKnowledgeMut.mutate({ agentType: agent.id })}
            disabled={updateKnowledgeMut.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {updateKnowledgeMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            Atualizar Conhecimento
          </button>
        </div>
      </div>

      {/* Resultado */}
      {currentEval?.status === "done" && (
        <div className="space-y-4">
          {/* Resumo */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: agent.color }} />
              <span className="font-semibold text-sm text-gray-800">Resumo</span>
            </div>
            <p className="text-sm text-gray-700">{currentEval.summary}</p>
          </div>

          {/* Análise */}
          {currentEval.analysis && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4" style={{ color: agent.color }} />
                <span className="font-semibold text-sm text-gray-800">Análise Completa</span>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {cleanAnalysis(currentEval.analysis)}
              </div>
            </div>
          )}

          {/* Recomendações */}
          {(currentEval.recommendations?.length ?? 0) > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4" style={{ color: agent.color }} />
                <span className="font-semibold text-sm text-gray-800">Recomendações ({currentEval.recommendations.length})</span>
              </div>
              <div className="space-y-2">
                {currentEval.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50" onClick={() => toggleRec(i)}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${priorityColors[rec.priority]}`}>{rec.priority}</span>
                        <span className="text-sm font-medium text-gray-800">{toStr(rec.titulo)}</span>
                      </div>
                      {expandedRecs.has(i) ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>
                    {expandedRecs.has(i) && (
                      <div className="px-3 pb-3 bg-gray-50 border-t border-gray-100 space-y-2 pt-2">
                        <p className="text-sm text-gray-600">{toStr(rec.descricao)}</p>
                        <div className="bg-white border border-gray-200 rounded px-3 py-2">
                          <p className="text-xs font-semibold text-gray-500 mb-0.5">Ação</p>
                          <p className="text-sm text-gray-800">{rec.acao}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Briefs de Criativo */}
          {(currentEval.creativeBriefs?.length ?? 0) > 0 && (
            <div className="bg-white border rounded-xl p-4" style={{ borderColor: agent.color + "40" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🎨</span>
                <span className="font-semibold text-sm text-gray-800">Briefs de Criativo ({currentEval.creativeBriefs.length})</span>
              </div>
              <div className="space-y-3">
                {currentEval.creativeBriefs.map((brief: any, i: number) => (
                  <div key={i} className="rounded-lg p-3 border text-sm space-y-2" style={{ background: agent.color + "08", borderColor: agent.color + "30" }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: agent.color }}>{brief.publico}</span>
                      {brief.formato && <span className="text-xs text-gray-500 font-medium">{brief.formato}</span>}
                    </div>
                    {Object.entries(brief).filter(([k]) => !["publico","formato"].includes(k)).map(([key, val]) => (
                      <div key={key}>
                        <span className="font-semibold text-gray-700 capitalize">{key.replace(/([A-Z])/g, " $1")}: </span>
                        <span className="text-gray-600">{Array.isArray(val) ? (val as string[]).join(", ") : String(val)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4" style={{ color: agent.color }} />
              <span className="font-semibold text-sm text-gray-800">Chat com {agent.name}</span>
            </div>
            <div className="min-h-[80px] max-h-[300px] overflow-y-auto space-y-2 mb-3">
              {messages.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Faça perguntas para {agent.name}.</p>}
              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-base ${msg.role === "user" ? "text-white" : "bg-gray-100 text-gray-800"}`}
                    style={msg.role === "user" ? { background: agent.color } : {}}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={`Pergunte para ${agent.name}…`}
                className="flex-1 text-base border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": agent.color } as any}
              />
              <button onClick={handleSend} disabled={sendingMsg || !chatInput.trim()} className="p-2 text-white rounded-lg disabled:opacity-50" style={{ background: agent.color }}>
                {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processando */}
      {currentEval && (currentEval.status === "running" || currentEval.status === "pending") && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: agent.color }} />
          <p className="text-sm font-medium text-gray-700">{agent.name} está analisando…</p>
        </div>
      )}

      {/* Erro */}
      {currentEval?.status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{currentEval.errorMessage || "Erro desconhecido"}</p>
        </div>
      )}

      {/* Histórico */}
      {recentEvals.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Histórico</span>
          </div>
          <div className="space-y-1.5">
            {recentEvals.map((ev: any) => (
              <button
                key={ev.id}
                onClick={() => setActiveEvalId(ev.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors ${activeEvalId === ev.id ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:bg-gray-50"}`}
              >
                <span className="text-gray-700 truncate">{ev.summary || `Análise #${ev.id}`}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-gray-400">{fmtDate(ev.triggeredAt)}</span>
                  <StatusBadge status={ev.status} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vazio */}
      {!activeEvalId && recentEvals.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-3">
          <div className="text-4xl">{agent.emoji}</div>
          <p className="text-sm font-semibold text-gray-800">Nenhuma análise ainda</p>
          <p className="text-xs text-gray-500">Clique em "Nova análise" para {agent.name} começar.</p>
        </div>
      )}
    </div>
  );
}

// ─── Studio IA (Hailuo / MiniMax) ────────────────────────────────────────────

const STUDIO_COLOR = "#EC4899";

function VideoStudioAI() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [pollingId, setPollingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const genMut = trpc.tiktokTeam.generateVideoAI.useMutation({
    onSuccess: (data) => {
      toast.success("Geração iniciada! O vídeo aparece na aba Vídeos quando pronto.");
      setPollingId(data.videoId);
      setImageUrl("");
      setPrompt("");
      setTitle("");
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const videoQuery = trpc.tiktokTeam.listVideos.useQuery(undefined, {
    refetchInterval: pollingId ? 5000 : false,
  });

  useEffect(() => {
    if (!pollingId) return;
    const found = videoQuery.data?.find((v: any) => v.id === pollingId);
    if (found && (found.status === "ready" || found.status === "error")) {
      setPollingId(null);
      if (found.status === "ready") toast.success("Vídeo pronto! Veja na aba Vídeos.");
      else toast.error("Erro na geração. Tente novamente.");
    }
  }, [videoQuery.data, pollingId]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || "Upload falhou");
      setImageUrl(data.url);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    } catch (err: any) {
      toast.error(`Upload falhou: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const isGenerating = genMut.isPending || !!pollingId;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎬</span>
          <h2 className="text-base font-bold text-gray-800">Studio IA</h2>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: STUDIO_COLOR }}>Beta</span>
        </div>
        <p className="text-xs text-gray-500">Envie uma imagem de produto e a IA gera um vídeo com movimento real para TikTok.</p>

        {/* Image upload */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Imagem base</label>
          {imageUrl ? (
            <div className="relative w-40">
              <img src={imageUrl} alt="preview" className="w-40 h-52 object-cover rounded-xl border border-gray-200" />
              <button
                onClick={() => setImageUrl("")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
              >✕</button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Enviando..." : "Selecionar imagem"}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Título do vídeo</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Pijama Florido — movimento"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": STUDIO_COLOR } as any}
          />
        </div>

        {/* Prompt */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Prompt de movimento <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Ex: modelo caminhando com o pijama, luz suave, câmera lenta..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 resize-none"
            style={{ "--tw-ring-color": STUDIO_COLOR } as any}
          />
        </div>

        <button
          onClick={() => genMut.mutate({ title: title || "Vídeo IA", imageUrl, prompt })}
          disabled={!imageUrl || !title || isGenerating}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: STUDIO_COLOR }}
        >
          {isGenerating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando vídeo…</>
            : <>✨ Gerar Vídeo com Hailuo</>}
        </button>

        {pollingId && (
          <p className="text-xs text-center text-gray-400 animate-pulse">Aguardando Hailuo… ~2-3 minutos.</p>
        )}
      </div>
    </div>
  );
}

// ─── Modal de Publicação ──────────────────────────────────────────────────────

const PLATFORM_OPTIONS = [
  { id: "tiktok" as const,    label: "TikTok",           color: "#010101", note: "API em aprovação — agendamento salvo" },
  { id: "instagram" as const, label: "Instagram Reels",  color: "#E1306C", note: "API em aprovação — agendamento salvo" },
];

function PublishModal({ video, onClose }: { video: any; onClose: () => void }) {
  const utils = trpc.useUtils();
  const saved = (() => { try { return JSON.parse(video.notes || "{}"); } catch { return {}; } })();

  const [caption, setCaption] = useState(saved.caption || video.description || "");
  const [hashtags, setHashtags] = useState(saved.hashtags || video.tags || "");
  const [platforms, setPlatforms] = useState<("tiktok" | "instagram")[]>(saved.platforms || ["tiktok"]);
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState("");

  const scheduleMut = trpc.tiktokTeam.schedulePost.useMutation({
    onSuccess: () => {
      utils.tiktokTeam.listVideos.invalidate();
      toast.success(scheduleMode === "later" ? "Publicação agendada!" : "Configuração salva!");
      onClose();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  function togglePlatform(p: "tiktok" | "instagram") {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleSubmit() {
    if (!platforms.length) { toast.error("Selecione ao menos uma plataforma."); return; }
    if (scheduleMode === "later" && !scheduledAt) { toast.error("Informe data e hora do agendamento."); return; }
    scheduleMut.mutate({
      videoId: video.id,
      caption,
      hashtags,
      platforms,
      scheduledAt: scheduleMode === "later" ? scheduledAt : undefined,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><Send className="w-4 h-4" /> Publicar Vídeo</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-sm">{video.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Plataformas */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Publicar em</label>
            <div className="flex gap-2">
              {PLATFORM_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    platforms.includes(p.id) ? "border-current text-white" : "border-gray-200 text-gray-500"
                  }`}
                  style={platforms.includes(p.id) ? { background: p.color, borderColor: p.color } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {platforms.map((p) => {
              const info = PLATFORM_OPTIONS.find((x) => x.id === p);
              return <p key={p} className="text-[11px] text-amber-600 mt-1">⚠ {info?.label}: {info?.note}</p>;
            })}
          </div>

          {/* Legenda */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Legenda <span className="font-normal text-gray-400">({caption.length}/2200)</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 2200))}
              rows={4}
              placeholder="Escreva a legenda do post..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Hashtags</label>
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#feminnita #pijama #tiktok"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Agendamento */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Quando publicar?</label>
            <div className="flex gap-2 mb-3">
              {[
                { id: "now" as const, label: "Salvar configuração" },
                { id: "later" as const, label: "Agendar data/hora" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setScheduleMode(opt.id)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                    scheduleMode === opt.id ? "border-pink-500 text-pink-600 bg-pink-50" : "border-gray-200 text-gray-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {scheduleMode === "later" && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 font-semibold mb-1">📋 Próximos passos</p>
            <p className="text-xs text-blue-600">Quando a API do TikTok e Instagram forem aprovadas, a publicação acontecerá automaticamente na data/hora agendada.</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={scheduleMut.isPending}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {scheduleMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            {scheduleMode === "later" ? "Agendar publicação" : "Salvar configuração"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Módulo de Vídeos ─────────────────────────────────────────────────────────

function VideoLibrary() {
  const [uploading, setUploading] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [publishingVideo, setPublishingVideo] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const cancelMut = trpc.tiktokTeam.cancelSchedule.useMutation({
    onSuccess: () => { utils.tiktokTeam.listVideos.invalidate(); toast.success("Agendamento cancelado."); },
  });

  const listQuery = trpc.tiktokTeam.listVideos.useQuery();
  const deleteMut = trpc.tiktokTeam.deleteVideo.useMutation({
    onSuccess: () => { utils.tiktokTeam.listVideos.invalidate(); toast.success("Vídeo removido"); },
  });
  const saveMut = trpc.tiktokTeam.saveVideo.useMutation({
    onSuccess: () => {
      utils.tiktokTeam.listVideos.invalidate();
      setVideoTitle("");
      setUploading(false);
      toast.success("Vídeo adicionado à biblioteca!");
    },
    onError: (err) => { toast.error(`Erro: ${err.message}`); setUploading(false); },
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!videoTitle.trim()) { toast.error("Preencha o título do vídeo antes de fazer upload."); return; }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const resp = await fetch("/api/upload/media", { method: "POST", body: formData });
      const data = await resp.json();
      if (!data.url) throw new Error(data.error || "Upload falhou");

      saveMut.mutate({
        title: videoTitle.trim(),
        filePath: data.url,
        fileSize: file.size,
        source: "uploaded",
      });
    } catch (err: any) {
      toast.error(`Upload falhou: ${err.message}`);
      setUploading(false);
    }
    e.target.value = "";
  }

  const videos = (listQuery.data || []) as any[];

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 text-gray-400" /> Adicionar Vídeo
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Título do vídeo (ex: Try-on pijama floral verão 2025)"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
              {uploading ? "Enviando…" : "Selecionar vídeo"}
            </button>
            <p className="text-xs text-gray-400">MP4, MOV — máx. 500MB</p>
          </div>
          <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/*" className="hidden" onChange={handleFileUpload} />
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Compliance TikTok — Checklist antes de publicar</p>
          <ul className="text-xs text-amber-700 space-y-0.5">
            <li>✓ Sem superlativos: "melhor", "nº1", "incrível", "perfeito", "único"</li>
            <li>✓ Sem claims de saúde: "melhora o sono", "terapêutico", "alivia dores"</li>
            <li>✓ Música apenas da TikTok Commercial Music Library (conta business)</li>
            <li>✓ Preço no vídeo igual ao preço real na loja</li>
            <li>✓ Urgência real: "últimas peças" só se for verdadeiro</li>
            <li>✓ Parceria com afiliado: obrigatório #Parceria ou #Ad</li>
          </ul>
        </div>
      </div>

      {/* Lista */}
      {videos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Video className="w-4 h-4 text-gray-400" /> Biblioteca ({videos.length})
          </h3>
          <div className="space-y-2">
            {videos.map((v: any) => (
              <div key={v.id} className="flex items-center gap-3 px-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{v.title}</p>
                  <p className="text-xs text-gray-400">
                    {v.source === "uploaded" ? "Upload" : "Gerado"} · {fmtSize(v.fileSize)} · {fmtDate(v.createdAt)}
                  </p>
                  {v.status === "scheduled" && v.scheduledAt && (
                    <p className="text-xs text-purple-600 font-medium mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {fmtDate(v.scheduledAt)}
                      {(() => { try { const p = JSON.parse(v.notes || "{}"); return p.platforms?.join(" + "); } catch { return ""; } })()}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  v.status === "published" ? "bg-green-100 text-green-700" :
                  v.status === "scheduled" ? "bg-purple-100 text-purple-700" :
                  v.status === "ready" ? "bg-blue-100 text-blue-700" :
                  v.status === "error" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-600"
                }`}>{v.status === "scheduled" ? "agendado" : v.status === "ready" ? "pronto" : v.status === "published" ? "publicado" : v.status}</span>
                {(v.status === "ready" || v.status === "draft") && (
                  <button
                    onClick={() => setPublishingVideo(v)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white rounded-lg shrink-0"
                    style={{ background: "#010101" }}
                  >
                    <Send className="w-3 h-3" /> Publicar
                  </button>
                )}
                {v.status === "scheduled" && (
                  <button
                    onClick={() => { setPublishingVideo(v); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg shrink-0"
                  >
                    <Calendar className="w-3 h-3" /> Editar
                  </button>
                )}
                <button onClick={() => deleteMut.mutate({ id: v.id })} className="p-1.5 text-gray-400 hover:text-red-500 rounded shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length === 0 && !listQuery.isLoading && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-3">
          <Film className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-800">Biblioteca vazia</p>
          <p className="text-xs text-gray-400">Faça upload dos seus vídeos para organizar e publicar no TikTok.</p>
        </div>
      )}

      {/* Agendados */}
      {videos.filter((v: any) => v.status === "scheduled").length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <h3 className="font-semibold text-purple-800 flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4" /> Agendados ({videos.filter((v: any) => v.status === "scheduled").length})
          </h3>
          <div className="space-y-2">
            {videos.filter((v: any) => v.status === "scheduled").map((v: any) => {
              const meta = (() => { try { return JSON.parse(v.notes || "{}"); } catch { return {}; } })();
              return (
                <div key={v.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2.5 border border-purple-100">
                  <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{v.title}</p>
                    <p className="text-xs text-purple-600">{fmtDate(v.scheduledAt)} · {(meta.platforms || []).join(" + ")}</p>
                  </div>
                  <button
                    onClick={() => cancelMut.mutate({ videoId: v.id })}
                    className="text-xs text-red-400 hover:text-red-600 shrink-0"
                  >Cancelar</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {publishingVideo && (
        <PublishModal video={publishingVideo} onClose={() => setPublishingVideo(null)} />
      )}
    </div>
  );
}


// ─── Página principal ─────────────────────────────────────────────────────────

const TT_PINK = "#FE2C55";

export type AccountType = "feminnita" | "fnt";

export default function TiktokTeamPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"videos" | "studio">("videos");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "studio" || detail === "videos") setActiveTab(detail);
    };
    window.addEventListener("tiktok-tab", handler);
    return () => window.removeEventListener("tiktok-tab", handler);
  }, []);

  return (
    <div className="max-w-full px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">🎵</span> Time TikTok Feminnita
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          5 especialistas ultra-preparadas para cada dimensão do TikTok. Clique em uma agente para conversar.
        </p>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {AGENTS.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setLocation(`/tiktok/${agent.id}`)}
            className="rounded-2xl p-4 text-center border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all bg-white group"
          >
            <img
              src={AGENT_PHOTOS[agent.id]}
              alt={agent.name}
              className="w-24 h-32 rounded-xl object-cover object-top mx-auto mb-3 border-2 border-gray-100 group-hover:border-current transition-colors"
              style={{ borderColor: "transparent" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.borderColor = agent.color; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.borderColor = "transparent"; }}
            />
            <p className="text-sm font-bold text-gray-800">{agent.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight mb-3">{agent.role}</p>
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold text-white inline-block"
              style={{ backgroundColor: agent.color }}
            >
              Conversar
            </span>
          </button>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: "videos" as const, label: "Vídeos", color: "#6B7280" },
          { id: "studio" as const, label: "Studio IA ✨", color: STUDIO_COLOR },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id ? "border-current" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            style={activeTab === tab.id ? { color: tab.color, borderColor: tab.color } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "studio" ? <VideoStudioAI /> : <VideoLibrary />}
    </div>
  );
}
