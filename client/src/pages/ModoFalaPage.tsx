import { useRef, useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Upload, X, Download, Loader2, Mic, Mic2, AlertCircle,
  CheckCircle2, XCircle, Clock, Film, MessageSquare, Volume2, Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BTN = "#8B2635";
const BTN_HOVER = "#6B1D28";

interface FilePreview { base64: string; preview: string; name: string; mimeType: string; }
type JobStatus = "uploading" | "queued" | "processing" | "done" | "error";

interface FalaJob {
  localId: string;
  talkId: string;
  imagePreview: string;
  label: string;
  status: JobStatus;
  videoUrl?: string;
  error?: string;
  elapsedSec: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function randomId() { return Math.random().toString(36).slice(2, 10); }

const STATUS_ICON: Record<JobStatus, React.ReactNode> = {
  uploading:  <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />,
  queued:     <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />,
  processing: <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />,
  done:       <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />,
  error:      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
};
const STATUS_LABEL: Record<JobStatus, string> = {
  uploading: "Enviando...", queued: "Na fila", processing: "Gerando...",
  done: "Pronto", error: "Erro",
};

export default function ModoFalaPage() {
  const [image, setImage] = useState<FilePreview | null>(null);
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("fernanda");
  const [submitting, setSubmitting] = useState(false);
  const [jobs, setJobs] = useState<FalaJob[]>([]);
  const jobsRef = useRef<FalaJob[]>([]);
  const notifiedRef = useRef<Set<string>>(new Set());
  jobsRef.current = jobs;
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const voicesQuery = trpc.modoFala.getVoices.useQuery();
  const configQuery = trpc.modoFala.checkConfig.useQuery();
  const cfg = configQuery.data;
  const utils = trpc.useUtils();

  const generateMutation = trpc.modoFala.generate.useMutation();
  const previewMutation  = trpc.modoFala.previewVoice.useMutation();

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

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Arquivo inválido. Envie uma imagem."); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("Imagem máx. 20 MB."); return; }
    const base64 = await fileToBase64(file);
    setImage({ base64, preview: URL.createObjectURL(file), name: file.name, mimeType: file.type });
  }

  // ── Polling ─────────────────────────────────────────────────────────────────
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
          const res = await utils.modoFala.status.fetch({ talkId: job.talkId });
          const isDone   = res.status === "COMPLETED";
          const isFailed = res.status === "FAILED";
          const newStatus: JobStatus = isDone ? "done" : isFailed ? "error" : "processing";
          setJobs(prev => prev.map(j => j.localId === job.localId
            ? { ...j, status: newStatus, videoUrl: isDone ? res.videoUrl : j.videoUrl, error: isFailed ? res.error : j.error }
            : j
          ));
          if (isDone && !notifiedRef.current.has(job.localId)) {
            notifiedRef.current.add(job.localId);
            toast.success(`Vídeo "${job.label.slice(0, 30)}" pronto!`);
          }
        } catch {}
      }
    }, 8000);

    return () => { clearInterval(timer); clearInterval(poller); };
  }, []);

  async function handleSubmit() {
    if (!image) { toast.error("Adicione a foto da modelo."); return; }
    if (!text.trim()) { toast.error("Digite o texto que a modelo vai falar."); return; }
    if (!cfg?.didConfigured) { toast.error("DID_API_KEY não configurado."); return; }

    setSubmitting(true);
    const localId = randomId();
    setJobs(prev => [{
      localId, talkId: "", imagePreview: image.preview,
      label: text.slice(0, 50), status: "uploading", elapsedSec: 0,
    }, ...prev]);

    try {
      const { talkId } = await generateMutation.mutateAsync({
        imageBase64: image.base64,
        imageMimeType: image.mimeType,
        text: text.trim(),
        voiceId: selectedVoice,
      });
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, talkId, status: "queued" } : j));
      setImage(null);
      setText("");
      toast.success("Adicionado à fila.");
    } catch (e: any) {
      setJobs(prev => prev.map(j => j.localId === localId ? { ...j, status: "error", error: e.message } : j));
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const handleDownload = useCallback(async (url: string, label: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `feminnita-fala-${label.slice(0, 20).replace(/\s+/g, "-")}-${Date.now()}.mp4`;
      a.click();
    } catch { window.open(url, "_blank"); }
  }, []);

  const voices = voicesQuery.data ?? [];
  const activeJobs = jobs.filter(j => j.status !== "done" && j.status !== "error");
  const doneJobs   = jobs.filter(j => j.status === "done"  || j.status === "error");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${BTN}, ${BTN_HOVER})` }}>
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Modo Fala</h1>
          <p className="text-sm text-slate-500">Foto + texto → vídeo com a modelo falando</p>
        </div>
      </div>

      {/* Config warning */}
      {cfg && (!cfg.didConfigured || !cfg.elConfigured) && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            {!cfg.didConfigured && <span>Adicione <code className="bg-amber-100 px-1 rounded">DID_API_KEY</code> no servidor. </span>}
            {!cfg.elConfigured  && <span>Adicione <code className="bg-amber-100 px-1 rounded">ELEVENLABS_API_KEY</code> no servidor.</span>}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Foto */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              1. Foto da modelo
            </label>
            {image ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <img src={image.preview} alt="" className="w-full h-44 object-cover" />
                <button onClick={() => setImage(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                <p className="text-xs text-slate-500 px-3 py-1.5 truncate">{image.name}</p>
              </div>
            ) : (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  onClick={() => inputRef.current?.click()}
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-colors ${
                    dragging ? "border-[#8B2635] bg-rose-50" : "border-slate-200 hover:border-[#8B2635] hover:bg-rose-50/50"
                  }`}>
                  <Upload className="w-8 h-8 text-slate-300" />
                  <p className="text-sm text-slate-500 text-center">Arraste a foto ou clique para escolher</p>
                  <p className="text-xs text-slate-400">máx. 20 MB</p>
                </div>
                <input ref={inputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </>
            )}
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
                  <div key={v.id}
                    onClick={() => setSelectedVoice(v.id)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      selectedVoice === v.id
                        ? "border-[#8B2635] bg-rose-50"
                        : "border-slate-200 hover:border-[#8B2635]"
                    }`}>
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm font-medium ${selectedVoice === v.id ? "text-[#8B2635]" : "text-slate-700"}`}>{v.name}</p>
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
              3. O que a modelo vai falar
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: Olá! Estou apaixonada por esse pijama. É super confortável e perfeito para o inverno..."
              rows={5}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none outline-none focus:border-[#8B2635] transition-colors"
            />
            <p className="text-xs text-slate-400 mt-1">{text.length}/2000 chars · ~{Math.ceil(text.length / 15)}s de vídeo</p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !image || !text.trim()}
            className="w-full text-white"
            style={{ backgroundColor: BTN }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = BTN_HOVER)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = BTN)}>
            {submitting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
              : <><Mic className="w-4 h-4 mr-2" /> Gerar vídeo com fala</>}
          </Button>
        </div>

        {/* Preview / info */}
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-3 text-slate-400 min-h-[300px]">
          <Mic className="w-10 h-10 text-slate-200" />
          <p className="text-sm font-medium text-center">Modo Fala</p>
          <p className="text-xs text-center">A modelo na foto vai falar o texto com a voz escolhida, sincronizando lábios automaticamente.</p>
          <p className="text-xs text-center text-slate-300">Powered by D-ID + ElevenLabs</p>
        </div>
      </div>

      {/* Fila de jobs */}
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

          {[...activeJobs, ...doneJobs].map(job => {
            const elapsed = `${String(Math.floor(job.elapsedSec / 60)).padStart(2, "0")}:${String(job.elapsedSec % 60).padStart(2, "0")}`;
            return (
              <div key={job.localId} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                job.status === "done" ? "border-green-200 bg-green-50" :
                job.status === "error" ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
              }`}>
                <img src={job.imagePreview} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {STATUS_ICON[job.status]}
                    <span className={`text-xs font-medium ${
                      job.status === "done" ? "text-green-600" : job.status === "error" ? "text-red-500" : "text-slate-600"
                    }`}>{STATUS_LABEL[job.status]}</span>
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
                    <Button size="sm" className="text-white h-7 text-xs px-2" style={{ backgroundColor: BTN }}
                      onClick={() => handleDownload(job.videoUrl!, job.label)}>
                      <Download className="w-3 h-3 mr-1" />Baixar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
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
