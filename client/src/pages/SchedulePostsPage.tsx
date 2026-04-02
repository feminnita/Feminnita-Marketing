import { useState } from 'react';
import { Calendar, Clock, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'blog', name: 'Blog', icon: '📝' },
];

export default function SchedulePostsPage() {
  const { data: influencersData } = trpc.autonomousInfluencers.listInfluencers.useQuery();
  const INFLUENCERS = (influencersData?.influencers ?? []).map((inf: any) => ({
    id: inf.id,
    name: inf.personality ? `${inf.name} - ${inf.personality}` : inf.name,
    color: 'bg-slate-50',
  }));

  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const schedulePostMutation = trpc.scheduledPosts.create.useMutation({
    onSuccess: (result) => {
      setScheduledPosts((prev) => [...prev, result as any]);
      setContent('');
      setCaption('');
      setHashtags('');
      setScheduledDate('');
      setScheduledTime('');
      setSelectedPlatforms(['instagram']);
      toast.success('Post agendado com sucesso!');
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(`Erro ao agendar post: ${error.message}`);
      setIsLoading(false);
    },
  });

  const handleSchedulePost = async () => {
    if (!selectedInfluencer || !content || !scheduledDate || !scheduledTime) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    schedulePostMutation.mutate({
      influencerId: selectedInfluencer,
      content,
      caption: caption || undefined,
      hashtags: hashtags || undefined,
      platforms: selectedPlatforms,
      scheduledAt: scheduledDateTime,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8" style={{ color: '#A63D4A' }} />
            <h1 className="text-4xl font-bold text-slate-900">Agendar Posts</h1>
          </div>
          <p className="text-lg text-slate-600">
            Agende posts automáticos para as influenciadoras em Instagram, TikTok e Blog
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle>Novo Post Agendado</CardTitle>
                <CardDescription>Configure os detalhes do post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Influenciadora */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Influenciadora
                  </label>
                  <Select value={selectedInfluencer?.toString() || ''} onValueChange={(v) => setSelectedInfluencer(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma influenciadora" />
                    </SelectTrigger>
                    <SelectContent>
                      {INFLUENCERS.map(inf => (
                        <SelectItem key={inf.id} value={inf.id.toString()}>
                          {inf.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conteúdo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Conteúdo do Post
                  </label>
                  <Textarea
                    placeholder="Escreva o conteúdo principal do post..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-32"
                  />
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Caption (Descrição)
                  </label>
                  <Textarea
                    placeholder="Escreva a caption para o post..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="min-h-24"
                  />
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Hashtags
                  </label>
                  <Input
                    placeholder="#feminnita #pijamas #lifestyle"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                  />
                </div>

                {/* Data e Hora */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Data
                    </label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Hora
                    </label>
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Plataformas */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Plataformas
                  </label>
                  <div className="space-y-2">
                    {PLATFORMS.map(platform => (
                      <div key={platform.id} className="flex items-center gap-2">
                        <Checkbox
                          id={platform.id}
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={() => handlePlatformToggle(platform.id)}
                        />
                        <label htmlFor={platform.id} className="text-sm text-slate-700 cursor-pointer">
                          {platform.icon} {platform.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão */}
                <Button
                  onClick={handleSchedulePost}
                  disabled={isLoading}
                  className="w-full gap-2"
                  style={{ backgroundColor: '#A63D4A' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Agendando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Agendar Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Posts Agendados */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Posts Agendados
                </CardTitle>
                <CardDescription>{scheduledPosts.length} posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scheduledPosts.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Nenhum post agendado
                    </p>
                  ) : (
                    scheduledPosts.map(post => (
                      <div key={post.id} className="border border-slate-200 rounded-lg p-3 bg-white">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {post.influencer}
                            </p>
                            <p className="text-xs text-slate-600">
                              {post.scheduledAt.toLocaleDateString('pt-BR')} às{' '}
                              {post.scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {post.platforms.map((p: string) => (
                            <span key={p} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
