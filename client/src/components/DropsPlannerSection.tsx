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
import { CalendarDays, Plus, Trash2, Edit2, Rocket, X, Check } from "lucide-react";

type DropStatus = "rascunho" | "agendado" | "ativo" | "encerrado";
type DropCategoria = "inverno" | "verao" | "natal" | "dia_das_maes" | "dia_dos_namorados" | "black_friday" | "lancamento" | "outro";

const statusConfig: Record<DropStatus, { label: string; className: string }> = {
  rascunho:  { label: "Rascunho",  className: "bg-slate-100 text-slate-700 border-slate-300" },
  agendado:  { label: "Agendado",  className: "bg-blue-100 text-blue-800 border-blue-300" },
  ativo:     { label: "Ativo",     className: "bg-green-100 text-green-800 border-green-300" },
  encerrado: { label: "Encerrado", className: "bg-gray-100 text-gray-600 border-gray-300" },
};

const categoriaConfig: Record<DropCategoria, { label: string; emoji: string }> = {
  inverno:           { label: "Inverno",           emoji: "🧥" },
  verao:             { label: "Verão",             emoji: "☀️" },
  natal:             { label: "Natal",             emoji: "🎄" },
  dia_das_maes:      { label: "Dia das Mães",      emoji: "💐" },
  dia_dos_namorados: { label: "Dia dos Namorados", emoji: "💑" },
  black_friday:      { label: "Black Friday",      emoji: "🏷️" },
  lancamento:        { label: "Lançamento",        emoji: "🚀" },
  outro:             { label: "Outro",             emoji: "📦" },
};

function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const tick = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function CountdownBadge({ dataLancamento }: { dataLancamento: Date }) {
  const countdown = useCountdown(dataLancamento);
  if (!countdown) return <span className="text-xs font-semibold text-green-600 animate-pulse">Ao vivo!</span>;
  return (
    <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
      {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
    </span>
  );
}

interface DropCardProps {
  drop: {
    id: number;
    nome: string;
    descricao?: string | null;
    dataLancamento: Date;
    status: DropStatus;
    categoria: DropCategoria;
    metaVendas?: number | null;
    vendasRealizadas?: number | null;
    preListaWhatsapp?: number | null;
    precoMinimo?: string | null;
    precoMaximo?: string | null;
  };
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: DropStatus) => void;
}

function DropCard({ drop, onDelete, onStatusChange }: DropCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const catInfo = categoriaConfig[drop.categoria] ?? { label: drop.categoria, emoji: "📦" };
  const stInfo = statusConfig[drop.status] ?? { label: drop.status, className: "" };
  const isFuture = new Date(drop.dataLancamento) > new Date();
  const progress = drop.metaVendas && drop.metaVendas > 0
    ? Math.min(100, Math.round(((drop.vendasRealizadas ?? 0) / drop.metaVendas) * 100))
    : null;

  const nextStatuses: DropStatus[] = drop.status === "rascunho"
    ? ["agendado", "ativo"]
    : drop.status === "agendado"
    ? ["ativo", "encerrado"]
    : drop.status === "ativo"
    ? ["encerrado"]
    : [];

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 truncate">{drop.nome}</span>
              <Badge variant="outline" className={`text-xs ${stInfo.className}`}>{stInfo.label}</Badge>
              <span className="text-xs bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                {catInfo.emoji} {catInfo.label}
              </span>
            </div>
            {drop.descricao && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{drop.descricao}</p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {confirmDelete ? (
              <>
                <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => onDelete(drop.id)}>
                  <Check className="h-3 w-3 mr-1" /> Confirmar
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setConfirmDelete(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>{new Date(drop.dataLancamento).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
          {isFuture ? (
            <CountdownBadge dataLancamento={new Date(drop.dataLancamento)} />
          ) : drop.status === "ativo" ? (
            <span className="text-xs font-semibold text-green-600 animate-pulse">Ao vivo!</span>
          ) : null}
        </div>

        {(drop.precoMinimo || drop.precoMaximo) && (
          <div className="text-xs text-slate-600">
            Faixa: <span className="font-medium">R$ {drop.precoMinimo || "?"} – R$ {drop.precoMaximo || "?"}</span>
          </div>
        )}

        {progress !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Vendas: {drop.vendasRealizadas ?? 0} / {drop.metaVendas}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {nextStatuses.length > 0 && (
          <div className="flex gap-2 pt-1 flex-wrap">
            {nextStatuses.map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onStatusChange(drop.id, s)}
              >
                <Edit2 className="h-3 w-3 mr-1" />
                {statusConfig[s].label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DropsPlannerSection() {
  const utils = trpc.useUtils();
  const { data: drops = [], isLoading } = trpc.drops.listar.useQuery();

  const criar = trpc.drops.criar.useMutation({
    onSuccess: () => {
      toast.success("Drop criado com sucesso!");
      utils.drops.listar.invalidate();
      utils.drops.proximos.invalidate();
      setShowForm(false);
      resetForm();
    },
    onError: (e) => toast.error("Erro ao criar drop: " + e.message),
  });

  const atualizar = trpc.drops.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Drop atualizado!");
      utils.drops.listar.invalidate();
    },
    onError: (e) => toast.error("Erro ao atualizar: " + e.message),
  });

  const deletar = trpc.drops.deletar.useMutation({
    onSuccess: () => {
      toast.success("Drop removido.");
      utils.drops.listar.invalidate();
    },
    onError: (e) => toast.error("Erro ao remover: " + e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataLancamento, setDataLancamento] = useState("");
  const [categoria, setCategoria] = useState<DropCategoria>("lancamento");
  const [metaVendas, setMetaVendas] = useState("");
  const [precoMinimo, setPrecoMinimo] = useState("");
  const [precoMaximo, setPrecoMaximo] = useState("");

  const resetForm = () => {
    setNome(""); setDescricao(""); setDataLancamento("");
    setCategoria("lancamento"); setMetaVendas(""); setPrecoMinimo(""); setPrecoMaximo("");
  };

  const handleCriar = () => {
    if (!nome.trim() || !dataLancamento) {
      toast.error("Preencha o nome e a data de lançamento.");
      return;
    }
    criar.mutate({
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      dataLancamento: new Date(dataLancamento).toISOString(),
      categoria,
      metaVendas: metaVendas ? parseInt(metaVendas) : undefined,
      precoMinimo: precoMinimo || undefined,
      precoMaximo: precoMaximo || undefined,
    });
  };

  // Group drops by month for timeline
  const dropsByMonth: Record<string, typeof drops> = {};
  for (const drop of drops) {
    const key = new Date(drop.dataLancamento).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    if (!dropsByMonth[key]) dropsByMonth[key] = [];
    dropsByMonth[key].push(drop);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-600" />
            Drops Sazonais
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Planeje e acompanhe o lançamento das suas coleções</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Novo Drop
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Novo Drop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome do Drop *</Label>
                <Input placeholder="Ex: Coleção Inverno 2026" value={nome} onChange={e => setNome(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Data e Hora de Lançamento *</Label>
                <Input type="datetime-local" value={dataLancamento} onChange={e => setDataLancamento(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={categoria} onValueChange={v => setCategoria(v as DropCategoria)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(categoriaConfig) as [DropCategoria, { label: string; emoji: string }][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Meta de Vendas (unidades)</Label>
                <Input type="number" placeholder="Ex: 100" value={metaVendas} onChange={e => setMetaVendas(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Preço Mínimo (R$)</Label>
                <Input placeholder="Ex: 79,90" value={precoMinimo} onChange={e => setPrecoMinimo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Preço Máximo (R$)</Label>
                <Input placeholder="Ex: 149,90" value={precoMaximo} onChange={e => setPrecoMaximo(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva a coleção, diferenciais, público-alvo..." value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCriar} disabled={criar.isPending} size="sm">
                {criar.isPending ? "Salvando..." : "Criar Drop"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && drops.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-12 flex flex-col items-center text-center gap-3">
            <Rocket className="h-10 w-10 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhum drop cadastrado</p>
            <p className="text-sm text-slate-400">Crie seu primeiro lançamento sazonal para começar a planejar!</p>
            <Button size="sm" onClick={() => setShowForm(true)} className="mt-1">
              <Plus className="h-4 w-4 mr-1" /> Criar primeiro drop
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Timeline por mês */}
      {Object.entries(dropsByMonth).map(([month, monthDrops]) => (
        <div key={month}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{month}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthDrops.map(drop => (
              <DropCard
                key={drop.id}
                drop={{
                  ...drop,
                  status: drop.status as DropStatus,
                  categoria: drop.categoria as DropCategoria,
                }}
                onDelete={(id) => deletar.mutate({ id })}
                onStatusChange={(id, status) => atualizar.mutate({ id, status })}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
