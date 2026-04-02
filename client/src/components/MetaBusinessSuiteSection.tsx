import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, TrendingUp, BarChart3, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const PLATAFORMA_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  email: "Email",
};

export default function MetaBusinessSuiteSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });
  const { data: tokenStatus } = trpc.oauthCallbacks.getTokenStatus.useQuery({ platform: "meta" });

  const metaCampanhas = (campanhas as any[]).filter(c =>
    c.plataforma === "instagram" || c.plataforma === "facebook"
  );
  const ativas = metaCampanhas.filter(c => c.status === "ativa");

  const totalImpressoes = ativas.reduce((s, c) => s + (c.impressoes ?? 0), 0);
  const totalAlcance = ativas.reduce((s, c) => s + (c.cliques ?? 0), 0);
  const totalEngajamentos = ativas.reduce((s, c) => s + (c.conversoes ?? 0), 0);
  const totalOrcamento = ativas.reduce((s, c) => s + parseFloat(c.orcamento ?? "0"), 0);
  const rois = ativas.filter(c => parseFloat(c.roi ?? "0") > 0);
  const roiMedio = rois.length > 0 ? rois.reduce((s, c) => s + parseFloat(c.roi ?? "0"), 0) / rois.length : 0;

  const isConnected = tokenStatus?.connected === true;

  const handleConnectMeta = () => {
    window.location.href = `/api/oauth/meta/connect`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integração Meta Business Suite</h2>
        <p className="text-slate-600 text-sm">
          Performance de campanhas Instagram e Facebook. Configure o OAuth Meta em <strong>Integrações &gt; Credenciais OAuth</strong> para sincronização automática.
        </p>
      </div>

      {/* Status da Conexão */}
      <Card className={`border-l-4 ${isConnected ? "border-l-green-500 bg-green-50" : "border-l-amber-500 bg-amber-50"}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Instagram className={`w-5 h-5 ${isConnected ? "text-green-600" : "text-amber-600"}`} />
              <div>
                <p className="font-semibold text-slate-900">
                  {isConnected ? "Meta conectado via OAuth" : "Meta não conectado"}
                </p>
                <p className="text-sm text-slate-600">
                  {isConnected
                    ? "Sincronização automática ativa"
                    : "Configure em Integrações > Credenciais OAuth para sincronizar campanhas reais"}
                </p>
              </div>
            </div>
            {!isConnected && (
              <Button onClick={handleConnectMeta} className="bg-blue-600 hover:bg-blue-700 text-sm">
                Conectar Meta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de campanhas Meta/IG reais do DB */}
      {metaCampanhas.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Meta/Instagram
              </CardTitle>
              <CardDescription>
                {ativas.length} campanha{ativas.length !== 1 ? "s" : ""} ativa{ativas.length !== 1 ? "s" : ""} de {metaCampanhas.length} total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "Impressões", valor: totalImpressoes.toLocaleString("pt-BR"), icon: "👁️" },
                  { label: "Cliques", valor: totalAlcance.toLocaleString("pt-BR"), icon: "🖱️" },
                  { label: "Conversões", valor: totalEngajamentos.toLocaleString("pt-BR"), icon: "💰" },
                  { label: "Orçamento", valor: `R$ ${totalOrcamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: "💵" },
                  { label: "ROI Médio", valor: roiMedio > 0 ? `${roiMedio.toFixed(0)}%` : "—", icon: "📈" },
                  { label: "Campanhas Ativas", valor: String(ativas.length), icon: "📊" },
                ].map((m, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4 text-center hover:border-blue-300 transition">
                    <p className="text-2xl mb-1">{m.icon}</p>
                    <p className="text-xs text-slate-500 uppercase font-medium mb-1">{m.label}</p>
                    <p className="text-xl font-bold text-slate-900">{m.valor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de campanhas Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Campanhas Meta / Instagram
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metaCampanhas.map((c: any) => (
                  <div key={c.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{c.nome}</h4>
                        <p className="text-xs text-slate-500">
                          {PLATAFORMA_LABELS[c.plataforma] ?? c.plataforma}
                          {c.dataInicio ? ` · Início: ${c.dataInicio}` : ""}
                        </p>
                      </div>
                      <Badge
                        className={
                          c.status === "ativa" ? "bg-green-100 text-green-800 text-xs"
                          : c.status === "pausada" ? "bg-amber-100 text-amber-800 text-xs"
                          : "bg-slate-100 text-slate-600 text-xs"
                        }
                      >
                        {c.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Impressões</p>
                        <p className="font-bold">{(c.impressoes ?? 0).toLocaleString("pt-BR")}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Cliques</p>
                        <p className="font-bold">{(c.cliques ?? 0).toLocaleString("pt-BR")}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Conversões</p>
                        <p className="font-bold text-green-700">{(c.conversoes ?? 0).toLocaleString("pt-BR")}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">ROI</p>
                        <p className="font-bold text-purple-700">{parseFloat(c.roi ?? "0").toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 mb-1">Nenhuma campanha Meta/Instagram encontrada.</p>
            <p className="text-sm text-slate-400">Crie campanhas com plataforma "instagram" ou "facebook" na aba Campanhas.</p>
          </CardContent>
        </Card>
      )}

      {/* Dicas */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <h4 className="font-semibold text-sm mb-3">💡 Dicas para Meta Business Suite</h4>
        <ul className="text-sm space-y-2 text-slate-700">
          <li>• <strong>Configure OAuth</strong> em Integrações &gt; Credenciais OAuth para sincronizar campanhas reais da API Meta</li>
          <li>• <strong>Publique nos horários ideais</strong> — 19h–21h para máximo engajamento</li>
          <li>• <strong>Responda comentários</strong> nos primeiros 30 minutos após publicar</li>
          <li>• <strong>Compare plataformas</strong> — Instagram vs Facebook para alocar orçamento</li>
          <li>• <strong>Use Meta CAPI</strong> (aba Meta &gt; CAPI) para rastrear conversões server-side</li>
        </ul>
      </Card>
    </div>
  );
}
