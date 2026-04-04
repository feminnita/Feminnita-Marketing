import { useState } from "react";
import { getInfluencerCosmetics } from "@/lib/influencerCosmetics";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Heart, MessageCircle, Share2, Plus, Trash2, Edit2 } from "lucide-react";



export default function InfluencerProfilePage() {
  const [, params] = useRoute("/influenciadora/:id");
  const influencerId = params?.id ? parseInt(params.id) : 1;
  const { user, loading: authLoading } = useAuth();
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCaption, setNewPostCaption] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  // Fetch live influencer data from DB
  const { data: influencersData } = trpc.autonomousInfluencers.listInfluencers.useQuery();
  const dbInfluencer = influencersData?.influencers?.find((i: any) => i.id === influencerId);

  // Static cosmetics (colors, emoji) with DB name/bio taking priority
  const cosmetics = getInfluencerCosmetics(influencerId);
  const profile = dbInfluencer
    ? {
        ...cosmetics,
        name: dbInfluencer.name,
        title: dbInfluencer.personality ?? cosmetics.title ?? "",
        bio: dbInfluencer.bio ?? cosmetics.bio ?? "",
      }
    : cosmetics.name
    ? cosmetics
    : null;

  // Get posts for influencer
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = trpc.influencerBlog.getPosts.useQuery(
    { influencerId },
    { enabled: !!influencerId }
  );

  // Create post mutation
  const createPostMutation = trpc.influencerBlog.createPost.useMutation({
    onSuccess: () => {
      setNewPostContent("");
      setNewPostCaption("");
      refetchPosts();
    },
  });

  // Delete post mutation
  const deletePostMutation = trpc.influencerBlog.deletePost.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
  });

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      await createPostMutation.mutateAsync({
        influencerId,
        content: newPostContent,
        caption: newPostCaption,
        platform: "blog",
      });
    } catch (error) {
      console.error("Erro ao criar post:", error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePostMutation.mutateAsync({ postId });
    } catch (error) {
      console.error("Erro ao deletar post:", error);
    }
  };

  if (!profile) {
    return <div className="text-center py-8">Influenciadora não encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Profile */}
      <div className={`bg-gradient-to-r ${profile.color} text-white py-12`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-6xl">{profile.image}</div>
            <div>
              <h1 className="text-4xl font-bold">{profile.name}</h1>
              <p className="text-xl opacity-90">{profile.title}</p>
            </div>
          </div>
          <p className="text-lg max-w-2xl">{profile.bio}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Vida Dia a Dia */}
          <div className="lg:col-span-1 space-y-6">
            {/* Daily Life */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  Dia a Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(profile.dailyLife ?? []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-lg mt-1">✓</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Feminnita Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👗</span>
                  Feminnita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(profile.feminnita ?? []).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-lg">💝</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Novo Post</CardTitle>
                  <CardDescription>Compartilhe um momento da vida de {profile.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Conteúdo do Post</label>
                    <Textarea
                      placeholder={`Escreva sobre o dia a dia de ${profile.name}, como os pijamas Feminnita se encaixam na vida dela...`}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="mt-2 min-h-[150px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Legenda para Redes Sociais (opcional)</label>
                    <Input
                      placeholder="Legenda com hashtags e call-to-action..."
                      value={newPostCaption}
                      onChange={(e) => setNewPostCaption(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending || !newPostContent.trim()}
                    className="w-full"
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Publicar Post
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Posts Recentes</h2>

              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <p className="text-lg">Nenhum post publicado ainda</p>
                    <p className="text-sm">Seja o primeiro a compartilhar um momento!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post: any) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      {/* Post Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString("pt-BR") : "Data desconhecida"}
                          </p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                            post.status === "published"
                              ? "bg-green-100 text-green-800"
                              : post.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {post.status === "published"
                              ? "✓ Publicado"
                              : post.status === "scheduled"
                              ? "⏱ Agendado"
                              : "📝 Rascunho"}
                          </span>
                        </div>
                        {user && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePost(post.id)}
                            disabled={deletePostMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                        {post.caption && (
                          <p className="text-sm text-gray-600 italic mt-3 pt-3 border-t">"{post.caption}"</p>
                        )}

                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.hashtags.map((tag: any, idx: any) => (
                              <span key={idx} className="text-sm text-blue-600 hover:underline cursor-pointer">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Engagement */}
                      <div className="flex gap-4 pt-4 border-t text-gray-600">
                        <button className="flex items-center gap-2 hover:text-red-600 transition">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">Curtir</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-blue-600 transition">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">Comentar</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-green-600 transition">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">Compartilhar</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
