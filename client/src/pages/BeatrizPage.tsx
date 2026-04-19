import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ExternalLink, Loader2, Sparkles, Download, RefreshCw, Wand2 } from "lucide-react";

export default function BeatrizPage() {
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

  const exportStatusQuery = trpc.canva.getExportStatus.useQuery(
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <img src="/agents/beatriz.jpg" alt="Beatriz" className="w-14 h-20 rounded-xl object-cover object-top border-2 shadow-md" style={{ borderColor: "#8B2635" }} />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Beatriz — Criativos</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gera copy + design no Canva para Meta Ads</p>
        </div>
      </div>

      {/* Formulário */}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Contexto da campanha <span className="text-gray-400 font-normal">(opcional)</span></label>
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

      {/* Resultado */}
      {result && (
        <div className="space-y-4">
          {/* Copy */}
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
                  <p className="text-xs text-blue-600 font-medium mb-1">Descrição do criativo visual</p>
                  <p className="text-sm text-blue-800 italic">{result.copy.imageDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Design Canva */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Design no Canva</h2>
            {result.editUrl ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  O design foi criado no Canva. Clique para abrir, adicione a foto do produto e o copy acima.
                </p>
                <a
                  href={result.editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[#8B2635] text-[#8B2635] rounded-xl font-medium hover:bg-rose-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir no Canva para editar
                </a>
                <p className="text-xs text-gray-400 text-center">Depois de editar no Canva, clique em Exportar abaixo</p>
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
                Design criado, mas o link de edição não foi retornado pela API do Canva. Acesse canva.com para visualizar.
              </p>
            )}

            {/* Download pronto */}
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" /> Baixar PNG
              </a>
            )}

            {/* Aguardando export */}
            {exportId && !downloadUrl && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" /> Processando exportação…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
