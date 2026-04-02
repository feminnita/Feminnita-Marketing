import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Edit2, MessageSquare, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const BADGE_COLORS = [
  "bg-pink-100 text-pink-800",
  "bg-blue-100 text-blue-800",
  "bg-purple-100 text-purple-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-orange-100 text-orange-800",
];

export default function ApprovalDashboardPage() {
  const { data: influencersData } = trpc.autonomousInfluencers.listInfluencers.useQuery();
  const influencerMap = new Map(
    (influencersData?.influencers ?? []).map((inf: any, i: number) => [
      inf.id as number,
      { name: inf.name as string, color: BADGE_COLORS[i % BADGE_COLORS.length] },
    ])
  );
  const getInfluencerName = (id: number) => influencerMap.get(id)?.name ?? `Influenciadora #${id}`;
  const getInfluencerColor = (id: number) => influencerMap.get(id)?.color ?? "bg-gray-100 text-gray-800";
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [rejectPostId, setRejectPostId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Buscar posts pendentes
  const { data: pendingPosts = [] } = trpc.postApproval.listPendingPosts.useQuery({
    limit: 20,
  });

  // Buscar histórico de posts publicados
  const { data: publishedHistory = [] } = trpc.postApproval.getPublishedHistory.useQuery({
    limit: 20,
  });

  // Buscar estatísticas
  const { data: stats } = trpc.postApproval.getApprovalStats.useQuery();

  // Mutations
  const approveMutation = trpc.postApproval.approvePost.useMutation();
  const rejectMutation = trpc.postApproval.rejectPost.useMutation();
  const editMutation = trpc.postApproval.editPost.useMutation();

  const handleApprove = async (postId: number) => {
    try {
      await approveMutation.mutateAsync({
        postId,
        platforms: ["instagram", "tiktok"],
      });
      toast.success("Post aprovado com sucesso!");
    } catch (error) {
      toast.error("Erro ao aprovar post");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectPostId || !rejectReason.trim()) return;
    try {
      await rejectMutation.mutateAsync({ postId: rejectPostId, reason: rejectReason });
      toast.success("Post rejeitado!");
      setRejectPostId(null);
      setRejectReason("");
    } catch (error) {
      toast.error("Erro ao rejeitar post");
    }
  };

  const handleEdit = (post: any) => {
    setSelectedPost(post);
    setEditedCaption(post.caption);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (selectedPost) {
      try {
        await editMutation.mutateAsync({
          postId: selectedPost.id,
          caption: editedCaption,
        });
        toast.success("Post editado com sucesso!");
        setShowEditModal(false);
      } catch (error) {
        toast.error("Erro ao editar post");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Aprovação</h1>
        <p className="text-gray-600 mt-2">
          Visualize, aprove e edite os posts gerados pelas IAs antes de publicar
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Gerado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGenerated}</div>
              <p className="text-xs text-gray-500">posts gerados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Aprovados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalApproved}</div>
              <p className="text-xs text-gray-500">{stats.approvalRate}% taxa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Rejeitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalRejected}</div>
              <p className="text-xs text-gray-500">posts rejeitados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
              <p className="text-xs text-gray-500">aguardando aprovação</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Posts Pendentes ({pendingPosts.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Histórico de Publicados ({publishedHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* Posts Pendentes */}
        <TabsContent value="pending" className="space-y-4">
          {pendingPosts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">Nenhum post pendente de aprovação</p>
              </CardContent>
            </Card>
          ) : (
            pendingPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={getInfluencerColor(post.influencerId)}>
                          {getInfluencerName(post.influencerId)}
                        </Badge>
                        <Badge variant="outline">{post.topic}</Badge>
                      </div>
                      <CardDescription className="mt-2">
                        Criado em {new Date(post.createdAt).toLocaleString("pt-BR")}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{post.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Caption */}
                  <div>
                    <h4 className="font-semibold mb-2">Caption</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{post.caption}</p>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <h4 className="font-semibold mb-2">Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag: string) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Metadados */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Produto Mencionado:</span>
                      <p className="font-semibold">{post.productMention}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">CTA:</span>
                      <p className="font-semibold">{post.cta}</p>
                    </div>
                  </div>

                  {/* Plataformas */}
                  <div>
                    <h4 className="font-semibold mb-2">Plataformas</h4>
                    <div className="flex gap-2">
                      {post.platforms.map((platform: string) => (
                        <Badge key={platform} variant="outline">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(post.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(post)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => { setRejectPostId(post.id); setRejectReason(""); }}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Histórico de Publicados */}
        <TabsContent value="published" className="space-y-4">
          {publishedHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">Nenhum post publicado ainda</p>
              </CardContent>
            </Card>
          ) : (
            publishedHistory.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className={getInfluencerColor(post.influencerId)}>
                        {getInfluencerName(post.influencerId)}
                      </Badge>
                      <CardDescription className="mt-2">
                        Publicado em {new Date(post.publishedAt).toLocaleString("pt-BR")}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Publicado</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-700">{post.caption}</p>

                  {/* Engajamento */}
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded">
                    <div className="text-center">
                      <div className="text-xl font-bold">{post.engagement.likes}</div>
                      <div className="text-xs text-gray-600">Curtidas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{post.engagement.comments}</div>
                      <div className="text-xs text-gray-600">Comentários</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">{post.engagement.shares}</div>
                      <div className="text-xs text-gray-600">Compartilhamentos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      {showEditModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Editar Post</CardTitle>
              <CardDescription>
                Editando post de {getInfluencerName(selectedPost.influencerId)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Caption</label>
                <textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="w-full border rounded p-3 min-h-24"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveEdit}
                  disabled={editMutation.isPending}
                >
                  Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Rejeição */}
      {rejectPostId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Rejeitar Post</CardTitle>
              <CardDescription>Informe o motivo da rejeição</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Motivo</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Por que rejeitar este post?"
                  className="w-full border rounded p-3 min-h-24"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleRejectSubmit}
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                >
                  Confirmar Rejeição
                </Button>
                <Button variant="outline" onClick={() => setRejectPostId(null)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
