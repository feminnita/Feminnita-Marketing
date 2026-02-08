import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Instagram, Facebook, MessageCircle, Plus, Edit, Trash2, Send, AlertCircle, Download, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { preloadedPosts } from "@/data/preloadedPostsWithImages";
import { postsCreativos } from "@/data/postsCreativos";

interface ScheduledPost {
  id: string | number;
  caption: string;
  platforms: ("instagram" | "facebook" | "whatsapp")[];
  scheduledDate: string;
  scheduledTime: string;
  status: "draft" | "scheduled" | "published" | "failed";
  imageUrl?: string;
  carouselSlides?: number;
}

export default function SocialMediaScheduler() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);

  // Carregar postagens pré-carregadas na primeira vez
  useEffect(() => {
    if (!postsLoaded && preloadedPosts.length > 0) {
      const convertedPosts = preloadedPosts.map((post: any) => {
        const dateStr = post.scheduledDate instanceof Date 
          ? post.scheduledDate.toISOString().split('T')[0]
          : String(post.scheduledDate);
        return {
          id: String(post.id),
          caption: post.caption,
          platforms: post.platform,
          scheduledDate: dateStr,
          scheduledTime: post.scheduledTime,
          status: "scheduled" as const,
          imageUrl: post.type === 'single' ? post.imageUrl : (post.slides?.[0]?.imageUrl || ""),
          carouselSlides: post.type === 'carousel' ? post.slides?.length || 0 : 0,
        };
      });
      setPosts(convertedPosts);
      setPostsLoaded(true);
    }
  }, [postsLoaded]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [formData, setFormData] = useState({
    caption: "",
    platforms: ["instagram"] as ("instagram" | "facebook" | "whatsapp")[],
    scheduledDate: "",
    scheduledTime: "10:00",
    imageUrl: "",
    carouselSlides: 1,
  });

  const handleAddPost = () => {
    if (!formData.caption || !formData.scheduledDate) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const newPost: ScheduledPost = {
      id: String(Date.now()),
      ...formData,
      status: "scheduled",
    };

    setPosts([...posts, newPost]);
    setFormData({
      caption: "",
      platforms: ["instagram"],
      scheduledDate: "",
      scheduledTime: "10:00",
      imageUrl: "",
      carouselSlides: 1,
    });
  };

  const handleDeletePost = (id: string | number) => {
    setPosts(posts.filter((p) => p.id !== id));
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post);
  };

  const handleSaveEdit = () => {
    if (!editingPost) return;
    
    setPosts(posts.map((p) => (p.id === editingPost.id ? editingPost : p)));
    setEditingPost(null);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  const publishMutation = trpc.instagramPublish.publishPost.useMutation();

  const handlePublishNow = async (post: ScheduledPost) => {
    try {
      if (!post.imageUrl) {
        alert("Post sem imagem nao pode ser publicado");
        return;
      }

      const platformsToPublish = post.platforms.filter((p) => p !== "whatsapp") as ("instagram" | "facebook")[];

      if (platformsToPublish.length === 0) {
        alert("Selecione pelo menos Instagram ou Facebook para publicar");
        return;
      }

      const result = await publishMutation.mutateAsync({
        caption: post.caption,
        imageUrl: post.imageUrl,
        platforms: platformsToPublish,
      });

      if (result.success) {
        alert(`Publicado com sucesso em: ${platformsToPublish.join(", ")}`);
        setPosts(posts.map((p) => (p.id === post.id ? { ...p, status: "published" as const } : p)));
      } else {
        alert(`Erro ao publicar: ${result.error}`);
        setPosts(posts.map((p) => (p.id === post.id ? { ...p, status: "failed" as const } : p)));
      }
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert(`Erro ao publicar o post: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, status: "failed" as const } : p)));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "facebook":
        return <Facebook className="w-4 h-4" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Você precisa estar autenticado para acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📱 Agendador de Postagens</h1>
        <p className="text-gray-600">Crie, edite e agende postagens para Instagram, Facebook e WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Postagem
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const convertedPosts = postsCreativos.map((post: any) => ({
                    id: String(post.id),
                    caption: post.caption,
                    platforms: ["instagram", "facebook"] as ("instagram" | "facebook" | "whatsapp")[],
                    scheduledDate: post.scheduledDate.toISOString().split('T')[0],
                    scheduledTime: post.scheduledDate.toISOString().split('T')[1].substring(0, 5),
                    status: "scheduled" as const,
                    imageUrl: post.imageUrl,
                    carouselSlides: 1,
                  }));
                  setPosts(convertedPosts);
                }}
                className="w-full mt-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Carregar 15 Postagens Criativas
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Caption */}
              <div>
                <label className="block text-sm font-medium mb-2">Legenda *</label>
                <Textarea
                  placeholder="Digite a legenda do post..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>

              {/* Plataformas */}
              <div>
                <label className="block text-sm font-medium mb-2">Plataformas *</label>
                <div className="space-y-2">
                  {["instagram", "facebook", "whatsapp"].map((platform) => (
                    <label key={platform} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              platforms: [...formData.platforms, platform as any],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              platforms: formData.platforms.filter((p) => p !== platform),
                            });
                          }
                        }}
                      />
                      <span className="capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium mb-2">Data *</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Hora */}
              <div>
                <label className="block text-sm font-medium mb-2">Hora</label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <Input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Tipo de Post */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Post</label>
                <select
                  className="w-full border rounded-md p-2"
                  value={formData.carouselSlides}
                  onChange={(e) => setFormData({ ...formData, carouselSlides: parseInt(e.target.value) })}
                >
                  <option value="1">Foto Simples</option>
                  <option value="5">Carrossel (5 slides)</option>
                </select>
              </div>

              {/* URL da Imagem */}
              <div>
                <label className="block text-sm font-medium mb-2">URL da Imagem</label>
                <Input
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <Button onClick={handleAddPost} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Postagem
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Postagens */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500 space-y-4">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma postagem agendada ainda</p>
                    <Button
                      onClick={() => {
                        const convertedPosts = postsCreativos.map((post: any) => ({
                          id: String(post.id),
                          caption: post.caption,
                          platforms: ["instagram", "facebook"] as ("instagram" | "facebook" | "whatsapp")[],
                          scheduledDate: post.scheduledDate.toISOString().split('T')[0],
                          scheduledTime: post.scheduledDate.toISOString().split('T')[1].substring(0, 5),
                          status: "scheduled" as const,
                          imageUrl: post.imageUrl,
                          carouselSlides: 1,
                        }));
                        setPosts(convertedPosts);
                      }}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Carregar 15 Postagens Criativas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(post.status)}`}>
                            {post.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {post.carouselSlides === 1 ? "Foto Simples" : `Carrossel (${post.carouselSlides} slides)`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.scheduledDate).toLocaleDateString("pt-BR")} às {post.scheduledTime}
                        </div>
                        <div className="flex items-center gap-1">
                          {post.platforms.map((platform) => (
                            <div key={platform} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                              {getPlatformIcon(platform)}
                              <span className="text-xs capitalize">{platform}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">{post.caption}</p>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="Post" className="w-full h-40 object-cover rounded mb-4" />
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishNow(post)}
                        disabled={post.status === "published"}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Publicar Agora
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
                  <div className="text-sm text-gray-600">Total de Postagens</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{posts.filter((p) => p.status === "published").length}</div>
                  <div className="text-sm text-gray-600">Publicadas</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{posts.filter((p) => p.status === "scheduled").length}</div>
                  <div className="text-sm text-gray-600">Agendadas</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Editar Postagem</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Legenda */}
              <div>
                <label className="block text-sm font-medium mb-2">Legenda</label>
                <Textarea
                  value={editingPost.caption}
                  onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>

              {/* URL da Imagem */}
              <div>
                <label className="block text-sm font-medium mb-2">URL da Imagem</label>
                <Input
                  type="url"
                  value={editingPost.imageUrl || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, imageUrl: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              {/* Pré-visualização da Imagem */}
              {editingPost.imageUrl && (
                <div>
                  <label className="block text-sm font-medium mb-2">Pré-visualização</label>
                  <img 
                    src={editingPost.imageUrl} 
                    alt="Pré-visualização" 
                    className="w-full h-64 object-cover rounded" 
                  />
                </div>
              )}

              {/* Data */}
              <div>
                <label className="block text-sm font-medium mb-2">Data</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Input
                    type="date"
                    value={editingPost.scheduledDate}
                    onChange={(e) => setEditingPost({ ...editingPost, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Hora */}
              <div>
                <label className="block text-sm font-medium mb-2">Hora</label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <Input
                    type="time"
                    value={editingPost.scheduledTime}
                    onChange={(e) => setEditingPost({ ...editingPost, scheduledTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Plataformas */}
              <div>
                <label className="block text-sm font-medium mb-2">Plataformas</label>
                <div className="space-y-2">
                  {["instagram", "facebook", "whatsapp"].map((platform) => (
                    <label key={platform} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingPost.platforms.includes(platform as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingPost({
                              ...editingPost,
                              platforms: [...editingPost.platforms, platform as any],
                            });
                          } else {
                            setEditingPost({
                              ...editingPost,
                              platforms: editingPost.platforms.filter((p) => p !== platform),
                            });
                          }
                        }}
                      />
                      <span className="capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEdit}
                >
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
