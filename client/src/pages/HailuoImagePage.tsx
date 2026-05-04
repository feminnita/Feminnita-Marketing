import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Download, ImageIcon, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ASPECT_RATIOS = [
  { value: "1:1",   label: "1:1",   hint: "Quadrado" },
  { value: "9:16",  label: "9:16",  hint: "Stories / Reels" },
  { value: "16:9",  label: "16:9",  hint: "Widescreen" },
  { value: "4:3",   label: "4:3",   hint: "Clássico" },
  { value: "3:4",   label: "3:4",   hint: "Retrato" },
];

const SUGGESTIONS = [
  "Modelo feminina usando pijama suede rosa, ambiente minimalista, iluminação suave, fundo neutro, fotografia de produto profissional",
  "Flat lay de kit pijama suede marsala com detalhes de renda, fundo branco, flores secas ao redor, estilo editorial de moda",
  "Mulher elegante em pijama de viscose floral, quarto decorado com luz golden hour, estilo lifestyle fashion",
  "Embalagem de presente Feminnita com pijama dobrado, fita dourada, fundo texturizado bege, fotografia comercial",
];

export default function HailuoImagePage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [n, setN] = useState(1);
  const [images, setImages] = useState<string[]>([]);

  const keyQuery = trpc.hailuoImage.checkKey.useQuery();

  const generateMutation = trpc.hailuoImage.generate.useMutation({
    onSuccess: (data) => {
      setImages(data.images);
      if (data.images.length === 0) toast.error("Nenhuma imagem retornada. Tente um prompt diferente.");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  function handleGenerate() {
    if (!prompt.trim()) { toast.error("Digite um prompt para gerar a imagem."); return; }
    setImages([]);
    generateMutation.mutate({ prompt: prompt.trim(), aspectRatio: aspectRatio as any, n });
  }

  function handleDownload(url: string, idx: number) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `feminnita-image-${Date.now()}-${idx + 1}.jpg`;
    a.target = "_blank";
    a.click();
  }

  const notConfigured = keyQuery.data && !keyQuery.data.configured;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Geração de Imagem IA</h1>
          <p className="text-sm text-slate-500">Hailuo AI (MiniMax) · Alta resolução</p>
        </div>
      </div>

      {/* Aviso de chave não configurada */}
      {notConfigured && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">MINIMAX_API_KEY não configurada</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Adicione <code className="bg-amber-100 px-1 rounded">MINIMAX_API_KEY=sua_chave</code> no arquivo <code className="bg-amber-100 px-1 rounded">.env</code> do servidor e reinicie.
              Obtenha a chave em <a href="https://platform.minimax.io" target="_blank" rel="noreferrer" className="underline">platform.minimax.io</a>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Painel de configuração */}
        <div className="lg:col-span-2 space-y-5">
          {/* Prompt */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva a imagem que deseja gerar... Ex: modelo feminina usando pijama suede rosa, estúdio minimalista, luz suave"
              className="min-h-[120px] resize-none text-sm"
              maxLength={1500}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{prompt.length}/1500</p>
          </div>

          {/* Sugestões */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Sugestões rápidas:</p>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-violet-50 hover:border-violet-200 text-slate-600 transition-colors line-clamp-2"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Proporção */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Proporção</label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setAspectRatio(r.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    aspectRatio === r.value
                      ? "bg-violet-600 border-violet-600 text-white"
                      : "border-slate-200 text-slate-600 hover:border-violet-300"
                  }`}
                >
                  {r.label}
                  <span className={`ml-1 ${aspectRatio === r.value ? "text-violet-200" : "text-slate-400"}`}>
                    {r.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Quantidade: <span className="text-violet-600">{n}</span>
            </label>
            <input
              type="range"
              min={1}
              max={4}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>1</span><span>2</span><span>3</span><span>4</span>
            </div>
          </div>

          {/* Botão */}
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !prompt.trim()}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {generateMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando imagem...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Gerar Imagem</>
            )}
          </Button>

          {generateMutation.isPending && (
            <p className="text-xs text-slate-500 text-center">
              A geração pode levar 15–40 segundos
            </p>
          )}
        </div>

        {/* Área de resultado */}
        <div className="lg:col-span-3">
          {images.length > 0 ? (
            <div className={`grid gap-3 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {images.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={url}
                    alt={`Imagem gerada ${idx + 1}`}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(url, idx)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-xs font-medium text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar
                    </button>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-xs font-medium text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Abrir
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Suas imagens aparecerão aqui</p>
                <p className="text-xs mt-1">Digite um prompt e clique em Gerar Imagem</p>
              </div>
              {generateMutation.isPending && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                  <span className="text-sm text-violet-600 font-medium">Gerando com Hailuo AI...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
