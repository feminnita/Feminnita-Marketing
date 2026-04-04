import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Check, Tv2, Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type LiveStatus = "rascunho" | "agendada" | "ao_vivo" | "encerrada";

const statusConfig: Record<LiveStatus, { label: string; className: string }> = {
  rascunho: { label: "Rascunho",  className: "bg-slate-100 text-slate-700 border-slate-300" },
  agendada: { label: "Agendada",  className: "bg-blue-100 text-blue-800 border-blue-300" },
  ao_vivo:  { label: "Ao vivo!",  className: "bg-red-100 text-red-700 border-red-300 animate-pulse" },
  encerrada:{ label: "Encerrada", className: "bg-gray-100 text-gray-600 border-gray-300" },
};

const duracaoOptions = [
  { value: "30",  label: "30 minutos" },
  { value: "60",  label: "1 hora" },
  { value: "90",  label: "1h30" },
  { value: "120", label: "2 horas" },
  { value: "180", label: "3 horas" },
];

function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(null); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

type LiveItem = {
  id: number;
  titulo: string;
  dataAgendada?: Date | null;
  duracao?: number | null;
  status: string;
  roteiro?: string | null;
  produtosDestaque?: string | null;
  metaViewers?: number | null;
  metaVendas?: number | null;
  viewersReais?: number | null;
  vendasReais?: number | null;
  receitaGerada?: string | null;
  tiktokLiveUrl?: string | null;
  observacoes?: string | null;
};

function LiveCard({ live, onUpdate, onDelete, onGerarRoteiro, gerarPending }: {
  live: LiveItem;
  onUpdate: (data: Partial<LiveItem> & { id: number }) => void;
  onDelete: (id: number) => void;
  onGerarRoteiro: (id: number, titulo: string, produtos: string, duracao: number) => void;
  gerarPending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editRoteiro, setEditRoteiro] = useState(live.roteiro ?? "");
  const [editViewers, setEditViewers] = useState(String(live.viewersReais ?? ""));
  const [editVendas, setEditVendas] = useState(String(live.vendasReais ?? ""));
  const [editReceita, setEditReceita] = useState(live.receitaGerada ?? "");
  const [editUrl, setEditUrl] = useState(live.tiktokLiveUrl ?? "");

  const st = statusConfig[live.status as LiveStatus] ?? { label: live.status, className: "" };
  const isFuture = live.dataAgendada && new Date(live.dataAgendada) > new Date();
  const countdown = useCountdown(isFuture ? new Date(live.dataAgendada!) : null);

  const savePerformance = () => {
    onUpdate({
      id: live.id,
      viewersReais: editViewers ? parseInt(editViewers) : undefined,
      vendasReais: editVendas ? parseInt(editVendas) : undefined,
      receitaGerada: editReceita || undefined,
      tiktokLiveUrl: editUrl || undefined,
    });
  };

  const saveRoteiro = () => {
    onUpdate({ id: live.id, roteiro: editRoteiro });
  };

  useEffect(() => {
    setEditRoteiro(live.roteiro ?? "");
  }, [live.roteiro]);

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800">{live.titulo}</span>
              <Badge variant="outline" className={`text-xs ${st.className}`}>{st.label}</Badge>
            </div>
            {live.dataAgendada && (
              <p className="text-xs text-slate-500 mt-1">
                {new Date(live.dataAgendada).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                {countdown && (
                  <span className="ml-2 font-mono text-blue-600">
                    {countdown.days}d {countdown.hours}h {countdown.minutes}m
                  </span>
                )}
              </p>
            )}
            {live.duracao && <p className="text-xs text-slate-400">{live.duracao} min</p>}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {confirmDelete ? (
              <>
                <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => onDelete(live.id)}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setConfirmDelete(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Status changer */}
        <div className="flex gap-2 flex-wrap">
          {(["rascunho","agendada","ao_vivo","encerrada"] as LiveStatus[])
            .filter(s => s !== live.status)
            .map(s => (
              <Button key={s} size="sm" variant="outline" className="h-7 text-xs" onClick={() => onUpdate({ id: live.id, status: s })}>
                {statusConfig[s].label}
              </Button>
            ))}
        </div>

        {/* Gerar roteiro */}
        <Button
          size="sm"
          variant="outline"
          className="w-full gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
          disabled={gerarPending}
          onClick={() => onGerarRoteiro(live.id, live.titulo, live.produtosDestaque ?? "", live.duracao ?? 120)}
        >
          {gerarPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {gerarPending ? "Gerando roteiro com IA..." : "🤖 Gerar Roteiro com IA"}
        </Button>

        {/* Expanded content */}
        {expanded && (
          <div className="space-y-4 border-t border-slate-100 pt-3">
            {/* Roteiro */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">Roteiro</Label>
              <Textarea
                rows={8}
                value={editRoteiro}
                onChange={e => setEditRoteiro(e.target.value)}
                placeholder="Roteiro da live aparecerá aqui após geração com IA, ou escreva manualmente..."
                className="text-xs font-mono resize-y"
              />
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={saveRoteiro}>
                Salvar roteiro
              </Button>
            </div>

            {/* Produtos */}
            {live.produtosDestaque && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">Produtos em Destaque</p>
                <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">{live.produtosDestaque}</p>
              </div>
            )}

            {/* Performance (for ao_vivo / encerrada) */}
            {(live.status === "ao_vivo" || live.status === "encerrada") && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-600">Dados de Performance</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Viewers Reais</Label>
                    <Input type="number" className="h-8 text-sm" value={editViewers} onChange={e => setEditViewers(e.target.value)} placeholder={String(live.metaViewers ?? "")} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Vendas Reais</Label>
                    <Input type="number" className="h-8 text-sm" value={editVendas} onChange={e => setEditVendas(e.target.value)} placeholder={String(live.metaVendas ?? "")} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Receita Gerada (R$)</Label>
                    <Input className="h-8 text-sm" value={editReceita} onChange={e => setEditReceita(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">URL da Live</Label>
                    <Input className="h-8 text-sm" value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="https://tiktok.com/..." />
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={savePerformance}>
                  Salvar dados
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Performance summary for encerrada */}
        {live.status === "encerrada" && !expanded && (
          <div className="flex gap-4 text-xs text-slate-600 bg-slate-50 rounded p-2">
            <span>👁️ {live.viewersReais ?? 0} viewers</span>
            <span>🛒 {live.vendasReais ?? 0} vendas</span>
            <span>💰 R$ {live.receitaGerada ?? "0"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TiktokLivePage() {
  const utils = trpc.useUtils();
  const { data: stats } = trpc.tiktokLive.stats.useQuery();
  const { data: lives = [], isLoading } = trpc.tiktokLive.listar.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const invalidate = () => utils.tiktokLive.listar.invalidate().then(() => utils.tiktokLive.stats.invalidate());

  const criar = trpc.tiktokLive.criar.useMutation({
    onSuccess: () => { toast.success("Live criada!"); invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const atualizar = trpc.tiktokLive.atualizar.useMutation({
    onSuccess: () => { toast.success("Atualizado!"); invalidate(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const deletar = trpc.tiktokLive.deletar.useMutation({
    onSuccess: () => { toast.success("Live removida."); invalidate(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const gerarRoteiro = trpc.tiktokLive.gerarRoteiro.useMutation({
    onSuccess: (data) => {
      toast.success("Roteiro gerado!");
      invalidate();
      setGeneratingId(null);
    },
    onError: (e) => { toast.error("Erro ao gerar roteiro: " + e.message); setGeneratingId(null); },
  });

  const [titulo, setTitulo] = useState("");
  const [dataAgendada, setDataAgendada] = useState("");
  const [duracao, setDuracao] = useState("120");
  const [produtos, setProdutos] = useState("");
  const [metaViewers, setMetaViewers] = useState("");
  const [metaVendas, setMetaVendas] = useState("");

  const resetForm = () => {
    setTitulo(""); setDataAgendada(""); setDuracao("120"); setProdutos(""); setMetaViewers(""); setMetaVendas("");
  };

  const handleCriar = () => {
    if (!titulo.trim()) { toast.error("Informe o título da live."); return; }
    criar.mutate({
      titulo: titulo.trim(),
      dataAgendada: dataAgendada ? new Date(dataAgendada).toISOString() : undefined,
      duracao: parseInt(duracao),
      produtosDestaque: produtos || undefined,
      metaViewers: metaViewers ? parseInt(metaViewers) : undefined,
      metaVendas: metaVendas ? parseInt(metaVendas) : undefined,
    });
  };

  const handleGerarRoteiro = (id: number, t: string, p: string, d: number) => {
    setGeneratingId(id);
    gerarRoteiro.mutate({ liveId: id, titulo: t, produtos: p, duracao: d });
  };

  const kpis = [
    { label: "Total de Lives",  value: stats?.total ?? 0,        color: "text-slate-700" },
    { label: "Agendadas",       value: stats?.agendadas ?? 0,    color: "text-blue-600" },
    { label: "Total Vendas",    value: stats?.totalVendas ?? 0,  color: "text-green-600" },
    { label: "Receita Total",   value: `R$ ${stats?.totalReceita ?? "0"}`, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Tv2 className="h-6 w-6 text-red-500" />
            TikTok Live Commerce
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Planeje, execute e meça suas lives de vendas</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Nova Live
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => (
          <Card key={k.label} className="border border-slate-200">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-red-200 bg-red-50/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nova Live TikTok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Título da Live *</Label>
                <Input placeholder="Ex: Lançamento Coleção Inverno 🧥" value={titulo} onChange={e => setTitulo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Data e Hora Agendada</Label>
                <Input type="datetime-local" value={dataAgendada} onChange={e => setDataAgendada(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Duração</Label>
                <Select value={duracao} onValueChange={setDuracao}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {duracaoOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Meta de Viewers</Label>
                <Input type="number" placeholder="Ex: 500" value={metaViewers} onChange={e => setMetaViewers(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Meta de Vendas (unidades)</Label>
                <Input type="number" placeholder="Ex: 50" value={metaVendas} onChange={e => setMetaVendas(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Produtos em Destaque</Label>
              <Textarea placeholder="Liste os produtos que serão apresentados na live..." value={produtos} onChange={e => setProdutos(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCriar} disabled={criar.isPending} size="sm">
                {criar.isPending ? "Salvando..." : "Criar Live"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas */}
      <Card className="border border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-amber-800">💡 Dicas para TikTok Live Commerce</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-amber-900">
          <div className="space-y-1">
            <p className="font-semibold">🕗 Horário de Pico</p>
            <p>20h – 22h têm maior audiência para moda feminina</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">⏱️ Duração Ideal</p>
            <p>90 min ou mais — algoritmo favorece lives longas</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">📅 Frequência</p>
            <p>2x por semana para construir audiência fiel</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">🛍️ Produtos por Live</p>
            <p>5 a 8 SKUs — foco gera mais conversão</p>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {!isLoading && lives.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-12 flex flex-col items-center text-center gap-3">
            <Tv2 className="h-10 w-10 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhuma live cadastrada</p>
            <p className="text-sm text-slate-400">Crie sua primeira live e gere um roteiro com IA!</p>
            <Button size="sm" onClick={() => setShowForm(true)} className="mt-1">
              <Plus className="h-4 w-4 mr-1" /> Criar primeira live
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lives list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lives.map((live: any) => (
          <LiveCard
            key={live.id}
            live={live as LiveItem}
            onUpdate={(data) => {
              const { id, status, roteiro, produtosDestaque, viewersReais, vendasReais, receitaGerada, tiktokLiveUrl, observacoes } = data;
              atualizar.mutate({ id, status: status as LiveStatus | undefined, roteiro: roteiro ?? undefined, produtosDestaque: produtosDestaque ?? undefined, viewersReais: viewersReais ?? undefined, vendasReais: vendasReais ?? undefined, receitaGerada: receitaGerada ?? undefined, tiktokLiveUrl: tiktokLiveUrl ?? undefined, observacoes: observacoes ?? undefined });
            }}
            onDelete={(id) => deletar.mutate({ id })}
            onGerarRoteiro={handleGerarRoteiro}
            gerarPending={generatingId === live.id && gerarRoteiro.isPending}
          />
        ))}
      </div>
    </div>
  );
}
