import { useRef, useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Upload, X, Download, Loader2, AlertCircle, Sparkles, Film,
  Clock, CheckCircle2, XCircle, Timer, Zap, Video, MessageSquare,
  BarChart2, Mic, Mic2, Volume2, Square, Coins, ShoppingCart, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BTN = "#8B2635";
const BTN_HOVER = "#6B1D28";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FilePreview { base64: string; preview: string; name: string; mimeType: string; }
type JobMode = "livre" | "runningup" | "fala";
type JobStatus = "uploading" | "queued" | "processing" | "done" | "error";

interface QueueJob {
  localId: string;
  mode: JobMode;
  taskId: string;
  imagePreview: string;
  label: string;
  status: JobStatus;
  videoUrl?: string;
  error?: string;
  elapsedSec: number;
  createdAt: Date;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadFilePreview(file: File, maxMB: number, accept: string[]): Promise<FilePreview> {
  if (!accept.some(a => file.type.startsWith(a.replace("*", ""))))
    throw new Error(`Arquivo inválido. Aceito: ${accept.join(", ")}`);
  if (file.size > maxMB * 1024 * 1024)
    throw new Error(`Arquivo máx. ${maxMB} MB.`);
  const base64 = await fileToBase64(file);
  return { base64, preview: URL.createObjectURL(file), name: file.name, mimeType: file.type };
}

function randomId() { return Math.random().toString(36).slice(2, 10); }

const STATUS_ICON: Record<JobStatus, React.ReactNode> = {
  uploading: <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />,
  queued:    <Timer className="w-4 h-4 text-amber-400 flex-shrink-0" />,
  processing: <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />,
  done:      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />,
  error:     <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
};
const STATUS_LABEL: Record<JobStatus, string> = {
  uploading: "Enviando...", queued: "Na fila", processing: "Gerando...",
  done: "Pronto", error: "Erro",
};
const MODE_LABEL: Record<JobMode, string> = {
  runningup: "Modo Pose", livre: "Modo Livre", fala: "Modo Fala",
};

// ── Quota Bar ─────────────────────────────────────────────────────────────────
function QuotaBar({ used, limit, extra, label }: { used: number; limit: number; extra: number; label: string }) {
  const total = limit + extra;
  const pct = total === 0 ? 100 : Math.min(100, Math.round((used / total) * 100));
  const exhausted = used >= total;
  return (
    <div className="flex items-center gap-3 text-xs">
      <BarChart2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      <span className="text-slate-500 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${exhausted ? "bg-red-400" : pct > 80 ? "bg-amber-400" : "bg-emerald-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-medium flex-shrink-0 ${exhausted ? "text-red-500" : "text-slate-600"}`}>
        {used}/{total}
        {extra > 0 && <span className="text-slate-400 font-normal"> (+{extra})</span>}
      </span>
    </div>
  );
}

// ── Buy Credits Modal ─────────────────────────────────────────────────────────
function BuyCreditsModal({ onClose }: { onClose: () => void }) {
  const packagesQuery = trpc.videoCredits.getPackages.useQuery();
  const createOrder   = trpc.videoCredits.createOrder.useMutation();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  async function handleBuy(packageId: "starter" | "pro" | "ultra") {
    setLoading(packageId);
    try {
      const result = await createOrder.mutateAsync({ packageId });
      setPaymentUrl(result.paymentUrl);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao criar pedido");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5" style={{ color: BTN }} />
            <h2 className="font-bold text-slate-900 text-lg">Comprar Créditos</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {paymentUrl ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-semibold text-slate-800">Pedido criado!</p>
            <p className="text-sm text-slate-500">Clique abaixo para finalizar o pagamento (PIX ou cartão). Os créditos são adicionados automaticamente após a confirmação.</p>
            <a href={paymentUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-bold text-sm"
              style={{ background: BTN }}>
              <ExternalLink className="w-4 h-4" /> Pagar agora
            </a>
            <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">Fechar</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-4">
              Running Up = 15 cr &nbsp;·&nbsp; Modo Livre = 10 cr &nbsp;·&nbsp; Modo Fala = 12 cr
            </p>
            {(packagesQuery.data ?? []).map(pkg => (
              <button key={pkg.id} disabled={loading === pkg.id}
                onClick={() => handleBuy(pkg.id as any)}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-[#8B2635] transition-colors text-left disabled:opacity-60">
                <div>
                  <div className="font-bold text-slate-800">{pkg.name} — {pkg.credits} créditos</div>
                  <div className="text-xs text-slate-500">{pkg.label}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">R$ {parseFloat(pkg.amountBrl).toFixed(0)}</span>
                  {loading === pkg.id
                    ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: BTN }} />
                    : <ShoppingCart className="w-4 h-4" style={{ color: BTN }} />}
                </div>
              </button>
            ))}
            <p className="text-xs text-slate-400 text-center pt-1">Pagamento via PIX ou cartão · Créditos não expiram</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Credit Balance Bar ────────────────────────────────────────────────────────
function CreditBar({ balance, onBuy }: { balance: number; onBuy: () => void }) {
  const low = balance < 20;
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm ${
      low ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"
    }`}>
      <div className="flex items-center gap-2">
        <Coins className={`w-4 h-4 ${low ? "text-amber-500" : "text-slate-400"}`} />
        <span className={`font-semibold ${low ? "text-amber-700" : "text-slate-700"}`}>
          {balance} crédito{balance !== 1 ? "s" : ""}
        </span>
        {low && <span className="text-amber-600 text-xs">— saldo baixo</span>}
      </div>
      <button onClick={onBuy}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
        style={{ background: BTN }}>
        <ShoppingCart className="w-3 h-3" /> Comprar
      </button>
    </div>
  );
}

const PROMPT_SUGGESTIONS = [
  "Modelo usando o pijama, andando suavemente, cabelo balançando, movimento natural e elegante",
  "Pessoa com o pijama, girando levemente, poses dinâmicas, ambiente de quarto aconchegante",
  "Modelo exibindo o pijama, movimentos fluidos e graciosos, expressão feliz e relaxada",
];

// ── Upload Zone ───────────────────────────────────────────────────────────────
function UploadZone({
  file, onFile, accept, maxMB, icon, hint, preview: previewType,
}: {
  file: FilePreview | null;
  onFile: (f: FilePreview | null) => void;
  accept: string[];
  maxMB: number;
  icon: React.ReactNode;
  hint: string;
  preview: "image" | "video";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function handle(f: File) {
    try {
      const p = await loadFilePreview(f, maxMB, accept);
      onFile(p);
    } catch (e: any) { toast.error(e.message); }
  }

  if (file) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        {previewType === "image"
          ? <img src={file.preview} alt="" className="w-full h-44 object-cover" />
          : <video src={file.preview} className="w-full h-44 object-cover" muted />}
        <button
          onClick={() => onFile(null)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
          <X className="w-3.5 h-3.5 text-white" />
        </button>
        <p className="text-xs text-slate-500 px-3 py-1.5 truncate">{file.name}</p>
      </div>
    );
  }

  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-colors ${
          dragging ? "border-[#8B2635] bg-rose-50" : "border-slate-200 hover:border-[#8B2635] hover:bg-rose-50/50"
        }`}
      >
        <div className="text-slate-300">{icon}</div>
        <p className="text-sm text-slate-500 text-center">{hint}</p>
        <p className="text-xs text-slate-400">máx. {maxMB} MB</p>
      </div>
      <input ref={inputRef} type="file" accept={accept.map(a => a + "/*").join(",")}
        className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }} />
    </>
  );
}

// ── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({ job, onDownload }: { job: QueueJob; onDownload: (url: string, label: string) => void }) {
  const elapsed = `${String(Math.floor(job.elapsedSec / 60)).padStart(2, "0")}:${String(job.elapsedSec % 60).padStart(2, "0")}`;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-colors ${
      job.status === "done" ? "border-green-200 bg-green-50" :
      job.status === "error" ? "border-red-200 bg-red-50" :
      "border-slate-200 bg-white"
    }`}>
      <img src={job.imagePreview} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {STATUS_ICON[job.status]}
          <span className={`text-xs font-medium ${
            job.status === "done" ? "text-green-600" :
            job.status === "error" ? "text-red-500" :
            "text-slate-600"
          }`}>{STATUS_LABEL[job.status]}</span>
          <span className="text-xs text-slate-400 ml-1">{MODE_LABEL[job.mode]}</span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">{job.label}</p>
        {job.error && <p className="text-xs text-red-400 truncate">{job.error}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {(job.status === "queued" || job.status === "processing") && (
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />{elapsed}
          </span>
        )}
        {job.status === "done" && job.videoUrl && (
          <Button size="sm" className="text-white h-7 text-xs px-2"
            style={{ backgroundColor: BTN }}
            onClick={() => onDownload(job.videoUrl!, job.label)}>
            <Download className="w-3 h-3 mr-1" />Baixar
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GerarVideoPage() {
  const [tab, setTab] = useState<JobMode>("livre");
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const jobsRef = useRef<QueueJob[]>([]);
  const notifiedRef = useRef<Set<string>>(new Set());
  jobsRef.current = jobs;

  // ── Modo Livre ───────────────────────────────────────────────────────────────
  const [livreImage, setLivreImage] = useState<FilePreview | null>(null);
  const [livrePrompt, setLivrePrompt] = useState("");
  const [livreDuration, setLivreDuration] = useState(6);
  const [livreSubmitting, setLivreSubmitting] = useState(false);

  // ── Running Up ───────────────────────────────────────────────────────────────
  const [ruImage, setRuImage] = useState<FilePreview | null>(null);
  const [ruVideo, setRuVideo] = useState<FilePreview | null>(null);
  const [ruSubmitting, setRuSubmitting] = useState(false);

  // ── Modo Fala ────────────────────────────────────────────────────────────────
  const [falaImage, setFalaImage] = useState<FilePreview | null>(null);
  const [falaText, setFalaText] = useState("");
  const [falaVoice, setFalaVoice] = useState("fernanda");
  const [falaSubtitles, setFalaSubtitles] = useState(true);
  const [falaSubmitting, setFalaSubmitting] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [showBuyModal, setShowBuyModal] = useState(false);

  // ── tRPC ─────────────────────────────────────────────────────────────────────
  const utils = trpc.useUtils();
  const configQuery     = trpc.runpodVideo.checkConfig.useQuery();
  const falaConfigQuery = trpc.modoFala.checkConfig.useQuery();
  const quotaQuery      = trpc.runpodVideo.getQuota.useQuery(undefined, { refetchInterval: 30000 });
  const balanceQuery    = trpc.videoCredits.getBalance.useQuery(undefined, { refetchInterval: 15000 });
  const voicesQuery     = trpc.modoFala.getVoices.useQuery();

  const cfg     = configQuery.data;
  const falaCfg = falaConfigQuery.data;
  const quota   = quotaQuery.data;
  const voices  = voicesQuery.data ?? [];

  const livreMutation   = trpc.runpodVideo.generate.useMutation();
  const ruMutation      = trpc.runpodVideo.runningUpGenerate.useMutation();
  const falaMutation    = trpc.modoFala.generate.useMutation();
  const previewMutation = trpc.modoFala.previewVoice.useMutation();

  // ── Voice preview ─────────────────────────────────────────────────────────────
  async function handlePreview(voiceId: string) {
    if (playingVoice === voiceId) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingVoice(null);
      return;
    }
    audioRef.current?.pause();
    setPlayingVoice(voiceId);
    try {
      const { audioBase64 } = await previewMutation.mutateAsync({ voiceId });
      const blob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: "audio/mpeg" });
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlayingVoice(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setPlayingVoice(null); toast.error("Erro ao reproduzir prévia."); };
      audio.play();
    } catch {
      setPlayingVoice(null);
      toast.error("Erro ao gerar prévia da voz.");
    }
  }

  // ── Polling ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setJobs(prev => prev.map(j =>
        j.status === "queued" || j.status === "processing"
          ? { ...j, elapsedSec: j.elapsedSec + 1 } : j
      ));
    }, 1000);

    const poller = setInterval(async () => {
      const active = jobsRef.current.filter(j => j.status === "queued" || j.status === "processing");
      for (const job of active) {
        try {
          let newStatus: JobStatus = "processing";
          let videoUrl: string | undefined;
          let error: string | undefined;

          if (job.mode === "runningup") {
            const res = await utils.runpodVideo.runningUpStatus.fetch({ taskId: job.taskId });
            const done = res.status === "SUCCESS" || res.status === "COMPLETED";
            const failed = res.status === "FAILED" || res.status === "ERROR";
            newStatus = done ? "done" : failed ? "error" : "processing";
            videoUrl = res.videoUrl;
            error = res.error;
          } else if (job.mode === "fala") {
            const res = await utils.modoFala.status.fetch({ talkId: job.taskId });
            newStatus = res.status === "COMPLETED" ? "done" : res.status === "FAILED" ? "error" : "processing";
            videoUrl = res.videoUrl ?? undefined;
            error = res.error ?? undefined;
          } else {
            const res = await utils.runpodVideo.status.fetch({ jobId: job.taskId });
            const done = res.status === "SUCCESS" || res.status === "COMPLETED";
            const failed = res.status === "FAILED" || res.status === "ERROR";
            newStatus = done ? "done" : failed ? "error" : "processing";
            videoUrl = res.videoUrl ?? undefined;
            error = res.error ?? undefined;
          }

          setJobs(prev => prev.map(j => j.localId === job.localId
            ? { ...j, status: newStatus, videoUrl: newStatus === "done" ? videoUrl : j.videoUrl, error: newStatus === "error" ? error : j.error }
            : j
          ));

          if (newStatus === "done" && !notifiedRef.current.has(job.localId)) {
            notifiedRef.current.add(job.localId);
            toast.success(`Vídeo "${job.label.slice(0, 30)}" pronto!`);
          }
        } catch {}
      }
    }, 10000);

    return () => { clearInterval(timer); clearInterval(poller); };
  }, []);

  // ── Submit handlers ───────────────────────────────────────────────────────────
  async function handleLivreSubmit() {
    if (!livreImage) { toast.error("Adicione a imagem."); return; }
    if (!livrePrompt.trim()) { toast.error("Descreva o movimento."); return; }
    if (!cfg?.falConfigured) { toast.error("SILICONFLOW_API_KEY não configurado."); return; }

    setLivreSubmitting(true);
    const localId = randomId();
    setJobs(prev => [{ localId, mode: "livre", taskId: "", imagePreview: livreImage.preview,
      label: livrePrompt.slice(0, 50), status: "uploading", elapsedSec: 0, createdAt: new Date() }, ...prev]);

    try {
      const { jobId } = await livreMutation.mutateAsync({
        imageBase64: livreImage.base64, imageMimeType: livreImage.mimeType,
        prompt: livrePrompt.trim(), durationSeconds: livreDuration,
      });
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, taskId: jobId, status: "queued" } : j));
      setLivreImage(null); setLivrePrompt("");
      quotaQuery.refetch();
      toast.success("Adicionado à fila.");
    } catch (e: any) {
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, status: "error", error: e.message } : j));
      toast.error(e.message);
    } finally { setLivreSubmitting(false); }
  }

  async function handleRunningUpSubmit() {
    if (!ruImage) { toast.error("Adicione a foto do modelo."); return; }
    if (!ruVideo) { toast.error("Adicione o vídeo referência."); return; }
    if (!cfg?.rhConfigured) { toast.error("RUNNINGHUB_API_KEY não configurado."); return; }

    setRuSubmitting(true);
    const localId = randomId();
    setJobs(prev => [{ localId, mode: "runningup", taskId: "", imagePreview: ruImage.preview,
      label: ruVideo.name, status: "uploading", elapsedSec: 0, createdAt: new Date() }, ...prev]);

    try {
      const { taskId } = await ruMutation.mutateAsync({
        imageBase64: ruImage.base64, videoBase64: ruVideo.base64,
        imageName: ruImage.name, videoName: ruVideo.name,
        imageMimeType: ruImage.mimeType, videoMimeType: ruVideo.mimeType,
      });
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, taskId, status: "queued" } : j));
      setRuImage(null); setRuVideo(null);
      quotaQuery.refetch();
      toast.success("Adicionado à fila.");
    } catch (e: any) {
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, status: "error", error: e.message } : j));
      toast.error(e.message);
    } finally { setRuSubmitting(false); }
  }

  async function handleFalaSubmit() {
    if (!falaImage) { toast.error("Adicione a foto da modelo."); return; }
    if (!falaText.trim()) { toast.error("Digite o texto que a modelo vai falar."); return; }
    if (!falaCfg?.didConfigured) { toast.error("DID_API_KEY não configurado."); return; }
    if (!falaCfg?.elConfigured) { toast.error("ELEVENLABS_API_KEY não configurado."); return; }

    setFalaSubmitting(true);
    const localId = randomId();
    setJobs(prev => [{ localId, mode: "fala", taskId: "", imagePreview: falaImage.preview,
      label: falaText.slice(0, 50), status: "uploading", elapsedSec: 0, createdAt: new Date() }, ...prev]);

    try {
      const { talkId } = await falaMutation.mutateAsync({
        imageBase64: falaImage.base64, imageMimeType: falaImage.mimeType,
        text: falaText.trim(), voiceId: falaVoice, withSubtitles: falaSubtitles,
      });
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, taskId: talkId, status: "queued" } : j));
      setFalaImage(null); setFalaText("");
      toast.success("Adicionado à fila.");
    } catch (e: any) {
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, status: "error", error: e.message } : j));
      toast.error(e.message);
    } finally { setFalaSubmitting(false); }
  }

  const handleDownload = useCallback(async (url: string, label: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `feminnita-${label.slice(0, 20).replace(/\s+/g, "-")}-${Date.now()}.mp4`;
      a.click();
    } catch { window.open(url, "_blank"); }
  }, []);

  const activeJobs = jobs.filter(j => j.status !== "done" && j.status !== "error");
  const doneJobs   = jobs.filter(j => j.status === "done"  || j.status === "error");

  const TABS = [
    { id: "runningup" as JobMode, label: "Modo Pose", icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "livre"     as JobMode, label: "Modo Livre", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "fala"      as JobMode, label: "Modo Fala",  icon: <Mic className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {showBuyModal && <BuyCreditsModal onClose={() => { setShowBuyModal(false); balanceQuery.refetch(); }} />}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${BTN}, ${BTN_HOVER})` }}>
          <Film className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Geração de Vídeo IA</h1>
          <p className="text-sm text-slate-500">Fila automática · {activeJobs.length > 0 ? `${activeJobs.length} em andamento` : "Pronto para gerar"}</p>
        </div>
      </div>

      {/* Credit balance */}
      {balanceQuery.data && (
        <CreditBar balance={balanceQuery.data.balance} onBuy={() => setShowBuyModal(true)} />
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── Running Up ─────────────────────────────────────────────────────────── */}
      {tab === "runningup" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {cfg && !cfg.rhConfigured && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">Modo Pose não configurado. Contate o suporte.</p>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                1. Foto do modelo <span className="text-slate-400 font-normal">— imagem de referência</span>
              </label>
              <UploadZone file={ruImage} onFile={setRuImage} accept={["image"]} maxMB={20}
                icon={<Upload className="w-8 h-8" />}
                hint="Arraste a foto do modelo ou clique para escolher" preview="image" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                2. Vídeo referência <span className="text-slate-400 font-normal">— movimentos a copiar</span>
              </label>
              <UploadZone file={ruVideo} onFile={setRuVideo} accept={["video"]} maxMB={35}
                icon={<Video className="w-8 h-8" />}
                hint="Arraste o vídeo TikTok referência ou clique para escolher" preview="video" />
            </div>
            {quota && <QuotaBar used={quota.runningup.used} limit={quota.runningup.limit} extra={quota.runningup.extra} label="Running Up" />}
            <Button onClick={handleRunningUpSubmit} disabled={ruSubmitting || !ruImage || !ruVideo}
              className="w-full text-white" style={{ backgroundColor: BTN }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = BTN_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BTN)}>
              {ruSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</> : <><Zap className="w-4 h-4 mr-2" /> Adicionar à fila</>}
            </Button>
          </div>
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-3 text-slate-400 min-h-[300px]">
            <Zap className="w-10 h-10 text-slate-200" />
            <p className="text-sm font-medium text-center">Running Up</p>
            <p className="text-xs text-center">O modelo na foto vai reproduzir os movimentos do vídeo referência.</p>
            <p className="text-xs text-center text-slate-300">Powered by Feminnita</p>
          </div>
        </div>
      )}

      {/* ── Modo Livre ────────────────────────────────────────────────────────── */}
      {tab === "livre" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {cfg && !cfg.falConfigured && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">Modo Livre não configurado. Contate o suporte.</p>
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                1. Imagem do produto <span className="text-slate-400 font-normal">— foto a ser animada</span>
              </label>
              <UploadZone file={livreImage} onFile={setLivreImage} accept={["image"]} maxMB={20}
                icon={<Upload className="w-8 h-8" />}
                hint="Arraste a foto do produto ou clique para escolher" preview="image" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                2. Descreva o movimento
              </label>
              <textarea value={livrePrompt} onChange={(e) => setLivrePrompt(e.target.value)}
                placeholder="Ex: Modelo usando o pijama, andando suavemente, cabelo balançando..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none outline-none focus:border-[#8B2635] transition-colors" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PROMPT_SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => setLivrePrompt(s)}
                    className="text-xs px-2 py-1 rounded-full border border-slate-200 text-slate-500 hover:border-[#8B2635] hover:text-[#8B2635] transition-colors truncate max-w-full">
                    {s.slice(0, 45)}…
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">3. Duração</label>
              <div className="flex gap-2">
                {[6, 10].map(d => (
                  <button key={d} onClick={() => setLivreDuration(d)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      livreDuration === d ? "border-[#8B2635] text-[#8B2635] bg-rose-50" : "border-slate-200 text-slate-500 hover:border-[#8B2635]"
                    }`}>{d}s</button>
                ))}
              </div>
            </div>
            {quota && <QuotaBar used={quota.livre.used} limit={quota.livre.limit} extra={quota.livre.extra} label="Modo Livre" />}
            <Button onClick={handleLivreSubmit} disabled={livreSubmitting || !livreImage || !livrePrompt.trim()}
              className="w-full text-white" style={{ backgroundColor: BTN }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = BTN_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BTN)}>
              {livreSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</> : <><Sparkles className="w-4 h-4 mr-2" /> Adicionar à fila</>}
            </Button>
          </div>
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-3 text-slate-400 min-h-[300px]">
            <Sparkles className="w-10 h-10 text-slate-200" />
            <p className="text-sm font-medium text-center">Modo Livre</p>
            <p className="text-xs text-center">Descreva o movimento em texto e o WanVideo vai animar a imagem.</p>
            <p className="text-xs text-center text-slate-300">Powered by Feminnita</p>
          </div>
        </div>
      )}

      {/* ── Modo Fala ─────────────────────────────────────────────────────────── */}
      {tab === "fala" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {falaCfg && (!falaCfg.didConfigured || !falaCfg.elConfigured) && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Modo Fala não configurado. Contate o suporte.
                </p>
              </div>
            )}

            {/* Foto */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                1. Foto da modelo
              </label>
              <UploadZone file={falaImage} onFile={setFalaImage} accept={["image"]} maxMB={20}
                icon={<Upload className="w-8 h-8" />}
                hint="Arraste a foto ou clique para escolher" preview="image" />
            </div>

            {/* Voz */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                <Mic2 className="w-3.5 h-3.5 inline mr-1" />
                2. Escolha a voz
              </label>
              <div className="grid grid-cols-2 gap-2">
                {voices.map(v => {
                  const isPlaying = playingVoice === v.id;
                  const isLoading = isPlaying && previewMutation.isPending;
                  return (
                    <div key={v.id} onClick={() => setFalaVoice(v.id)}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        falaVoice === v.id ? "border-[#8B2635] bg-rose-50" : "border-slate-200 hover:border-[#8B2635]"
                      }`}>
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm font-medium ${falaVoice === v.id ? "text-[#8B2635]" : "text-slate-700"}`}>{v.name}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePreview(v.id); }}
                          title={isPlaying ? "Parar" : "Ouvir prévia"}
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            isPlaying ? "bg-[#8B2635] text-white" : "bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-[#8B2635]"
                          }`}>
                          {isLoading
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : isPlaying
                              ? <Square className="w-2.5 h-2.5 fill-white" />
                              : <Volume2 className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400">{v.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Texto */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                3. Descreva a cena
              </label>
              <textarea value={falaText} onChange={(e) => setFalaText(e.target.value)}
                placeholder="Ex: A modelo sorri e diz: 'Olá! Esse pijama é incrível, você vai se apaixonar. Está por apenas R$ 49,90!'"
                rows={5}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none outline-none focus:border-[#8B2635] transition-colors" />
              <p className="text-xs text-slate-400 mt-1">{falaText.length}/2000 chars · descreva o que a modelo diz e faz</p>
            </div>

            {/* Toggle legenda */}
            <button
              onClick={() => setFalaSubtitles(v => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                falaSubtitles ? "border-[#8B2635] bg-rose-50" : "border-slate-200 bg-white"
              }`}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  falaSubtitles ? "bg-[#8B2635] border-[#8B2635]" : "border-slate-300"
                }`}>
                  {falaSubtitles && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                </div>
                <span className={`text-sm font-medium ${falaSubtitles ? "text-[#8B2635]" : "text-slate-600"}`}>
                  Adicionar legenda automática
                </span>
              </div>
            </button>

            <Button onClick={handleFalaSubmit} disabled={falaSubmitting || !falaImage || !falaText.trim()}
              className="w-full text-white" style={{ backgroundColor: BTN }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = BTN_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BTN)}>
              {falaSubmitting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                : <><Mic className="w-4 h-4 mr-2" /> Gerar vídeo com fala</>}
            </Button>
          </div>

          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-3 text-slate-400 min-h-[300px]">
            <Mic className="w-10 h-10 text-slate-200" />
            <p className="text-sm font-medium text-center">Modo Fala</p>
            <p className="text-xs text-center">A modelo na foto vai falar o texto com a voz escolhida, sincronizando lábios automaticamente.</p>
            <p className="text-xs text-center text-slate-300">Powered by Feminnita</p>
          </div>
        </div>
      )}

      {/* ── Fila de jobs ──────────────────────────────────────────────────────── */}
      {jobs.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Fila de geração
              {activeJobs.length > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />{activeJobs.length} ativo{activeJobs.length > 1 ? "s" : ""}
                </span>
              )}
            </h2>
            {doneJobs.length > 0 && (
              <button onClick={() => setJobs(prev => prev.filter(j => j.status !== "done" && j.status !== "error"))}
                className="text-xs text-slate-400 hover:text-slate-600">Limpar concluídos</button>
            )}
          </div>
          {activeJobs.map(job => <JobCard key={job.localId} job={job} onDownload={handleDownload} />)}
          {doneJobs.length > 0 && (
            <>
              {activeJobs.length > 0 && <hr className="border-slate-100" />}
              {doneJobs.map(job => <JobCard key={job.localId} job={job} onDownload={handleDownload} />)}
            </>
          )}
        </div>
      )}

      {jobs.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Film className="w-8 h-8 mx-auto mb-2 text-slate-200" />
          <p className="text-sm">A fila aparece aqui. Adicione um vídeo para começar.</p>
        </div>
      )}
    </div>
  );
}
