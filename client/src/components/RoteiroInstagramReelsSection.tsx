import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Volume2, Palette, Film, CheckCircle2, TrendingUp } from "lucide-react";

export default function RoteiroInstagramReelsSection() {
  const timeline = [
    {
      segundo: "0-4",
      titulo: "TEASER (Gancho de Mistério)",
      descricao: "Tela preta com efeito de frost (geada). Mão tocando vidro congelado. Close-up em gotas de água congeladas.",
      audio: "Música sofisticada começa (70%). Voz em off: 'Você já sentiu o conforto perfeito para o inverno?'",
      texto: "ALGO ESPECIAL CHEGOU | PREPARE-SE",
      efeito: "Efeito de frost aparecendo. Cores frias (azul, branco, cinza). Shimmer no texto.",
      duracao: "4 segundos"
    },
    {
      segundo: "4-10",
      titulo: "REVEAL (Revelação do Produto)",
      descricao: "Zoom out rápido. Mulher em ambiente aconchego usando pijama de inverno. Close-up nos detalhes: tecido, cores (azul marinho, cinza, vinho).",
      audio: "Voz em off: 'Apresentamos: Pijama Inverno 2026! Tecido premium, conforto máximo, design exclusivo!' Som de 'reveal' (ta-da!).",
      texto: "PIJAMA INVERNO 2026 | LANÇAMENTO EXCLUSIVO",
      efeito: "Transição rápida com zoom out. Cores mudam de frias para quentes. Glow ao redor do pijama. Confete digital.",
      duracao: "6 segundos"
    },
    {
      segundo: "10-18",
      titulo: "CARACTERÍSTICAS (Destaques)",
      descricao: "Montagem 4 cenas: close-up tecido → modelo confortável → cores diferentes → ambiente invernal",
      audio: "Voz em off: 'Tecido 100% algodão premium, peso perfeito para inverno, 4 cores exclusivas, conforto que você merece!'",
      texto: "TECIDO PREMIUM | CONFORTO MÁXIMO | 4 CORES EXCLUSIVAS | PERFEITO PARA INVERNO",
      efeito: "Transições suaves (0.5s). Cada característica com ícone 'pop'. Cores quentes. Highlight em detalhes.",
      duracao: "8 segundos"
    },
    {
      segundo: "18-28",
      titulo: "PROVA SOCIAL + LIFESTYLE",
      descricao: "Montagem 4 cenas: acordando na cama → tomando café → com amigas → depoimentos de clientes",
      audio: "Voz em off: 'Mulheres em toda parte já estão amando! Conforto, qualidade e estilo que você merece!' Ding em depoimentos.",
      texto: "CONFORTO PARA SEUS MELHORES MOMENTOS | ⭐ CLIENTES AMAM",
      efeito: "Transições suaves (0.5s). Cores quentes e aconchego. Efeito de 'like' (coração) em depoimentos. Filtro 'warm'.",
      duracao: "10 segundos"
    },
    {
      segundo: "28-38",
      titulo: "URGÊNCIA + EXCLUSIVIDADE",
      descricao: "Close-up do pijama com elementos de urgência: contador de estoque, 'Lançamento Exclusivo', 'Quantidade Limitada'.",
      audio: "Voz em off: 'Lançamento exclusivo com quantidade limitada! Disponível AGORA apenas no link da bio!' Som de urgência (tick-tock).",
      texto: "LANÇAMENTO EXCLUSIVO | QUANTIDADE LIMITADA | DISPONÍVEL AGORA | CLIQUE NO LINK DA BIO",
      efeito: "Efeito de countdown/timer (opcional). Glow intenso ao redor do pijama. Texto com pulse/pulsação. Cores vibrantes.",
      duracao: "10 segundos"
    },
    {
      segundo: "38-40",
      titulo: "CALL-TO-ACTION (CTA) + FECHAMENTO",
      descricao: "Mulher olhando para câmera, sorrindo, confiante. Usando pijama de inverno. Ambiente premium, iluminação elegante.",
      audio: "Voz em off: 'Não perca! Seu inverno perfeito começa aqui!' Som de sucesso (ding).",
      texto: "SEU INVERNO PERFEITO COMEÇA AQUI | FEMINNITA PIJAMAS",
      efeito: "Glow ao redor da mulher. Efeito pulse no texto CTA. Cores quentes e aconchego.",
      duracao: "2 segundos"
    }
  ];

  const especificacoes = {
    audio: [
      { label: "Música de Fundo", valor: "Áudio viral premium (Levitating remix, Blinding Lights remix)" },
      { label: "Volume Música", valor: "70%" },
      { label: "Voz em Off", valor: "Feminina, sofisticada, confiante, clara" },
      { label: "Volume Voz", valor: "80%" },
      { label: "Efeitos Sonoros", valor: "Reveal (ta-da!), notificação (ding), urgência (tick-tock), sucesso" },
      { label: "Volume Efeitos", valor: "40-50%" }
    ],
    visuais: [
      { label: "Resolução", valor: "1080x1920px (vertical) ou 1080x1350px (quadrado)" },
      { label: "Aspect Ratio", valor: "9:16 (vertical) ou 1:1 (quadrado)" },
      { label: "FPS", valor: "30fps" },
      { label: "Duração", valor: "40 segundos" },
      { label: "Codec", valor: "H.264" },
      { label: "Tamanho Máximo", valor: "4GB" }
    ],
    cores: [
      { nome: "Rosa Feminnita", hex: "#E84C89", uso: "Acentos, logo" },
      { nome: "Azul Marinho", hex: "#1A3A52", uso: "Cor pijama inverno" },
      { nome: "Cinza", hex: "#8B8B8B", uso: "Cor pijama inverno" },
      { nome: "Vinho", hex: "#722F37", uso: "Cor pijama inverno" },
      { nome: "Branco", hex: "#FFFFFF", uso: "Fundo de texto" },
      { nome: "Cores Quentes", hex: "Laranja/Ouro", uso: "Aconchego, lifestyle" }
    ]
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Roteiro de Vídeo para Instagram Reels - Lançamento Inverno</h2>
        <p className="text-slate-600">
          "Chegou! Pijama Inverno 2026 - Conforto Máximo para as Noites Frias" - Roteiro completo de 40 segundos otimizado para Instagram Reels com foco em premium, exclusividade e urgência.
        </p>
      </div>

      {/* Informações Gerais */}
      <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg">Informações Gerais do Vídeo</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Objetivo</p>
            <p className="text-slate-700">Criar buzz sobre novo lançamento, gerar antecipação e urgência de compra</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Público-Alvo</p>
            <p className="text-slate-700">Mulheres 18-50 anos, seguidoras da marca, buscando conforto e qualidade</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Formato</p>
            <p className="text-slate-700">Teaser → Reveal → Características → Prova Social → CTA</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Tom de Voz</p>
            <p className="text-slate-700">Entusiasmado, exclusivo, confiante, sofisticado</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Duração</p>
            <p className="text-slate-700 font-bold text-blue-600">40 segundos</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Estilo Visual</p>
            <p className="text-slate-700">Premium, elegante, invernal, aspiracional</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Detalhada */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Timeline Detalhada (40 segundos)</h3>
        
        {timeline.map((item, idx) => (
          <Card key={idx} className="border-l-4 border-l-blue-400">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-blue-100 text-blue-800">{item.segundo}s</Badge>
                    <CardTitle className="text-base">{item.titulo}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">{item.descricao}</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">{item.duracao}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-1 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Áudio
                  </p>
                  <p className="text-sm text-blue-900">{item.audio}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Texto na Tela</p>
                  <p className="text-sm text-purple-900 font-medium">{item.texto}</p>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded border border-amber-200">
                <p className="text-xs font-semibold text-amber-600 uppercase mb-1 flex items-center gap-1">
                  <Palette className="w-3 h-3" /> Efeitos Visuais
                </p>
                <p className="text-sm text-amber-900">{item.efeito}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Especificações Técnicas */}
      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="audio">Áudio</TabsTrigger>
          <TabsTrigger value="visuais">Visuais</TabsTrigger>
          <TabsTrigger value="cores">Cores</TabsTrigger>
        </TabsList>

        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-blue-600" />
                Especificações de Áudio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {especificacoes.audio.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-slate-200 pb-2 last:border-0">
                  <span className="font-semibold text-slate-700 text-sm">{item.label}</span>
                  <span className="text-slate-600 text-sm text-right">{item.valor}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visuais" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-600" />
                Especificações Visuais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {especificacoes.visuais.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-slate-200 pb-2 last:border-0">
                  <span className="font-semibold text-slate-700 text-sm">{item.label}</span>
                  <span className="text-slate-600 text-sm text-right">{item.valor}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                Paleta de Cores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {especificacoes.cores.map((cor, idx) => (
                <div key={idx} className="flex items-center gap-3 border-b border-slate-200 pb-3 last:border-0">
                  <div
                    className="w-12 h-12 rounded border-2 border-slate-300"
                    style={{ backgroundColor: cor.hex }}
                  />
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">{cor.nome}</p>
                    <p className="text-xs text-slate-600">{cor.hex}</p>
                    <p className="text-xs text-slate-500 italic">{cor.uso}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diferenças: 3 Tipos de Roteiros */}
      <Card className="border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            Comparação: 3 Tipos de Roteiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Aspecto</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Renda Extra</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Compra Familiar</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Lançamento Inverno</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Público</td>
                  <td className="py-2 px-2 text-slate-600">Mulheres 18-45, desempregadas</td>
                  <td className="py-2 px-2 text-slate-600">Mães 25-50</td>
                  <td className="py-2 px-2 text-slate-600">Mulheres 18-50, seguidoras</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Problema</td>
                  <td className="py-2 px-2 text-slate-600">Sem renda</td>
                  <td className="py-2 px-2 text-slate-600">Preço alto</td>
                  <td className="py-2 px-2 text-slate-600">Frio, desconforto</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Plataforma</td>
                  <td className="py-2 px-2 text-slate-600">TikTok</td>
                  <td className="py-2 px-2 text-slate-600">TikTok/Reels</td>
                  <td className="py-2 px-2 text-slate-600">Instagram Reels</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Duração</td>
                  <td className="py-2 px-2 text-slate-600">30s</td>
                  <td className="py-2 px-2 text-slate-600">30s</td>
                  <td className="py-2 px-2 text-slate-600">40s</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Tom</td>
                  <td className="py-2 px-2 text-slate-600">Entusiasmado</td>
                  <td className="py-2 px-2 text-slate-600">Caloroso</td>
                  <td className="py-2 px-2 text-slate-600">Sofisticado, premium</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Cores</td>
                  <td className="py-2 px-2 text-slate-600">Rosa/Laranja</td>
                  <td className="py-2 px-2 text-slate-600">Quentes/Ouro</td>
                  <td className="py-2 px-2 text-slate-600">Azul/Cinza/Vinho</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">CTA</td>
                  <td className="py-2 px-2 text-slate-600">"Clique no link"</td>
                  <td className="py-2 px-2 text-slate-600">"Reúna sua família"</td>
                  <td className="py-2 px-2 text-slate-600">"Disponível AGORA"</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-semibold text-slate-600">Meta de Conversão</td>
                  <td className="py-2 px-2 text-slate-600">10 registros</td>
                  <td className="py-2 px-2 text-slate-600">15 registros</td>
                  <td className="py-2 px-2 text-slate-600">25 compras</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dicas Finais */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            8 Dicas Finais para Maximizar Sucesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Qualidade Premium é Essencial", descricao: "Instagram Reels valoriza qualidade visual. Invista em iluminação, ângulos e edição profissional." },
            { titulo: "Primeira Cena é Crítica", descricao: "Os primeiros 3 segundos determinam se o público continua. Use teaser/mistério para prender atenção." },
            { titulo: "Transições Elegantes", descricao: "Use transições suaves, não abruptas. Isso transmite sofisticação e premium." },
            { titulo: "Cores Consistentes", descricao: "Mantenha paleta de cores consistente (azul marinho, cinza, vinho para pijama; quentes para lifestyle)." },
            { titulo: "Música Trendy", descricao: "Use áudio que está em alta no Instagram. Isso aumenta chances de ser promovido pelo algoritmo." },
            { titulo: "Prova Social Importa", descricao: "Depoimentos e lifestyle shots aumentam confiança. Mostre mulheres reais usando e amando." },
            { titulo: "CTA Clara e Urgente", descricao: "'Disponível AGORA com quantidade limitada' é mais poderoso que 'Clique no link da bio'." },
            { titulo: "Teste Múltiplas Versões", descricao: "Poste versão principal, depois teste alternativas. Aprenda qual funciona melhor." }
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b border-blue-200 last:border-0">
              <div className="w-1 bg-blue-600 rounded-full flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">{tip.titulo}</p>
                <p className="text-sm text-slate-600">{tip.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Métricas de Sucesso */}
      <Card className="border-l-4 border-l-blue-400">
        <CardHeader>
          <CardTitle className="text-lg">Métricas para Acompanhar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { metrica: "Visualizações", meta: "Mínimo 20K views (lançamento deve ter alcance maior)" },
            { metrica: "Saves", meta: "Mínimo 500 saves (indica interesse em compra futura)" },
            { metrica: "Shares", meta: "Mínimo 100 shares (vídeo deve ser compartilhado)" },
            { metrica: "Comentários", meta: "Mínimo 50 comentários" },
            { metrica: "Cliques no Link", meta: "Mínimo 200 cliques" },
            { metrica: "Conversão", meta: "Mínimo 25 compras (de 200 cliques)" }
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-slate-200 pb-2 last:border-0">
              <span className="font-semibold text-slate-700 text-sm">{item.metrica}</span>
              <span className="text-blue-600 font-medium text-sm">{item.meta}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            Checklist Final Antes de Postar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            "Vídeo tem exatamente 40 segundos",
            "Áudio está sincronizado com vídeo",
            "Texto está legível em celular (teste em celular real)",
            "Cores são vibrantes e consistentes",
            "Transições são suaves e elegantes",
            "Qualidade visual é premium (não pixelado)",
            "CTA é claro e urgente",
            "Link na bio está funcional",
            "Hashtags estão relevantes e populares",
            "Legenda está atrativa e inclui CTA",
            "Vídeo foi testado em diferentes celulares",
            "Áudio foi testado (volume correto, sem ruído)",
            "Você está satisfeita com o resultado final"
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 rounded" />
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
