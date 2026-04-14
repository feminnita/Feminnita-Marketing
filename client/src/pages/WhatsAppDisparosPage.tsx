/**
 * WhatsAppDisparosPage — Disparo em Massa WhatsApp
 *
 * Permite criar e executar campanhas de reativação para a base de clientes.
 * Suporta personalização com {nome} e delay configurável entre mensagens.
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  MessageSquare, Send, Plus, Trash2, Play, Square,
  CheckCircle, XCircle, Clock, Users, AlertTriangle,
  ChevronDown, ChevronUp, RefreshCw, Loader2, Info,
  Sparkles, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Blast {
  id: number;
  title: string;
  message: string;
  delaySeconds: number;
  status: "draft" | "running" | "done" | "cancelled" | "error";
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft:     { label: "Rascunho",    color: "bg-slate-100 text-slate-700",   icon: <Clock className="w-3.5 h-3.5" /> },
  running:   { label: "Enviando...", color: "bg-blue-100 text-blue-800",     icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  done:      { label: "Concluído",   color: "bg-green-100 text-green-800",   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelado",   color: "bg-yellow-100 text-yellow-800", icon: <Square className="w-3.5 h-3.5" /> },
  error:     { label: "Erro",        color: "bg-red-100 text-red-800",       icon: <XCircle className="w-3.5 h-3.5" /> },
};

function fmtDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function progressPct(blast: Blast): number {
  if (blast.totalContacts === 0) return 0;
  return Math.round(((blast.sentCount + blast.failedCount) / blast.totalContacts) * 100);
}

// Conta contatos válidos na textarea
function countContacts(raw: string): number {
  return raw.split(/[\n;]/).map(l => l.trim()).filter(l => {
    const digits = l.replace(/\D/g, "");
    return digits.length >= 10;
  }).length;
}

// Templates de mensagem
const TEMPLATES = [
  {
    label: "Reativação Clientes",
    msg: "Oi {nome}! Aqui é a Feminnita Pijamas 🌸\n\nFaz um tempo que não falamos! Temos novidades lindas que você vai amar.\n\nQuer ver os lançamentos? Responda aqui e te mando as fotos! 😊",
  },
  {
    label: "Oferta Especial",
    msg: "Oi {nome}! Feminnita aqui 💕\n\nEstamos com uma condição especial exclusiva para clientes como você!\n\nInteresse? Chama aqui que te passo os detalhes 🛍️",
  },
  {
    label: "Lançamento Coleção",
    msg: "Oi {nome}! Chegou nossa nova coleção de pijamas 😍✨\n\nPeças incríveis para você revender! Estamos com pronta entrega.\n\nQuer ver o catálogo? É só responder aqui! 📱",
  },
  {
    label: "Pós-Férias",
    msg: "Oi {nome}, tudo bem? 🌟\n\nJaneiro/fevereiro é época forte para pijamas!\n\nTemos coleções novas com ótima saída. Quer ver o catálogo atualizado? Responde aqui! 💫",
  },
];

// ─── Componente de Status de uma Campanha ─────────────────────────────────────

function BlastCard({
  blast,
  onRefresh,
  onCancel,
  onDelete,
}: {
  blast: Blast;
  onRefresh: () => void;
  onCancel: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[blast.status] ?? STATUS_CONFIG.draft;
  const pct = progressPct(blast);
  const isRunning = blast.status === "running";

  // Auto-refresh se estiver rodando
  const liveQuery = trpc.whatsappBlasts.get.useQuery(
    { blastId: blast.id },
    {
      enabled: isRunning,
      refetchInterval: isRunning ? 3000 : false,
    }
  );
  // Notificar parent quando dados mudarem enquanto running
  const liveBlastData = liveQuery.data as Blast | undefined;
  if (isRunning && liveBlastData && liveBlastData.status !== "running") {
    onRefresh();
  }
  const liveBlast = liveBlastData ?? blast;

  return (
    <Card className="border border-slate-200">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-slate-800 truncate">{liveBlast.title}</span>
              <Badge className={`flex items-center gap-1 text-xs ${cfg.color}`}>
                {cfg.icon}{cfg.label}
              </Badge>
            </div>

            {/* Barra de progresso */}
            {liveBlast.totalContacts > 0 && (
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{liveBlast.sentCount} enviados · {liveBlast.failedCount} falhas · {liveBlast.totalContacts} total</span>
                  <span>{progressPct(liveBlast)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${liveBlast.status === "error" ? "bg-red-400" : "bg-green-400"}`}
                    style={{ width: `${progressPct(liveBlast)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 text-xs text-slate-400">
              <span>Criado: {fmtDate(liveBlast.createdAt)}</span>
              {liveBlast.startedAt && <span>Iniciado: {fmtDate(liveBlast.startedAt)}</span>}
              {liveBlast.completedAt && <span>Fim: {fmtDate(liveBlast.completedAt)}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isRunning && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs text-red-600 border-red-200"
                onClick={() => onCancel(liveBlast.id)}
              >
                <Square className="w-3 h-3" />
                Parar
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
            {!isRunning && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-600"
                onClick={() => onDelete(liveBlast.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-600 mb-1">Mensagem:</p>
            <p className="text-xs text-slate-700 whitespace-pre-wrap bg-slate-50 rounded p-2">{liveBlast.message}</p>
            <p className="text-xs text-slate-400 mt-2">Intervalo: {liveBlast.delaySeconds}s entre mensagens</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function WhatsAppDisparosPage() {
  const [tab, setTab] = useState("novo");

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [contactsRaw, setContactsRaw] = useState("");
  const [delaySeconds, setDelaySeconds] = useState(8);
  const [showPreview, setShowPreview] = useState(false);
  const [createdBlastId, setCreatedBlastId] = useState<number | null>(null);

  // WhatsApp status
  const wpStatus = trpc.whatsappBlasts.checkWhatsApp.useQuery(undefined, { refetchInterval: 15000 });
  const isWpConnected = wpStatus.data?.isConnected ?? false;

  // Lista de campanhas
  const blastList = trpc.whatsappBlasts.list.useQuery();

  // Mutations
  const createMutation = trpc.whatsappBlasts.create.useMutation({
    onSuccess: (data) => {
      setCreatedBlastId(data.blastId);
      toast.success(`Campanha criada com ${data.totalContacts} contatos!`);
      blastList.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const startMutation = trpc.whatsappBlasts.start.useMutation({
    onSuccess: () => {
      toast.success("Disparo iniciado!");
      blastList.refetch();
      setTab("historico");
      // Reset form
      setTitle("");
      setMessage("");
      setContactsRaw("");
      setCreatedBlastId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.whatsappBlasts.cancel.useMutation({
    onSuccess: () => { toast.success("Campanha cancelada."); blastList.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.whatsappBlasts.delete.useMutation({
    onSuccess: () => { toast.success("Campanha deletada."); blastList.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const contactCount = countContacts(contactsRaw);

  // Tempo estimado de envio
  const estimatedMinutes = Math.ceil((contactCount * delaySeconds) / 60);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Disparo em Massa WhatsApp</h1>
        <p className="text-slate-500 text-sm mt-1">
          Reative sua base de clientes com mensagens personalizadas via Baileys
        </p>
      </div>

      {/* Status WhatsApp */}
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium ${
          isWpConnected
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}
      >
        <div className={`w-2.5 h-2.5 rounded-full ${isWpConnected ? "bg-green-500 animate-pulse" : "bg-amber-400"}`} />
        {isWpConnected ? (
          <>WhatsApp conectado — {wpStatus.data?.phoneNumber || "número não exibido"}</>
        ) : (
          <>WhatsApp desconectado — <a href="/whatsapp-baileys" className="underline">conecte aqui</a> antes de disparar</>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="novo" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Nova Campanha
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Histórico
            {blastList.data && blastList.data.length > 0 && (
              <Badge className="ml-1 text-xs bg-slate-200 text-slate-700">{blastList.data.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="dicas" className="gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Boas Práticas
          </TabsTrigger>
        </TabsList>

        {/* ── Nova Campanha ── */}
        <TabsContent value="novo" className="space-y-5 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurar Disparo</CardTitle>
              <CardDescription>
                Use <code className="bg-slate-100 px-1 rounded text-xs">{"{nome}"}</code> na mensagem para personalizar com o nome do contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Nome da Campanha</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reativação abril 2026"
                />
              </div>

              {/* Templates rápidos */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Templates Prontos</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setMessage(t.msg)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-pink-500" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Mensagem</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite a mensagem... Use {nome} para personalizar"
                  rows={5}
                  className="font-mono text-sm"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-slate-400">{message.length} caracteres</p>
                  {message && (
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? "Ocultar preview" : "Ver preview"}
                    </button>
                  )}
                </div>
                {showPreview && message && (
                  <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1.5 font-medium">Preview (exemplo com "Maria"):</p>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">
                      {message.replace(/\{nome\}/gi, "Maria").replace(/\{numero\}/gi, "11999990000")}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    Intervalo entre mensagens
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={3}
                      max={60}
                      value={delaySeconds}
                      onChange={(e) => setDelaySeconds(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-12 text-center">{delaySeconds}s</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recomendado: 8-15s para segurança
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Lista de Contatos
                </label>
                <Textarea
                  value={contactsRaw}
                  onChange={(e) => setContactsRaw(e.target.value)}
                  placeholder={`Um contato por linha:\n11999990000\n11988880000,Maria Silva\nNome,11977770000\n+5511966660000`}
                  rows={8}
                  className="font-mono text-xs"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-slate-400">
                    Formatos: número, número,Nome ou Nome,número — DDI 55 adicionado automaticamente
                  </p>
                  {contactCount > 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-green-700">
                      <Users className="w-3.5 h-3.5" />
                      {contactCount} contatos
                    </div>
                  )}
                </div>
              </div>

              {contactCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">Tempo estimado: ~{estimatedMinutes} {estimatedMinutes === 1 ? "minuto" : "minutos"}</p>
                    <p className="mt-0.5">{contactCount} contatos · {delaySeconds}s de intervalo</p>
                  </div>
                </div>
              )}

              {!isWpConnected && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    WhatsApp não está conectado. O disparo só pode começar após a conexão.
                    Você pode criar a campanha agora e iniciar depois.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {/* Criar campanha (sem disparar ainda) */}
                {!createdBlastId ? (
                  <Button
                    onClick={() => createMutation.mutate({ title, message, contactsRaw, delaySeconds })}
                    disabled={!title || !message || contactCount === 0 || createMutation.isPending}
                    variant="outline"
                    className="gap-2"
                  >
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Criar campanha
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-1.5 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      Campanha #{createdBlastId} criada
                    </div>
                    <Button
                      onClick={() => startMutation.mutate({ blastId: createdBlastId })}
                      disabled={!isWpConnected || startMutation.isPending}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {startMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      {isWpConnected ? "Iniciar disparo agora" : "WhatsApp desconectado"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCreatedBlastId(null)}
                      className="text-xs text-slate-400"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Histórico ── */}
        <TabsContent value="historico" className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-700">Campanhas</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => blastList.refetch()}
              className="gap-1 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${blastList.isFetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {blastList.isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : !blastList.data || blastList.data.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Nenhuma campanha ainda</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-blue-600"
                onClick={() => setTab("novo")}
              >
                Criar primeira campanha
              </Button>
            </div>
          ) : (
            (blastList.data as Blast[]).map((b) => (
              <BlastCard
                key={b.id}
                blast={b}
                onRefresh={() => blastList.refetch()}
                onCancel={(id) => cancelMutation.mutate({ blastId: id })}
                onDelete={(id) => deleteMutation.mutate({ blastId: id })}
              />
            ))
          )}
        </TabsContent>

        {/* ── Boas Práticas ── */}
        <TabsContent value="dicas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Boas Práticas para Disparos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-800 mb-2">⏱️ Intervalos Seguros</p>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Use no mínimo <strong>8 segundos</strong> entre mensagens</li>
                  <li>Para listas grandes (&gt;500), use 15-20s</li>
                  <li>Evite disparos entre 22h e 8h para respeitar o usuário</li>
                  <li>Limite recomendado: até 300 contatos por sessão</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-800 mb-2">✍️ Mensagens que Convertem</p>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Comece com o nome: "Oi <strong>{"{nome}"}</strong>!" gera mais resposta</li>
                  <li>Seja breve — menos de 200 caracteres converte melhor</li>
                  <li>Termine com uma pergunta aberta (não link direto)</li>
                  <li>Envie uma <strong>foto do produto</strong> na sequência manualmente</li>
                  <li>Não mencione preço na primeira mensagem</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-800 mb-2">📋 Qualidade da Lista</p>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Priorize clientes que compraram nos últimos 6 meses</li>
                  <li>Exporte do Bling: clientes + telefone</li>
                  <li>Remova números com DDD fora do Brasil</li>
                  <li>Liste com nome para personalização</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-800 mb-2">🎯 Estratégia de Reativação</p>
                <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded font-medium shrink-0">Dia 1</span>
                    <p className="text-xs">Mensagem de "oi sumiu" com novidades — objetivo: gerar resposta</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded font-medium shrink-0">Dia 3</span>
                    <p className="text-xs">Para quem não respondeu: enviar foto do produto mais vendido</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded font-medium shrink-0">Dia 7</span>
                    <p className="text-xs">Oferta especial com urgência real (estoque limitado)</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium mb-1">Aviso Importante</p>
                    <p>O Baileys simula o WhatsApp Web. Disparos muito rápidos ou listas muito grandes podem resultar em bloqueio temporário do número. Use com moderação e sempre respeite o usuário.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
