import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, Upload, Share2, Download, Folder, Lock, ExternalLink, Zap } from "lucide-react";

const STORED_VIDEOS = [
  {
    id: 1,
    nome: "Carol - Meu Primeiro Pedido Chegou!",
    tamanho: "245 MB",
    data: "2026-02-01",
    tipo: "Story",
    duracao: "15s",
    status: "Pronto",
    compartilhado: true
  },
  {
    id: 2,
    nome: "Renata - Análise Rápida de Qualidade",
    tamanho: "312 MB",
    data: "2026-02-01",
    tipo: "TikTok",
    duracao: "18s",
    status: "Pronto",
    compartilhado: false
  },
  {
    id: 3,
    nome: "Vanessa - Compra Coletiva com as Amigas",
    tamanho: "278 MB",
    data: "2026-02-02",
    tipo: "Reels",
    duracao: "20s",
    status: "Processando",
    compartilhado: true
  },
  {
    id: 4,
    nome: "Luiza - Pijama Inverno 2026",
    tamanho: "356 MB",
    data: "2026-02-02",
    tipo: "Reels",
    duracao: "25s",
    status: "Pronto",
    compartilhado: false
  },
  {
    id: 5,
    nome: "Carol - Como Ganhei R$ 500 em 1 Semana",
    tamanho: "289 MB",
    data: "2026-02-03",
    tipo: "TikTok",
    duracao: "25s",
    status: "Pronto",
    compartilhado: true
  },
  {
    id: 6,
    nome: "Renata - Lojista Revela o Segredo",
    tamanho: "334 MB",
    data: "2026-02-03",
    tipo: "Story",
    duracao: "18s",
    status: "Pronto",
    compartilhado: false
  },
];

export default function IntegracaoGoogleDriveSection() {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [shareLink, setShareLink] = useState("");

  const totalSize = STORED_VIDEOS.reduce((acc, v) => {
    const size = parseInt(v.tamanho);
    return acc + size;
  }, 0);

  const handleShare = (videoId: number) => {
    const video = STORED_VIDEOS.find(v => v.id === videoId);
    if (video) {
      setShareLink(`https://drive.google.com/file/d/${videoId}/view?usp=sharing`);
      navigator.clipboard.writeText(shareLink);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            Integração com Google Drive
          </CardTitle>
          <CardDescription>
            Armazene e compartilhe vídeos gerados diretamente no Google Drive. Acesso fácil para toda a equipe com controle de permissões.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Conexão com Google Drive */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Conectar Google Drive
            </h3>
            {!isConnected ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Conecte sua conta Google Drive para armazenar e compartilhar vídeos automaticamente.
                </p>
                <Button
                  onClick={() => {
                    window.open("https://drive.google.com", "_blank");
                    setIsConnected(true);
                  }}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Conectar Google Drive
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-semibold">Conectado com sucesso!</span>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="bg-blue-50 p-4">
              <h4 className="font-semibold text-sm mb-2">📹 Vídeos Armazenados</h4>
              <div className="text-2xl font-bold text-blue-600">{STORED_VIDEOS.length}</div>
              <p className="text-xs text-slate-600 mt-1">Total de vídeos</p>
            </Card>

            <Card className="bg-purple-50 p-4">
              <h4 className="font-semibold text-sm mb-2">💾 Espaço Usado</h4>
              <div className="text-2xl font-bold text-purple-600">{(totalSize / 1024).toFixed(1)} GB</div>
              <p className="text-xs text-slate-600 mt-1">De 100 GB disponível</p>
            </Card>

            <Card className="bg-green-50 p-4">
              <h4 className="font-semibold text-sm mb-2">👥 Compartilhados</h4>
              <div className="text-2xl font-bold text-green-600">
                {STORED_VIDEOS.filter(v => v.compartilhado).length}
              </div>
              <p className="text-xs text-slate-600 mt-1">Com a equipe</p>
            </Card>
          </div>

          {/* Vídeos Armazenados */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Vídeos Armazenados</h3>
            <div className="space-y-3">
              {STORED_VIDEOS.map(video => (
                <Card
                  key={video.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedVideo(selectedVideo === video.id ? null : video.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Folder className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-sm">{video.nome}</h4>
                        <Badge
                          variant={video.status === "Pronto" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {video.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-2">
                        <span>📊 {video.tipo}</span>
                        <span>⏱️ {video.duracao}</span>
                        <span>💾 {video.tamanho}</span>
                        <span>📅 {video.data}</span>
                      </div>

                      {selectedVideo === video.id && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://drive.google.com/file/d/${video.id}/view`, "_blank");
                            }}
                            className="gap-1 text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Abrir
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(video.id);
                            }}
                            className="gap-1 text-xs"
                          >
                            <Share2 className="w-3 h-3" />
                            {video.compartilhado ? "Compartilhado" : "Compartilhar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://drive.google.com/uc?export=download&id=${video.id}`, "_blank");
                            }}
                            className="gap-1 text-xs"
                          >
                            <Download className="w-3 h-3" />
                            Baixar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Guia Rápido */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">📋 Como Usar</h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>1. <strong>Conecte Google Drive</strong> (botão acima)</li>
              <li>2. <strong>Gere vídeos com IA</strong> (aba "Vídeos IA")</li>
              <li>3. <strong>Edite no CapCut</strong> (aba "CapCut")</li>
              <li>4. <strong>Vídeos são salvos automaticamente</strong> no Google Drive</li>
              <li>5. <strong>Compartilhe com equipe</strong> (clique em "Compartilhar")</li>
              <li>6. <strong>Baixe quando necessário</strong> (clique em "Baixar")</li>
              <li>7. <strong>Agende publicação</strong> (aba "Agendador")</li>
            </ol>
          </Card>

          {/* Permissões e Segurança */}
          <Card className="bg-yellow-50 border-yellow-200 p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-600" />
              Controle de Permissões
            </h4>
            <ul className="text-sm space-y-1 text-slate-700">
              <li>✓ <strong>Visualizador:</strong> Apenas visualizar vídeos</li>
              <li>✓ <strong>Comentarista:</strong> Visualizar e comentar</li>
              <li>✓ <strong>Editor:</strong> Visualizar, comentar e editar</li>
              <li>✓ <strong>Proprietário:</strong> Acesso total (apenas você)</li>
            </ul>
          </Card>

          {/* Recursos Adicionais */}
          <div className="grid md:grid-cols-2 gap-3">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">📚 Documentação</h4>
              <p className="text-xs text-slate-600 mb-3">
                Guia completo de Google Drive API
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://developers.google.com/drive", "_blank")}
                className="w-full text-xs"
              >
                Acessar Docs
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎓 Tutoriais</h4>
              <p className="text-xs text-slate-600 mb-3">
                Como compartilhar e colaborar no Drive
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://support.google.com/drive", "_blank")}
                className="w-full text-xs"
              >
                Ver Tutoriais
              </Button>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
