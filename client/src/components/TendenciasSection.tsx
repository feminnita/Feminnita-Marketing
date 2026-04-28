import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Zap, ArrowUp, ArrowDown, Minus, Instagram, Music2, RefreshCw } from "lucide-react";

const ACCENT_COLORS = ['#6B1D28', '#A63D4A', '#6B7A3A', '#3A5A6B'];
const BG_COLORS = ['#fdf0e8', '#fce8ea', '#eef5e8', '#e8f2f5'];

const MOMENTUM_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  rising: { label: 'Subindo', icon: <ArrowUp className="w-3 h-3" />, color: 'text-green-600' },
  peak: { label: 'Pico', icon: <Zap className="w-3 h-3" />, color: 'text-amber-600' },
  declining: { label: 'Caindo', icon: <ArrowDown className="w-3 h-3" />, color: 'text-red-500' },
};

export default function TendenciasSection() {
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok' | 'youtube'>('instagram');
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<number | null>(null);
  const [trends, setTrends] = useState<any[]>([]);

  const { data: influencers = [], isLoading: loadingInfluencers } = trpc.influencers.list.useQuery();

  // Auto-select first influencer
  if (influencers.length > 0 && selectedInfluencerId === null) {
    setSelectedInfluencerId(influencers[0].id);
  }

  const monitorTrends = trpc.autonomousInfluencers.monitorTrends.useMutation({
    onSuccess: (data) => setTrends(data.trends ?? []),
  });

  type Inf = (typeof influencers)[number];
  const selectedIdx = influencers.findIndex((i: Inf) => i.id === selectedInfluencerId);

  const platforms = [
    { value: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { value: 'tiktok', label: 'TikTok', icon: <Music2 className="w-4 h-4" /> },
    { value: 'youtube', label: 'YouTube', icon: <TrendingUp className="w-4 h-4" /> },
  ] as const;

  if (loadingInfluencers) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6B1D28' }} /></div>;
  }

  if (influencers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">📈</div>
        <p className="text-slate-600">Crie as influencers em <strong>Personas</strong> primeiro.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Tendências Virais</h2>
        <p className="text-slate-500 text-sm mt-1">
          A IA analisa o que está em alta na plataforma e sugere conteúdo relevante para cada influencer.
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Influencer</p>
          <div className="flex gap-2">
            {influencers.map((inf: Inf, idx: number) => (
              <button
                key={inf.id}
                onClick={() => setSelectedInfluencerId(inf.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-sm transition-all"
                style={selectedInfluencerId === inf.id
                  ? { borderColor: ACCENT_COLORS[idx % ACCENT_COLORS.length], backgroundColor: BG_COLORS[idx % BG_COLORS.length], color: ACCENT_COLORS[idx % ACCENT_COLORS.length] }
                  : { borderColor: '#e5e7eb', color: '#6b7280' }
                }
              >
                {inf.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Plataforma</p>
          <div className="flex gap-2">
            {platforms.map(p => (
              <button
                key={p.value}
                onClick={() => setSelectedPlatform(p.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm transition-all"
                style={selectedPlatform === p.value
                  ? { borderColor: '#6B1D28', backgroundColor: '#fdf0e8', color: '#6B1D28' }
                  : { borderColor: '#e5e7eb', color: '#6b7280' }
                }
              >
                {p.icon}{p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        style={{ backgroundColor: selectedIdx >= 0 ? ACCENT_COLORS[selectedIdx % ACCENT_COLORS.length] : '#6B1D28' }}
        className="text-white"
        disabled={monitorTrends.isPending || !selectedInfluencerId}
        onClick={() => {
          setTrends([]);
          monitorTrends.mutate({ influencerId: selectedInfluencerId!, platform: selectedPlatform });
        }}
      >
        {monitorTrends.isPending
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analisando tendências...</>
          : <><RefreshCw className="w-4 h-4 mr-2" />Analisar Tendências Agora</>
        }
      </Button>

      {monitorTrends.isError && (
        <p className="text-sm text-red-500">Erro ao buscar tendências. Verifique a chave de IA no .env.</p>
      )}

      {/* Resultados */}
      {trends.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-600">
            {trends.length} tendências encontradas para <strong>{influencers.find((i: Inf) => i.id === selectedInfluencerId)?.name}</strong> no {selectedPlatform}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map((trend: any, i) => {
              const momentum = MOMENTUM_CONFIG[trend.momentum] ?? MOMENTUM_CONFIG.rising;
              const relevance = Math.round((trend.relevanceScore ?? 0.5) * 100);

              return (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{trend.name}</p>
                        {trend.category && (
                          <Badge variant="secondary" className="text-xs mt-1">{trend.category}</Badge>
                        )}
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-medium ${momentum.color}`}>
                        {momentum.icon}{momentum.label}
                      </span>
                    </div>

                    {/* Barra de relevância */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Relevância</span>
                        <span>{relevance}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${relevance}%`,
                            backgroundColor: selectedIdx >= 0 ? ACCENT_COLORS[selectedIdx % ACCENT_COLORS.length] : '#6B1D28'
                          }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {trend.estimatedReach && (
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-slate-400">Alcance estimado</p>
                          <p className="font-semibold text-slate-700 mt-0.5">
                            {typeof trend.estimatedReach === 'number'
                              ? trend.estimatedReach.toLocaleString('pt-BR')
                              : trend.estimatedReach}
                          </p>
                        </div>
                      )}
                      {trend.recommendedPostType && (
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-slate-400">Tipo recomendado</p>
                          <p className="font-semibold text-slate-700 mt-0.5 capitalize">{trend.recommendedPostType}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!monitorTrends.isPending && trends.length === 0 && !monitorTrends.isError && (
        <div className="text-center py-12 text-slate-300 space-y-2">
          <TrendingUp className="w-12 h-12 mx-auto" />
          <p className="text-sm text-slate-400">
            Selecione uma influencer e plataforma, depois clique em <strong>Analisar</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
