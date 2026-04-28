import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Bot, CheckCircle, ChevronDown, ChevronUp, Clock, Loader2,
  MessageSquare, PlayCircle, Send, XCircle, Upload, Video,
  Trash2, Film, TrendingUp, Package, Wand2, Download, Plus, X,
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

// ─── Módulo de Vídeos ─────────────────────────────────────────────────────────

function VideoLibrary() {
  const [uploading, setUploading] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

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
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  v.status === "published" ? "bg-green-100 text-green-700" :
                  v.status === "ready" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>{v.status}</span>
                <button onClick={() => deleteMut.mutate({ id: v.id })} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
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
    </div>
  );
}

// ─── Video Studio ─────────────────────────────────────────────────────────────

const STUDIO_COLOR = "#8B5CF6";

function VideoStudio() {
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [hookText, setHookText] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [durationPerImage, setDurationPerImage] = useState(4);
  const [title, setTitle] = useState("");
  const [dubbing, setDubbing] = useState(true);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const listQuery = trpc.tiktokTeam.listVideos.useQuery(undefined, {
    refetchInterval: generatingId ? 3000 : false,
  });

  const generateMut = trpc.tiktokTeam.generateVideo.useMutation({
    onSuccess: (data) => {
      setGeneratingId(data.videoId);
      utils.tiktokTeam.listVideos.invalidate();
      toast.success("Vídeo em processamento…");
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const deleteMut = trpc.tiktokTeam.deleteVideo.useMutation({
    onSuccess: () => { utils.tiktokTeam.listVideos.invalidate(); toast.success("Removido"); },
  });

  // Stop polling when the generating video is done/errored
  useEffect(() => {
    if (!generatingId) return;
    const found = listQuery.data?.find((v: any) => v.id === generatingId);
    if (found && found.status !== "processing") {
      setGeneratingId(null);
      if (found.status === "ready") toast.success("Vídeo gerado com sucesso!");
      if (found.status === "error") toast.error("Falha ao gerar vídeo. Verifique o log.");
    }
  }, [listQuery.data, generatingId]);

  function addImageUrl() {
    if (imageUrls.length < 5) setImageUrls([...imageUrls, ""]);
  }

  function removeImageUrl(i: number) {
    setImageUrls(imageUrls.filter((_, idx) => idx !== i));
  }

  function setUrl(i: number, val: string) {
    const next = [...imageUrls];
    next[i] = val;
    setImageUrls(next);
  }

  function handleGenerate() {
    const validUrls = imageUrls.map((u) => u.trim()).filter(Boolean);
    if (!title.trim()) return toast.error("Preencha o título do vídeo.");
    if (validUrls.length === 0) return toast.error("Adicione pelo menos 1 imagem.");
    generateMut.mutate({
      title: title.trim(),
      imageUrls: validUrls,
      hookText: hookText.trim(),
      ctaText: ctaText.trim(),
      durationPerImage,
      dubbing,
    });
  }

  const videos = ((listQuery.data || []) as any[]).filter((v: any) => v.source === "generated");

  return (
    <div className="space-y-4">
      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Wand2 className="w-4 h-4" style={{ color: STUDIO_COLOR }} />
          Gerar Vídeo com IA
        </h3>
        <p className="text-xs text-gray-500">
          Cole URLs de imagens de produto (1–5), escreva os textos e gere um vídeo vertical 9:16 pronto para TikTok/Reels.
        </p>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Título do vídeo</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Try-on pijama floral verão 2025"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": STUDIO_COLOR } as any}
          />
        </div>

        {/* Image URLs */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Imagens do produto (URLs)</label>
          <div className="space-y-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(i, e.target.value)}
                  placeholder={`URL da imagem ${i + 1}`}
                  className="flex-1 text-base border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": STUDIO_COLOR } as any}
                />
                {imageUrls.length > 1 && (
                  <button onClick={() => removeImageUrl(i)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg border border-gray-200">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {imageUrls.length < 5 && (
            <button onClick={addImageUrl} className="mt-2 flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800">
              <Plus className="w-3.5 h-3.5" /> Adicionar imagem
            </button>
          )}
        </div>

        {/* Texts */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Hook (início — primeiros 3s)</label>
            <input
              type="text"
              value={hookText}
              onChange={(e) => setHookText(e.target.value.slice(0, 70))}
              placeholder="Ex: Você sabia que dá para comprar pijamas no preço de fábrica?"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": STUDIO_COLOR } as any}
            />
            <p className="text-xs text-gray-400 mt-1">{hookText.length}/70 caracteres</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">CTA (final — últimos 3s)</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value.slice(0, 70))}
              placeholder="Ex: Comenta CATÁLOGO que eu mando tudo no DM"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": STUDIO_COLOR } as any}
            />
            <p className="text-xs text-gray-400 mt-1">{ctaText.length}/70 caracteres</p>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Duração por imagem</label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map((s) => (
              <button
                key={s}
                onClick={() => setDurationPerImage(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  durationPerImage === s
                    ? "text-white border-transparent"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={durationPerImage === s ? { background: STUDIO_COLOR } : {}}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>

        {/* Dublagem */}
        <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          <input
            type="checkbox"
            id="dubbing"
            checked={dubbing}
            onChange={(e) => setDubbing(e.target.checked)}
            className="w-4 h-4 accent-purple-600 cursor-pointer"
          />
          <label htmlFor="dubbing" className="text-sm font-medium text-purple-900 cursor-pointer select-none">
            🎙️ Dublagem com IA (ElevenLabs) — voz lê o hook e o CTA automaticamente
          </label>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generateMut.isPending || !!generatingId}
          className="w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
          style={{ background: STUDIO_COLOR }}
        >
          {generateMut.isPending || generatingId ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processando…</>
          ) : (
            <><Wand2 className="w-4 h-4" /> Gerar Vídeo</>
          )}
        </button>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-700 space-y-0.5">
          <p className="font-semibold">Como funciona:</p>
          <p>• As imagens são baixadas e montadas em slideshow vertical 1080×1920 (9:16)</p>
          <p>• Hook e CTA aparecem como legenda no início e no final do vídeo</p>
          <p>• Saída: MP4 H.264, 30fps, sem áudio (adicione música no TikTok/Reels)</p>
          <p>• Processamento leva ~30–90 segundos dependendo do número de imagens</p>
        </div>
      </div>

      {/* Generated videos list */}
      {videos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Video className="w-4 h-4 text-gray-400" /> Vídeos Gerados ({videos.length})
          </h3>
          <div className="space-y-2">
            {videos.map((v: any) => (
              <div key={v.id} className="flex items-center gap-3 px-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: STUDIO_COLOR + "15" }}>
                  {v.status === "processing" ? (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: STUDIO_COLOR }} />
                  ) : v.status === "error" ? (
                    <XCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <Film className="w-5 h-5" style={{ color: STUDIO_COLOR }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{v.title}</p>
                  <p className="text-xs text-gray-400">
                    {fmtDate(v.createdAt)}
                    {v.durationSeconds ? ` · ${v.durationSeconds}s` : ""}
                    {v.status === "processing" ? " · Processando…" : ""}
                    {v.status === "error" ? ` · Erro: ${v.description || "desconhecido"}` : ""}
                  </p>
                </div>
                {v.status === "ready" && v.filePath && (
                  <a
                    href={v.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg"
                    style={{ background: STUDIO_COLOR }}
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar
                  </a>
                )}
                <button onClick={() => deleteMut.mutate({ id: v.id })} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
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
    const handler = (e: Event) => setActiveTab((e as CustomEvent).detail as "videos" | "studio");
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

      {/* Tab nav — Vídeos e Studio */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: "videos" as const, label: "Vídeos", emoji: "🎬", color: "#6B7280" },
          { id: "studio" as const, label: "Studio ✨", emoji: "🎬", color: STUDIO_COLOR },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id ? "border-current" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            style={activeTab === tab.id ? { color: tab.color, borderColor: tab.color } : {}}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "studio" ? <VideoStudio /> : <VideoLibrary />}
    </div>
  );
}
