import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Send } from "lucide-react";

interface ScheduledPost {
  title: string;
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  platforms: {
    instagram: boolean;
    facebook: boolean;
    tiktok: boolean;
    whatsapp: boolean;
  };
}

interface Props {
  onSchedule: (post: ScheduledPost) => void;
}

export function PostScheduler({ onSchedule }: Props) {
  const [post, setPost] = useState<ScheduledPost>({
    title: "",
    content: "",
    scheduledDate: "",
    scheduledTime: "",
    platforms: {
      instagram: false,
      facebook: false,
      tiktok: false,
      whatsapp: false,
    },
  });

  const [isScheduling, setIsScheduling] = useState(false);
  const [message, setMessage] = useState("");

  const handlePlatformChange = (platform: keyof typeof post.platforms) => {
    setPost(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: !prev.platforms[platform],
      },
    }));
  };

  const handleSchedule = async () => {
    if (!post.title || !post.content || !post.scheduledDate || !post.scheduledTime) {
      setMessage("❌ Preencha todos os campos");
      return;
    }

    const selectedPlatforms = Object.entries(post.platforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform);

    if (selectedPlatforms.length === 0) {
      setMessage("❌ Selecione pelo menos uma plataforma");
      return;
    }

    setIsScheduling(true);
    setMessage("");

    try {
      // Simular agendamento
      await new Promise(resolve => setTimeout(resolve, 800));

      onSchedule(post);
      setMessage(`✅ Postagem agendada para ${post.scheduledDate} às ${post.scheduledTime}`);

      // Limpar formulário
      setPost({
        title: "",
        content: "",
        scheduledDate: "",
        scheduledTime: "",
        platforms: {
          instagram: false,
          facebook: false,
          tiktok: false,
          whatsapp: false,
        },
      });

      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      setMessage("❌ Erro ao agendar postagem");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Card className="w-full border-pink-200">
      <CardHeader>
        <CardTitle className="text-pink-600">Agendar Postagem</CardTitle>
        <CardDescription>Prepare sua postagem e escolha quando publicar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Título */}
        <div>
          <label className="text-sm font-medium text-gray-700">Título</label>
          <Input
            placeholder="Título da postagem"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Conteúdo */}
        <div>
          <label className="text-sm font-medium text-gray-700">Conteúdo</label>
          <textarea
            placeholder="Escreva o conteúdo da postagem aqui..."
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            rows={4}
          />
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Data
            </label>
            <Input
              type="date"
              value={post.scheduledDate}
              onChange={(e) => setPost({ ...post, scheduledDate: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Hora
            </label>
            <Input
              type="time"
              value={post.scheduledTime}
              onChange={(e) => setPost({ ...post, scheduledTime: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Plataformas */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Publicar em:</label>
          <div className="space-y-2">
            {[
              { id: "instagram", label: "📸 Instagram" },
              { id: "facebook", label: "👍 Facebook" },
              { id: "tiktok", label: "🎵 TikTok" },
              { id: "whatsapp", label: "💬 WhatsApp (Grupo VIP)" },
            ].map(platform => (
              <div key={platform.id} className="flex items-center gap-2">
                <Checkbox
                  id={platform.id}
                  checked={post.platforms[platform.id as keyof typeof post.platforms]}
                  onCheckedChange={() => handlePlatformChange(platform.id as keyof typeof post.platforms)}
                />
                <label htmlFor={platform.id} className="text-sm cursor-pointer">
                  {platform.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Botão Agendar */}
        <div className="pt-4 space-y-2">
          <Button
            onClick={handleSchedule}
            disabled={isScheduling}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isScheduling ? "Agendando..." : "📅 Agendar Postagem"}
          </Button>

          {message && (
            <div className={`text-center text-sm font-medium ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}>
              {message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
