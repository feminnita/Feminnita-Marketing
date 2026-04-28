import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Plus, Loader2, Play, Pause, Trash2, Sparkles } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ativo:    { label: 'Ativo',    color: 'bg-green-100 text-green-700' },
  pausado:  { label: 'Pausado',  color: 'bg-yellow-100 text-yellow-700' },
  agendado: { label: 'Agendado', color: 'bg-blue-100 text-blue-700' },
};

const TEMPLATES = [
  { label: "Boas-vindas",   body: "Olá! 👋 Bem-vinda à Feminnita! Sua loja de pijamas favorita. Precisa de ajuda ou quer ver nossa coleção? Estamos aqui!" },
  { label: "Pedido pronto", body: "Oi! 🎉 Boa notícia: seu pedido Feminnita está pronto para envio. Em breve você vai receber o código de rastreamento. Qualquer dúvida, é só falar!" },
  { label: "Abandono",      body: "Oi! Você deixou produtos no carrinho. 🛒 Ainda tem interesse? Posso ajudar com tamanhos, cores ou condições especiais?" },
  { label: "Pós-compra",    body: "Oi! 💛 Você recebeu seu pijama Feminnita? Adoramos saber como foi! Deixa uma avaliação e ganhe 5% na próxima compra." },
];

export function IntegracaoWhatsAppSection() {
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [body, setBody] = useState("");
  const [schedule, setSchedule] = useState("");

  const { data: automacoes = [], isLoading, refetch } = trpc.automations.listar.useQuery();
  type Auto = (typeof automacoes)[number];
  const wppAutomacoes = automacoes.filter((a: Auto) => a.tipo === "whatsapp" || a.plataforma === "whatsapp");

  const criar = trpc.automations.criar.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setNome(""); setBody(""); setSchedule(""); },
  });
  const atualizar = trpc.automations.atualizar.useMutation({ onSuccess: () => refetch() });
  const deletar = trpc.automations.deletar.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>WhatsApp</h2>
          <p className="text-slate-500 text-sm mt-1">Mensagens automáticas para clientes — boas-vindas, abandono, pós-venda.</p>
        </div>
        <Button style={{ backgroundColor: '#6B1D28' }} className="text-white" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nova Automação
        </Button>
      </div>

      {/* Aviso de configuração */}
      <div className="rounded-xl p-4 border border-amber-200 bg-amber-50 flex items-start gap-3">
        <MessageCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Conectar WhatsApp Business API</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Para enviar mensagens reais configure <code className="bg-amber-100 px-1 rounded">WHATSAPP_ACCESS_TOKEN</code> e{" "}
            <code className="bg-amber-100 px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</code> no arquivo <strong>.env</strong>.
          </p>
        </div>
      </div>

      {/* Templates rápidos */}
      <div>
        <p className="text-sm font-medium text-slate-600 mb-3">Templates prontos</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.label}
              onClick={() => { setNome(t.label); setBody(t.body); setShowForm(true); }}
              className="p-3 rounded-xl border border-slate-200 hover:border-green-400 text-left transition-all group">
              <MessageCircle className="w-4 h-4 mb-2 text-slate-400 group-hover:text-green-500 transition-colors" />
              <p className="text-sm font-medium text-slate-700">{t.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{t.body}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              Nova automação WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Nome da automação</label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Boas-vindas novo cliente" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Mensagem</label>
              <Textarea rows={4} value={body} onChange={e => setBody(e.target.value)}
                placeholder="Texto da mensagem WhatsApp..." />
              <p className="text-xs text-slate-400 mt-1">{body.length} caracteres</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Gatilho / Agendamento</label>
              <Input value={schedule} onChange={e => setSchedule(e.target.value)}
                placeholder="Ex: novo pedido, abandono 2h, pós-entrega 3d..." />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button className="flex-1 text-white" style={{ backgroundColor: '#25D366' }}
                disabled={criar.isPending || !nome.trim() || !body.trim()}
                onClick={() => criar.mutate({ nome, tipo: "whatsapp", plataforma: "whatsapp", conteudo: body, agendamento: schedule || "manual" })}>
                {criar.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Salvar Automação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista */}
      <div>
        <p className="text-sm font-medium text-slate-600 mb-3">
          Automações ativas
          {wppAutomacoes.length > 0 && <Badge variant="secondary" className="ml-2">{wppAutomacoes.length}</Badge>}
        </p>

        {isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-green-500" /></div>}

        {!isLoading && wppAutomacoes.length === 0 && (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma automação ainda. Use um template acima.</p>
          </div>
        )}

        <div className="space-y-3">
          {wppAutomacoes.map((auto: Auto) => {
            const status = STATUS_CONFIG[auto.status ?? 'pausado'] ?? STATUS_CONFIG.pausado;
            return (
              <div key={auto.id} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="p-2 rounded-lg bg-green-50">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-800 text-sm">{auto.nome}</p>
                    <Badge className={`${status.color} border-0 text-xs`}>{status.label}</Badge>
                  </div>
                  {auto.conteudo && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{auto.conteudo}</p>}
                  {auto.agendamento && <p className="text-xs text-slate-400 mt-1">⚡ {auto.agendamento}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => atualizar.mutate({ id: auto.id, status: auto.status === 'ativo' ? 'pausado' : 'ativo' })}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    {auto.status === 'ativo'
                      ? <Pause className="w-3.5 h-3.5 text-slate-500" />
                      : <Play className="w-3.5 h-3.5 text-green-600" />
                    }
                  </button>
                  <button onClick={() => deletar.mutate({ id: auto.id })}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
