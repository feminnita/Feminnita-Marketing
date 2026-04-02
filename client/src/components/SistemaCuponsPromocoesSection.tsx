import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ticket, Plus, Copy, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const TIPO_LABELS: Record<string, string> = {
  percentual: "Desconto %",
  valor_fixo: "Valor Fixo",
  frete_gratis: "Frete Grátis",
};

export default function SistemaCuponsPromocoesSection() {
  const { data: cupons = [], refetch } = trpc.cupons.listar.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [form, setForm] = useState({
    codigo: "",
    desconto: "",
    tipo: "percentual" as "percentual" | "valor_fixo" | "frete_gratis",
    persona: "",
    campanha: "",
    maxUsos: "",
    dataExpiracao: "",
  });

  const criar = trpc.cupons.criar.useMutation({
    onSuccess: () => {
      toast.success("Cupom criado!");
      setShowForm(false);
      setForm({ codigo: "", desconto: "", tipo: "percentual", persona: "", campanha: "", maxUsos: "", dataExpiracao: "" });
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const deletar = trpc.cupons.deletar.useMutation({
    onSuccess: () => { toast.success("Cupom removido"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const atualizar = trpc.cupons.atualizar.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error(e.message),
  });

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  const totalUsos = (cupons as any[]).reduce((s, c) => s + (c.usos ?? 0), 0);
  const ativos = (cupons as any[]).filter(c => c.ativo).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sistema de Cupons e Promoções</h2>
        <p className="text-slate-600 text-sm">
          Crie e gerencie cupons por persona e campanha. Rastreie usos e otimize o que converte mais.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-slate-500 mb-1">Total de Cupons</p>
          <p className="text-2xl font-bold text-purple-600">{(cupons as any[]).length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-slate-500 mb-1">Cupons Ativos</p>
          <p className="text-2xl font-bold text-green-600">{ativos}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-slate-500 mb-1">Total de Usos</p>
          <p className="text-2xl font-bold text-amber-600">{totalUsos.toLocaleString("pt-BR")}</p>
        </CardContent></Card>
      </div>

      {/* Cupons existentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-600" />
                Cupons Cadastrados
              </CardTitle>
              <CardDescription>Clique no código para copiar</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Cupom
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulário */}
          {showForm && (
            <Card className="border-2 border-amber-300 bg-amber-50 p-4 space-y-4">
              <h3 className="font-semibold text-slate-900">Novo Cupom</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Código *</Label>
                  <Input
                    value={form.codigo}
                    onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                    placeholder="Ex: INVERNO20"
                    className="mt-1 text-sm font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs">Tipo *</Label>
                  <select
                    value={form.tipo}
                    onChange={e => setForm({ ...form, tipo: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
                  >
                    <option value="percentual">Desconto %</option>
                    <option value="valor_fixo">Valor Fixo (R$)</option>
                    <option value="frete_gratis">Frete Grátis</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Desconto *</Label>
                  <Input
                    value={form.desconto}
                    onChange={e => setForm({ ...form, desconto: e.target.value })}
                    placeholder={form.tipo === "percentual" ? "20%" : form.tipo === "valor_fixo" ? "R$ 40" : "Frete Grátis"}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Persona</Label>
                  <Input
                    value={form.persona}
                    onChange={e => setForm({ ...form, persona: e.target.value })}
                    placeholder="Ex: Carol, Renata, Todos"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Campanha</Label>
                  <Input
                    value={form.campanha}
                    onChange={e => setForm({ ...form, campanha: e.target.value })}
                    placeholder="Ex: Renda Extra, Lojistas"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Máx. Usos (opcional)</Label>
                  <Input
                    type="number"
                    value={form.maxUsos}
                    onChange={e => setForm({ ...form, maxUsos: e.target.value })}
                    placeholder="Ilimitado"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Expiração (opcional)</Label>
                  <Input
                    type="date"
                    value={form.dataExpiracao}
                    onChange={e => setForm({ ...form, dataExpiracao: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => criar.mutate({
                    codigo: form.codigo,
                    desconto: form.desconto,
                    tipo: form.tipo,
                    persona: form.persona || undefined,
                    campanha: form.campanha || undefined,
                    maxUsos: form.maxUsos ? parseInt(form.maxUsos) : undefined,
                    dataExpiracao: form.dataExpiracao || undefined,
                  })}
                  disabled={!form.codigo.trim() || !form.desconto.trim() || criar.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {criar.isPending ? "Salvando..." : "Salvar Cupom"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </Card>
          )}

          {/* Lista */}
          {(cupons as any[]).length === 0 && !showForm ? (
            <div className="text-center py-8 text-slate-500">
              <Ticket className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Nenhum cupom criado ainda.</p>
              <p className="text-sm">Crie seu primeiro cupom para rastrear conversões por campanha.</p>
            </div>
          ) : (
            (cupons as any[]).map((cupom: any) => (
              <div key={cupom.id} className="border-2 border-slate-200 rounded-lg p-4 hover:border-purple-300 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <button
                        onClick={() => copiarCodigo(cupom.codigo)}
                        className="bg-slate-900 text-white px-3 py-1 rounded text-sm font-bold font-mono hover:bg-slate-700 transition flex items-center gap-1"
                      >
                        {cupom.codigo}
                        {copiado === cupom.codigo ? " ✓" : <Copy className="w-3 h-3 ml-1" />}
                      </button>
                      <Badge className="bg-amber-600 text-xs">{cupom.desconto}</Badge>
                      <Badge variant="outline" className="text-xs">{TIPO_LABELS[cupom.tipo] ?? cupom.tipo}</Badge>
                      <Badge className={cupom.ativo ? "bg-green-100 text-green-800 text-xs" : "bg-slate-100 text-slate-600 text-xs"}>
                        {cupom.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    {(cupom.persona || cupom.campanha) && (
                      <p className="text-xs text-slate-500">
                        {cupom.persona && `👤 ${cupom.persona}`}
                        {cupom.persona && cupom.campanha && " · "}
                        {cupom.campanha && `📢 ${cupom.campanha}`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => atualizar.mutate({ id: cupom.id, ativo: !cupom.ativo })}
                      className="text-xs h-7 px-2"
                      title={cupom.ativo ? "Pausar" : "Ativar"}
                    >
                      {cupom.ativo ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletar.mutate({ id: cupom.id })}
                      className="text-red-600 hover:bg-red-50 h-7 px-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="text-slate-500">Usos</p>
                    <p className="font-bold text-blue-600">{cupom.usos ?? 0}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-500">Máx. Usos</p>
                    <p className="font-bold">{cupom.maxUsos ? cupom.maxUsos.toLocaleString("pt-BR") : "∞"}</p>
                  </div>
                  <div className="p-2 bg-orange-50 rounded">
                    <p className="text-slate-500">Expira</p>
                    <p className="font-bold text-orange-600">{cupom.dataExpiracao ?? "—"}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="bg-green-50 border-green-200 p-4">
        <h4 className="font-semibold text-sm mb-3">✅ Boas Práticas de Cupons</h4>
        <ul className="text-sm space-y-2 text-slate-700">
          <li>• <strong>Crie 1 cupom por persona</strong> — assim você sabe qual canal converte mais</li>
          <li>• <strong>Teste tipos diferentes</strong> — % vs valor fixo vs frete grátis</li>
          <li>• <strong>Defina expiração</strong> — cria urgência e controla promoções sazonais</li>
          <li>• <strong>Limite de usos</strong> — garante exclusividade para cupons especiais</li>
          <li>• <strong>Cupons de reabastecimento</strong> — reativam clientes inativos</li>
        </ul>
      </Card>
    </div>
  );
}
