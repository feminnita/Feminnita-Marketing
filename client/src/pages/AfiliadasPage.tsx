import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, TrendingUp, DollarSign, Star, Copy, Plus, X, Award } from "lucide-react";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

type NivelKey = "bronze" | "prata" | "ouro" | "diamante";

const nivelConfig: Record<NivelKey, { label: string; className: string }> = {
  bronze:   { label: "Bronze",   className: "bg-amber-100 text-amber-800 border-amber-300" },
  prata:    { label: "Prata",    className: "bg-slate-100 text-slate-700 border-slate-300" },
  ouro:     { label: "Ouro",     className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  diamante: { label: "Diamante", className: "bg-blue-100 text-blue-800 border-blue-300" },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  ativa:    { label: "Ativa",    className: "bg-green-100 text-green-800" },
  inativa:  { label: "Inativa",  className: "bg-red-100 text-red-800" },
  pendente: { label: "Pendente", className: "bg-orange-100 text-orange-800" },
};

export default function AfiliadasPage() {
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editStatusId, setEditStatusId] = useState<number | null>(null);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    cidade: "",
    estado: "",
    comissaoPercent: "10",
    observacoes: "",
  });

  const utils = trpc.useUtils();

  const { data: stats } = trpc.afiliadas.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const { data: lista = [], isLoading } = trpc.afiliadas.listar.useQuery(undefined, { refetchInterval: 30_000 });

  const criarMutation = trpc.afiliadas.criar.useMutation({
    onSuccess: () => {
      toast.success("Afiliada cadastrada com sucesso!");
      utils.afiliadas.listar.invalidate();
      utils.afiliadas.stats.invalidate();
      setShowForm(false);
      setForm({ nome: "", email: "", whatsapp: "", cidade: "", estado: "", comissaoPercent: "10", observacoes: "" });
    },
    onError: (err) => toast.error("Erro ao cadastrar afiliada: " + err.message),
  });

  const atualizarMutation = trpc.afiliadas.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.afiliadas.listar.invalidate();
      utils.afiliadas.stats.invalidate();
      setEditStatusId(null);
    },
    onError: (err) => toast.error("Erro ao atualizar: " + err.message),
  });

  const deletarMutation = trpc.afiliadas.deletar.useMutation({
    onSuccess: () => {
      toast.success("Afiliada removida.");
      utils.afiliadas.listar.invalidate();
      utils.afiliadas.stats.invalidate();
      setConfirmDeleteId(null);
    },
    onError: (err) => toast.error("Erro ao remover: " + err.message),
  });

  const handleSalvar = () => {
    if (!form.nome.trim() || form.nome.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres.");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("E-mail inválido.");
      return;
    }
    criarMutation.mutate({
      nome: form.nome.trim(),
      email: form.email || undefined,
      whatsapp: form.whatsapp || undefined,
      cidade: form.cidade || undefined,
      estado: form.estado || undefined,
      comissaoPercent: form.comissaoPercent || "10",
      observacoes: form.observacoes || undefined,
    });
  };

  const handleCopyLink = (linkCode: string) => {
    const url = `${window.location.origin}/ref/${linkCode}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copiado!");
    }).catch(() => {
      toast.error("Não foi possível copiar o link.");
    });
  };

  const handleChangeStatus = (id: number, status: "ativa" | "inativa" | "pendente") => {
    atualizarMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    deletarMutation.mutate({ id });
  };

  // Top 5 ranking por totalVendas
  const ranking = [...lista].sort((a, b) => (b.totalVendas ?? 0) - (a.totalVendas ?? 0)).slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Afiliadas / Revendedoras</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie seu programa de afiliadas e acompanhe o desempenho</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Nova Afiliada"}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Afiliadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ativas</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.ativas ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalVendas ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Comissões Devidas</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {Number(stats?.totalComissoes ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de cadastro */}
      {showForm && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">Cadastrar Nova Afiliada</CardTitle>
            <CardDescription>Preencha os dados da nova afiliada/revendedora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="nome">Nome <span className="text-red-500">*</span></Label>
                <Input
                  id="nome"
                  placeholder="Nome completo"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="(00) 00000-0000"
                  value={form.whatsapp}
                  onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="Cidade"
                  value={form.cidade}
                  onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  value={form.estado}
                  onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione</option>
                  {UFS.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="comissao">Comissão (%)</Label>
                <Input
                  id="comissao"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="10"
                  value={form.comissaoPercent}
                  onChange={e => setForm(f => ({ ...f, comissaoPercent: e.target.value }))}
                />
              </div>
              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <Label htmlFor="observacoes">Observações</Label>
                <textarea
                  id="observacoes"
                  placeholder="Observações adicionais..."
                  value={form.observacoes}
                  onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSalvar} disabled={criarMutation.isPending}>
                {criarMutation.isPending ? "Salvando..." : "Salvar Afiliada"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de afiliadas */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Todas as Afiliadas</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-5">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : lista.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="pt-10 pb-10 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhuma afiliada cadastrada</p>
                <p className="text-gray-400 text-sm mt-1">Clique em "Nova Afiliada" para começar seu programa</p>
              </CardContent>
            </Card>
          ) : (
            lista.map(afiliada => {
              const nivel = (afiliada.nivel ?? "bronze") as NivelKey;
              const nConfig = nivelConfig[nivel] ?? nivelConfig.bronze;
              const sConfig = statusConfig[afiliada.status] ?? statusConfig.pendente;
              const isConfirmingDelete = confirmDeleteId === afiliada.id;
              const isEditingStatus = editStatusId === afiliada.id;

              return (
                <Card key={afiliada.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{afiliada.nome}</h3>
                          <Badge className={`text-xs border ${nConfig.className}`}>{nConfig.label}</Badge>
                          <Badge className={`text-xs ${sConfig.className}`}>{sConfig.label}</Badge>
                        </div>

                        <div className="text-sm text-gray-500 space-y-0.5">
                          {(afiliada.cidade || afiliada.estado) && (
                            <p>{[afiliada.cidade, afiliada.estado].filter(Boolean).join(", ")}</p>
                          )}
                          {afiliada.email && <p>{afiliada.email}</p>}
                          {afiliada.whatsapp && <p>{afiliada.whatsapp}</p>}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <span className="text-gray-600">
                            <span className="font-medium text-gray-900">{afiliada.totalVendas ?? 0}</span> vendas
                          </span>
                          <span className="text-gray-600">
                            Receita: <span className="font-medium text-gray-900">
                              R$ {Number(afiliada.totalReceita ?? "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </span>
                          <span className="text-gray-600">
                            Comissão: <span className="font-medium text-gray-900">{afiliada.comissaoPercent ?? "10"}%</span>
                          </span>
                        </div>

                        {/* Link de rastreamento */}
                        <div className="mt-3 flex items-center gap-2">
                          <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded truncate max-w-xs">
                            /ref/{afiliada.linkCode}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-gray-500 hover:text-gray-800"
                            onClick={() => handleCopyLink(afiliada.linkCode)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* Mudar status */}
                        {isEditingStatus ? (
                          <div className="flex flex-col gap-1">
                            {(["ativa", "inativa", "pendente"] as const).map(s => (
                              <button
                                key={s}
                                onClick={() => handleChangeStatus(afiliada.id, s)}
                                disabled={atualizarMutation.isPending}
                                className={`text-xs px-2 py-1 rounded border cursor-pointer hover:opacity-80 ${statusConfig[s].className}`}
                              >
                                {statusConfig[s].label}
                              </button>
                            ))}
                            <button
                              onClick={() => setEditStatusId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setEditStatusId(afiliada.id)}
                          >
                            Editar Status
                          </Button>
                        )}

                        {/* Deletar */}
                        {isConfirmingDelete ? (
                          <div className="flex flex-col items-end gap-1">
                            <p className="text-xs text-red-600 font-medium">Confirmar exclusão?</p>
                            <div className="flex gap-1">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={() => handleDelete(afiliada.id)}
                                disabled={deletarMutation.isPending}
                              >
                                Sim
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Não
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setConfirmDeleteId(afiliada.id)}
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Ranking */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Ranking Top 5
          </h2>

          {ranking.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="pt-6 pb-6 text-center">
                <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Sem dados de ranking ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ranking.map((afiliada, index) => {
                const nivel = (afiliada.nivel ?? "bronze") as NivelKey;
                const nConfig = nivelConfig[nivel] ?? nivelConfig.bronze;
                const posColors = ["text-yellow-500", "text-slate-400", "text-amber-600", "text-gray-500", "text-gray-400"];

                return (
                  <Card key={afiliada.id} className={index === 0 ? "border-yellow-200 bg-yellow-50/30" : ""}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-xl font-bold w-6 text-center shrink-0 ${posColors[index] ?? "text-gray-400"}`}>
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900 text-sm truncate">{afiliada.nome}</p>
                            <Badge className={`text-xs border ${nConfig.className}`}>{nConfig.label}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {afiliada.totalVendas ?? 0} vendas •{" "}
                            R$ {Number(afiliada.totalReceita ?? "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
