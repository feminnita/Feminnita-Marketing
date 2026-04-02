import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, TrendingUp, CheckCircle, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function IAOtimizacaoLegendaSection() {
  const [legendaOriginal, setLegendaOriginal] = useState("");
  const [legendasOtimizadas, setLegendasOtimizadas] = useState<{ title: string; caption: string; rationale: string }[]>([]);
  const [sugestoesAtivas, setSugestoesAtivas] = useState(false);

  const [historico, setHistorico] = useState<{ id: number; original: string; otimizada: string; data: string }[]>([]);

  const optimizeMutation = trpc.aiContentGenerator.optimizeCaption.useMutation({
    onSuccess: (data) => {
      setLegendasOtimizadas(data.versions);
      setSugestoesAtivas(true);
    },
    onError: (err) => {
      toast.error(`Erro ao otimizar: ${err.message}`);
    },
  });

  const otimizarLegenda = () => {
    if (!legendaOriginal.trim()) return;
    optimizeMutation.mutate({ originalCaption: legendaOriginal });
  };

  const copiarLegenda = (legenda: string) => {
    navigator.clipboard.writeText(legenda);
    toast.success("Legenda copiada para a área de transferência!");
  };

  const usarLegenda = (legenda: string) => {
    setHistorico([
      {
        id: historico.length + 1,
        original: legendaOriginal,
        otimizada: legenda,
        data: new Date().toISOString().split('T')[0],
      },
      ...historico,
    ]);
    setLegendaOriginal("");
    setLegendasOtimizadas([]);
    setSugestoesAtivas(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">IA para Otimização de Legendas</h2>
        <p className="text-slate-600">
          Use inteligência artificial para sugerir melhorias em legendas baseado em trending topics, hashtags e performance histórica.
        </p>
      </div>

      {/* Editor de Legenda */}
      <Card className="border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Otimizar Legenda com IA
          </CardTitle>
          <CardDescription>Cole sua legenda e deixe a IA sugerir melhorias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Sua Legenda Original</label>
            <Textarea 
              placeholder="Cole sua legenda aqui..."
              value={legendaOriginal}
              onChange={(e) => setLegendaOriginal(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-slate-600 mt-2">{legendaOriginal.length} caracteres</p>
          </div>

          <Button
            onClick={otimizarLegenda}
            disabled={!legendaOriginal.trim() || optimizeMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
            size="lg"
          >
            <Sparkles className="w-5 h-5" />
            {optimizeMutation.isPending ? "Analisando..." : "Gerar Sugestões com IA"}
          </Button>
        </CardContent>
      </Card>

      {/* Sugestões Geradas */}
      {sugestoesAtivas && legendasOtimizadas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">✨ Sugestões Geradas pela IA</h3>
          
          {legendasOtimizadas.map((sugestao, idx) => (
            <Card key={idx} className="border-2 border-purple-200 hover:border-purple-300 transition">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-base">{sugestao.title}</CardTitle>
                    <CardDescription>{sugestao.rationale}</CardDescription>
                  </div>
                  <Badge className="bg-purple-600">IA</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{sugestao.caption}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copiarLegenda(sugestao.caption)}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </Button>
                  <Button
                    onClick={() => usarLegenda(sugestao.caption)}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Usar Esta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Histórico de Legendas Otimizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Otimizações</CardTitle>
          <CardDescription>Legendas que você otimizou com IA</CardDescription>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Nenhuma legenda otimizada ainda. Use o formulário acima e clique em "Usar Esta".
            </p>
          ) : (
            <div className="space-y-3">
              {historico.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-2">{item.data}</p>
                  <p className="font-semibold text-slate-900 mb-1 text-sm">Original:</p>
                  <p className="text-sm text-slate-600 mb-3">{item.original}</p>
                  <p className="font-semibold text-slate-900 mb-1 text-sm">Otimizada:</p>
                  <p className="text-sm text-slate-700 bg-purple-50 p-2 rounded mb-3 whitespace-pre-wrap">{item.otimizada}</p>
                  <Button
                    onClick={() => copiarLegenda(item.otimizada)}
                    size="sm"
                    variant="outline"
                    className="gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise de Tendências */}
      <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Análise de Tendências
          </CardTitle>
          <CardDescription>Palavras-chave e hashtags em alta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Hashtags em Alta (Instagram):</p>
              <div className="flex flex-wrap gap-2">
                {["#PijamaConforto", "#RendaExtra", "#Empreendedorismo", "#Feminnita", "#Qualidade", "#Promoção"].map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Palavras-Chave Trending (TikTok):</p>
              <div className="flex flex-wrap gap-2">
                {["Renda Extra", "Trabalho em Casa", "Empreendedorismo", "Qualidade", "Economia", "Família"].map((palavra) => (
                  <Badge key={palavra} variant="outline" className="cursor-pointer hover:bg-blue-100">
                    {palavra}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-100 border border-blue-300 rounded">
              <p className="text-xs font-semibold text-blue-900 mb-1">💡 Dica da IA:</p>
              <p className="text-xs text-blue-800">Use "Renda Extra" + emojis de dinheiro em legendas de Stories para aumentar engajamento em 25-35%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Legendas que Convertem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Comece com gancho irresistível nos 3 primeiros caracteres",
            "✅ Use 3-5 emojis estrategicamente distribuídos",
            "✅ Inclua prova social (depoimentos, números de clientes)",
            "✅ Crie urgência (tempo limitado, últimas peças)",
            "✅ Use 5-10 hashtags relevantes (não mais)",
            "✅ Termine com CTA clara (clique, comente, compartilhe)",
            "✅ Teste diferentes versões com A/B Testing",
            "✅ Acompanhe métricas de cada legenda otimizada"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {historico.length > 0 && (
        <Card className="border-l-4 border-l-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg">Impacto das Otimizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl mb-2">✨</p>
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Legendas Otimizadas</p>
              <p className="text-2xl font-bold text-slate-900">{historico.length}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
