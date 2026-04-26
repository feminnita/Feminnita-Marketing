import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Users,
  Lightbulb,
  FileText,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  Plus,
  Bot,
  Hash,
  AlignLeft,
  Film,
  LayoutGrid,
  BookOpen,
  Send,
} from "lucide-react";

// ─── tipos locais ────────────────────────────────────────────────
type BriefStatus = "all" | "pending" | "generated" | "approved" | "published";
type BriefType = "all" | "carousel" | "reel" | "story" | "post";

interface Competitor {
  name: string;
  strategy?: string;
  strengths?: string[];
}

interface Recommendation {
  action: string;
  rationale?: string;
  priority?: "alta" | "media" | "baixa";
}

interface CompetitorInsights {
  competitors?: Competitor[];
}

interface MarketReport {
  weeklyStrategy?: string;
  audienceInsights?: string;
  competitorInsights?: CompetitorInsights;
  trendingHashtags?: string[];
  contentOpportunities?: string[];
  recommendations?: Recommendation[];
}

interface Brief {
  id: number;
  topic?: string;
  briefType?: string;
  status?: string;
  targetAudience?: string;
  influencerName?: string;
  generatedContent?: unknown;
}

// ─── helpers ─────────────────────────────────────────────────────
const PRIORITY_BADGE: Record<string, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-yellow-100 text-yellow-700",
  baixa: "bg-gray-100 text-gray-500",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-gray-100 text-gray-600" },
  generated: { label: "Gerado", className: "bg-blue-100 text-blue-700" },
  approved: { label: "Aprovado", className: "bg-green-100 text-green-700" },
  published: { label: "Publicado", className: "bg-purple-100 text-purple-700" },
};

const TYPE_ICON: Record<string, React.ReactElement> = {
  carousel: <LayoutGrid className="w-4 h-4" />,
  reel: <Film className="w-4 h-4" />,
  story: <BookOpen className="w-4 h-4" />,
  post: <AlignLeft className="w-4 h-4" />,
};

const AGENTS = [
  // ── Equipe IA Especializada (com memória + busca na internet) ─────────────
  {
    name: "Fernanda — Gestora de Tráfego",
    icon: <Bot className="w-5 h-5 text-purple-500" />,
    frequency: "Análise diária Meta Ads + todas as plataformas",
    description: "Otimiza campanhas Meta Ads, monitora ROAS/CPA e escala orçamento. Integra Shopee, ML, Amazon e TikTok Ads conforme credenciais são ativadas.",
    badge: "Meta · ML · Shopee · Amazon · TikTok",
    badgeColor: "bg-purple-100 text-purple-700",
    href: "/gestor-trafego",
  },
  {
    name: "Sofia — Crescimento Instagram",
    icon: <TrendingUp className="w-5 h-5 text-pink-500" />,
    frequency: "Análise diária + busca de tendências",
    description: "Monitora métricas orgânicas, identifica tendências de conteúdo em tempo real e propõe ações para crescer seguidores e engajamento.",
    badge: "Instagram · Reels · Stories",
    badgeColor: "bg-pink-100 text-pink-700",
    href: "/agente/sofia",
  },
  {
    name: "Clara — Inteligência Competitiva",
    icon: <Eye className="w-5 h-5 text-blue-500" />,
    frequency: "Monitoramento diário de concorrentes",
    description: "Rastreia concorrentes de pijamas atacado, analisa precificação de mercado e identifica gaps e oportunidades estratégicas.",
    badge: "Concorrentes · Mercado · Preços",
    badgeColor: "bg-blue-100 text-blue-700",
    href: "/agente/clara",
  },
  {
    name: "Mariana — Estratégia de Vendas",
    icon: <Send className="w-5 h-5 text-green-500" />,
    frequency: "Análise diária multicanal",
    description: "Gerencia estratégia de vendas em todos os canais (Meta, ML, WhatsApp, Shopee, Amazon, TikTok). Foca no caminho para R$100K/mês.",
    badge: "ML · Shopee · Amazon · TikTok · WhatsApp",
    badgeColor: "bg-green-100 text-green-700",
    href: "/agente/mariana",
  },
  // ── Agentes de automação de conteúdo (pipeline existente) ─────────────────
  {
    name: "MarketResearch",
    icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
    frequency: "Roda diariamente às 7h",
    description: "Analisa mercado, concorrentes e tendências de hashtags.",
  },
  {
    name: "CreativeTeam",
    icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
    frequency: "Roda toda segunda-feira às 8h",
    description: "Gera briefs de conteúdo com base nas pesquisas.",
  },
  {
    name: "Copywriter",
    icon: <FileText className="w-5 h-5 text-green-400" />,
    frequency: "Processa briefs a cada 30min",
    description: "Redige o conteúdo completo dos briefs aprovados.",
  },
];

// ─── grade de agentes ─────────────────────────────────────────────
function AgentesGrid() {
  const [, setLocation] = useLocation();
  const specialists = AGENTS.filter((a) => (a as any).href);
  const automation = AGENTS.filter((a) => !(a as any).href);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-500" />
          Equipe IA Especializada — Memória + Busca em Tempo Real
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialists.map((agent) => (
            <Card
              key={agent.name}
              className="cursor-pointer hover:shadow-md hover:border-purple-300 transition-all"
              onClick={() => setLocation((agent as any).href)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-50 rounded-lg">{agent.icon}</div>
                  <div>
                    <CardTitle className="text-sm leading-tight">{agent.name}</CardTitle>
                    {(agent as any).badge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${(agent as any).badgeColor}`}>
                        {(agent as any).badge}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-600">{agent.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{agent.frequency}</span>
                </div>
                <div className="text-xs text-purple-600 font-medium pt-1 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  → Abrir agente
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Pipeline de Automação de Conteúdo
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {automation.map((agent) => (
            <Card key={agent.name} className="hover:shadow-sm transition-shadow opacity-80">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-50 rounded-lg">{agent.icon}</div>
                  <CardTitle className="text-sm leading-tight">{agent.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-gray-600">{agent.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{agent.frequency}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── componente de conteúdo gerado ───────────────────────────────
function GeneratedContentView({
  briefType,
  content,
}: {
  briefType?: string;
  content: unknown;
}) {
  if (!content) return <p className="text-gray-400 text-sm">Sem conteúdo gerado.</p>;

  const c = content as Record<string, unknown>;

  if (briefType === "carousel") {
    const slides = Array.isArray(c.slides) ? (c.slides as string[]) : [];
    return (
      <div className="space-y-2">
        <p className="font-semibold text-sm text-gray-700">Slides do Carrossel</p>
        {slides.length > 0 ? (
          slides.map((slide, i) => (
            <div key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs flex items-center justify-center font-semibold">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{slide}</p>
            </div>
          ))
        ) : (
          <pre className="text-xs text-gray-500 whitespace-pre-wrap">
            {JSON.stringify(content, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (briefType === "reel") {
    return (
      <div className="space-y-3">
        {(c.hook as React.ReactNode) && (
          <div>
            <p className="font-semibold text-sm text-gray-700 mb-1">Hook</p>
            <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">{String(c.hook)}</p>
          </div>
        )}
        {Array.isArray(c.scenes) && c.scenes.length > 0 && (
          <div>
            <p className="font-semibold text-sm text-gray-700 mb-1">Cenas</p>
            {(c.scenes as string[]).map((scene, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <span className="text-xs text-gray-400 mt-0.5 shrink-0">#{i + 1}</span>
                <p className="text-sm text-gray-600">{scene}</p>
              </div>
            ))}
          </div>
        )}
        {(c.cta as React.ReactNode) && (
          <div>
            <p className="font-semibold text-sm text-gray-700 mb-1">CTA</p>
            <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">{String(c.cta)}</p>
          </div>
        )}
        {!c.hook && !c.scenes && !c.cta && (
          <pre className="text-xs text-gray-500 whitespace-pre-wrap">
            {JSON.stringify(content, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (briefType === "story") {
    const stories = Array.isArray(c.stories) ? (c.stories as string[]) : [];
    return (
      <div className="space-y-2">
        <p className="font-semibold text-sm text-gray-700">Stories</p>
        {stories.length > 0 ? (
          stories.map((s, i) => (
            <div key={i} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-semibold">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{s}</p>
            </div>
          ))
        ) : (
          <pre className="text-xs text-gray-500 whitespace-pre-wrap">
            {JSON.stringify(content, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  // post (default)
  return (
    <div className="space-y-3">
      {(c.caption as React.ReactNode) && (
        <div>
          <p className="font-semibold text-sm text-gray-700 mb-1">Caption</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
            {String(c.caption)}
          </p>
        </div>
      )}
      {(c.hashtags as React.ReactNode) && (
        <div>
          <p className="font-semibold text-sm text-gray-700 mb-1">Hashtags</p>
          <p className="text-sm text-pink-600 bg-pink-50 p-2 rounded">{String(c.hashtags)}</p>
        </div>
      )}
      {!c.caption && !c.hashtags && (
        <pre className="text-xs text-gray-500 whitespace-pre-wrap">
          {JSON.stringify(content, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─── página principal ─────────────────────────────────────────────
export default function MarketingTeamPage() {
  const [briefStatusFilter, setBriefStatusFilter] = useState<BriefStatus>("all");
  const [briefTypeFilter, setBriefTypeFilter] = useState<BriefType>("all");
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [newBriefOpen, setNewBriefOpen] = useState(false);

  // Form novo brief
  const [newTopic, setNewTopic] = useState("");
  const [newBriefType, setNewBriefType] = useState("");
  const [newAudience, setNewAudience] = useState("");

  const { data: report, refetch: refetchReport } =
    trpc.marketResearch.getLatestReport.useQuery();

  const { data: briefs, refetch: refetchBriefs } =
    trpc.marketResearch.listContentBriefs.useQuery();

  const generateReport = trpc.marketResearch.generateNow.useMutation({
    onSuccess: () => refetchReport(),
  });

  const createBrief = trpc.marketResearch.createBrief.useMutation({
    onSuccess: () => {
      refetchBriefs();
      setNewBriefOpen(false);
      setNewTopic("");
      setNewBriefType("");
      setNewAudience("");
    },
  });

  const updateBriefStatus = trpc.marketResearch.updateBriefStatus.useMutation({
    onSuccess: () => {
      refetchBriefs();
      if (selectedBrief) {
        setSelectedBrief(null);
      }
    },
  });

  const filteredBriefs = (briefs ?? []).filter((b: any) => {
    const statusOk = briefStatusFilter === "all" || b.status === briefStatusFilter;
    const typeOk = briefTypeFilter === "all" || b.briefType === briefTypeFilter;
    return statusOk && typeOk;
  });

  const typedReport = report as MarketReport | undefined | null;

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-500" />
            Equipe de Marketing IA
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Pesquisa de mercado, briefs de conteúdo e agentes autônomos.
          </p>
        </div>
      </div>

      <Tabs defaultValue="pesquisa">
        <TabsList>
          <TabsTrigger value="pesquisa" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Pesquisa de Mercado
          </TabsTrigger>
          <TabsTrigger value="briefs" className="gap-2">
            <FileText className="w-4 h-4" />
            Briefs de Conteúdo
            {briefs && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {briefs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="agentes" className="gap-2">
            <Bot className="w-4 h-4" />
            Status dos Agentes
          </TabsTrigger>
        </TabsList>

        {/* ─── ABA PESQUISA ─── */}
        <TabsContent value="pesquisa" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => generateReport.mutate()}
              disabled={generateReport.isPending}
              className="gap-2 bg-pink-600 hover:bg-pink-700"
            >
              <RefreshCw
                className={`w-4 h-4 ${generateReport.isPending ? "animate-spin" : ""}`}
              />
              {generateReport.isPending ? "Gerando..." : "Gerar Nova Pesquisa"}
            </Button>
          </div>

          {!typedReport ? (
            <div className="text-center py-16 text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma pesquisa de mercado disponível.</p>
              <p className="text-sm mt-1">Clique em "Gerar Nova Pesquisa" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Estratégia + Insights */}
              <div className="grid md:grid-cols-2 gap-4">
                {typedReport.weeklyStrategy && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Estratégia Semanal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{typedReport.weeklyStrategy}</p>
                    </CardContent>
                  </Card>
                )}
                {typedReport.audienceInsights && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        Insights de Audiência
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{typedReport.audienceInsights}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Concorrentes */}
              {typedReport.competitorInsights?.competitors && typedReport.competitorInsights.competitors.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Concorrentes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {typedReport.competitorInsights!.competitors!.map((c, i) => (
                      <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                        <p className="font-medium text-sm text-gray-900">{c.name}</p>
                        {c.strategy && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            <span className="font-medium">Estratégia:</span> {c.strategy}
                          </p>
                        )}
                        {c.strengths && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(Array.isArray(c.strengths) ? c.strengths : String(c.strengths).split(","))
                              .map((s: string, j: number) => (
                                <Badge key={j} variant="secondary" className="text-xs">
                                  {s.trim()}
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Hashtags */}
              {typedReport.trendingHashtags && typedReport.trendingHashtags.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Hash className="w-4 h-4 text-pink-500" />
                      Hashtags em Alta
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Clique para copiar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {typedReport.trendingHashtags.map((tag, i) => (
                        <button
                          key={i}
                          onClick={() => copyToClipboard(tag)}
                          className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium hover:bg-pink-100 transition-colors border border-pink-200"
                          title="Clique para copiar"
                        >
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Oportunidades */}
              {typedReport.contentOpportunities &&
                typedReport.contentOpportunities.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-500" />
                        Oportunidades de Conteúdo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {typedReport.contentOpportunities.map((opp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Recomendações */}
              {typedReport.recommendations && typedReport.recommendations.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      Recomendações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {typedReport.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Badge
                          className={`text-xs shrink-0 mt-0.5 ${
                            PRIORITY_BADGE[rec.priority ?? "baixa"]
                          }`}
                        >
                          {rec.priority ?? "baixa"}
                        </Badge>
                        <p className="text-sm text-gray-700">
                          {rec.action}{rec.rationale ? ` — ${rec.rationale}` : ""}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* ─── ABA BRIEFS ─── */}
        <TabsContent value="briefs" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "generated", "approved", "published"] as BriefStatus[]).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setBriefStatusFilter(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      briefStatusFilter === s
                        ? "bg-pink-600 text-white border-pink-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    {s === "all"
                      ? "Todos"
                      : STATUS_BADGE[s]?.label ?? s}
                  </button>
                )
              )}
              <span className="text-gray-300 self-center">|</span>
              {(["all", "carousel", "reel", "story", "post"] as BriefType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setBriefTypeFilter(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    briefTypeFilter === t
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  {t === "all" ? "Todos os Tipos" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Novo Brief */}
            <Dialog open={newBriefOpen} onOpenChange={setNewBriefOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-pink-600 hover:bg-pink-700 shrink-0">
                  <Plus className="w-4 h-4" />
                  Novo Brief
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Brief</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label>Tópico</Label>
                    <Input
                      placeholder="Ex: Pijama floral para o verão"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={newBriefType} onValueChange={setNewBriefType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carousel">Carousel</SelectItem>
                        <SelectItem value="reel">Reel</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="post">Post</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Público-Alvo</Label>
                    <Textarea
                      placeholder="Ex: Mulheres 25-40 anos, foco em conforto e moda..."
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button
                    className="w-full bg-pink-600 hover:bg-pink-700"
                    onClick={() =>
                      createBrief.mutate({
                        topic: newTopic,
                        briefType: newBriefType as "carousel" | "reel" | "story" | "post" | "feed",
                        targetAudience: newAudience,
                      })
                    }
                    disabled={createBrief.isPending || !newTopic || !newBriefType}
                  >
                    {createBrief.isPending ? "Criando..." : "Criar Brief"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {filteredBriefs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum brief encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredBriefs.map((brief: any) => {
                const statusInfo =
                  STATUS_BADGE[brief.status ?? "pending"] ?? STATUS_BADGE["pending"];
                const icon = TYPE_ICON[brief.briefType ?? "post"] ?? TYPE_ICON["post"];
                return (
                  <Card
                    key={brief.id}
                    className="hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() =>
                      brief.status === "generated" || brief.status === "approved"
                        ? setSelectedBrief(brief as unknown as Brief)
                        : undefined
                    }
                  >
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-gray-50 rounded-lg shrink-0 text-gray-500">
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {brief.topic ?? "Sem tópico"}
                            </p>
                            <Badge className={`text-xs ${statusInfo.className}`}>
                              {statusInfo.label}
                            </Badge>
                            {brief.briefType && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {brief.briefType}
                              </Badge>
                            )}
                          </div>
                          {(brief as unknown as Brief).influencerName && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Influenciadora: {(brief as unknown as Brief).influencerName}
                            </p>
                          )}
                          {brief.targetAudience && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {brief.targetAudience}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {(brief.status === "generated" || brief.status === "approved") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBrief(brief as unknown as Brief);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver
                          </Button>
                        )}
                        {brief.status === "generated" && (
                          <Button
                            size="sm"
                            className="gap-1 text-xs bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBriefStatus.mutate({
                                id: brief.id,
                                status: "approved",
                              });
                            }}
                            disabled={updateBriefStatus.isPending}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Aprovar
                          </Button>
                        )}
                        {brief.status === "approved" && (
                          <Button
                            size="sm"
                            className="gap-1 text-xs bg-purple-600 hover:bg-purple-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBriefStatus.mutate({
                                id: brief.id,
                                status: "published",
                              });
                            }}
                            disabled={updateBriefStatus.isPending}
                          >
                            <Send className="w-3.5 h-3.5" />
                            Publicar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Modal lateral de conteúdo gerado */}
          <Dialog open={!!selectedBrief} onOpenChange={(open) => !open && setSelectedBrief(null)}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedBrief?.briefType
                    ? TYPE_ICON[selectedBrief.briefType] ?? <FileText className="w-4 h-4" />
                    : <FileText className="w-4 h-4" />}
                  {selectedBrief?.topic ?? "Brief"}
                </DialogTitle>
              </DialogHeader>
              {selectedBrief && (
                <div className="space-y-4 mt-2">
                  <div className="flex gap-2 flex-wrap">
                    {selectedBrief.briefType && (
                      <Badge variant="outline" className="capitalize">
                        {selectedBrief.briefType}
                      </Badge>
                    )}
                    {selectedBrief.status && (
                      <Badge
                        className={
                          STATUS_BADGE[selectedBrief.status]?.className ?? ""
                        }
                      >
                        {STATUS_BADGE[selectedBrief.status]?.label ?? selectedBrief.status}
                      </Badge>
                    )}
                  </div>
                  {selectedBrief.targetAudience && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Público:</span>{" "}
                      {selectedBrief.targetAudience}
                    </p>
                  )}
                  <div className="border-t pt-3">
                    <GeneratedContentView
                      briefType={selectedBrief.briefType}
                      content={selectedBrief.generatedContent}
                    />
                  </div>
                  <div className="flex gap-2 border-t pt-3">
                    {selectedBrief.status === "generated" && (
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 gap-1"
                        onClick={() => {
                          updateBriefStatus.mutate({
                            id: selectedBrief.id,
                            status: "approved",
                          });
                        }}
                        disabled={updateBriefStatus.isPending}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </Button>
                    )}
                    {selectedBrief.status === "approved" && (
                      <Button
                        className="flex-1 bg-purple-600 hover:bg-purple-700 gap-1"
                        onClick={() => {
                          updateBriefStatus.mutate({
                            id: selectedBrief.id,
                            status: "published",
                          });
                        }}
                        disabled={updateBriefStatus.isPending}
                      >
                        <Send className="w-4 h-4" />
                        Publicar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── ABA AGENTES ─── */}
        <TabsContent value="agentes" className="mt-4">
          <AgentesGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
