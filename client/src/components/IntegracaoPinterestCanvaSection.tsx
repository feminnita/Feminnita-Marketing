import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, Copy, ExternalLink, Palette, Image, AlertCircle } from "lucide-react";

export default function IntegracaoPinterestCanvaSection() {
  const templates = [
    {
      id: 1,
      persona: "Carol",
      name: "Pin Renda Extra",
      description: "Design vibrante mostrando lucro rápido",
      dimensions: "1000x1500px",
      colors: ["#FF6B35", "#F7931E", "#FDB913"],
      downloads: 245,
      uses: 89,
      link: "https://canva.com/templates/renda-extra-carol",
    },
    {
      id: 2,
      persona: "Carol",
      name: "Story Template - Unboxing",
      description: "Template para stories de unboxing de produtos",
      dimensions: "1080x1920px",
      colors: ["#FF69B4", "#FFB6C1", "#FFC0CB"],
      downloads: 167,
      uses: 124,
      link: "https://canva.com/templates/unboxing-carol",
    },
    {
      id: 3,
      persona: "Renata",
      name: "Pin Fornecedor Confiável",
      description: "Design profissional para B2B",
      dimensions: "1000x1500px",
      colors: ["#1E90FF", "#4169E1", "#6495ED"],
      downloads: 312,
      uses: 156,
      link: "https://canva.com/templates/fornecedor-renata",
    },
    {
      id: 4,
      persona: "Renata",
      name: "Catálogo Digital",
      description: "Template para apresentar coleção de produtos",
      dimensions: "1920x1080px",
      colors: ["#2F4F4F", "#696969", "#A9A9A9"],
      downloads: 198,
      uses: 87,
      link: "https://canva.com/templates/catalogo-renata",
    },
    {
      id: 5,
      persona: "Vanessa",
      name: "Pin Compra Coletiva",
      description: "Design aconchegante para grupos de compra",
      dimensions: "1000x1500px",
      colors: ["#FF1493", "#FF69B4", "#FFB6C1"],
      downloads: 289,
      uses: 203,
      link: "https://canva.com/templates/compra-coletiva",
    },
    {
      id: 6,
      persona: "Vanessa",
      name: "Post Família - Carrossel",
      description: "Template para posts em carrossel com família",
      dimensions: "1080x1350px",
      colors: ["#FFD700", "#FFA500", "#FF8C00"],
      downloads: 156,
      uses: 112,
      link: "https://canva.com/templates/familia-carrossel",
    },
    {
      id: 7,
      persona: "Luiza",
      name: "Pin Loungewear Trend",
      description: "Design trendy para moda loungewear",
      dimensions: "1000x1500px",
      colors: ["#FF00FF", "#FF1493", "#FF69B4"],
      downloads: 423,
      uses: 267,
      link: "https://canva.com/templates/loungewear-trend",
    },
    {
      id: 8,
      persona: "Luiza",
      name: "Reels Cover - TikTok Viral",
      description: "Template para capas de reels virais",
      dimensions: "1080x1920px",
      colors: ["#00CED1", "#00BFFF", "#1E90FF"],
      downloads: 567,
      uses: 412,
      link: "https://canva.com/templates/tiktok-viral",
    },
  ];

  const designTips = [
    {
      tip: "Use cores da persona",
      description: "Cada persona tem uma paleta de cores específica - respeite para manter consistência",
    },
    {
      tip: "Mantenha tipografia clara",
      description: "Use fontes legíveis mesmo em tamanho pequeno para redes sociais",
    },
    {
      tip: "Adicione CTA visível",
      description: "Botão ou texto de ação deve estar em local de destaque",
    },
    {
      tip: "Otimize para mobile",
      description: "Teste como fica em tela pequena antes de publicar",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Pinterest & Canva - Templates Visuais</h2>
        <p className="text-slate-600">Crie designs profissionais para cada persona com templates pré-feitos e salve direto no Pinterest</p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Dados de exemplo — conecte sua conta para ver dados reais</p>
              <p className="text-sm text-slate-600 mt-1">
                Os templates, downloads e estatísticas abaixo são exemplos ilustrativos. Para usar templates reais do Canva e salvar pins no Pinterest, conecte suas contas nas configurações de integrações.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Templates Disponíveis</p>
              <p className="text-2xl font-bold text-slate-900">8</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Downloads Totais</p>
              <p className="text-2xl font-bold text-slate-900">2,357</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Usos em Campanhas</p>
              <p className="text-2xl font-bold text-slate-900">1,250</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-slate-900">87.3%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Templates por Persona
          </CardTitle>
          <CardDescription>Clique para abrir no Canva ou salvar no Pinterest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                {/* Color Preview */}
                <div className="flex h-20">
                  {template.colors.map((color, idx) => (
                    <div key={idx} className="flex-1" style={{ backgroundColor: color }} />
                  ))}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {template.persona}
                    </Badge>
                    <h3 className="font-semibold text-slate-900 text-sm">{template.name}</h3>
                    <p className="text-xs text-slate-600 mt-1">{template.description}</p>
                  </div>

                  {/* Specs */}
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>📐 {template.dimensions}</p>
                    <p>⬇️ {template.downloads} downloads</p>
                    <p>✓ {template.uses} usos</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <a
                      href={template.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 text-xs bg-pink-500 text-white rounded hover:bg-pink-600 py-2 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Canva
                    </a>
                    <button className="flex-1 flex items-center justify-center gap-1 text-xs border border-slate-300 rounded hover:bg-slate-50 py-2 transition">
                      <Share2 className="w-3 h-3" />
                      Pinterest
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Design Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Dicas de Design
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {designTips.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-slate-900 mb-2">💡 {item.tip}</p>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">🔗 Como Integrar</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-3">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Abra um template no Canva (clique no botão "Canva")</li>
            <li>Customize com suas cores, textos e imagens</li>
            <li>Exporte em alta resolução (PNG ou PDF)</li>
            <li>Salve no Pinterest (clique no botão "Pinterest")</li>
            <li>Compartilhe o link com sua equipe</li>
            <li>Use em suas campanhas de marketing</li>
          </ol>
          <p className="text-xs mt-4 pt-4 border-t border-blue-200">
            <strong>Pro Tip:</strong> Crie uma pasta no Pinterest para cada persona e organize todos os designs lá!
          </p>
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">⚡ Fluxo de Trabalho Recomendado</CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-2 text-sm">
          <p>1️⃣ <strong>Escolha a persona</strong> para sua campanha</p>
          <p>2️⃣ <strong>Selecione um template</strong> apropriado</p>
          <p>3️⃣ <strong>Customize no Canva</strong> com seus dados</p>
          <p>4️⃣ <strong>Salve no Pinterest</strong> para referência futura</p>
          <p>5️⃣ <strong>Exporte e publique</strong> nas redes sociais</p>
          <p>6️⃣ <strong>Monitore performance</strong> e ajuste se necessário</p>
        </CardContent>
      </Card>
    </div>
  );
}
