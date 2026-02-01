import { useState } from "react";
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
import { Zap, Trash2, Edit2, Play, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Automation {
  id: string;
  nome: string;
  tipo: "post" | "mensagem" | "email" | "whatsapp";
  plataforma: "instagram" | "facebook" | "tiktok" | "whatsapp" | "email";
  conteudo: string;
  agendamento: string;
  status: "ativo" | "pausado" | "agendado";
  proxima_execucao?: string;
}

export default function Automations() {
  const [automacoes, setAutomacoes] = useState<Automation[]>([
    {
      id: "1",
      nome: "Post Instagram Diário",
      tipo: "post",
      plataforma: "instagram",
      conteudo: "Novo look da semana! 👗✨",
      agendamento: "Diariamente às 10:00",
      status: "ativo",
      proxima_execucao: "Hoje às 10:00",
    },
    {
      id: "2",
      nome: "WhatsApp VIP",
      tipo: "mensagem",
      plataforma: "whatsapp",
      conteudo: "Olá! Temos uma promoção especial para você 🎉",
      agendamento: "Terças e Quintas às 14:00",
      status: "ativo",
      proxima_execucao: "Terça às 14:00",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    nome: string;
    tipo: "post" | "mensagem" | "email" | "whatsapp";
    plataforma: "instagram" | "facebook" | "tiktok" | "whatsapp" | "email";
    conteudo: string;
    agendamento: string;
  }>({
    nome: "",
    tipo: "post",
    plataforma: "instagram",
    conteudo: "",
    agendamento: "",
  });

  // Usar tRPC para criar automação
  const criarMutation = trpc.automations.criar.useMutation({
    onSuccess: (result: any) => {
      setAutomacoes([
        ...automacoes,
        {
          ...result,
          status: "agendado",
          proxima_execucao: "Próxima execução: " + formData.agendamento,
        },
      ]);
      resetForm();
    },
  });

  // Usar tRPC para executar automação
  const executarMutation = trpc.automations.executar.useMutation({
    onSuccess: (result: any) => {
      alert(result.mensagem);
    },
  });

  // Usar tRPC para atualizar automação
  const atualizarMutation = trpc.automations.atualizar.useMutation({
    onSuccess: (result: any) => {
      if (editingId) {
        setAutomacoes(
          automacoes.map((a) =>
            a.id === editingId ? { ...a, ...formData } : a
          )
        );
      }
      resetForm();
    },
  });

  // Usar tRPC para deletar automação
  const deletarMutation = trpc.automations.deletar.useMutation({
    onSuccess: (result: any) => {
      setAutomacoes(automacoes.filter((a) => a.id !== editingId));
      alert(result.mensagem);
    },
  });

  const handleAddAutomation = () => {
    if (!formData.nome || !formData.conteudo) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    if (editingId) {
      atualizarMutation.mutate({
        id: editingId,
        nome: formData.nome,
        conteudo: formData.conteudo,
        agendamento: formData.agendamento,
      });
    } else {
      criarMutation.mutate(formData);
    }
  };

  const handleEdit = (automacao: Automation) => {
    setEditingId(automacao.id);
    setFormData({
      nome: automacao.nome,
      tipo: automacao.tipo,
      plataforma: automacao.plataforma,
      conteudo: automacao.conteudo,
      agendamento: automacao.agendamento,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta automação?")) {
      setEditingId(id);
      deletarMutation.mutate({ id });
    }
  };

  const handleExecute = (automacao: Automation) => {
    executarMutation.mutate({
      id: automacao.id,
      plataforma: automacao.plataforma,
      conteudo: automacao.conteudo,
    });
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "post" as const,
      plataforma: "instagram" as const,
      conteudo: "",
      agendamento: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8" />
            Automações de Conteúdo
          </h1>
          <p className="text-gray-600 mt-2">
            Crie e gerencie automações para publicar conteúdo automaticamente
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Nova Automação
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>
              {editingId ? "Editar Automação" : "Nova Automação"}
            </CardTitle>
            <CardDescription>
              Configure os detalhes da automação de conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Automação</Label>
              <Input
                id="nome"
                placeholder="Ex: Post Instagram Diário"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Conteúdo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, tipo: value as any })
                  }
                >
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="mensagem">Mensagem</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plataforma">Plataforma</Label>
                <Select
                  value={formData.plataforma}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, plataforma: value as any })
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="conteudo">Conteúdo</Label>
              <Textarea
                id="conteudo"
                placeholder="Digite o conteúdo que será publicado..."
                value={formData.conteudo}
                onChange={(e) =>
                  setFormData({ ...formData, conteudo: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agendamento">Agendamento</Label>
              <Input
                id="agendamento"
                placeholder="Ex: Diariamente às 10:00"
                value={formData.agendamento}
                onChange={(e) =>
                  setFormData({ ...formData, agendamento: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddAutomation}
                className="bg-green-600 hover:bg-green-700"
                disabled={criarMutation.isPending || atualizarMutation.isPending}
              >
                {editingId ? "Atualizar" : "Criar"} Automação
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
        {automacoes.map((automacao) => (
          <Card key={automacao.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {automacao.nome}
                    {automacao.status === "ativo" && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {automacao.tipo} • {automacao.plataforma} • {automacao.agendamento}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExecute(automacao)}
                    disabled={executarMutation.isPending}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Executar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(automacao)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(automacao.id)}
                    disabled={deletarMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-3">{automacao.conteudo}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Status: {automacao.status}</span>
                {automacao.proxima_execucao && (
                  <span>{automacao.proxima_execucao}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
