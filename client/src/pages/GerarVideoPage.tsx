import { useRef, useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Upload, X, Download, Loader2, AlertCircle, Sparkles, Film,
  Clock, CheckCircle2, XCircle, Timer, Zap, Video, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BTN = "#8B2635";
const BTN_HOVER = "#6B1D28";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FilePreview { base64: string; preview: string; name: string; mimeType: string; }
type JobMode = "livre" | "runningup";
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
  onFile: (f: FilePreview) => void;
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
        <button onClick={() => {}} className="hidden" />
        <button
          onClick={(e) => { e.stopPropagation(); onFile(null as any); }}
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
          <span className="text-xs text-slate-400 ml-1">
            {job.mode === "runningup" ? "Running Up" : "Modo Livre"}
          </span>
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
  const [tab, setTab] = useState<JobMode>("runningup");
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const jobsRef = useRef<QueueJob[]>([]);
  const notifiedRef = useRef<Set<string>>(new Set());
  jobsRef.current = jobs;

  // Modo Livre
  const [livreImage, setLivreImage] = useState<FilePreview | null>(null);
  const [livrePrompt, setLivrePrompt] = useState("");
  const [livreDuration, setLivreDuration] = useState(10);
  const [livreSubmitting, setLivreSubmitting] = useState(false);

  // Running Up
  const [ruImage, setRuImage] = useState<FilePreview | null>(null);
  const [ruVideo, setRuVideo] = useState<FilePreview | null>(null);
  const [ruSubmitting, setRuSubmitting] = useState(false);

  const utils = trpc.useUtils();
  const configQuery = trpc.runpodVideo.checkConfig.useQuery();
  const cfg = configQuery.data;

  const livreMutation = trpc.runpodVideo.generate.useMutation();
  const ruMutation = trpc.runpodVideo.runningUpGenerate.useMutation();

  // ── Polling ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Timer to increment elapsed seconds
    const timer = setInterval(() => {
      setJobs(prev => prev.map(j =>
        j.status === "queued" || j.status === "processing"
          ? { ...j, elapsedSec: j.elapsedSec + 1 }
          : j
      ));
    }, 1000);

    // Status polling every 10s
    const poller = setInterval(async () => {
      const active = jobsRef.current.filter(j => j.status === "queued" || j.status === "processing");
      for (const job of active) {
        try {
          let rhStatus: string, videoUrl: string | undefined, error: string | undefined;

          if (job.mode === "runningup") {
            const res = await utils.runpodVideo.runningUpStatus.fetch({ taskId: job.taskId });
            rhStatus = res.status;
            videoUrl = res.videoUrl;
            error = res.error;
          } else {
            const res = await utils.runpodVideo.status.fetch({ jobId: job.taskId });
            rhStatus = res.status;
            videoUrl = res.videoUrl ?? undefined;
            error = res.error ?? undefined;
          }

          const isDone = rhStatus === "SUCCESS" || rhStatus === "COMPLETED";
          const isFailed = rhStatus === "FAILED" || rhStatus === "ERROR";
          const isProcessing = rhStatus === "IN_PROGRESS" || rhStatus === "RUNNING";

          const newStatus: JobStatus = isDone ? "done" : isFailed ? "error" : isProcessing ? "processing" : "queued";

          setJobs(prev => prev.map(j => j.localId === job.localId
            ? { ...j, status: newStatus, videoUrl: isDone ? videoUrl : j.videoUrl, error: isFailed ? error : j.error }
            : j
          ));

          if (isDone && !notifiedRef.current.has(job.localId)) {
            notifiedRef.current.add(job.localId);
            toast.success(`Vídeo "${job.label.slice(0, 30)}" pronto!`);
          }
        } catch {}
      }
    }, 10000);

    return () => { clearInterval(timer); clearInterval(poller); };
  }, []);

  // ── Add to queue ─────────────────────────────────────────────────────────────
  async function handleLivreSubmit() {
    if (!livreImage) { toast.error("Adicione a imagem."); return; }
    if (!livrePrompt.trim()) { toast.error("Descreva o movimento."); return; }
    if (!cfg?.falConfigured) { toast.error("FAL_API_KEY não configurado."); return; }

    setLivreSubmitting(true);
    const localId = randomId();
    const tempJob: QueueJob = {
      localId, mode: "livre", taskId: "", imagePreview: livreImage.preview,
      label: livrePrompt.slice(0, 50), status: "uploading", elapsedSec: 0, createdAt: new Date(),
    };
    setJobs(prev => [tempJob, ...prev]);

    try {
      const { jobId } = await livreMutation.mutateAsync({
        imageBase64: livreImage.base64,
        prompt: livrePrompt.trim(),
        durationSeconds: livreDuration,
      });
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, taskId: jobId, status: "queued" } : j));
      setLivreImage(null); setLivrePrompt("");
      toast.success("Adicionado à fila.");
    } catch (e: any) {
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, status: "error", error: e.message } : j));
      toast.error(e.message);
    } finally {
      setLivreSubmitting(false);
    }
  }

  async function handleRunningUpSubmit() {
    if (!ruImage) { toast.error("Adicione a foto do modelo."); return; }
    if (!ruVideo) { toast.error("Adicione o vídeo referência."); return; }
    if (!cfg?.rhConfigured) { toast.error("RUNNINGHUB_API_KEY não configurado."); return; }

    setRuSubmitting(true);
    const localId = randomId();
    const tempJob: QueueJob = {
      localId, mode: "runningup", taskId: "", imagePreview: ruImage.preview,
      label: ruVideo.name, status: "uploading", elapsedSec: 0, createdAt: new Date(),
    };
    setJobs(prev => [tempJob, ...prev]);

    try {
      const { taskId } = await ruMutation.mutateAsync({
        imageBase64: ruImage.base64,
        videoBase64: ruVideo.base64,
        imageName: ruImage.name,
        videoName: ruVideo.name,
        imageMimeType: ruImage.mimeType,
        videoMimeType: ruVideo.mimeType,
      });
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, taskId, status: "queued" } : j));
      setRuImage(null); setRuVideo(null);
      toast.success("Adicionado à fila.");
    } catch (e: any) {
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, status: "error", error: e.message } : j));
      toast.error(e.message);
    } finally {
      setRuSubmitting(false);
    }
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
  const doneJobs = jobs.filter(j => j.status === "done" || j.status === "error");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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

      {/* Config warnings */}
      {cfg && !cfg.falConfigured && tab === "livre" && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">Adicione <code className="bg-amber-100 px-1 rounded">FAL_API_KEY</code> no <code className="bg-amber-100 px-1 rounded">.env</code> para usar o Modo Livre.</p>
        </div>
      )}
      {cfg && !cfg.rhConfigured && tab === "runningup" && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">Adicione <code className="bg-amber-100 px-1 rounded">RUNNINGHUB_API_KEY</code> no <code className="bg-amber-100 px-1 rounded">.env</code> para usar o Running Up.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {([["runningup", "Running Up", <Zap className="w-3.5 h-3.5" />],
           ["livre", "Modo Livre", <Sparkles className="w-3.5 h-3.5" />]] as const).map(([id, label, icon]) => (
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
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                1. Foto do modelo
                <span className="text-slate-400 font-normal ml-1">— imagem de referência</span>
              </label>
              <UploadZone
                file={ruImage}
                onFile={(f) => setRuImage(f || null)}
                accept={["image"]}
                maxMB={20}
                icon={<Upload className="w-8 h-8" />}
                hint="Arraste a foto do modelo ou clique para escolher"
                preview="image"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                2. Vídeo referência
                <span className="text-slate-400 font-normal ml-1">— movimentos a copiar</span>
              </label>
              <UploadZone
                file={ruVideo}
                onFile={(f) => setRuVideo(f || null)}
                accept={["video"]}
                maxMB={35}
                icon={<Video className="w-8 h-8" />}
                hint="Arraste o vídeo TikTok referência ou clique para escolher"
                preview="video"
              />
            </div>
            <Button
              onClick={handleRunningUpSubmit}
              disabled={ruSubmitting || !ruImage || !ruVideo}
              className="w-full text-white"
              style={{ backgroundColor: BTN }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = BTN_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BTN)}>
              {ruSubmitting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                : <><Zap className="w-4 h-4 mr-2" /> Adicionar à fila</>}
            </Button>
          </div>

          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-3 text-slate-400 min-h-[300px]">
            <Zap className="w-10 h-10 text-slate-200" />
            <p className="text-sm font-medium text-center">Running Up</p>
            <p className="text-xs text-center">O modelo na foto vai reproduzir os movimentos do vídeo referência.</p>
            <p className="text-xs text-center text-slate-300">Powered by RunningHub · WanVideo Animate + ViTPose</p>
          </div>
        </div>
      )}

      {/* ── Modo Livre ────────────────────────────────────────────────────────── */}
      {tab === "livre" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                1. Imagem do produto
                <span className="text-slate-400 font-normal ml-1">— foto a ser animada</span>
              </label>
              <UploadZone
                file={livreImage}
                onFile={(f) => setLivreImage(f || null)}
                accept={["image"]}
                maxMB={20}
                icon={<Upload className="w-8 h-8" />}
                hint="Arraste a foto do produto ou clique para escolher"
                preview="image"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                2. Descreva o movimento
              </label>
              <textarea
                value={livrePrompt}
                onChange={(e) => setLivrePrompt(e.target.value)}
                placeholder="Ex: Modelo usando o pijama, andando suavemente, cabelo balançando..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none outline-none focus:border-[#8B2635] transition-colors"
              />
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
              <div className="flex items-center gap-3">
                <input type="range" min={3} max={30} step={1} value={livreDuration}
                  onChange={(e) => setLivreDuration(Number(e.target.value))}
                  className="flex-1" style={{ accentColor: BTN }} />
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                  <input type="number" min={3} max={30} value={livreDuration}
                    onChange={(e) => setLivreDuration(Math.min(30, Math.max(3, Number(e.target.value) || 3)))}
                    className="w-14 text-center text-sm font-semibold py-1.5 outline-none"
                    style={{ color: BTN }} />
                  <span className="pr-2 text-xs text-slate-400">s</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>3s</span><span>15s</span><span>30s</span>
              </div>
            </div>
            <Button
              onClick={handleLivreSubmit}
              disabled={livreSubmitting || !livreImage || !livrePrompt.trim()}
              className="w-full text-white"
              style={{ backgroundColor: BTN }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = BTN_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = BTN)}>
              {livreSubmitting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                : <><Sparkles className="w-4 h-4 mr-2" /> Adicionar à fila</>}
            </Button>
          </div>

          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-3 text-slate-400 min-h-[300px]">
            <Sparkles className="w-10 h-10 text-slate-200" />
            <p className="text-sm font-medium text-center">Modo Livre</p>
            <p className="text-xs text-center">Descreva o movimento em texto e o WanVideo vai animar a imagem.</p>
            <p className="text-xs text-center text-slate-300">Powered by fal.ai · WanVideo 2.2 I2V</p>
          </div>
        </div>
      )}

      {/* ── Fila de jobs ─────────────────────────────────────────────────────── */}
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
                className="text-xs text-slate-400 hover:text-slate-600">
                Limpar concluídos
              </button>
            )}
          </div>

          {/* Active jobs first */}
          {activeJobs.map(job => (
            <JobCard key={job.localId} job={job} onDownload={handleDownload} />
          ))}

          {/* Done/error jobs */}
          {doneJobs.length > 0 && (
            <>
              {activeJobs.length > 0 && <hr className="border-slate-100" />}
              {doneJobs.map(job => (
                <JobCard key={job.localId} job={job} onDownload={handleDownload} />
              ))}
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
