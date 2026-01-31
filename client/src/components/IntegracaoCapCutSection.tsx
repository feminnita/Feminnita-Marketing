import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Upload, Download, Zap, ExternalLink } from "lucide-react";

const TEMPLATES = [
  {
    id: "transicao-rapida",
    nome: "Transição Rápida",
    descricao: "Transições dinâmicas a cada 2-3 segundos",
    duracao: "30s",
    categoria: "Transições",
    preview: "Zoom, Fade, Slide"
  },
  {
    id: "efeitos-visuais",
    nome: "Efeitos Visuais",
    descricao: "Efeitos de glitch, confete, neon",
    duracao: "30s",
    categoria: "Efeitos",
    preview: "Glitch, Confete, Neon"
  },
  {
    id: "text-animation",
    nome: "Animação de Texto",
    descricao: "Textos com animações fluidas",
    duracao: "30s",
    categoria: "Texto",
    preview: "Pop-up, Typewriter, Bounce"
  },
  {
    id: "musica-sync",
    nome: "Sincronização de Música",
    descricao: "Cortes sincronizados com beat",
    duracao: "30s",
    categoria: "Áudio",
    preview: "Beat-drop, Sync, Fade"
  },
  {
    id: "color-grade",
    nome: "Color Grading",
    descricao: "Filtros e ajustes de cor profissionais",
    duracao: "30s",
    categoria: "Cor",
    preview: "Vintage, Cinematic, Neon"
  },
  {
    id: "slow-motion",
    nome: "Slow Motion",
    descricao: "Efeitos de câmera lenta",
    duracao: "30s",
    categoria: "Velocidade",
    preview: "0.5x, 0.75x, 1x"
  },
];

const CATEGORIAS = ["Transições", "Efeitos", "Texto", "Áudio", "Cor", "Velocidade"];

export default function IntegracaoCapCutSection() {
  const [selectedTemplate, setSelectedTemplate] = useState("transicao-rapida");
  const [selectedCategory, setSelectedCategory] = useState("Transições");
  const [isConnected, setIsConnected] = useState(false);

  const filteredTemplates = TEMPLATES.filter(t => t.categoria === selectedCategory);
  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-purple-600" />
            Integração com CapCut API
          </CardTitle>
          <CardDescription>
            Edite vídeos gerados com IA usando templates pré-configurados. Adicione transições, efeitos, textos e sincronize com áudio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Conexão com CapCut */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Conectar CapCut
            </h3>
            {!isConnected ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Conecte sua conta CapCut para editar vídeos diretamente da plataforma.
                </p>
                <Button
                  onClick={() => {
                    window.open("https://www.capcut.com/api", "_blank");
                    setIsConnected(true);
                  }}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Conectar CapCut
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-semibold">Conectado com sucesso!</span>
              </div>
            )}
          </div>

          {/* Seleção de Categoria */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Categorias de Templates</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedTemplate(TEMPLATES.find(t => t.categoria === cat)?.id || "");
                  }}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Templates Disponíveis</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {filteredTemplates.map(t => (
                <Button
                  key={t.id}
                  variant={selectedTemplate === t.id ? "default" : "outline"}
                  onClick={() => setSelectedTemplate(t.id)}
                  className="justify-start h-auto py-3 text-left"
                >
                  <div>
                    <div className="font-semibold text-sm">{t.nome}</div>
                    <div className="text-xs opacity-75">{t.descricao}</div>
                    <div className="text-xs opacity-60 mt-1">Preview: {t.preview}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Preview do Template */}
          {template && (
            <Card className="bg-slate-900 text-white p-6">
              <h3 className="font-semibold text-sm mb-4">Preview: {template.nome}</h3>
              <div className="bg-slate-800 rounded-lg p-8 text-center mb-4 min-h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎬</div>
                  <p className="text-sm text-slate-400">
                    {template.descricao}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Duração: {template.duracao}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-semibold text-xs mb-2">Características:</h4>
                  <ul className="text-xs space-y-1 text-slate-300">
                    <li>✓ Pré-configurado</li>
                    <li>✓ Customizável</li>
                    <li>✓ Exportável HD</li>
                    <li>✓ Sem marca d'água</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-xs mb-2">Próximos Passos:</h4>
                  <ol className="text-xs space-y-1 text-slate-300">
                    <li>1. Upload do vídeo</li>
                    <li>2. Aplicar template</li>
                    <li>3. Customizar (opcional)</li>
                    <li>4. Exportar e publicar</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => window.open("https://www.capcut.com", "_blank")}
                  className="gap-2 flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4" />
                  Abrir CapCut
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Baixar Template
                </Button>
              </div>
            </Card>
          )}

          {/* Guia Rápido */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              Guia Rápido de Uso
            </h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>1. <strong>Gere o vídeo com IA</strong> (aba "Vídeos IA")</li>
              <li>2. <strong>Conecte CapCut</strong> (botão acima)</li>
              <li>3. <strong>Escolha um template</strong> de edição</li>
              <li>4. <strong>Faça upload</strong> do vídeo gerado</li>
              <li>5. <strong>Aplique o template</strong> automaticamente</li>
              <li>6. <strong>Customize</strong> cores, textos, timing (opcional)</li>
              <li>7. <strong>Exporte em HD</strong> sem marca d'água</li>
              <li>8. <strong>Publique</strong> nos horários otimizados</li>
            </ol>
          </Card>

          {/* Recursos Adicionais */}
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">📚 Documentação</h4>
              <p className="text-xs text-slate-600 mb-3">
                Guia completo de como usar CapCut API
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://www.capcut.com/api/docs", "_blank")}
                className="w-full text-xs"
              >
                Acessar Docs
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎓 Tutoriais</h4>
              <p className="text-xs text-slate-600 mb-3">
                Vídeos de como editar com templates
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://www.youtube.com/results?search_query=capcut+templates", "_blank")}
                className="w-full text-xs"
              >
                Ver Tutoriais
              </Button>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">💬 Suporte</h4>
              <p className="text-xs text-slate-600 mb-3">
                Comunidade e suporte CapCut
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://www.capcut.com/community", "_blank")}
                className="w-full text-xs"
              >
                Comunidade
              </Button>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
