import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, RefreshCw } from "lucide-react";

const PERSONAS = [
  { id: "carol", label: "Carol — Mãe Moderna", tone: "Acolhedor, autêntico" },
  { id: "renata", label: "Renata — Executiva Elegante", tone: "Profissional, sofisticado" },
  { id: "vanessa", label: "Vanessa — Criativa Artística", tone: "Criativo, inspirador" },
  { id: "luiza", label: "Luiza — Fitness Aventureira", tone: "Energético, motivador" },
  { id: "generico", label: "Genérico — Marca Feminnita", tone: "Acolhedor e premium" },
] as const;

const TIPOS = [
  { id: "product", label: "Produto" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "tip", label: "Dica" },
  { id: "story", label: "Story/Reel" },
] as const;

const HASHTAGS_MARCA = [
  "#Feminnita", "#PijamaConforto", "#RendaExtra", "#ModaFeminina",
  "#PijamaFeminino", "#QualidadePremium", "#InvernoConforto", "#CompraColetiva",
  "#FeminnItaPijamas", "#ConfortoÉTudo",
];

export default function GeradorConteudoIASection() {
  const [form, setForm] = useState({
    persona: "carol" as typeof PERSONAS[number]["id"],
    topic: "",
    type: "product" as typeof TIPOS[number]["id"],
    productName: "",
  });
  const [copiadoIdx, setCopiadoIdx] = useState(-1);

  const gerar = trpc.aiContentGenerator.generateCaptionFree.useMutation({
    onError: (e) => toast.error(e.message),
  });

  const handleCopiar = (texto: string, idx: number) => {
    navigator.clipboard.writeText(texto);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx(-1), 2000);
  };

  const personaAtual = PERSONAS.find(p => p.id === form.persona);

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            Gerador de Conteúdo com IA
          </CardTitle>
          <CardDescription>
            Gere legendas autênticas e engajadoras com IA para cada persona da Feminnita.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulário */}
          <Card className="p-4 bg-white space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold mb-1 block">Persona</Label>
                <select
                  value={form.persona}
                  onChange={e => setForm({ ...form, persona: e.target.value as typeof form.persona })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  {PERSONAS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                {personaAtual && (
                  <p className="text-xs text-slate-500 mt-1">Tom: {personaAtual.tone}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1 block">Tipo de Conteúdo</Label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as typeof form.type })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1 block">Tema / Assunto *</Label>
                <Input
                  value={form.topic}
                  onChange={e => setForm({ ...form, topic: e.target.value })}
                  placeholder="Ex: Lançamento coleção inverno, Renda extra..."
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1 block">Produto (opcional)</Label>
                <Input
                  value={form.productName}
                  onChange={e => setForm({ ...form, productName: e.target.value })}
                  placeholder="Ex: Pijama Suede Rosa"
                  className="text-sm"
                />
              </div>
            </div>
            <Button
              onClick={() => gerar.mutate(form)}
              disabled={!form.topic.trim() || gerar.isPending}
              className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
            >
              <Sparkles className="w-4 h-4" />
              {gerar.isPending ? "Gerando com IA..." : "Gerar 3 Legendas com IA"}
            </Button>
          </Card>

          {/* Legendas geradas */}
          {gerar.data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">✨ Legendas Geradas pela IA</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => gerar.mutate(form)}
                  disabled={gerar.isPending}
                  className="gap-1 text-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regerar
                </Button>
              </div>
              {gerar.data.captions.map((cap, idx) => (
                <Card key={idx} className="p-4 border border-amber-200 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-amber-600 text-xs">{cap.approach}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopiar(`${cap.text}\n\n${cap.hashtags.join(" ")}`, idx)}
                      className="text-xs gap-1 h-7"
                    >
                      {copiadoIdx === idx ? "✓ Copiado" : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-900 mb-3 leading-relaxed">{cap.text}</p>
                  <div className="flex flex-wrap gap-1">
                    {cap.hashtags.map((h, hi) => (
                      <span key={hi} className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{h}</span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!gerar.data && !gerar.isPending && (
            <div className="text-center py-10 text-slate-400">
              <Sparkles className="w-10 h-10 mx-auto mb-3 text-amber-300" />
              <p className="text-sm">Preencha o formulário acima e clique em "Gerar" para criar legendas reais com IA.</p>
            </div>
          )}

          {/* Hashtags da marca para copiar rapidamente */}
          <div>
            <h3 className="font-semibold text-sm mb-3">🏷️ Hashtags da Marca</h3>
            <div className="flex flex-wrap gap-2">
              {HASHTAGS_MARCA.map((h, i) => (
                <button
                  key={i}
                  onClick={() => handleCopiar(h, 100 + i)}
                  className="text-xs bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-3 py-1 rounded-full transition-colors"
                >
                  {copiadoIdx === 100 + i ? "✓" : h}
                </button>
              ))}
            </div>
          </div>

          {/* Dicas */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">✅ Dicas para Máximo Engajamento</h4>
            <ul className="text-sm space-y-2 text-slate-700">
              <li>• <strong>Primeira linha impactante</strong> — 80% das pessoas leem só o início</li>
              <li>• <strong>CTA clara</strong> (clique, comente, compartilhe) — aumenta conversão</li>
              <li>• <strong>Emojis estratégicos</strong> — humanizam e aumentam engajamento</li>
              <li>• <strong>3-5 hashtags relevantes</strong> — use as da marca + trending</li>
              <li>• <strong>Gere variações</strong> — teste abordagens diferentes e veja qual performa melhor</li>
            </ul>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
