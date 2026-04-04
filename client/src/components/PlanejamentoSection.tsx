import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";

const ACCENT_COLORS = ['#8B2635', '#A63D4A', '#6B7A3A', '#3A5A6B'];
const BG_COLORS = ['#fdf0e8', '#fce8ea', '#eef5e8', '#e8f2f5'];
const WEEK_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

type Post = {
  id: number;
  influencerId: number | null;
  influencerName: string;
  platform: string | null;
  caption: string | null;
  status: string | null;
  scheduledAt: Date | null;
  createdAt: Date | null;
};

export default function PlanejamentoSection() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [generatingFor, setGeneratingFor] = useState<number | null>(null);
  const [aiResult, setAiResult] = useState<{ influencerName: string; caption: string } | null>(null);

  const { data: influencers = [], isLoading: loadingInf } = trpc.influencers.list.useQuery();
  const { data: allPosts = [], isLoading: loadingPosts, refetch } = trpc.influencers.getAllPosts.useQuery({ limit: 500 });
  type Inf = (typeof influencers)[number];
  type PostItem = (typeof allPosts)[number];

  // Map influencer id → color index
  const colorMap: Record<number, number> = {};
  influencers.forEach((inf: Inf, idx: number) => { colorMap[inf.id] = idx; });

  const generate = trpc.autonomousInfluencers.generateContent.useMutation({
    onSuccess: (data, vars) => {
      const inf = influencers.find((i: Inf) => i.id === vars.influencerId);
      setAiResult({ influencerName: inf?.name ?? '', caption: data.content?.caption ?? '' });
      setGeneratingFor(null);
      refetch();
    },
    onError: () => setGeneratingFor(null),
  });

  // Week grid
  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);

  const weekDates = WEEK_DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekLabel = `${formatDate(weekDates[0])} — ${formatDate(weekDates[6])}`;

  const postsInWeek: Post[][] = weekDates.map(date => {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    return allPosts.filter((post: PostItem) => {
      const d = new Date((post.scheduledAt ?? post.createdAt) as Date);
      return d >= start && d <= end;
    });
  });

  const totalWeek = postsInWeek.reduce((s, d) => s + d.length, 0);

  if (loadingInf || loadingPosts) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B2635' }} /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Planejamento Semanal</h2>
          <p className="text-slate-500 text-sm mt-1">Posts agendados na semana. Use "Gerar" para criar conteúdo com IA.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(o => o - 1)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">‹</button>
          <span className="text-sm text-slate-600 px-1">{weekLabel}</span>
          <button onClick={() => setWeekOffset(o => o + 1)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">›</button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors">Hoje</button>
          )}
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 bg-white border border-slate-100 shadow-sm">
          <p className="text-2xl font-bold" style={{ color: '#8B2635' }}>{totalWeek}</p>
          <p className="text-xs text-slate-500 mt-1">Posts na semana</p>
        </div>
        {influencers.slice(0, 3).map((inf: Inf, idx: number) => {
          const count = postsInWeek.reduce((s, day) => s + day.filter(p => p.influencerId === inf.id).length, 0);
          return (
            <div key={inf.id} className="rounded-xl p-4 border shadow-sm"
              style={{ backgroundColor: BG_COLORS[idx % BG_COLORS.length], borderColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] + '30' }}>
              <p className="text-2xl font-bold" style={{ color: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>{count}</p>
              <p className="text-xs text-slate-500 mt-1">{inf.name}</p>
            </div>
          );
        })}
      </div>

      {/* Grade da semana */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {WEEK_DAYS.map((dayName, i) => (
          <div key={dayName} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-2 py-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-700">{dayName.slice(0, 3)}</p>
                <p className="text-[10px] text-slate-400">{formatDate(weekDates[i])}</p>
              </div>
              {postsInWeek[i].length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1">{postsInWeek[i].length}</Badge>
              )}
            </div>
            <div className="p-1.5 space-y-1 min-h-[70px]">
              {postsInWeek[i].length === 0 && (
                <p className="text-[10px] text-slate-300 text-center pt-5">—</p>
              )}
              {postsInWeek[i].map((post: Post) => {
                const idx = colorMap[post.influencerId ?? 0] ?? 0;
                return (
                  <div key={post.id} className="rounded px-1.5 py-1 text-white text-[10px]"
                    style={{ backgroundColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>
                    <span className="font-medium">{post.influencerName}</span>
                    {post.caption && <p className="opacity-75 truncate">{post.caption}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Gerar conteúdo rápido */}
      {influencers.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Gerar post rápido para a semana
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {influencers.map((inf: Inf, idx: number) => (
                <Button key={inf.id} variant="outline" className="h-auto py-3 flex-col gap-1.5"
                  style={{ borderColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}
                  disabled={generatingFor !== null}
                  onClick={() => {
                    setAiResult(null);
                    setGeneratingFor(inf.id);
                    generate.mutate({ influencerId: inf.id, theme: "pijamas Feminnita — conteúdo da semana", platform: "instagram", contentType: "video" });
                  }}>
                  {generatingFor === inf.id
                    ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: ACCENT_COLORS[idx % ACCENT_COLORS.length] }} />
                    : <Sparkles className="w-4 h-4" style={{ color: ACCENT_COLORS[idx % ACCENT_COLORS.length] }} />
                  }
                  <span className="text-xs font-medium text-slate-700">{inf.name}</span>
                </Button>
              ))}
            </div>

            {aiResult && (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-2">
                <p className="text-xs font-semibold text-amber-700">{aiResult.influencerName} — salvo como rascunho</p>
                <p className="text-sm text-slate-700 leading-relaxed">{aiResult.caption}</p>
                <button onClick={() => setAiResult(null)} className="text-xs text-slate-400 hover:text-slate-600">Fechar</button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {influencers.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          Crie as influencers em <strong>Personas</strong> para usar o planejamento.
        </div>
      )}
    </div>
  );
}
