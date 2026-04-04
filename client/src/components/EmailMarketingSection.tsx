import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Plus, Loader2, Sparkles, Play, Pause, Trash2 } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ativo:    { label: 'Ativo',    color: 'bg-green-100 text-green-700' },
  pausado:  { label: 'Pausado',  color: 'bg-yellow-100 text-yellow-700' },
  agendado: { label: 'Agendado', color: 'bg-blue-100 text-blue-700' },
};

const TEMPLATE_SUGGESTIONS = [
  { label: "Boas-vindas",    subject: "Bem-vinda à Feminnita! 🎉", body: "Olá! Seja bem-vinda à Feminnita. Preparamos uma seleção especial de pijamas para você. Confira nossa coleção e aproveite 10% de desconto na sua primeira compra." },
  { label: "Nova coleção",   subject: "Nova coleção chegou! 🌙",    body: "A nova coleção Feminnita chegou com tudo! Pijamas macios, elegantes e perfeitos para o inverno. Corra antes que acabe." },
  { label: "Abandono",       subject: "Você esqueceu algo 😊",      body: "Notamos que você deixou itens no carrinho. Seus pijamas favoritos ainda estão esperando por você. Complete sua compra e ganhe frete grátis." },
  { label: "Promoção",       subject: "Oferta especial só hoje! ⏰", body: "Por tempo limitado, 20% de desconto em toda a linha de pijamas Feminnita. Use o cupom FEMINNITA20 no checkout." },
];

export function EmailMarketingSection() {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [schedule, setSchedule] = useState("");

  const { data: automacoes = [], isLoading, refetch } = trpc.automations.listar.useQuery();
  type Auto = (typeof automacoes)[number];
  const emailAutomacoes = automacoes.filter((a: Auto) => a.tipo === "email" || a.plataforma === "email");

  const criar = trpc.automations.criar.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setSubject(""); setBody(""); setSchedule(""); },
  });
  const atualizar = trpc.automations.atualizar.useMutation({ onSuccess: () => refetch() });
  const deletar = trpc.automations.deletar.useMutation({ onSuccess: () => refetch() });

  const applyTemplate = (t: typeof TEMPLATE_SUGGESTIONS[0]) => {
    setSubject(t.subject);
    setBody(t.body);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Email Marketing</h2>
          <p className="text-slate-500 text-sm mt-1">Crie e agende campanhas de email para sua base de clientes.</p>
        </div>
        <Button style={{ backgroundColor: '#8B2635' }} className="text-white" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nova Campanha
        </Button>
      </div>

      {/* Templates rápidos */}
      <div>
        <p className="text-sm font-medium text-slate-600 mb-3">Templates prontos</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TEMPLATE_SUGGESTIONS.map(t => (
            <button key={t.label} onClick={() => applyTemplate(t)}
              className="p-3 rounded-xl border border-slate-200 hover:border-current text-left transition-all group"
              style={{ '--tw-border-opacity': 1 } as any}>
              <Mail className="w-4 h-4 mb-2 text-slate-400 group-hover:text-current transition-colors" style={{ color: undefined }} />
              <p className="text-sm font-medium text-slate-700">{t.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{t.subject}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4" style={{ color: '#8B2635' }} />
              Nova campanha de email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Assunto</label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Assunto do email..." />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Conteúdo</label>
              <Textarea rows={5} value={body} onChange={e => setBody(e.target.value)} placeholder="Corpo do email..." />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Agendamento</label>
              <Input value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="Ex: imediato, diário 09:00, semana..." />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button className="flex-1 text-white" style={{ backgroundColor: '#8B2635' }}
                disabled={criar.isPending || !subject.trim() || !body.trim()}
                onClick={() => criar.mutate({ nome: subject, tipo: "email", plataforma: "email", conteudo: body, agendamento: schedule || "manual" })}>
                {criar.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Criar Campanha
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de campanhas */}
      <div>
        <p className="text-sm font-medium text-slate-600 mb-3">
          Campanhas cadastradas
          {emailAutomacoes.length > 0 && <Badge variant="secondary" className="ml-2">{emailAutomacoes.length}</Badge>}
        </p>

        {isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8B2635' }} /></div>}

        {!isLoading && emailAutomacoes.length === 0 && (
          <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma campanha ainda. Use um template acima para começar.</p>
          </div>
        )}

        <div className="space-y-3">
          {emailAutomacoes.map((camp: Auto) => {
            const status = STATUS_CONFIG[camp.status ?? 'pausado'] ?? STATUS_CONFIG.pausado;
            return (
              <div key={camp.id} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#fdf0e8' }}>
                  <Mail className="w-4 h-4" style={{ color: '#8B2635' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-800 text-sm truncate">{camp.nome}</p>
                    <Badge className={`${status.color} border-0 text-xs`}>{status.label}</Badge>
                  </div>
                  {camp.conteudo && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{camp.conteudo}</p>}
                  {camp.agendamento && <p className="text-xs text-slate-400 mt-1">📅 {camp.agendamento}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => atualizar.mutate({ id: camp.id, status: camp.status === 'ativo' ? 'pausado' : 'ativo' })}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    title={camp.status === 'ativo' ? 'Pausar' : 'Ativar'}>
                    {camp.status === 'ativo'
                      ? <Pause className="w-3.5 h-3.5 text-slate-500" />
                      : <Play className="w-3.5 h-3.5 text-green-600" />
                    }
                  </button>
                  <button onClick={() => deletar.mutate({ id: camp.id })}
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
