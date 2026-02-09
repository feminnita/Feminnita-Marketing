import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Plus, Trash2, Send } from "lucide-react";

const INFLUENCERS = [
  { id: 1, name: "Carol", color: "bg-pink-100" },
  { id: 2, name: "Renata", color: "bg-purple-100" },
  { id: 3, name: "Vanessa", color: "bg-blue-100" },
  { id: 4, name: "Luiza", color: "bg-green-100" },
];

export default function InfluencerBlogsPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedInfluencer, setSelectedInfluencer] = useState(1);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCaption, setNewPostCaption] = useState("");

  // Get posts for selected influencer
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = trpc.influencerBlog.getPosts.useQuery(
    { influencerId: selectedInfluencer },
    { enabled: !!selectedInfluencer }
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

  // Publish post mutation
  const publishPostMutation = trpc.influencerBlog.publishNow.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
  });

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      await createPostMutation.mutateAsync({
        influencerId: selectedInfluencer,
        content: newPostContent,
        caption: newPostCaption,
        platform: "blog",
      });
    } catch (error) {
      console.error("Erro ao criar post:", error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (confirm("Tem certeza que deseja deletar este post?")) {
      try {
        await deletePostMutation.mutateAsync({ postId });
      } catch (error) {
        console.error("Erro ao deletar post:", error);
      }
    }
  };

  const handlePublishPost = async (postId: number) => {
    try {
      await publishPostMutation.mutateAsync({ postId });
    } catch (error) {
      console.error("Erro ao publicar post:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const selectedInfluencerData = INFLUENCERS.find((i) => i.id === selectedInfluencer);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Blogs das Influenciadoras</h1>
        <p className="text-gray-600">Gerenciar conteúdo dos blogs de cada influenciadora</p>
      </div>

      {/* Influencer Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {INFLUENCERS.map((influencer) => (
          <button
            key={influencer.id}
            onClick={() => setSelectedInfluencer(influencer.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedInfluencer === influencer.id
                ? `${influencer.color} border-gray-400`
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <h3 className="font-semibold text-lg">{influencer.name}</h3>
            <p className="text-sm text-gray-600">{posts.length} posts</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Post Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Novo Post</CardTitle>
              <CardDescription>
                Criar post para {selectedInfluencerData?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Conteúdo</label>
                <Textarea
                  placeholder="Escreva o conteúdo do post..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="mt-2 min-h-[200px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Legenda (opcional)</label>
                <Input
                  placeholder="Legenda para redes sociais..."
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  className="mt-2"
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
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Post
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Posts de {selectedInfluencerData?.name}</CardTitle>
              <CardDescription>
                {postsLoading ? "Carregando..." : `${posts.length} posts no total`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum post criado ainda</p>
                  <p className="text-sm">Crie o primeiro post usando o formulário ao lado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString("pt-BR") : "Data desconhecida"}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                            post.status === "published"
                              ? "bg-green-100 text-green-800"
                              : post.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {post.status === "published"
                              ? "Publicado"
                              : post.status === "scheduled"
                              ? "Agendado"
                              : "Rascunho"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {post.status !== "published" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePublishPost(post.id)}
                              disabled={publishPostMutation.isPending}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePost(post.id)}
                            disabled={deletePostMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-gray-900 mb-2">{post.content}</p>

                      {post.caption && (
                        <p className="text-sm text-gray-600 italic mb-2">"{post.caption}"</p>
                      )}

                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.hashtags.map((tag, idx) => (
                            <span key={idx} className="text-sm text-blue-600">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
