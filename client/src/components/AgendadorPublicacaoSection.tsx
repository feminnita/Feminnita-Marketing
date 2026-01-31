import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, CheckCircle, AlertCircle, ExternalLink, Zap } from "lucide-react";

const SCHEDULED_POSTS = [
  {
    id: 1,
    titulo: "Carol - Meu Primeiro Pedido Chegou!",
    plataforma: "Instagram Stories",
    data: "2026-02-03",
    hora: "19:00",
    status: "Agendado",
    persona: "Carol",
    tipo: "Story",
    visualizacoes_esperadas: "5K-10K",
    conversoes_esperadas: "50-100"
  },
  {
    id: 2,
    titulo: "Renata - Análise Rápida de Qualidade",
    plataforma: "TikTok",
    data: "2026-02-03",
    hora: "20:00",
    status: "Agendado",
    persona: "Renata",
    tipo: "TikTok",
    visualizacoes_esperadas: "10K-50K",
    conversoes_esperadas: "100-300"
  },
  {
    id: 3,
    titulo: "Vanessa - Compra Coletiva com as Amigas",
    plataforma: "Instagram Reels",
    data: "2026-02-04",
    hora: "19:00",
    status: "Agendado",
    persona: "Vanessa",
    tipo: "Reels",
    visualizacoes_esperadas: "15K-50K",
    conversoes_esperadas: "150-400"
  },
  {
    id: 4,
    titulo: "Luiza - Pijama Inverno 2026",
    plataforma: "Instagram Reels",
    data: "2026-02-05",
    hora: "20:00",
    status: "Agendado",
    persona: "Luiza",
    tipo: "Reels",
    visualizacoes_esperadas: "20K-80K",
    conversoes_esperadas: "200-500"
  },
  {
    id: 5,
    titulo: "Carol - Como Ganhei R$ 500 em 1 Semana",
    plataforma: "TikTok",
    data: "2026-02-05",
    hora: "19:00",
    status: "Publicado",
    persona: "Carol",
    tipo: "TikTok",
    visualizacoes_esperadas: "40K-50K",
    conversoes_esperadas: "200-300"
  },
  {
    id: 6,
    titulo: "Renata - Lojista Revela o Segredo",
    plataforma: "Instagram Stories",
    data: "2026-02-06",
    hora: "18:00",
    status: "Publicado",
    persona: "Renata",
    tipo: "Story",
    visualizacoes_esperadas: "8K-15K",
    conversoes_esperadas: "80-150"
  },
];

const PLATAFORMAS = [
  {
    id: "instagram",
    nome: "Instagram",
    logo: "📷",
    url: "https://business.instagram.com",
    features: ["Stories", "Reels", "Feed", "IGTV"]
  },
  {
    id: "tiktok",
    nome: "TikTok",
    logo: "🎵",
    url: "https://www.tiktok.com/creator",
    features: ["Vídeos", "Duetos", "Stitches"]
  },
  {
    id: "facebook",
    nome: "Facebook",
    logo: "f",
    url: "https://www.facebook.com/creator",
    features: ["Feed", "Reels", "Stories"]
  },
  {
    id: "youtube",
    nome: "YouTube",
    logo: "▶️",
    url: "https://www.youtube.com/creator_studio",
    features: ["Shorts", "Vídeos", "Premieres"]
  },
];

export default function AgendadorPublicacaoSection() {
  const [selectedStatus, setSelectedStatus] = useState("Agendado");
  const [selectedPlataforma, setSelectedPlataforma] = useState("instagram");

  const filteredPosts = SCHEDULED_POSTS.filter(p => p.status === selectedStatus);

  const getStatusColor = (status: string) => {
    if (status === "Publicado") return "bg-green-100 text-green-800";
    if (status === "Agendado") return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusIcon = (status: string) => {
    if (status === "Publicado") return <CheckCircle className="w-4 h-4" />;
    if (status === "Agendado") return <Clock className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Agendador Automático de Publicação
          </CardTitle>
          <CardDescription>
            Agende publicações automáticas em Instagram, TikTok, Facebook e YouTube. Integração com Meta Business Suite e TikTok Creator Center.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Conexão com Plataformas */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Conectar Plataformas</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {PLATAFORMAS.map(p => (
                <Card key={p.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{p.logo} {p.nome}</h4>
                      <p className="text-xs text-slate-600 mb-2">
                        {p.features.join(", ")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => window.open(p.url, "_blank")}
                      className="gap-1 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Conectar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Status de Posts */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Posts Agendados</h3>
            <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="Agendado" className="text-xs">
                  ⏰ Agendados (4)
                </TabsTrigger>
                <TabsTrigger value="Publicado" className="text-xs">
                  ✅ Publicados (2)
                </TabsTrigger>
                <TabsTrigger value="Erro" className="text-xs">
                  ⚠️ Erros (0)
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedStatus} className="space-y-3 mt-4">
                {filteredPosts.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p className="text-sm text-slate-600">
                      Nenhum post neste status no momento.
                    </p>
                  </Card>
                ) : (
                  filteredPosts.map(post => (
                    <Card key={post.id} className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{post.titulo}</h4>
                            <Badge className={getStatusColor(post.status)} variant="outline">
                              {getStatusIcon(post.status)}
                              <span className="ml-1">{post.status}</span>
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-2">
                            <span>📱 {post.plataforma}</span>
                            <span>📅 {post.data}</span>
                            <span>🕐 {post.hora}</span>
                            <span>👤 {post.persona}</span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-xs">
                            <div className="bg-blue-50 p-2 rounded">
                              <span className="text-slate-600">Visualizações esperadas:</span>
                              <div className="font-semibold text-blue-600">{post.visualizacoes_esperadas}</div>
                            </div>
                            <div className="bg-green-50 p-2 rounded">
                              <span className="text-slate-600">Conversões esperadas:</span>
                              <div className="font-semibold text-green-600">{post.conversoes_esperadas}</div>
                            </div>
                          </div>
                        </div>
                        {post.status === "Agendado" && (
                          <Button size="sm" variant="outline" className="text-xs">
                            Editar
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="bg-blue-50 p-4">
              <h4 className="font-semibold text-sm mb-2">📊 Total Agendado</h4>
              <div className="text-2xl font-bold text-blue-600">4 Posts</div>
              <p className="text-xs text-slate-600 mt-1">Próximos 7 dias</p>
            </Card>

            <Card className="bg-green-50 p-4">
              <h4 className="font-semibold text-sm mb-2">✅ Publicados</h4>
              <div className="text-2xl font-bold text-green-600">2 Posts</div>
              <p className="text-xs text-slate-600 mt-1">Esta semana</p>
            </Card>

            <Card className="bg-purple-50 p-4">
              <h4 className="font-semibold text-sm mb-2">📈 Engajamento Total</h4>
              <div className="text-2xl font-bold text-purple-600">1.2K</div>
              <p className="text-xs text-slate-600 mt-1">Últimos 7 dias</p>
            </Card>
          </div>

          {/* Guia Rápido */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              Como Agendar Publicações
            </h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>1. <strong>Gere o vídeo com IA</strong> (aba "Vídeos IA")</li>
              <li>2. <strong>Edite no CapCut</strong> (aba "CapCut")</li>
              <li>3. <strong>Conecte as plataformas</strong> (botões acima)</li>
              <li>4. <strong>Selecione data e hora</strong> de publicação</li>
              <li>5. <strong>Escolha a persona</strong> (Carol, Renata, Vanessa, Luiza)</li>
              <li>6. <strong>Defina o áudio</strong> (aba "Áudios")</li>
              <li>7. <strong>Confirme e agende</strong> automaticamente</li>
              <li>8. <strong>Monitore performance</strong> em tempo real</li>
            </ol>
          </Card>

          {/* Recursos Adicionais */}
          <div className="grid md:grid-cols-2 gap-3">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎯 Meta Business Suite</h4>
              <p className="text-xs text-slate-600 mb-3">
                Agende em Instagram, Facebook e WhatsApp de uma vez
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://business.facebook.com", "_blank")}
                className="w-full text-xs"
              >
                Acessar
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎵 TikTok Creator Center</h4>
              <p className="text-xs text-slate-600 mb-3">
                Agende vídeos no TikTok com antecedência
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://www.tiktok.com/creator", "_blank")}
                className="w-full text-xs"
              >
                Acessar
              </Button>
            </Card>
          </div>

          {/* Próximos Passos */}
          <Card className="bg-yellow-50 border-yellow-200 p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Dicas Importantes
            </h4>
            <ul className="text-sm space-y-1 text-slate-700">
              <li>✓ Agende com 24-48h de antecedência para melhor performance</li>
              <li>✓ Use os horários otimizados (veja aba "Performance")</li>
              <li>✓ Varie entre personas para manter frescor de conteúdo</li>
              <li>✓ Monitore métricas após publicação (veja aba "Dashboard")</li>
              <li>✓ Responda comentários nos primeiros 30 minutos</li>
            </ul>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
