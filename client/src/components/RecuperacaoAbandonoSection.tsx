import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, TrendingUp, Users, CheckCircle, Plus, Trash2, Play, RotateCcw } from "lucide-react";

export default function RecuperacaoAbandonoSection() {
  const { data: stats } = trpc.abandonoRecovery.stats.useQuery();
  const { data: sequencias = [], refetch: refetchSeqs } = trpc.abandonoRecovery.listarSequencias.useQuery();
  const { data: logs = [], refetch: refetchLogs } = trpc.abandonoRecovery.listarLogs.useQuery();
  const { data: defaults } = trpc.abandonoRecovery.defaultMessages.useQuery();

  const [showForm, setShowForm] = useState(false);
  const [showIniciar, setShowIniciar] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome: "",
    etapa1Horas: 1,
    etapa1Mensagem: "",
    etapa2Horas: 24,
    etapa2Mensagem: "",
    etapa3Horas: 72,
    etapa3Mensagem: "",
  });
  const [iniciarForm, setIniciarForm] = useState({ clienteNome: "", clienteWhatsapp: "", pedidoId: "" });

  const criar = trpc.abandonoRecovery.criarSequencia.useMutation({
    onSuccess: () => {
      toast.success("Sequência criada!");
      setShowForm(false);
      setForm({ nome: "", etapa1Horas: 1, etapa1Mensagem: "", etapa2Horas: 24, etapa2Mensagem: "", etapa3Horas: 72, etapa3Mensagem: "" });
      refetchSeqs();
    },
    onError: (e) => toast.error(e.message),
  });

  const deletar = trpc.abandonoRecovery.deletarSequencia.useMutation({
    onSuccess: () => { toast.success("Sequência removida"); refetchSeqs(); },
    onError: (e) => toast.error(e.message),
  });

  const toggleAtivo = trpc.abandonoRecovery.atualizarSequencia.useMutation({
    onSuccess: () => { refetchSeqs(); },
    onError: (e) => toast.error(e.message),
  });

  const iniciar = trpc.abandonoRecovery.iniciarRecuperacao.useMutation({
    onSuccess: (data) => {
      toast.success("Recuperação iniciada! Mensagem enviada.");
      setShowIniciar(null);
      setIniciarForm({ clienteNome: "", clienteWhatsapp: "", pedidoId: "" });
      refetchLogs();
    },
    onError: (e) => toast.error(e.message),
  });

  const converter = trpc.abandonoRecovery.marcarConvertido.useMutation({
    onSuccess: () => { toast.success("Marcado como convertido! 🎉"); refetchLogs(); },
    onError: (e) => toast.error(e.message),
  });

  const preencherDefaults = () => {
    if (!defaults) return;
    setForm(prev => ({
      ...prev,
      etapa1Mensagem: prev.etapa1Mensagem || defaults.etapa1,
      etapa2Mensagem: prev.etapa2Mensagem || defaults.etapa2,
      etapa3Mensagem: prev.etapa3Mensagem || defaults.etapa3,
    }));
  };

  const statusColor: Record<string, string> = {
    ativo: "bg-blue-100 text-blue-800",
    convertido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
    concluido: "bg-slate-100 text-slate-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Recuperação de Abandono</h2>
        <p className="text-slate-600 text-sm">Sequências automáticas de WhatsApp para recuperar pedidos não finalizados do Bling.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Iniciadas", valor: stats?.total ?? 0, icon: Users, cor: "text-blue-600" },
          { label: "Em Andamento", valor: stats?.ativos ?? 0, icon: MessageCircle, cor: "text-amber-600" },
          { label: "Convertidas", valor: stats?.convertidos ?? 0, icon: CheckCircle, cor: "text-green-600" },
          { label: "Taxa de Conversão", valor: `${stats?.taxaConversao ?? "0"}%`, icon: TrendingUp, cor: "text-purple-600" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600">{kpi.label}</p>
                <kpi.icon className={`w-4 h-4 ${kpi.cor}`} />
              </div>
              <p className={`text-2xl font-bold ${kpi.cor}`}>{kpi.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sequências */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sequências Configuradas</CardTitle>
              <CardDescription>Cada sequência envia mensagens em 3 momentos: 1h, 24h e 72h após o abandono</CardDescription>
            </div>
            <Button onClick={() => { setShowForm(!showForm); if (!showForm) preencherDefaults(); }} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Sequência
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulário */}
          {showForm && (
            <Card className="border-2 border-amber-300 bg-amber-50 p-4 space-y-4">
              <h3 className="font-semibold text-slate-900">Nova Sequência de Recuperação</h3>
              <div>
                <Label>Nome da Sequência</Label>
                <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Recuperação Padrão Atacado" className="mt-1" />
              </div>

              {[
                { etapa: 1, horas: form.etapa1Horas, msg: form.etapa1Mensagem, keyH: "etapa1Horas", keyM: "etapa1Mensagem" },
                { etapa: 2, horas: form.etapa2Horas, msg: form.etapa2Mensagem, keyH: "etapa2Horas", keyM: "etapa2Mensagem" },
                { etapa: 3, horas: form.etapa3Horas, msg: form.etapa3Mensagem, keyH: "etapa3Horas", keyM: "etapa3Mensagem" },
              ].map(({ etapa, horas, msg, keyH, keyM }) => (
                <div key={etapa} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-600">{etapa}ª Mensagem</Badge>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={horas}
                        onChange={e => setForm({ ...form, [keyH]: parseInt(e.target.value) || 1 })}
                        className="w-16 text-center text-sm"
                        min={1}
                      />
                      <span className="text-sm text-slate-600">hora(s) após abandono</span>
                    </div>
                  </div>
                  <Textarea
                    value={msg}
                    onChange={e => setForm({ ...form, [keyM]: e.target.value })}
                    placeholder="Use {nome} para personalizar com o nome do cliente"
                    rows={3}
                    className="text-sm"
                  />
                </div>
              ))}

              <div className="flex gap-2">
                <Button
                  onClick={() => criar.mutate(form)}
                  disabled={!form.nome.trim() || criar.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {criar.isPending ? "Salvando..." : "Salvar Sequência"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </Card>
          )}

          {/* Lista de sequências */}
          {sequencias.length === 0 && !showForm ? (
            <div className="text-center py-8 text-slate-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Nenhuma sequência configurada.</p>
              <p className="text-sm">Crie sua primeira sequência para começar a recuperar pedidos abandonados.</p>
            </div>
          ) : (
            sequencias.map((seq: any) => (
              <Card key={seq.id} className="border border-slate-200">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{seq.nome}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-slate-500">⏱️ {seq.etapa1Horas}h → {seq.etapa2Horas}h → {seq.etapa3Horas}h</span>
                        <Badge className={seq.ativo ? "bg-green-100 text-green-800 text-xs" : "bg-slate-100 text-slate-600 text-xs"}>
                          {seq.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowIniciar(showIniciar === seq.id ? null : seq.id)}
                        className="gap-1 text-xs"
                      >
                        <Play className="w-3 h-3" /> Iniciar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAtivo.mutate({ id: seq.id, ativo: !seq.ativo })}
                        className="text-xs"
                      >
                        {seq.ativo ? "Pausar" : "Ativar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletar.mutate({ id: seq.id })}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Formulário de iniciar recuperação */}
                  {showIniciar === seq.id && (
                    <div className="border-t border-slate-200 pt-3 space-y-3">
                      <p className="text-sm font-medium text-slate-700">Iniciar recuperação para:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Nome do cliente</Label>
                          <Input value={iniciarForm.clienteNome} onChange={e => setIniciarForm({ ...iniciarForm, clienteNome: e.target.value })} placeholder="Maria" className="mt-1 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs">WhatsApp</Label>
                          <Input value={iniciarForm.clienteWhatsapp} onChange={e => setIniciarForm({ ...iniciarForm, clienteWhatsapp: e.target.value })} placeholder="5511999999999" className="mt-1 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs">Pedido (opcional)</Label>
                          <Input value={iniciarForm.pedidoId} onChange={e => setIniciarForm({ ...iniciarForm, pedidoId: e.target.value })} placeholder="PED-001" className="mt-1 text-sm" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => iniciar.mutate({ sequenciaId: seq.id, ...iniciarForm })}
                          disabled={!iniciarForm.clienteNome || !iniciarForm.clienteWhatsapp || iniciar.isPending}
                          className="bg-green-600 hover:bg-green-700 text-xs gap-1"
                        >
                          <Play className="w-3 h-3" /> {iniciar.isPending ? "Iniciando..." : "Iniciar Agora"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowIniciar(null)} className="text-xs">Cancelar</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Histórico de Recuperações */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Recuperações</CardTitle>
            <CardDescription>Acompanhe o status de cada cliente em recuperação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.slice(0, 20).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{log.clienteNome}</p>
                    <p className="text-xs text-slate-500">{log.clienteWhatsapp}{log.pedidoId ? ` · ${log.pedidoId}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Etapa {log.etapaAtual}/3</span>
                    <Badge className={`text-xs ${statusColor[log.status] ?? "bg-slate-100"}`}>
                      {log.status}
                    </Badge>
                    {log.status === "ativo" && (
                      <Button size="sm" variant="outline" className="text-xs gap-1 text-green-700"
                        onClick={() => converter.mutate({ logId: log.id })}>
                        <RotateCcw className="w-3 h-3" /> Convertido
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-base">💡 Boas Práticas de Recuperação</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-slate-700">
          <p>✅ <strong>1h:</strong> Lembrete amigável — "Vi que você estava vendo nossos pijamas"</p>
          <p>✅ <strong>24h:</strong> Urgência suave — "Estoque limitado, não perca"</p>
          <p>✅ <strong>72h:</strong> Oferta especial — frete grátis ou desconto exclusivo</p>
          <p>✅ Personalize sempre com o nome: use <code className="bg-white px-1 rounded">{"{nome}"}</code> na mensagem</p>
          <p>✅ Marque como convertido quando o cliente finalizar o pedido para rastrear taxa de recuperação</p>
        </CardContent>
      </Card>
    </div>
  );
}
