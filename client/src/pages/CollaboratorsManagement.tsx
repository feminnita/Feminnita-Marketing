import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, Edit2, Github } from "lucide-react";
import { toast } from "sonner";

export default function CollaboratorsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer" as const,
  });

  const { data: collaborators, isLoading, refetch } = trpc.collaborators.listCollaborators.useQuery();
  const createMutation = trpc.collaborators.createCollaborator.useMutation();
  const deleteMutation = trpc.collaborators.deleteCollaborator.useMutation();

  const handleCreateCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      toast.success("Colaborador criado com sucesso");
      setFormData({ name: "", email: "", password: "", role: "viewer" });
      setShowForm(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar colaborador");
    }
  };

  const handleDeleteCollaborator = async (id: any) => {
    try {
      await deleteMutation.mutateAsync({ collaboratorId: id });
      toast.success("Colaborador deletado com sucesso");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar colaborador");
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Colaboradores</h1>
          <p className="text-gray-600 mt-2">Gerencie os colaboradores da sua equipe</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Colaborador
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Colaborador</CardTitle>
            <CardDescription>Adicione um novo membro à sua equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCollaborator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do colaborador"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Senha segura"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Função</label>
                <Select value={formData.role} onValueChange={(role) => setFormData({ ...formData, role: role as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Colaborador"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Colaboradores</CardTitle>
          <CardDescription>Lista de todos os colaboradores da equipe</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Carregando colaboradores...</p>
          ) : !collaborators || collaborators.length === 0 ? (
            <p className="text-gray-500">Nenhum colaborador adicionado ainda</p>
          ) : (
            <div className="space-y-4">
              {collaborators.map((collaborator: any) => (
                <div key={collaborator.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{collaborator.name}</p>
                    <p className="text-sm text-gray-600">{collaborator.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Função: {collaborator.role}</p>
                  </div>
                  <div className="flex gap-2">
                    {/* GitHub button will be enabled after fixing router */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCollaborator(Number(collaborator.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
