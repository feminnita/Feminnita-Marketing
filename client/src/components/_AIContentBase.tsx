/**
 * Shared AI content generator base used by Roteiros, Reels, TikTok, Legendas, Imagens sections.
 * Each section passes its own config (platform, contentType, style hint, prompts).
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, Check, Clock, TrendingUp, RefreshCw } from "lucide-react";

export type AIContentConfig = {
  title: string;
  description: string;
  platform: "instagram" | "tiktok" | "youtube" | "blog";
  contentType: "video" | "image" | "carousel" | "story";
  styleHint: string;
  themePlaceholder: string;
  themeSuggestions: string[];
  resultLabel?: string;
};

const ACCENT_COLORS = ['#6B1D28', '#A63D4A', '#6B7A3A', '#3A5A6B'];
const BG_COLORS = ['#fdf0e8', '#fce8ea', '#eef5e8', '#e8f2f5'];

export function AIContentBase({ config }: { config: AIContentConfig }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [theme, setTheme] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: influencers = [], isLoading } = trpc.influencers.list.useQuery();
  type Inf = (typeof influencers)[number];
  const selectedIdx = influencers.findIndex((i: Inf) => i.id === selectedId);
  const selected = influencers[selectedIdx] ?? null;

  const generate = trpc.autonomousInfluencers.generateContent.useMutation({
    onSuccess: (data) => setResult(data.content),
  });

  const copyAll = () => {
    if (!result) return;
    const text = [result.caption, result.script, result.hooks?.join('\n'), result.hashtags?.join(' ')]
      .filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6B1D28' }} />
    </div>
  );

  if (influencers.length === 0) return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">🤖</div>
      <p className="text-slate-600">Crie as influencers em <strong>Personas</strong> primeiro.</p>
    </div>
  );

  const accentColor = selectedIdx >= 0 ? ACCENT_COLORS[selectedIdx % ACCENT_COLORS.length] : '#6B1D28';
  const bgColor = selectedIdx >= 0 ? BG_COLORS[selectedIdx % BG_COLORS.length] : '#fdf0e8';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>{config.title}</h2>
        <p className="text-slate-500 text-sm mt-1">{config.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 space-y-5">
            {/* Influencer selector */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Influencer</label>
              <div className="grid grid-cols-2 gap-2">
                {influencers.map((inf: Inf, idx: number) => (
                  <button key={inf.id} onClick={() => { setSelectedId(inf.id); setResult(null); }}
                    className="flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-all"
                    style={selectedId === inf.id
                      ? { borderColor: ACCENT_COLORS[idx % ACCENT_COLORS.length], backgroundColor: BG_COLORS[idx % BG_COLORS.length] }
                      : { borderColor: '#e5e7eb' }
                    }>
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                      style={{ backgroundColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>
                      {inf.avatar
                        ? <img src={inf.avatar} alt={inf.name} className="w-full h-full object-cover" />
                        : inf.name[0]}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{inf.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Tema</label>
              <Input value={theme} onChange={e => setTheme(e.target.value)}
                placeholder={config.themePlaceholder} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {config.themeSuggestions.map(s => (
                  <button key={s} onClick={() => setTheme(s)}
                    className="text-xs px-2 py-1 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full text-white" style={{ backgroundColor: accentColor }}
              disabled={generate.isPending || !selectedId || !theme.trim()}
              onClick={() => {
                setResult(null);
                generate.mutate({
                  influencerId: selectedId!,
                  theme,
                  platform: config.platform,
                  contentType: config.contentType,
                  style: config.styleHint,
                });
              }}>
              {generate.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Gerando...</>
                : <><Sparkles className="w-4 h-4 mr-2" />Gerar com IA</>
              }
            </Button>

            {!selectedId && <p className="text-xs text-center text-slate-400">Selecione uma influencer para começar</p>}
            {generate.isError && <p className="text-sm text-center text-red-500">Erro ao gerar. Verifique a chave de IA no .env</p>}
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              {config.resultLabel ?? "Resultado"}
              {selected && <Badge variant="outline" className="text-xs font-normal">por {selected.name}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generate.isPending && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: accentColor }} />
                <p className="text-sm text-slate-400">{selected?.name} está criando...</p>
              </div>
            )}

            {!generate.isPending && !result && !generate.isError && (
              <div className="text-center py-12 text-slate-200 space-y-2">
                <Sparkles className="w-10 h-10 mx-auto" />
                <p className="text-sm text-slate-400">Preencha o formulário e clique em Gerar</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={copyAll}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copiado!' : 'Copiar tudo'}
                  </button>
                </div>

                {/* Script / hooks */}
                {(result.script || result.hooks) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Roteiro</p>
                    <div className="rounded-xl p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap space-y-2"
                      style={{ backgroundColor: bgColor }}>
                      {result.script && <p>{result.script}</p>}
                      {result.hooks?.map((h: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <span className="font-bold text-xs" style={{ color: accentColor }}>{i === 0 ? 'Hook' : `Cena ${i + 1}`}</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caption */}
                {result.caption && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Legenda</p>
                    <div className="rounded-xl p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap"
                      style={{ backgroundColor: bgColor }}>
                      {result.caption}
                    </div>
                  </div>
                )}

                {/* Content ideas */}
                {result.contentIdeas?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Ideias visuais</p>
                    <ul className="space-y-1">
                      {result.contentIdeas.map((idea: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 flex gap-2">
                          <span style={{ color: accentColor }}>•</span>{idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hashtags */}
                {result.hashtags?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Hashtags</p>
                    <p className="text-sm text-blue-600">{result.hashtags.join(' ')}</p>
                  </div>
                )}

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2">
                  {result.bestTimeToPost && (
                    <div className="rounded-lg p-2.5 bg-slate-50 flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400">Melhor horário</p>
                        <p className="text-xs font-medium text-slate-700">{result.bestTimeToPost}</p>
                      </div>
                    </div>
                  )}
                  {result.estimatedReach && (
                    <div className="rounded-lg p-2.5 bg-slate-50 flex items-start gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400">Alcance estimado</p>
                        <p className="text-xs font-medium text-slate-700">
                          {typeof result.estimatedReach === 'number'
                            ? result.estimatedReach.toLocaleString('pt-BR')
                            : result.estimatedReach}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="outline" size="sm" className="w-full"
                  onClick={() => { setResult(null); setTheme(''); }}>
                  <RefreshCw className="w-3 h-3 mr-2" /> Gerar outro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
