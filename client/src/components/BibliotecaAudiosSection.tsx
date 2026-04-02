import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Download, Play, Heart, Share2, Search } from "lucide-react";

const TRENDING_SOUNDS = [
  { id: "sound-1", nome: "Renda Extra - Trending", artista: "TikTok Viral", duracao: "15s", categoria: "Renda Extra", link: "https://www.tiktok.com/music/", tipo: "Trending" },
  { id: "sound-2", nome: "Conforto & Lifestyle", artista: "Indie Pop", duracao: "30s", categoria: "Lifestyle", link: "https://www.tiktok.com/music/", tipo: "Trending" },
  { id: "sound-3", nome: "Motivação Empreendedora", artista: "Motivational", duracao: "20s", categoria: "Motivação", link: "https://www.tiktok.com/music/", tipo: "Trending" },
  { id: "sound-4", nome: "Compra Coletiva - Alegria", artista: "Pop Upbeat", duracao: "25s", categoria: "Compra Coletiva", link: "https://www.tiktok.com/music/", tipo: "Trending" },
  { id: "sound-5", nome: "ASMR - Tecido Macio", artista: "ASMR Sounds", duracao: "30s", categoria: "ASMR", link: "https://www.tiktok.com/music/", tipo: "Trending" },
  { id: "sound-6", nome: "Unboxing - Surpresa", artista: "Sound Effects", duracao: "10s", categoria: "Unboxing", link: "https://www.tiktok.com/music/", tipo: "Trending" },
];

const ROYALTY_FREE = [
  { id: "rf-1", nome: "Energetic Vibes", artista: "Free Music Archive", duracao: "60s", categoria: "Energético", link: "https://freemusicarchive.org", tipo: "Royalty Free" },
  { id: "rf-2", nome: "Soft Background", artista: "Epidemic Sound", duracao: "60s", categoria: "Background", link: "https://www.epidemicsound.com", tipo: "Royalty Free" },
  { id: "rf-3", nome: "Uplifting Pop", artista: "Bensound", duracao: "60s", categoria: "Pop", link: "https://www.bensound.com", tipo: "Royalty Free" },
  { id: "rf-4", nome: "Corporate Success", artista: "Incompetech", duracao: "60s", categoria: "Corporativo", link: "https://incompetech.com", tipo: "Royalty Free" },
  { id: "rf-5", nome: "Chill Lofi", artista: "Chosic", duracao: "60s", categoria: "Lofi", link: "https://www.chosic.com/spotify-playlist-generator/", tipo: "Royalty Free" },
  { id: "rf-6", nome: "Motivational Strings", artista: "YouTube Audio Library", duracao: "60s", categoria: "Motivação", link: "https://www.youtube.com/audiolibrary", tipo: "Royalty Free" },
];

const CATEGORIAS = ["Renda Extra", "Lifestyle", "Motivação", "Compra Coletiva", "ASMR", "Unboxing", "Energético", "Background", "Pop", "Corporativo", "Lofi"];

export default function BibliotecaAudiosSection() {
  const [selectedCategory, setSelectedCategory] = useState("Renda Extra");
  const [audioType, setAudioType] = useState("trending");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const audios = audioType === "trending" ? TRENDING_SOUNDS : ROYALTY_FREE;
  const filteredAudios = audios.filter(a =>
    a.categoria === selectedCategory &&
    (a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     a.artista.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-blue-600" />
            Biblioteca de Áudios e Músicas
          </CardTitle>
          <CardDescription>
            Acesso a trending sounds do TikTok/Instagram e música royalty-free para seus vídeos. Todos os áudios são legalizados e prontos para usar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de Áudio */}
          <Tabs value={audioType} onValueChange={setAudioType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trending">🔥 Trending Sounds</TabsTrigger>
              <TabsTrigger value="royalty-free">🎵 Royalty Free</TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-slate-700">
                  <strong>Trending Sounds:</strong> Sons populares do TikTok e Instagram que estão viralizando. Use para aumentar alcance e engajamento.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="royalty-free" className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-slate-700">
                  <strong>Royalty Free:</strong> Músicas legalizadas que você pode usar sem restrições. Ideal para conteúdo de longa duração.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar áudio ou artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categorias */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Categorias</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map(cat => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Lista de Áudios */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">{filteredAudios.length} Áudios Encontrados</h3>
            {filteredAudios.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-slate-600">Nenhum áudio encontrado nesta categoria. Tente outra!</p>
              </Card>
            ) : (
              filteredAudios.map(audio => (
                <Card key={audio.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{audio.nome}</h4>
                        <Badge variant="secondary" className="text-xs">{audio.tipo}</Badge>
                      </div>
                      <p className="text-xs text-slate-600">{audio.artista} • {audio.duracao}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => window.open(audio.link, "_blank")} className="gap-1">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleFavorite(audio.id)}>
                        <Heart className={`w-4 h-4 ${favorites.includes(audio.id) ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(audio.link)}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => window.open(audio.link, "_blank")} className="gap-1">
                        <Download className="w-3 h-3" />
                        Usar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Favoritos */}
          {favorites.length > 0 && (
            <Card className="bg-pink-50 border-pink-200 p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                Seus Favoritos ({favorites.length})
              </h4>
              <p className="text-xs text-slate-600">
                Você marcou {favorites.length} áudio(s) como favorito. Acesse-os rapidamente aqui!
              </p>
            </Card>
          )}

          {/* Guia Rápido */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">📋 Como Usar</h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>1. <strong>Escolha a categoria</strong> que combina com seu vídeo</li>
              <li>2. <strong>Busque ou navegue</strong> pelos áudios disponíveis</li>
              <li>3. <strong>Clique em "Play"</strong> para ouvir preview na plataforma</li>
              <li>4. <strong>Clique em "Usar"</strong> para acessar a plataforma</li>
              <li>5. <strong>Baixe o áudio</strong> em MP3 ou WAV</li>
              <li>6. <strong>Adicione ao seu vídeo</strong> no CapCut ou editor preferido</li>
              <li>7. <strong>Publique</strong> com crédito ao artista (se necessário)</li>
            </ol>
          </Card>

          {/* Plataformas */}
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎵 TikTok Sounds</h4>
              <p className="text-xs text-slate-600 mb-3">Trending sounds direto do TikTok</p>
              <Button variant="outline" size="sm" onClick={() => window.open("https://www.tiktok.com/music", "_blank")} className="w-full text-xs">
                Acessar
              </Button>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎼 YouTube Audio</h4>
              <p className="text-xs text-slate-600 mb-3">Biblioteca royalty-free do YouTube</p>
              <Button variant="outline" size="sm" onClick={() => window.open("https://www.youtube.com/audiolibrary", "_blank")} className="w-full text-xs">
                Acessar
              </Button>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎧 Epidemic Sound</h4>
              <p className="text-xs text-slate-600 mb-3">Música premium royalty-free</p>
              <Button variant="outline" size="sm" onClick={() => window.open("https://www.epidemicsound.com", "_blank")} className="w-full text-xs">
                Acessar
              </Button>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
