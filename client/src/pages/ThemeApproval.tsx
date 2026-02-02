import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ImageIcon,
  AlertCircle,
  Send,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const INFLUENCERS = [
  { id: 1, name: "Carol", color: "bg-pink-100", textColor: "text-pink-700" },
  { id: 2, name: "Renata", color: "bg-purple-100", textColor: "text-purple-700" },
  { id: 3, name: "Vanessa", color: "bg-blue-100", textColor: "text-blue-700" },
  { id: 4, name: "Luiza", color: "bg-amber-100", textColor: "text-amber-700" },
];

export default function ThemeApproval() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "create">("pending");
  const [newTheme, setNewTheme] = useState({
    theme: "",
    model: "",
    description: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const influencer = INFLUENCERS.find((inf) => inf.id === selectedInfluencer);

  // Get scheduled posts (pending approvals)
  const { data: scheduledData, refetch } = trpc.postScheduler.getScheduledPosts.useQuery(
    { influencerId: selectedInfluencer },
    { enabled: !!selectedInfluencer }
  );

  // Request theme approval mutation
  const requestThemeMutation = trpc.postScheduler.requestThemeApproval.useMutation({
    onSuccess: () => {
      setNewTheme({ theme: "", model: "", description: "", imageUrl: "" });
      refetch();
    },
  });

  // Approve theme mutation
  const approveMutation = trpc.postScheduler.approveThemeAndGenerate.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleRequestTheme = async () => {
    if (!newTheme.theme || !newTheme.model || !newTheme.description) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await requestThemeMutation.mutateAsync({
        influencerId: selectedInfluencer,
        theme: newTheme.theme,
        model: newTheme.model,
        description: newTheme.description,
        exampleImageUrl: newTheme.imageUrl || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTheme = async (approvalId: string) => {
    setLoading(true);
    try {
      await approveMutation.mutateAsync({
        approvalId,
        influencerId: selectedInfluencer,
        theme: newTheme.theme,
        model: newTheme.model,
        platforms: ["instagram", "tiktok", "youtube", "blog"],
      });
    } finally {
      setLoading(false);
    }
  };

  const posts = scheduledData?.posts || [];
  const pendingPosts = posts.filter((p: any) => p.status === "pending_approval");
  const approvedPosts = posts.filter((p: any) => p.status === "approved");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Aprovação de Temas e Modelos
          </h1>
          <p className="text-slate-600">
            Revise, aprove e personalize os temas de postagem para suas influenciadoras
          </p>
        </div>

        {/* Influencer Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {INFLUENCERS.map((inf) => (
            <Card
              key={inf.id}
              className={`cursor-pointer transition-all ${
                selectedInfluencer === inf.id
                  ? "ring-2 ring-pink-500 bg-pink-50"
                  : "hover:shadow-lg"
              }`}
              onClick={() => setSelectedInfluencer(inf.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${inf.textColor}`}>{inf.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "pending"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Pendentes ({pendingPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "approved"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 inline mr-2" />
            Aprovados ({approvedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === "create"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Criar Novo
          </button>
        </div>

        {/* Pending Approvals */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingPosts.length === 0 ? (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-600">
                    Nenhum tema pendente de aprovação para {influencer?.name}
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingPosts.map((post: any) => (
                <Card key={post.id} className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-amber-900">{post.theme}</CardTitle>
                        <CardDescription className="text-amber-800">
                          Modelo: {post.model}
                        </CardDescription>
                      </div>
                      <Badge className="bg-amber-600">Aguardando Aprovação</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-2">Descrição:</p>
                      <p className="text-slate-700">{post.content}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-2">
                        Plataformas:
                      </p>
                      <div className="flex gap-2">
                        {post.platforms.map((platform: string) => (
                          <Badge key={platform} variant="secondary" className="capitalize">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-2">
                        Agendado para:
                      </p>
                      <p className="text-slate-700">
                        {new Date(post.scheduledFor).toLocaleDateString("pt-BR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleApproveTheme(post.id)}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Aprovando...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Aprovar e Publicar
                          </>
                        )}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Approved Posts */}
        {activeTab === "approved" && (
          <div className="space-y-4">
            {approvedPosts.length === 0 ? (
              <Card className="bg-slate-50">
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">
                    Nenhum tema aprovado para {influencer?.name}
                  </p>
                </CardContent>
              </Card>
            ) : (
              approvedPosts.map((post: any) => (
                <Card key={post.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-green-900">{post.theme}</CardTitle>
                        <CardDescription className="text-green-800">
                          Modelo: {post.model}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-600">Aprovado</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <CheckCircle2 className="w-4 h-4" />
                      Será publicado em {post.platforms.join(", ")}
                    </div>
                    <p className="text-sm text-slate-600">
                      Agendado para{" "}
                      {new Date(post.scheduledFor).toLocaleDateString("pt-BR")}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Create New Theme */}
        {activeTab === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Tema para {influencer?.name}</CardTitle>
              <CardDescription>
                Defina um tema e modelo para a próxima postagem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Name */}
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Nome do Tema *
                </label>
                <Input
                  placeholder="Ex: Verão 2026, Coleção Premium, etc"
                  value={newTheme.theme}
                  onChange={(e) =>
                    setNewTheme({ ...newTheme, theme: e.target.value })
                  }
                  className="border-slate-300"
                />
              </div>

              {/* Model */}
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Modelo/Coleção *
                </label>
                <Input
                  placeholder="Ex: Básico, Premium, Edição Limitada, etc"
                  value={newTheme.model}
                  onChange={(e) =>
                    setNewTheme({ ...newTheme, model: e.target.value })
                  }
                  className="border-slate-300"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Descrição/Briefing *
                </label>
                <Textarea
                  placeholder="Descreva o tema, estilo, tom, público-alvo, etc. A IA usará isso para gerar conteúdo personalizado"
                  value={newTheme.description}
                  onChange={(e) =>
                    setNewTheme({ ...newTheme, description: e.target.value })
                  }
                  className="border-slate-300 min-h-32"
                />
              </div>

              {/* Example Image */}
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  URL da Imagem de Exemplo (opcional)
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newTheme.imageUrl}
                  onChange={(e) =>
                    setNewTheme({ ...newTheme, imageUrl: e.target.value })
                  }
                  className="border-slate-300"
                />
              </div>

              {/* Info Alert */}
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Após criar o tema, a IA gerará conteúdo personalizado para cada plataforma
                  (Instagram, TikTok, YouTube, Blog) e você poderá revisar antes de publicar.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                onClick={handleRequestTheme}
                disabled={
                  loading ||
                  !newTheme.theme ||
                  !newTheme.model ||
                  !newTheme.description
                }
                className="w-full bg-pink-600 hover:bg-pink-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Conteúdo...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Criar Tema e Gerar Conteúdo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
