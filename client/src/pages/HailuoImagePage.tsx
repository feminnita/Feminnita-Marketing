import { useRef, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Download, ImageIcon, Loader2, Sparkles, AlertCircle, Upload, X, FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_GENERATED = "hailuo_generated_images";
const STORAGE_REFERENCES = "hailuo_reference_images";

interface SavedImage { url: string; prompt: string; date: string; }
interface SavedReference { preview: string; date: string; name: string; }

function loadFromStorage<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function saveToStorage<T>(key: string, items: T[]) {
  try { localStorage.setItem(key, JSON.stringify(items.slice(0, 50))); } catch {}
}

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

interface ReferenceImage { base64: string; mimeType: string; preview: string; name: string; }

export default function HailuoImagePage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [n, setN] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [quality, setQuality] = useState<"1024" | "2048" | "4096">("1024");
  const [referenceImage, setReferenceImage] = useState<ReferenceImage | null>(null);
  const [dragging, setDragging] = useState(false);
  const [libraryTab, setLibraryTab] = useState<"generated" | "references">("generated");
  const [savedImages, setSavedImages] = useState<SavedImage[]>(() => loadFromStorage(STORAGE_GENERATED));
  const [savedRefs, setSavedRefs] = useState<SavedReference[]>(() => loadFromStorage(STORAGE_REFERENCES));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const keyQuery = trpc.hailuoImage.checkKey.useQuery();

  const generateMutation = trpc.hailuoImage.generate.useMutation({
    onSuccess: (data) => {
      setImages(data.images);
      if (data.images.length === 0) { toast.error("Nenhuma imagem retornada. Tente um prompt diferente."); return; }
      // salva automaticamente na biblioteca
      const date = new Date().toLocaleString("pt-BR");
      const newEntries: SavedImage[] = data.images.map(url => ({ url, prompt: prompt.trim(), date }));
      setSavedImages(prev => {
        const updated = [...newEntries, ...prev];
        saveToStorage(STORAGE_GENERATED, updated);
        return updated;
      });
    },
    onError: (e) => { toast.error(e.message); },
  });

  function loadImageFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Apenas imagens são aceitas."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 10 MB."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      const ref: ReferenceImage = { base64, mimeType: file.type, preview: dataUrl, name: file.name };
      setReferenceImage(ref);
      // salva na biblioteca de referências
      const saved: SavedReference = { preview: dataUrl, date: new Date().toLocaleString("pt-BR"), name: file.name };
      setSavedRefs(prev => {
        const updated = [saved, ...prev];
        saveToStorage(STORAGE_REFERENCES, updated);
        return updated;
      });
    };
    reader.readAsDataURL(file);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImageFile(file);
  }

  function handleGenerate() {
    if (!prompt.trim()) { toast.error("Digite um prompt para gerar a imagem."); return; }
    setImages([]);
    generateMutation.mutate({
      prompt: prompt.trim(),
      aspectRatio: aspectRatio as any,
      n,
      quality,
      ...(referenceImage ? { referenceImage: { base64: referenceImage.base64, mimeType: referenceImage.mimeType } } : {}),
    });
  }

  function handleDownload(url: string, idx: number) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `feminnita-image-${Date.now()}-${idx + 1}.jpg`;
    a.target = "_blank";
    a.click();
  }

  function deleteGenerated(idx: number) {
    setSavedImages(prev => { const u = prev.filter((_, i) => i !== idx); saveToStorage(STORAGE_GENERATED, u); return u; });
  }

  function deleteReference(idx: number) {
    setSavedRefs(prev => { const u = prev.filter((_, i) => i !== idx); saveToStorage(STORAGE_REFERENCES, u); return u; });
  }

  function useAsReference(ref: SavedReference) {
    const base64 = ref.preview.split(",")[1];
    const mimeMatch = ref.preview.match(/^data:([^;]+);/);
    setReferenceImage({ base64, mimeType: mimeMatch?.[1] || "image/jpeg", preview: ref.preview, name: ref.name });
    toast.success("Referência selecionada da biblioteca");
  }

  const notConfigured = keyQuery.data && !keyQuery.data.configured;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B2635] to-[#6B1D28] flex items-center justify-center flex-shrink-0">
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

          {/* Imagem de referência */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Imagem de referência <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            {referenceImage ? (
              <div className="relative rounded-xl overflow-hidden border border-rose-200 bg-slate-50">
                <img src={referenceImage.preview} alt="Referência" className="w-full h-40 object-cover" />
                <button
                  onClick={() => setReferenceImage(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-3 py-1.5">
                  <p className="text-xs text-white font-medium">Referência carregada — a IA usará como base</p>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-colors ${
                  dragging ? "border-[#8B2635] bg-rose-50" : "border-slate-200 hover:border-[#8B2635] hover:bg-rose-50/50"
                }`}
              >
                <Upload className="w-6 h-6 text-slate-400" />
                <p className="text-xs text-slate-500 text-center">
                  Arraste uma foto aqui ou <span className="text-[#8B2635] font-medium">clique para escolher</span>
                </p>
                <p className="text-xs text-slate-400">JPG, PNG, WEBP · máx. 10 MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadImageFile(f); }}
            />
          </div>

          {/* Sugestões */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Sugestões rápidas:</p>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 transition-colors line-clamp-2"
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
                      ? "bg-[#8B2635] border-[#8B2635] text-white"
                      : "border-slate-200 text-slate-600 hover:border-[#8B2635]"
                  }`}
                >
                  {r.label}
                  <span className={`ml-1 ${aspectRatio === r.value ? "text-rose-200" : "text-slate-400"}`}>
                    {r.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Quantidade: <span className="text-[#8B2635]">{n}</span>
            </label>
            <input
              type="range"
              min={1}
              max={4}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-[#8B2635]"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>1</span><span>2</span><span>3</span><span>4</span>
            </div>
          </div>

          {/* Qualidade */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Qualidade</label>
            <div className="flex gap-2">
              {([["1024","1K","Padrão"],["2048","2K","Alta"],["4096","4K","Máxima"]] as const).map(([val, label, hint]) => (
                <button
                  key={val}
                  onClick={() => setQuality(val)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    quality === val ? "bg-[#8B2635] border-[#8B2635] text-white" : "border-slate-200 text-slate-600 hover:border-[#8B2635]"
                  }`}
                >
                  <span className="block font-bold">{label}</span>
                  <span className={`block ${quality === val ? "text-rose-200" : "text-slate-400"}`}>{hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botão */}
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !prompt.trim()}
            className="w-full bg-[#8B2635] hover:bg-[#6B1D28] text-white"
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
                  <Loader2 className="w-5 h-5 animate-spin text-[#8B2635]" />
                  <span className="text-sm text-[#8B2635] font-medium">Gerando com Hailuo AI...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Biblioteca */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
          <FolderOpen className="w-4 h-4 text-[#8B2635]" />
          <span className="text-sm font-semibold text-slate-800">Biblioteca</span>
          <div className="flex ml-auto gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setLibraryTab("generated")}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${libraryTab === "generated" ? "bg-[#8B2635] text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              Geradas {savedImages.length > 0 && <span className="ml-1 opacity-70">{savedImages.length}</span>}
            </button>
            <button
              onClick={() => setLibraryTab("references")}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${libraryTab === "references" ? "bg-[#8B2635] text-white" : "text-slate-500 hover:text-slate-700"}`}
            >
              Referências {savedRefs.length > 0 && <span className="ml-1 opacity-70">{savedRefs.length}</span>}
            </button>
          </div>
        </div>

        <div className="p-4">
          {libraryTab === "generated" && (
            savedImages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhuma imagem gerada ainda — elas aparecem aqui automaticamente</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {savedImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={img.url} alt={img.prompt} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                      <button onClick={() => handleDownload(img.url, idx)} className="flex items-center gap-1 px-2 py-1 bg-white rounded text-xs font-medium text-slate-900 hover:bg-slate-100 w-full justify-center">
                        <Download className="w-3 h-3" /> Baixar
                      </button>
                      <button onClick={() => deleteGenerated(idx)} className="flex items-center gap-1 px-2 py-1 bg-red-600 rounded text-xs font-medium text-white hover:bg-red-700 w-full justify-center">
                        <Trash2 className="w-3 h-3" /> Remover
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
                      <p className="text-xs text-white truncate">{img.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {libraryTab === "references" && (
            savedRefs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhuma imagem de referência salva ainda — aparecem aqui ao fazer upload</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {savedRefs.map((ref, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={ref.preview} alt={ref.name} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                      <button onClick={() => useAsReference(ref)} className="flex items-center gap-1 px-2 py-1 bg-white rounded text-xs font-medium text-slate-900 hover:bg-slate-100 w-full justify-center">
                        <Upload className="w-3 h-3" /> Usar
                      </button>
                      <button onClick={() => deleteReference(idx)} className="flex items-center gap-1 px-2 py-1 bg-red-600 rounded text-xs font-medium text-white hover:bg-red-700 w-full justify-center">
                        <Trash2 className="w-3 h-3" /> Remover
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
                      <p className="text-xs text-white truncate">{ref.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
