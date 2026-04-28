import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Mail, Zap, Users, Clock, Send, Plus, Loader2, Play, Pause, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TEMPLATES = [
  { label: "Carrinho Abandonado", subject: "Você esqueceu algo 😊", body: "Olá! Notamos que você deixou itens no carrinho. Seus pijamas favoritos ainda estão esperando. Complete sua compra e ganhe frete grátis." },
  { label: "Pós-Compra Upsell",   subject: "Obrigada pela sua compra! 💕", body: "Sua compra foi confirmada. Que tal completar o look? Selecionamos peças que combinam perfeitamente com o que você escolheu." },
  { label: "Reengajamento",       subject: "Sentimos sua falta! 🌙", body: "Faz um tempinho que você não nos visita. Preparamos uma seleção especial com 15% de desconto exclusivo para você." },
  { label: "Nova Coleção",        subject: "Nova coleção chegou! ✨", body: "A coleção mais esperada do ano chegou! Pijamas macios, elegantes e perfeitos. Seja a primeira a conferir." },
];

const TIMING_TIPS = [
  { dia: "Terça", hora: "10h", taxa: "38%", desc: "Pico de abertura" },
  { dia: "Quarta", hora: "14h", taxa: "35%", desc: "Pós-almoço" },
  { dia: "Quinta", hora: "10h", taxa: "36%", desc: "Pré-fim de semana" },
  { dia: "Sexta", hora: "17h", taxa: "42%", desc: "Maior conversão" },
];

export function AutomacaoEmailInteligenteSection() {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [schedule, setSchedule] = useState("");

  const { data: automacoes = [], isLoading, refetch } = trpc.automations.listar.useQuery();
  type Auto = (typeof automacoes)[number];
  const emailAutos = automacoes.filter((a: Auto) => a.tipo === "email" || a.plataforma === "email");

  const criar = trpc.automations.criar.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setSubject(""); setBody(""); setSchedule(""); },
  });
  const atualizar = trpc.automations.atualizar.useMutation({ onSuccess: () => refetch() });
  const deletar = trpc.automations.deletar.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Automação de Email</h2>
          <p className="text-slate-500 text-sm mt-1">Fluxos automáticos que enviam o email certo, na hora certa.</p>
        </div>
        <Button style={{ backgroundColor: '#6B1D28' }} className="text-white" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-0 shadow-sm border-l-4" style={{ borderLeftColor: '#6B1D28' }}>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => { setSubject(t.subject); setBody(t.body); }}
                  className="p-2 text-xs border rounded-lg hover:bg-slate-50 text-left transition-colors">
                  <p className="font-medium text-slate-700">{t.label}</p>
                  <p className="text-slate-400 truncate">{t.subject}</p>
                </button>
              ))}
            </div>
            <Input placeholder="Assunto do email" value={subject} onChange={e => setSubject(e.target.value)} />
            <Textarea placeholder="Corpo do email..." value={body} onChange={e => setBody(e.target.value)} rows={3} />
            <div className="flex gap-3 flex-wrap">
              <Input type="datetime-local" value={schedule} onChange={e => setSchedule(e.target.value)} className="flex-1" />
              <Button style={{ backgroundColor: '#6B1D28' }} className="text-white"
                disabled={!subject || !body || criar.isPending}
                onClick={() => criar.mutate({ nome: subject, tipo: "email", plataforma: "email", conteudo: body, agendamento: schedule })}>
                {criar.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Criar
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real automations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-600">
            {isLoading ? "Carregando..." : `${emailAutos.length} automação${emailAutos.length !== 1 ? 'ões' : ''} de email`}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />Atualizar
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: '#6B1D28' }} /></div>
        ) : emailAutos.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
            <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-slate-500 text-sm">Nenhuma automação de email criada.</p>
            <p className="text-xs text-slate-400 mt-1">Clique em "Nova Automação" para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emailAutos.map((a: Auto) => (
              <Card key={a.id} className="border-0 shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <p className="font-medium text-slate-800 text-sm truncate">
                          {a.nome ?? "Sem assunto"}
                        </p>
                        <Badge className={a.status === 'ativo' ? 'bg-green-100 text-green-700 border-0' : 'bg-yellow-100 text-yellow-700 border-0'}>
                          {a.status === 'ativo' ? 'Ativo' : 'Pausado'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 ml-6">
                        {a.conteudo?.slice(0, 80) ?? ""}...
                      </p>
                      {a.agendamento && (
                        <p className="text-xs text-slate-400 ml-6 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(a.agendamento).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="outline"
                        disabled={atualizar.isPending}
                        onClick={() => atualizar.mutate({ id: a.id, status: a.status === 'ativo' ? 'pausado' : 'ativo' })}>
                        {a.status === 'ativo' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700"
                        disabled={deletar.isPending}
                        onClick={() => deletar.mutate({ id: a.id })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Timing guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Horários com Maior Taxa de Abertura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TIMING_TIPS.map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="font-bold text-slate-800 text-sm">{t.dia} {t.hora}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                <p className="text-lg font-bold mt-1" style={{ color: '#6B1D28' }}>{t.taxa}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Persona personalization */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            Personalização por Persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { persona: "Carol",   estilo: "Descontraído, emojis, casual",        cta: "Aproveita agora!" },
              { persona: "Renata",  estilo: "Elegante, profissional, qualidade",    cta: "Descobrir coleção" },
              { persona: "Vanessa", estilo: "Acolhedor, prático, benefícios",       cta: "Ver recomendações" },
              { persona: "Luiza",   estilo: "Criativo, viral, urgência",            cta: "Ser a primeira" },
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: ['#6B1D28','#A63D4A','#6B7A3A','#3A5A6B'][i] }}>
                  {p.persona[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.persona}</p>
                  <p className="text-xs text-slate-500">{p.estilo}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: '#6B1D28' }}>CTA: {p.cta}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
