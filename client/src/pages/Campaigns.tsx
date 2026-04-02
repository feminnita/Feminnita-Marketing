import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, Trash2, Edit2, Play, Pause } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Campaign {
  id: string;
  nome: string;
  plataforma: "instagram" | "facebook" | "tiktok" | "whatsapp" | "email";
  orcamento: number;
  publico_alvo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  status: "rascunho" | "planejamento" | "ativa" | "pausada" | "finalizada";
  performance?: {
    impressoes: number;
    cliques: number;
    conversoes: number;
    roi: number;
  };
}

export default function Campaigns() {
  const { data: dbCampanhas = [], refetch: refetchCampanhas } = trpc.campaigns.listar.useQuery();
  const [campanhas, setCampanhas] = useState<Campaign[]>([]);

  useEffect(() => {
    if (dbCampanhas.length > 0) setCampanhas(dbCampanhas as Campaign[]);
  }, [dbCampanhas]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    nome: string;
    plataforma: "instagram" | "facebook" | "tiktok" | "whatsapp" | "email";
    orcamento: number;
    publico_alvo: string;
    descricao: string;
    data_inicio: string;
    data_fim: string;
  }>({
    nome: "",
    plataforma: "instagram",
    orcamento: 0,
    publico_alvo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
  });

  const criarMutation = trpc.campaigns.criar.useMutation({
    onSuccess: () => {
      refetchCampanhas();
      resetForm();
    },
  });

  const atualizarMutation = trpc.campaigns.atualizar.useMutation({
    onSuccess: () => {
      refetchCampanhas();
      resetForm();
    },
  });

  const deletarMutation = trpc.campaigns.deletar.useMutation({
    onSuccess: (result: any) => {
      refetchCampanhas();
      toast.success(result.mensagem);
    },
  });

  const publicarMutation = trpc.campaigns.publicar.useMutation({
    onSuccess: (result: any) => {
      toast.success(result.mensagem);
    },
  });

  const pausarMutation = trpc.campaigns.pausar.useMutation({
    onSuccess: (result: any) => {
      toast.success(result.mensagem);
    },
  });

  const handleSaveCampaign = () => {
    if (!formData.nome || !formData.descricao) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      atualizarMutation.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      criarMutation.mutate(formData);
    }
  };

  const handleEdit = (campanha: Campaign) => {
    setEditingId(campanha.id);
    setFormData({
      nome: campanha.nome,
      plataforma: campanha.plataforma,
      orcamento: campanha.orcamento,
      publico_alvo: campanha.publico_alvo,
      descricao: campanha.descricao,
      data_inicio: campanha.data_inicio,
      data_fim: campanha.data_fim,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setEditingId(id);
    deletarMutation.mutate({ id });
  };

  const handlePublish = (id: string) => {
    publicarMutation.mutate({ id });
  };

  const handlePause = (id: string) => {
    pausarMutation.mutate({ id });
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      plataforma: "instagram" as const,
      orcamento: 0,
      publico_alvo: "",
      descricao: "",
      data_inicio: "",
      data_fim: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Campanhas de Marketing
          </h1>
          <p className="text-gray-600 mt-2">
            Crie, edite e gerencie suas campanhas de publicidade
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nova Campanha
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>
              {editingId ? "Editar Campanha" : "Nova Campanha"}
            </CardTitle>
            <CardDescription>
              Configure os detalhes da sua campanha de marketing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Campanha *</Label>
              <Input
                id="nome"
                placeholder="Ex: Campanha Verão 2026"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plataforma">Plataforma</Label>
                <Select
                  value={formData.plataforma}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, plataforma: value })
                  }
                >
                  <SelectTrigger id="plataforma">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orcamento">Orçamento (R$)</Label>
                <Input
                  id="orcamento"
                  type="number"
                  placeholder="5000"
                  value={formData.orcamento}
                  onChange={(e) =>
                    setFormData({ ...formData, orcamento: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publico_alvo">Público-Alvo</Label>
              <Input
                id="publico_alvo"
                placeholder="Ex: Mulheres 18-45 anos"
                value={formData.publico_alvo}
                onChange={(e) =>
                  setFormData({ ...formData, publico_alvo: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva os objetivos e detalhes da campanha..."
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, data_inicio: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) =>
                    setFormData({ ...formData, data_fim: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveCampaign}
                className="bg-green-600 hover:bg-green-700"
                disabled={criarMutation.isPending || atualizarMutation.isPending}
              >
                {editingId ? "Atualizar" : "Criar"} Campanha
              </Button>
              <Button
                onClick={resetForm}
                variant="outline"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {campanhas.map((campanha) => (
          <Card key={campanha.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{campanha.nome}</CardTitle>
                  <CardDescription className="mt-1">
                    {campanha.plataforma} • {campanha.publico_alvo}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {campanha.status === "rascunho" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePublish(campanha.id)}
                      disabled={publicarMutation.isPending}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Publicar
                    </Button>
                  )}
                  {campanha.status === "ativa" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePause(campanha.id)}
                      disabled={pausarMutation.isPending}
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pausar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(campanha)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(campanha.id)}
                    disabled={deletarMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">{campanha.descricao}</p>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Orçamento</p>
                  <p className="font-semibold">R$ {campanha.orcamento.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Período</p>
                  <p className="font-semibold">{campanha.data_inicio} a {campanha.data_fim}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{campanha.status}</p>
                </div>
                {campanha.performance && (
                  <div>
                    <p className="text-gray-500">ROI</p>
                    <p className="font-semibold text-green-600">{campanha.performance.roi}x</p>
                  </div>
                )}
              </div>

              {campanha.performance && (
                <div className="grid grid-cols-3 gap-4 text-sm border-t pt-3">
                  <div>
                    <p className="text-gray-500">Impressões</p>
                    <p className="font-semibold">{campanha.performance.impressoes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cliques</p>
                    <p className="font-semibold">{campanha.performance.cliques.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Conversões</p>
                    <p className="font-semibold">{campanha.performance.conversoes.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
