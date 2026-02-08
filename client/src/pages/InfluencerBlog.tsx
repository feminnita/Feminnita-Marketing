import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Send, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BlogPost {
  id: number;
  influencerId: number;
  platform: string;
  content: string;
  caption: string;
  mediaUrls?: string[];
  hashtags?: string[];
  scheduledAt?: Date;
  publishedAt?: Date;
  status: "draft" | "scheduled" | "published" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export default function InfluencerBlog() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<number>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  const [formData, setFormData] = useState({
    content: "",
    caption: "",
    hashtags: "",
    scheduledAt: "",
    platform: "instagram",
  });

  // Fetch influencers
  const { data: influencers = [] } = trpc.influencers.list.useQuery();
  
  // Fetch posts for selected influencer
  const { data: posts = [], refetch: refetchPosts } = trpc.influencerBlog.getPosts.useQuery({
    influencerId: selectedInfluencer,
  });

  // Create/Update post mutation
  const createPostMutation = trpc.influencerBlog.createPost.useMutation({
    onSuccess: () => {
      refetchPosts();
      resetForm();
      setIsCreating(false);
    },
  });

  // Delete post mutation
  const deletePostMutation = trpc.influencerBlog.deletePost.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
  });

  // Publish now mutation
  const publishNowMutation = trpc.influencerBlog.publishNow.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
  });

  const resetForm = () => {
    setFormData({
      content: "",
      caption: "",
      hashtags: "",
      scheduledAt: "",
      platform: "instagram",
    });
    setEditingPost(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduledAt = formData.scheduledAt ? new Date(formData.scheduledAt) : undefined;
    const hashtags = formData.hashtags.split(",").map(h => h.trim()).filter(h => h);

    if (editingPost) {
      // Update post
      await createPostMutation.mutateAsync({
        id: editingPost.id,
        influencerId: selectedInfluencer,
        content: formData.content,
        caption: formData.caption,
        hashtags,
        scheduledAt,
        platform: formData.platform,
      });
    } else {
      // Create new post
      await createPostMutation.mutateAsync({
        influencerId: selectedInfluencer,
        content: formData.content,
        caption: formData.caption,
        hashtags,
        scheduledAt,
        platform: formData.platform,
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      content: post.content,
      caption: post.caption || "",
      hashtags: post.hashtags?.join(", ") || "",
      scheduledAt: post.scheduledAt ? format(new Date(post.scheduledAt), "yyyy-MM-dd'T'HH:mm") : "",
      platform: post.platform,
    });
    setIsCreating(true);
  };

  const handleDelete = (postId: number) => {
    if (confirm("Tem certeza que deseja deletar este post?")) {
      deletePostMutation.mutate({ postId });
    }
  };

  const handlePublishNow = (postId: number) => {
    publishNowMutation.mutate({ postId });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Blog das Influencers</h1>
        <p className="text-gray-600">Gerencie e agende publicações para cada influencer</p>
      </div>

      {/* Influencer Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione a Influencer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {influencers.map((influencer: any) => (
              <Button
                key={influencer.id}
                variant={selectedInfluencer === influencer.id ? "default" : "outline"}
                onClick={() => setSelectedInfluencer(influencer.id)}
              >
                {influencer.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Post Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPost ? "Editar Post" : "Novo Post"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Plataforma</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                  <option value="blog">Blog</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Conteúdo</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite o conteúdo do post..."
                  rows={5}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Legenda</label>
                <Textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Digite a legenda do post..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hashtags</label>
                <Input
                  value={formData.hashtags}
                  onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                  placeholder="#feminnita, #pijamas, #moda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Agendar para</label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  placeholder="Data e hora da publicação"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createPostMutation.isPending}>
                  {editingPost ? "Atualizar" : "Criar"} Post
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsCreating(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Novo Post
          </Button>
        )}

        {posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Nenhum post criado ainda</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post: BlogPost) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{post.caption || "Sem título"}</CardTitle>
                    <CardDescription>
                      {format(new Date(post.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(post.status)}>
                    {post.status === "published" && "Publicado"}
                    {post.status === "scheduled" && "Agendado"}
                    {post.status === "draft" && "Rascunho"}
                    {post.status === "failed" && "Falha"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Conteúdo:</p>
                  <p className="text-gray-700">{post.content}</p>
                </div>

                {post.hashtags && post.hashtags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Hashtags:</p>
                    <div className="flex gap-2 flex-wrap">
                      {post.hashtags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {post.scheduledAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Agendado para:{" "}
                      {format(new Date(post.scheduledAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  {post.status === "draft" && (
                    <>
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
                        onClick={() => handlePublishNow(post.id)}
                        disabled={publishNowMutation.isPending}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Publicar Agora
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
