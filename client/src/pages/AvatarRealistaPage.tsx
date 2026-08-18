import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UserRound, Loader2, Sparkles, AlertCircle, Copy, Check, ImageIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Formato = "talking-head" | "podcast";

interface Briefing {
  idade: number;
  genero: string;
  nacionalidade: string;
  papel: string;
  cenario: string;
  figurino: string;
  tom: string;
  formato: Formato;
  variacoes: number;
}

const DEFAULT_BRIEFING: Briefing = {
  idade: 40,
  genero: "mulher",
  nacionalidade: "Brazilian",
  papel: "especialista em autocuidado que fala com mulheres sobre bem-estar",
  cenario: "sala de estar aconchegante em casa",
  figurino: "blusa de tricô bege, casual",
  tom: "sincera, calorosa e confiável",
  formato: "talking-head",
  variacoes: 1,
};

const FORMATOS: { value: Formato; label: string; hint: string }[] = [
  { value: "talking-head", label: "Talking-head", hint: "Olha pra câmera" },
  { value: "podcast", label: "Podcast", hint: "Olha pro lado" },
];

export default function AvatarRealistaPage() {
  const [b, setB] = useState<Briefing>(DEFAULT_BRIEFING);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [imagesByPrompt, setImagesByPrompt] = useState<Record<number, string[]>>({});
  const [generatingImageIdx, setGeneratingImageIdx] = useState<number | null>(null);

  const keyQuery = trpc.hailuoImage.checkKey.useQuery();

  const promptMutation = trpc.avatar.generatePrompt.useMutation({
    onSuccess: (data) => {
      setPrompts(data.prompts);
      setImagesByPrompt({});
      if (data.prompts.length === 0) toast.error("Nenhum prompt retornado. Tente novamente.");
    },
    onError: (e) => toast.error(e.message),
  });

  const imageMutation = trpc.hailuoImage.generate.useMutation({
    onSuccess: (data, variables) => {
      const idx = (variables as any).__idx as number;
      setGeneratingImageIdx(null);
      if (data.images.length === 0) { toast.error("Nenhuma imagem retornada. Tente novamente."); return; }
      setImagesByPrompt((prev) => ({ ...prev, [idx]: data.images }));
    },
    onError: (e) => { setGeneratingImageIdx(null); toast.error(e.message); },
  });

  function set<K extends keyof Briefing>(key: K, value: Briefing[K]) {
    setB((prev) => ({ ...prev, [key]: value }));
  }

  function handleGeneratePrompt() {
    if (!b.papel.trim() || !b.cenario.trim()) { toast.error("Preencha ao menos papel e cenário."); return; }
    setPrompts([]);
    setImagesByPrompt({});
    promptMutation.mutate({ ...b });
  }

  async function handleCopy(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch { toast.error("Não foi possível copiar."); }
  }

  function handleGenerateImage(prompt: string, idx: number) {
    if (keyQuery.data && !keyQuery.data.configured) {
      toast.error("MINIMAX_API_KEY não configurada no servidor.");
      return;
    }
    setGeneratingImageIdx(idx);
    // Higgsfield/Hailuo aceita até 1500 chars; o prompt do avatar cabe folgado.
    imageMutation.mutate({
      prompt: prompt.slice(0, 1500),
      aspectRatio: b.formato === "podcast" ? "16:9" : "3:4",
      n: 1,
      quality: "2048",
      __idx: idx,
    } as any);
  }

  function handleDownload(url: string, idx: number) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `avatar-realista-${Date.now()}-${idx + 1}.jpg`;
    a.target = "_blank";
    a.click();
  }

  const notConfigured = keyQuery.data && !keyQuery.data.configured;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B2635] to-[#6B1D28] flex items-center justify-center flex-shrink-0">
          <UserRound className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Avatar Realista</h1>
          <p className="text-sm text-slate-500">Briefing de persona → prompt em inglês (framework de 3 blocos) → imagem</p>
        </div>
      </div>

      {/* Aviso de chave não configurada */}
      {notConfigured && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">MINIMAX_API_KEY não configurada</p>
            <p className="text-xs text-amber-700 mt-0.5">
              O prompt em texto funciona normalmente (pode copiar e colar no ChatGPT/Higgsfield). Para o botão
              <b> Gerar imagem</b>, adicione <code className="bg-amber-100 px-1 rounded">MINIMAX_API_KEY=sua_chave</code> no
              <code className="bg-amber-100 px-1 rounded">.env</code> do servidor e reinicie.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Painel de briefing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Idade</label>
              <Input type="number" min={1} max={120} value={b.idade}
                onChange={(e) => set("idade", Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Gênero</label>
              <Input value={b.genero} placeholder="mulher / homem"
                onChange={(e) => set("genero", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Nacionalidade</label>
            <Input value={b.nacionalidade} placeholder="Brazilian"
              onChange={(e) => set("nacionalidade", e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Papel / arquétipo</label>
            <Textarea value={b.papel} className="min-h-[60px] resize-none text-sm"
              placeholder="Ex: filho que cuida dos pais idosos"
              onChange={(e) => set("papel", e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Cenário</label>
            <Input value={b.cenario} placeholder="cozinha de casa"
              onChange={(e) => set("cenario", e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Figurino</label>
            <Input value={b.figurino} placeholder="camisa polo cinza simples"
              onChange={(e) => set("figurino", e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Tom / emoção</label>
            <Input value={b.tom} placeholder="sério e sincero"
              onChange={(e) => set("tom", e.target.value)} />
          </div>

          {/* Formato */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Formato</label>
            <div className="flex gap-2">
              {FORMATOS.map((f) => (
                <button key={f.value} onClick={() => set("formato", f.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    b.formato === f.value ? "bg-[#8B2635] border-[#8B2635] text-white" : "border-slate-200 text-slate-600 hover:border-[#8B2635]"
                  }`}>
                  <span className="block font-bold">{f.label}</span>
                  <span className={`block ${b.formato === f.value ? "text-rose-200" : "text-slate-400"}`}>{f.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Variações */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Quantidade de prompts: <span className="text-[#8B2635]">{b.variacoes}</span>
            </label>
            <input type="range" min={1} max={6} value={b.variacoes}
              onChange={(e) => set("variacoes", Number(e.target.value))} className="w-full accent-[#8B2635]" />
            <p className="text-xs text-slate-400 mt-0.5">Mais de 1 gera variações (pele, idade, cabelo, cenário) do mesmo arquétipo.</p>
          </div>

          <Button onClick={handleGeneratePrompt} disabled={promptMutation.isPending}
            className="w-full bg-[#8B2635] hover:bg-[#6B1D28] text-white">
            {promptMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando prompt...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Gerar prompt</>
            )}
          </Button>
        </div>

        {/* Área de resultado */}
        <div className="lg:col-span-3">
          {prompts.length > 0 ? (
            <div className="space-y-4">
              {prompts.map((prompt, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                    <span className="text-sm font-semibold text-slate-800">
                      Prompt {prompts.length > 1 ? `#${idx + 1}` : ""} <span className="font-normal text-slate-400">(inglês)</span>
                    </span>
                    <button onClick={() => handleCopy(prompt, idx)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white">
                      {copiedIdx === idx ? <><Check className="w-3.5 h-3.5 text-green-600" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                    </button>
                  </div>
                  <div className="p-4">
                    <pre className="whitespace-pre-wrap break-words text-xs text-slate-700 font-mono leading-relaxed">{prompt}</pre>

                    <div className="mt-3 flex items-center gap-2">
                      <Button onClick={() => handleGenerateImage(prompt, idx)}
                        disabled={generatingImageIdx !== null}
                        className="bg-[#8B2635] hover:bg-[#6B1D28] text-white h-9">
                        {generatingImageIdx === idx ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando imagem...</>
                        ) : (
                          <><ImageIcon className="w-4 h-4 mr-2" /> Gerar imagem</>
                        )}
                      </Button>
                    </div>

                    {imagesByPrompt[idx]?.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {imagesByPrompt[idx].map((url, i) => (
                          <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                            <img src={url} alt={`Avatar ${idx + 1}-${i + 1}`} className="w-full h-auto object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button onClick={() => handleDownload(url, i)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-xs font-medium text-slate-900 hover:bg-slate-100">
                                <Download className="w-3.5 h-3.5" /> Baixar
                              </button>
                              <a href={url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-xs font-medium text-slate-900 hover:bg-slate-100">
                                <ImageIcon className="w-3.5 h-3.5" /> Abrir
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <UserRound className="w-8 h-8 text-slate-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Seu(s) prompt(s) aparecerão aqui</p>
                <p className="text-xs mt-1">Preencha o briefing e clique em Gerar prompt</p>
              </div>
              {promptMutation.isPending && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#8B2635]" />
                  <span className="text-sm text-[#8B2635] font-medium">Montando o avatar com Claude...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
