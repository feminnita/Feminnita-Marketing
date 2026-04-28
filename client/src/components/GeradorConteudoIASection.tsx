import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, Check, Clock, TrendingUp, Instagram, Music2 } from "lucide-react";

const ACCENT_COLORS = ['#6B1D28', '#A63D4A', '#6B7A3A', '#3A5A6B'];
const BG_COLORS = ['#fdf0e8', '#fce8ea', '#eef5e8', '#e8f2f5'];

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'blog', label: 'Blog' },
] as const;

const TYPES = [
  { value: 'video', label: 'Vídeo / Reel' },
  { value: 'image', label: 'Imagem' },
  { value: 'carousel', label: 'Carrossel' },
  { value: 'story', label: 'Story' },
] as const;

const THEME_SUGGESTIONS = [
  "Lançamento coleção inverno",
  "Look de pijama favorito",
  "Kit presente para ela",
  "Rotina noturna de autocuidado",
  "Pijama fofo para o frio",
  "Dia das Mães — kit família",
  "Por que investir em pijama de qualidade",
  "Unboxing do pedido Feminnita",
];

export default function GeradorConteudoIASection() {
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<number | null>(null);
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | 'blog'>('instagram');
  const [contentType, setContentType] = useState<'video' | 'image' | 'carousel' | 'story'>('video');
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('');
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: influencers = [], isLoading: loadingInfluencers } = trpc.influencers.list.useQuery();
  type Inf = (typeof influencers)[number];
  const selectedIdx = influencers.findIndex((i: Inf) => i.id === selectedInfluencerId);
  const selected = influencers[selectedIdx] ?? null;

  const generate = trpc.autonomousInfluencers.generateContent.useMutation({
    onSuccess: (data) => setResult(data.content),
  });

  const copyCaption = () => {
    if (result?.caption) {
      navigator.clipboard.writeText(result.caption + (result.hashtags?.length ? '\n\n' + result.hashtags.join(' ') : ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loadingInfluencers) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6B1D28' }} />
      </div>
    );
  }

  if (influencers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">🤖</div>
        <p className="text-slate-600">Crie as influencers primeiro em <strong>Personas</strong>.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Gerador de Conteúdo IA</h2>
        <p className="text-slate-500 text-sm mt-1">
          A IA escreve na voz de cada influencer. Escolha quem, onde e o tema — ela cria a legenda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 space-y-5">

            {/* Selecionar influencer */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Influencer</label>
              <div className="grid grid-cols-2 gap-2">
                {influencers.map((inf: Inf, idx: number) => (
                  <button
                    key={inf.id}
                    onClick={() => setSelectedInfluencerId(inf.id)}
                    className="flex items-center gap-2 p-2.5 rounded-lg border-2 text-left transition-all"
                    style={selectedInfluencerId === inf.id
                      ? { borderColor: ACCENT_COLORS[idx % ACCENT_COLORS.length], backgroundColor: BG_COLORS[idx % BG_COLORS.length] }
                      : { borderColor: '#e5e7eb', backgroundColor: 'white' }
                    }
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border"
                      style={{ borderColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>
                      {inf.avatar ? (
                        <img src={inf.avatar} alt={inf.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>
                          {inf.name[0]}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{inf.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plataforma + Tipo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Plataforma</label>
                <select
                  value={platform}
                  onChange={e => setPlatform(e.target.value as typeof platform)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Tipo</label>
                <select
                  value={contentType}
                  onChange={e => setContentType(e.target.value as typeof contentType)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Tema */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Tema</label>
              <Input
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="O que vai falar? Ex: lançamento da coleção inverno..."
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {THEME_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setTheme(s)}
                    className="text-xs px-2 py-1 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Estilo (opcional)</label>
              <Input
                value={style}
                onChange={e => setStyle(e.target.value)}
                placeholder="Ex: divertido, emocionante, educativo, íntimo..."
              />
            </div>

            <Button
              className="w-full text-white"
              style={{ backgroundColor: selectedIdx >= 0 ? ACCENT_COLORS[selectedIdx % ACCENT_COLORS.length] : '#6B1D28' }}
              disabled={generate.isPending || !selectedInfluencerId || !theme.trim()}
              onClick={() => {
                setResult(null);
                generate.mutate({
                  influencerId: selectedInfluencerId!,
                  theme,
                  platform,
                  contentType,
                  style: style || undefined,
                });
              }}
            >
              {generate.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Gerando com IA...</>
                : <><Sparkles className="w-4 h-4 mr-2" />Gerar Conteúdo</>
              }
            </Button>

            {!selectedInfluencerId && (
              <p className="text-xs text-center text-slate-400">Selecione uma influencer para habilitar</p>
            )}
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Conteúdo Gerado
              {selected && <Badge variant="outline" className="text-xs font-normal">por {selected.name}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generate.isPending && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: selected ? ACCENT_COLORS[selectedIdx % ACCENT_COLORS.length] : '#6B1D28' }} />
                <p className="text-sm">
                  {selected?.name} está criando o conteúdo...
                </p>
              </div>
            )}

            {generate.isError && (
              <div className="text-center py-8 text-sm text-red-500">
                Erro ao gerar conteúdo. Verifique se a chave de IA (LLM_API_KEY) está configurada no .env.
              </div>
            )}

            {!generate.isPending && !result && !generate.isError && (
              <div className="text-center py-12 text-slate-300 space-y-2">
                <Sparkles className="w-10 h-10 mx-auto" />
                <p className="text-sm">Preencha o formulário e clique em Gerar</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {result.caption && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Legenda</p>
                      <button
                        onClick={copyCaption}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copiado!' : 'Copiar tudo'}
                      </button>
                    </div>
                    <div className="rounded-xl p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap"
                      style={{ backgroundColor: selectedIdx >= 0 ? BG_COLORS[selectedIdx % BG_COLORS.length] : '#fdf0e8' }}>
                      {result.caption}
                    </div>
                  </div>
                )}

                {result.hashtags?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Hashtags</p>
                    <p className="text-sm text-blue-600 leading-relaxed">{result.hashtags.join(' ')}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {result.bestTimeToPost && (
                    <div className="rounded-lg p-3 bg-slate-50 flex items-start gap-2">
                      <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Melhor horário</p>
                        <p className="text-sm font-medium text-slate-700">{result.bestTimeToPost}</p>
                      </div>
                    </div>
                  )}
                  {result.estimatedReach && (
                    <div className="rounded-lg p-3 bg-slate-50 flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Alcance estimado</p>
                        <p className="text-sm font-medium text-slate-700">
                          {typeof result.estimatedReach === 'number'
                            ? result.estimatedReach.toLocaleString('pt-BR')
                            : result.estimatedReach} pessoas
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {result.contentIdeas?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Ideias de conteúdo</p>
                    <ul className="space-y-1">
                      {result.contentIdeas.map((idea: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span>{idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => { setResult(null); setTheme(''); }}
                >
                  Gerar outro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
