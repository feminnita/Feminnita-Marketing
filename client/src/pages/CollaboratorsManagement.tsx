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
  const connectGitHubMutation = trpc.collaborators.connectGitHub.useMutation();

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

  const handleDeleteCollaborator = async (collaboratorId: number) => {
    if (!confirm("Tem certeza que deseja deletar este colaborador?")) return;

    try {
      await deleteMutation.mutateAsync({ collaboratorId });
      toast.success("Colaborador deletado com sucesso");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar colaborador");
    }
  };

  const handleConnectGitHub = async (collaboratorId: number) => {
    // Simular conexão com GitHub
    const githubId = prompt("Digite seu GitHub ID:");
    const githubUsername = prompt("Digite seu GitHub username:");

    if (!githubId || !githubUsername) return;

    try {
      await connectGitHubMutation.mutateAsync({
        collaboratorId,
        githubId,
        githubUsername,
      });
      toast.success("GitHub conectado com sucesso");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao conectar GitHub");
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8" style={{ color: "#A63D4A" }} />
            Gerenciamento de Colaboradores
          </h1>
          <p className="text-slate-600 mt-2">Crie e gerencie colaboradores da sua equipe</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
          style={{ backgroundColor: "#A63D4A" }}
        >
          <Plus className="w-4 h-4" />
          Novo Colaborador
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8 border-amber-200">
          <CardHeader>
            <CardTitle>Criar Novo Colaborador</CardTitle>
            <CardDescription>Adicione um novo membro à sua equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCollaborator} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Senha</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Função</label>
                  <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      <SelectItem value="viewer">Visualizador</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button type="submit" style={{ backgroundColor: "#A63D4A" }}>
                    Criar Colaborador
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-slate-600 mb-3">Ou conecte com GitHub:</p>
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full gap-2 border-slate-300 hover:bg-slate-50"
                    onClick={() => {
                      const clientId = "YOUR_GITHUB_CLIENT_ID";
                      const redirectUri = `${window.location.origin}/auth/github/callback`;
                      const scope = "user:email";
                      const state = Math.random().toString(36).substring(7);
                      sessionStorage.setItem("github_oauth_state", state);
                      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
                    }}
                  >
                    <Github className="w-4 h-4" />
                    Conectar com GitHub
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-slate-600">Carregando colaboradores...</p>
          </div>
        ) : collaborators && collaborators.length > 0 ? (
          collaborators.map((collab: any) => (
            <Card key={collab.id} className="border-amber-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{collab.name}</CardTitle>
                <CardDescription>{collab.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Função:</span>
                  <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: "#FFF3E0", color: "#A63D4A" }}>
                    {collab.role === "admin" ? "Administrador" : collab.role === "editor" ? "Editor" : "Visualizador"}
                  </span>
                </div>
                
                {collab.githubUsername && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Github className="w-4 h-4" />
                    <span>{collab.githubUsername}</span>
                  </div>
                )}

                {collab.lastLogin && (
                  <div className="text-xs text-slate-500">
                    Último acesso: {new Date(collab.lastLogin).toLocaleDateString("pt-BR")}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConnectGitHub(collab.id)}
                    className="flex-1 gap-1"
                  >
                    <Github className="w-3 h-3" />
                    GitHub
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCollaborator(collab.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-slate-600">Nenhum colaborador cadastrado ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
