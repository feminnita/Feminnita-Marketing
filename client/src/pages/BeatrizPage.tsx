import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Send, MessageCircle, ImagePlus, CheckCircle2, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CAMPAIGN_OPTIONS = [
  { value: "prospeccao",  label: "Prospecção — Revendedoras novas (público frio)" },
  { value: "remarketing", label: "Remarketing — Quem já viu a Feminnita" },
  { value: "lancamento",  label: "Lançamento de Coleção" },
  { value: "oferta",      label: "Oferta / Promoção com desconto" },
] as const;

export default function BeatrizPage() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"chat" | "criativo">("chat");

  // ── Chat ──
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou a Beatriz — copywriter e estrategista criativa da Feminnita. Posso criar copy para Meta Ads, analisar anúncios, escrever scripts de UGC e variantes A/B. O que você precisa?",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Criar Criativo ──
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [campaignType, setCampaignType] = useState<"prospeccao" | "remarketing" | "lancamento" | "oferta">("prospeccao");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const chatMut = trpc.creativeAds.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const createMut = trpc.creativeAds.requestFromImage.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (e) => toast.error("Erro ao criar: " + e.message),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || chatMut.isPending) return;
    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    chatMut.mutate({ messages: updated });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Envie uma imagem (JPG, PNG, WebP)."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Imagem muito grande. Máximo 10MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
      setSubmitted(false);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange({ target: { files: [file] } } as any);
  }

  function handleCreate() {
    if (!imageBase64) { toast.error("Selecione uma foto do produto."); return; }
    createMut.mutate({ imageBase64, campaignType, notes: notes.trim() || undefined });
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="hidden md:flex w-44 flex-shrink-0 flex-col items-center py-6 px-3 border-r bg-gray-50">
        <img
          src="/agents/beatriz.jpg"
          alt="Beatriz"
          className="w-36 h-52 rounded-2xl object-cover object-top shadow-md"
        />
        <h2 className="mt-3 font-semibold text-gray-900 text-sm text-center">Beatriz</h2>
        <p className="text-xs text-gray-500 text-center mt-0.5 leading-tight">Copy & Criativos<br/>Meta Ads</p>
        <div className="mt-3 flex flex-col items-center gap-1 text-center">
          <span className="text-xs text-[#8B2635] font-medium">Copyhackers · Hormozi</span>
          <span className="text-xs text-gray-400">Savannah Sanchez</span>
        </div>
        <div className="mt-auto text-xs text-center text-gray-400 leading-tight">
          Briefada pela<br/>Fernanda
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Tabs */}
        <div className="flex border-b bg-white px-4 pt-4 gap-1 shrink-0">
          <button
            onClick={() => setTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              tab === "chat"
                ? "border-[#8B2635] text-[#8B2635]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageCircle className="w-4 h-4" /> Conversar com Beatriz
          </button>
          <button
            onClick={() => setTab("criativo")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              tab === "criativo"
                ? "border-[#8B2635] text-[#8B2635]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <ImagePlus className="w-4 h-4" /> Criar Criativo
          </button>
        </div>

        {/* ── TAB CHAT ── */}
        {tab === "chat" && (
          <div className="flex flex-col flex-1 min-h-0 p-4">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <img
                      src="/agents/beatriz.jpg"
                      alt="Beatriz"
                      className="w-7 h-7 rounded-full object-cover object-top mr-2 mt-1 shrink-0"
                    />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#8B2635] text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-800 rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatMut.isPending && (
                <div className="flex justify-start">
                  <img src="/agents/beatriz.jpg" alt="Beatriz" className="w-7 h-7 rounded-full object-cover object-top mr-2 shrink-0" />
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-[#8B2635]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="mt-4 flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Crie um copy para cold audience focado na revendedora autônoma..."
                className="resize-none min-h-[60px] max-h-[160px]"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || chatMut.isPending}
                className="bg-[#8B2635] hover:bg-[#7a1f2d] h-[60px] px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB CRIAR CRIATIVO ── */}
        {tab === "criativo" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-lg space-y-5">

              {/* Explicação do fluxo */}
              <div className="flex items-start gap-3 text-sm text-gray-600 bg-rose-50 border border-rose-100 rounded-xl p-4">
                <span className="text-[#8B2635] mt-0.5">ℹ</span>
                <span>
                  Envie a foto do produto e diga qual campanha é.
                  A <strong>Fernanda</strong> analisa a imagem e escreve o brief estratégico.
                  A <strong>Beatriz</strong> gera 3 versões de copy com hooks diferentes.
                  Tudo vai direto para <strong>Aprovação</strong>.
                </span>
              </div>

              {/* Upload da foto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto do produto *</label>
                {!imagePreview ? (
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#8B2635] hover:bg-rose-50/30 transition-colors"
                  >
                    <ImagePlus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Clique ou arraste a foto aqui</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — máx 10MB</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Produto"
                      className="w-full max-h-72 object-contain rounded-xl border border-gray-200 bg-gray-50"
                    />
                    <button
                      onClick={() => { setImagePreview(null); setImageBase64(null); setSubmitted(false); }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border border-gray-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              {/* Campanha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campanha *</label>
                <div className="space-y-2">
                  {CAMPAIGN_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        campaignType === opt.value
                          ? "border-[#8B2635] bg-rose-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="campaign"
                        value={opt.value}
                        checked={campaignType === opt.value}
                        onChange={() => { setCampaignType(opt.value); setSubmitted(false); }}
                        className="accent-[#8B2635]"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notas opcionais */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); setSubmitted(false); }}
                  placeholder="Ex: focar na cor rosa, destacar o kit presente, ângulo mãe e filha..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B2635]/30"
                />
              </div>

              {/* Submit / Sucesso */}
              {!submitted ? (
                <button
                  onClick={handleCreate}
                  disabled={!imageBase64 || createMut.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#8B2635] text-white rounded-xl font-semibold hover:bg-[#7a1f2d] disabled:opacity-50 transition-colors"
                >
                  {createMut.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Fernanda está briefando a Beatriz…</>
                  ) : (
                    <><ImagePlus className="w-4 h-4" /> Fernanda + Beatriz criam os criativos</>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">3 criativos em geração!</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        Fernanda escreveu o brief estratégico e a Beatriz está gerando 3 versões
                        com hooks diferentes (Público-Alvo, Transformação, Impacto).
                        Aparecerão em <strong>Criativos → Aprovação</strong> em instantes.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLocation("/criativos")}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#8B2635] text-[#8B2635] rounded-xl font-medium hover:bg-rose-50 transition-colors"
                  >
                    Ver em Criativos <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setImagePreview(null); setImageBase64(null); setNotes(""); setSubmitted(false); }}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Enviar outra foto
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
