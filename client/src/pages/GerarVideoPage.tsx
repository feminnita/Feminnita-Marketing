import { useRef, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, X, Play, Download, Loader2, AlertCircle, Sparkles, Film, Clock, CheckCircle2, XCircle, Timer, History } from "lucide-react";
import { Button } from "@/components/ui/button";

const BTN = "#8B2635";
const BTN_HOVER = "#6B1D28";

interface FilePreview { base64: string; preview: string; name: string; }

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      resolve(dataUrl.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fileToPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

const POLL_INTERVAL = 8000; // 8 segundos

export default function GerarVideoPage() {
  const [image, setImage] = useState<FilePreview | null>(null);
  const [video, setVideo] = useState<FilePreview | null>(null);
  const [duration, setDuration] = useState(15);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "queued" | "processing" | "done" | "error">("idle");
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [draggingImage, setDraggingImage] = useState(false);
  const [draggingVideo, setDraggingVideo] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const configQuery = trpc.runpodVideo.checkConfig.useQuery();
  const historyQuery = trpc.runpodVideo.history.useQuery({ limit: 20 }, { refetchInterval: 15000 });

  const generateMutation = trpc.runpodVideo.generate.useMutation({
    onSuccess: (data) => {
      setJobId(data.jobId);
      setStatus("queued");
      setElapsedSeconds(0);
    },
    onError: (e) => {
      toast.error(e.message);
      setStatus("error");
      setErrorMsg(e.message);
    },
  });

  const statusQuery = trpc.runpodVideo.status.useQuery(
    { jobId: jobId! },
    { enabled: false, retry: false }
  );

  // Polling quando há jobId
  useEffect(() => {
    if (!jobId || status === "done" || status === "error") return;

    // Timer de tempo decorrido
    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);

    pollRef.current = setInterval(async () => {
      try {
        const result = await statusQuery.refetch();
        const data = result.data;
        if (!data) return;

        if (data.status === "COMPLETED") {
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          if (data.videoBase64) {
            setResultVideo(`data:video/mp4;base64,${data.videoBase64}`);
            setStatus("done");
            toast.success("Vídeo gerado com sucesso!");
          } else {
            setStatus("error");
            setErrorMsg("Vídeo não retornado pelo servidor.");
          }
        } else if (data.status === "FAILED") {
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
          setStatus("error");
          setErrorMsg(data.error || "Erro desconhecido na geração.");
          toast.error("Falha na geração do vídeo.");
        } else if (data.status === "IN_PROGRESS") {
          setStatus("processing");
        }
      } catch {}
    }, POLL_INTERVAL);

    return () => {
      clearInterval(pollRef.current!);
      clearInterval(timerRef.current!);
    };
  }, [jobId]);

  async function loadImage(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Apenas imagens aceitas."); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("Imagem máx. 20 MB."); return; }
    const base64 = await fileToBase64(file);
    setImage({ base64, preview: fileToPreviewUrl(file), name: file.name });
  }

  async function loadVideo(file: File) {
    if (!file.type.startsWith("video/")) { toast.error("Apenas vídeos aceitos."); return; }
    if (file.size > 200 * 1024 * 1024) { toast.error("Vídeo máx. 200 MB."); return; }
    const base64 = await fileToBase64(file);
    setVideo({ base64, preview: fileToPreviewUrl(file), name: file.name });
  }

  function handleGenerate() {
    if (!image || !video) { toast.error("Adicione a imagem e o vídeo de referência."); return; }
    setStatus("idle");
    setResultVideo(null);
    setErrorMsg(null);
    setJobId(null);
    generateMutation.mutate({
      imageBase64: image.base64,
      videoBase64: video.base64,
      durationSeconds: duration,
    });
  }

  function handleDownload() {
    if (!resultVideo) return;
    const a = document.createElement("a");
    a.href = resultVideo;
    a.download = `feminnita-video-${Date.now()}.mp4`;
    a.click();
  }

  function reset() {
    setStatus("idle");
    setJobId(null);
    setResultVideo(null);
    setErrorMsg(null);
    setElapsedSeconds(0);
  }

  const isRunning = status === "queued" || status === "processing";
  const notConfigured = configQuery.data && !configQuery.data.configured;

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
          <p className="text-sm text-slate-500">WanVideo Animate · Transfere movimento do TikTok para seu produto</p>
        </div>
      </div>

      {/* Aviso configuração */}
      {notConfigured && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">RunPod não configurado</p>
            <p className="text-xs text-amber-700 mt-1">
              Adicione no <code className="bg-amber-100 px-1 rounded">.env</code>:<br />
              <code className="bg-amber-100 px-1 rounded">RUNPOD_API_KEY=sua_chave</code><br />
              <code className="bg-amber-100 px-1 rounded">RUNPOD_ENDPOINT_ID=seu_endpoint_id</code>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna esquerda — inputs */}
        <div className="space-y-5">
          {/* Vídeo referência */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              1. Vídeo referência (TikTok)
              <span className="text-slate-400 font-normal ml-1">— o movimento que você quer copiar</span>
            </label>
            {video ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <video src={video.preview} controls className="w-full max-h-52 object-contain bg-black" />
                <button onClick={() => setVideo(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                <p className="text-xs text-slate-500 px-3 py-1.5 truncate">{video.name}</p>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDraggingVideo(true); }}
                onDragLeave={() => setDraggingVideo(false)}
                onDrop={(e) => { e.preventDefault(); setDraggingVideo(false); const f = e.dataTransfer.files[0]; if (f) loadVideo(f); }}
                onClick={() => videoInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-2 transition-colors ${
                  draggingVideo ? "border-[#8B2635] bg-rose-50" : "border-slate-200 hover:border-[#8B2635] hover:bg-rose-50/50"
                }`}
              >
                <Play className="w-8 h-8 text-slate-300" />
                <p className="text-sm text-slate-500 text-center">
                  Arraste o vídeo do TikTok aqui ou <span style={{ color: BTN }} className="font-medium">clique para escolher</span>
                </p>
                <p className="text-xs text-slate-400">MP4, MOV · máx. 200 MB</p>
              </div>
            )}
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadVideo(f); }} />
          </div>

          {/* Imagem produto */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              2. Imagem do seu produto
              <span className="text-slate-400 font-normal ml-1">— a foto que vai entrar no vídeo</span>
            </label>
            {image ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={image.preview} alt="Produto" className="w-full h-48 object-cover" />
                <button onClick={() => setImage(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                <p className="text-xs text-slate-500 px-3 py-1.5 truncate">{image.name}</p>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDraggingImage(true); }}
                onDragLeave={() => setDraggingImage(false)}
                onDrop={(e) => { e.preventDefault(); setDraggingImage(false); const f = e.dataTransfer.files[0]; if (f) loadImage(f); }}
                onClick={() => imageInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 flex flex-col items-center gap-2 transition-colors ${
                  draggingImage ? "border-[#8B2635] bg-rose-50" : "border-slate-200 hover:border-[#8B2635] hover:bg-rose-50/50"
                }`}
              >
                <Upload className="w-8 h-8 text-slate-300" />
                <p className="text-sm text-slate-500 text-center">
                  Arraste a foto do produto aqui ou <span style={{ color: BTN }} className="font-medium">clique para escolher</span>
                </p>
                <p className="text-xs text-slate-400">JPG, PNG, WEBP · máx. 20 MB</p>
              </div>
            )}
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImage(f); }} />
          </div>

          {/* Duração */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              3. Duração do vídeo
            </label>
            <div className="flex items-center gap-3">
              <input type="range" min={3} max={30} step={1} value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1" style={{ accentColor: BTN }} />
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <input
                  type="number" min={3} max={30} value={duration}
                  onChange={(e) => {
                    const v = Math.min(30, Math.max(3, Number(e.target.value) || 3));
                    setDuration(v);
                  }}
                  className="w-14 text-center text-sm font-semibold py-1.5 outline-none"
                  style={{ color: BTN }}
                />
                <span className="pr-2 text-xs text-slate-400">s</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>3s</span><span>15s</span><span>30s</span>
            </div>
          </div>

          {/* Botão gerar */}
          <Button
            onClick={handleGenerate}
            disabled={isRunning || !image || !video || notConfigured}
            className="w-full text-white"
            style={{ backgroundColor: BTN }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = BTN_HOVER)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = BTN)}
          >
            {isRunning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando vídeo...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Gerar Vídeo</>
            )}
          </Button>
        </div>

        {/* Coluna direita — resultado */}
        <div className="flex flex-col">
          {status === "idle" && (
            <div className="flex-1 min-h-[400px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Film className="w-12 h-12 text-slate-200" />
              <p className="text-sm font-medium">O vídeo gerado aparece aqui</p>
              <p className="text-xs">Adicione vídeo + imagem e clique em Gerar</p>
            </div>
          )}

          {isRunning && (
            <div className="flex-1 min-h-[400px] rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-rose-100 border-t-[#8B2635] animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800">
                  {status === "queued" ? "Na fila do servidor..." : "Gerando seu vídeo..."}
                </p>
                <p className="text-xs text-slate-500 mt-1">Isso leva entre 3 e 8 minutos</p>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 font-mono">
                    {String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:{String(elapsedSeconds % 60).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 px-6 text-center">
                O WanVideo analisa o movimento do vídeo referência e aplica na sua imagem com as mesmas expressões e pose
              </p>
            </div>
          )}

          {status === "done" && resultVideo && (
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-black">
                <video src={resultVideo} controls autoPlay loop className="w-full" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownload} className="flex-1 text-white" style={{ backgroundColor: BTN }}>
                  <Download className="w-4 h-4 mr-2" /> Baixar Vídeo
                </Button>
                <Button onClick={reset} variant="outline" className="flex-1">
                  Gerar outro
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex-1 min-h-[400px] rounded-xl border border-red-200 bg-red-50 flex flex-col items-center justify-center gap-3 p-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm font-semibold text-red-800">Erro na geração</p>
              <p className="text-xs text-red-600 text-center">{errorMsg}</p>
              <Button onClick={reset} variant="outline" className="mt-2">Tentar novamente</Button>
            </div>
          )}
        </div>
      </div>

      {/* Histórico de jobs */}
      {(historyQuery.data?.jobs?.length ?? 0) > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">Histórico de gerações</h2>
          </div>
          <div className="space-y-2">
            {historyQuery.data!.jobs.map((job) => {
              const statusIcon = {
                completed:  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />,
                failed:     <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
                cancelled:  <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />,
                processing: <Loader2 className="w-4 h-4 text-blue-400 flex-shrink-0 animate-spin" />,
                queued:     <Timer className="w-4 h-4 text-amber-400 flex-shrink-0" />,
              }[job.status];

              const statusLabel = {
                completed: "Concluído", failed: "Falhou", cancelled: "Cancelado",
                processing: "Processando", queued: "Na fila",
              }[job.status];

              const date = new Date(job.createdAt).toLocaleString("pt-BR", {
                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
              });

              return (
                <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 text-sm">
                  {statusIcon}
                  <span className="text-slate-500 text-xs w-28 flex-shrink-0">{date}</span>
                  <span className={`text-xs font-medium w-24 flex-shrink-0 ${
                    job.status === "completed" ? "text-green-600" :
                    job.status === "failed" ? "text-red-500" : "text-slate-500"
                  }`}>{statusLabel}</span>
                  <span className="text-xs text-slate-400">{job.durationSeconds}s</span>
                  {job.errorMessage && (
                    <span className="text-xs text-red-400 truncate ml-2">{job.errorMessage}</span>
                  )}
                  <span className="text-xs text-slate-300 ml-auto font-mono">{job.runpodJobId.slice(0, 8)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
