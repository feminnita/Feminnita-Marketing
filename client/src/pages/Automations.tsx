import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Plus,
  Trash2,
  Edit2,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";

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
      nome: "WhatsApp Grupos VIP",
      tipo: "whatsapp",
      plataforma: "whatsapp",
      conteudo: "Promoção exclusiva para VIPs: 30% de desconto!",
      agendamento: "Toda segunda às 14:00",
      status: "ativo",
      proxima_execucao: "Segunda às 14:00",
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

  const handleAddAutomation = () => {
    if (!formData.nome || !formData.conteudo) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    if (editingId) {
      setAutomacoes(
        automacoes.map((a) =>
          a.id === editingId
            ? {
                ...a,
                ...formData,
                status: "agendado" as const,
              }
            : a
        )
      );
      setEditingId(null);
    } else {
      setAutomacoes([
        ...automacoes,
        {
          id: Date.now().toString(),
          ...formData,
          status: "agendado" as const,
          proxima_execucao: formData.agendamento,
        },
      ]);
    }

      setFormData({
        nome: "",
        tipo: "post" as const,
        plataforma: "instagram" as const,
        conteudo: "",
        agendamento: "",
      });
    setShowForm(false);
  };

  const handleEdit = (automacao: Automation) => {
    setFormData({
      nome: automacao.nome,
      tipo: automacao.tipo,
      plataforma: automacao.plataforma,
      conteudo: automacao.conteudo,
      agendamento: automacao.agendamento,
    });
    setEditingId(automacao.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta automação?")) {
      setAutomacoes(automacoes.filter((a) => a.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setAutomacoes(
      automacoes.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === "ativo" ? "pausado" : "ativo",
            }
          : a
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ativo":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pausado":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "agendado":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "pausado":
        return "Pausado";
      case "agendado":
        return "Agendado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automações de Conteúdo</h1>
          <p className="text-muted-foreground mt-2">
            Crie e gerencie automações de publicação em múltiplos canais
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              nome: "",
              tipo: "post",
              plataforma: "instagram",
              conteudo: "",
              agendamento: "",
            });
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Automação
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Editar Automação" : "Criar Nova Automação"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Automação</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Post Instagram Diário"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="conteudo">Conteúdo</Label>
              <Textarea
                id="conteudo"
                placeholder="Digite o conteúdo que será publicado..."
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddAutomation}>
                {editingId ? "Atualizar" : "Criar"} Automação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Automações */}
      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todas">Todas ({automacoes.length})</TabsTrigger>
          <TabsTrigger value="ativas">
            Ativas ({automacoes.filter((a) => a.status === "ativo").length})
          </TabsTrigger>
          <TabsTrigger value="pausadas">
            Pausadas ({automacoes.filter((a) => a.status === "pausado").length})
          </TabsTrigger>
          <TabsTrigger value="agendadas">
            Agendadas ({automacoes.filter((a) => a.status === "agendado").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          {automacoes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma automação criada. Crie uma para começar!
                </p>
              </CardContent>
            </Card>
          ) : (
            automacoes.map((automacao) => (
              <Card key={automacao.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(automacao.status)}
                        <h3 className="font-semibold">{automacao.nome}</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {automacao.plataforma}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{automacao.conteudo}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📅 {automacao.agendamento}</span>
                        {automacao.proxima_execucao && (
                          <span>⏰ Próxima: {automacao.proxima_execucao}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(automacao.id)}
                      >
                        {automacao.status === "ativo" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(automacao)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(automacao.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="ativas" className="space-y-4">
          {automacoes
            .filter((a) => a.status === "ativo")
            .map((automacao) => (
              <Card key={automacao.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{automacao.nome}</h3>
                      <p className="text-sm text-muted-foreground">{automacao.conteudo}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(automacao.id)}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="pausadas" className="space-y-4">
          {automacoes
            .filter((a) => a.status === "pausado")
            .map((automacao) => (
              <Card key={automacao.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{automacao.nome}</h3>
                      <p className="text-sm text-muted-foreground">{automacao.conteudo}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(automacao.id)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="agendadas" className="space-y-4">
          {automacoes
            .filter((a) => a.status === "agendado")
            .map((automacao) => (
              <Card key={automacao.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{automacao.nome}</h3>
                      <p className="text-sm text-muted-foreground">{automacao.conteudo}</p>
                      <p className="text-xs text-blue-600 mt-2">
                        Próxima execução: {automacao.proxima_execucao}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
