import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ExternalLink, Loader2, Sparkles, Download, RefreshCw, Wand2, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function BeatrizPage() {
  const [tab, setTab] = useState<"chat" | "gerar">("chat");

  // ── Chat state ──
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou a Beatriz — copywriter e estrategista criativa da Feminnita. Posso criar copy para Meta Ads, briefings de criativo, scripts de UGC, análise de anúncios e variantes A/B. O que você precisa hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Gerar criativo state ──
  const [productName, setProductName] = useState("");
  const [campaignContext, setCampaignContext] = useState("");
  const [result, setResult] = useState<{
    copy: { headline: string; headlineVariants?: string[]; body: string; imageDescription: string };
    designId: string | null;
    editUrl: string | null;
    title: string;
  } | null>(null);
  const [exportId, setExportId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const chatMut = trpc.creativeAds.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const generateMut = trpc.canva.generateAdCreative.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setExportId(null);
      setDownloadUrl(null);
      toast.success("Criativo gerado! Abra no Canva para editar.");
    },
    onError: (err) => toast.error(err.message),
  });

  const exportMut = trpc.canva.exportCreative.useMutation({
    onSuccess: (data) => {
      setExportId(data.exportId ?? null);
      if (data.urls) setDownloadUrl(data.urls);
      toast.success("Exportação iniciada!");
    },
    onError: (err) => toast.error(err.message),
  });

  trpc.canva.getExportStatus.useQuery(
    { exportId: exportId! },
    {
      enabled: !!exportId && !downloadUrl,
      refetchInterval: 3000,
      onSuccess: (data: any) => {
        if (data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
          toast.success("PNG pronto para download!");
        }
      },
    } as any
  );

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

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar — foto grande vertical */}
      <div className="hidden md:flex w-44 flex-shrink-0 flex-col items-center py-6 px-3 border-r bg-gray-50">
        <img
          src="/agents/beatriz.jpg"
          alt="Beatriz"
          className="w-36 h-52 rounded-2xl object-cover object-top shadow-md"
          style={{ borderColor: "#8B2635" }}
        />
        <h2 className="mt-3 font-semibold text-gray-900 text-sm text-center">Beatriz</h2>
        <p className="text-xs text-gray-500 text-center mt-0.5 leading-tight">Copy & Criativos<br/>Meta Ads</p>
        <div className="mt-3 flex flex-col items-center gap-1 text-center">
          <span className="text-xs text-[#8B2635] font-medium">Copyhackers · Hormozi</span>
          <span className="text-xs text-gray-400">Savannah Sanchez</span>
        </div>
        <div className="mt-auto text-xs text-center text-gray-400 leading-tight">
          Copy que<br/>converte
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
            onClick={() => setTab("gerar")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              tab === "gerar"
                ? "border-[#8B2635] text-[#8B2635]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Wand2 className="w-4 h-4" /> Gerar Criativo no Canva
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

        {/* ── TAB GERAR ── */}
        {tab === "gerar" && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-xl space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Produto / Coleção</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Pijama Adulto Manga Longa Xadrez"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2635]/30 focus:border-[#8B2635]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contexto da campanha <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={campaignContext}
                    onChange={(e) => setCampaignContext(e.target.value)}
                    placeholder="Ex: Promoção inverno, desconto 20% para revendedoras"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2635]/30 focus:border-[#8B2635]"
                  />
                </div>
                <button
                  onClick={() => generateMut.mutate({ productName, campaignContext })}
                  disabled={!productName.trim() || generateMut.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#8B2635] text-white rounded-xl font-medium hover:bg-[#7a1f2d] disabled:opacity-50 transition-colors"
                >
                  {generateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {generateMut.isPending ? "Beatriz criando…" : "Gerar com Beatriz"}
                </button>
              </div>

              {result && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[#8B2635]" /> Copy gerado pela Beatriz
                    </h2>
                    <div className="space-y-3">
                      <div className="bg-[#fff5f6] border border-rose-100 rounded-lg p-3">
                        <p className="text-xs text-[#8B2635] font-semibold mb-1">✦ Headline Principal (A)</p>
                        <p className="text-sm font-bold text-gray-900">{result.copy.headline}</p>
                      </div>
                      {result.copy.headlineVariants?.map((v, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-400 font-medium mb-1">Variante {String.fromCharCode(66 + i)} — A/B Test</p>
                          <p className="text-sm font-semibold text-gray-700">{v}</p>
                        </div>
                      ))}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 font-medium mb-1">Texto do anúncio (body)</p>
                        <p className="text-sm text-gray-700">{result.copy.body}</p>
                      </div>
                      {result.copy.imageDescription && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-600 font-medium mb-1">Briefing visual</p>
                          <p className="text-sm text-blue-800 italic">{result.copy.imageDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="font-semibold text-gray-800 mb-3">Design no Canva</h2>
                    {result.editUrl ? (
                      <div className="space-y-3">
                        <a
                          href={result.editUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#8B2635] text-[#8B2635] rounded-xl font-medium hover:bg-rose-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" /> Abrir no Canva para editar
                        </a>
                        <button
                          onClick={() => result.designId && exportMut.mutate({ designId: result.designId })}
                          disabled={!result.designId || exportMut.isPending}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors"
                        >
                          {exportMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          Exportar como PNG
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        Design criado, mas o link de edição não foi retornado pela API do Canva.
                      </p>
                    )}
                    {downloadUrl && (
                      <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                        <Download className="w-4 h-4" /> Baixar PNG
                      </a>
                    )}
                    {exportId && !downloadUrl && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Processando exportação…
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
