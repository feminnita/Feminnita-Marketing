import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Volume2, Palette, Users, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

export default function RoteiroAnuncioFamiliarSection() {
  const timeline = [
    {
      segundo: "0-3",
      titulo: "GANCHO (Problema Relatable)",
      descricao: "Mãe em loja de shopping, chocada com preço: R$ 149,90 por pijama",
      audio: "Música alegre com tom de 'problema'. Voz em off: 'Pijama de qualidade para toda a família? Caro demais...'",
      texto: "R$ 149,90 POR PIJAMA",
      efeito: "Zoom no rosto. Efeito 'shake' (tremor) na tela. Filtro de dessaturação.",
      duracao: "3 segundos"
    },
    {
      segundo: "3-7",
      titulo: "PROBLEMA EXPANDIDO (Cálculo)",
      descricao: "Montagem: calculando em celular → família inteira → expressão de 'caro demais' → desistindo",
      audio: "Voz em off: 'Para uma família de 4 pessoas, seriam R$ 600... E ainda faltam mais!'",
      texto: "4 PESSOAS × R$ 149,90 = R$ 599,60 | E AINDA FALTAM AVÓS, TIOS...",
      efeito: "Transições rápidas (0.5s). Números com efeito de 'vibração'. Tons frios/cinzentos.",
      duracao: "4 segundos"
    },
    {
      segundo: "7-12",
      titulo: "VIRADA (Descoberta)",
      descricao: "Mãe recebe notificação: 'Feminnita - Compre em Família e Economize até 60%'. Expressão muda para esperança.",
      audio: "Música muda para positiva e alegre. Voz em off: 'Até que descobri a Feminnita... E tudo mudou!' Som de notificação (ding).",
      texto: "DESCOBRI A FEMINNITA | COMPRE EM FAMÍLIA",
      efeito: "Zoom na notificação. Flash de luz branca (esperança). Saturação volta ao normal. Cores vibrantes.",
      duracao: "5 segundos"
    },
    {
      segundo: "12-20",
      titulo: "RESULTADO (Economia + Felicidade)",
      descricao: "Montagem 4 cenas: pijamas bonitos → família toda feliz em pijamas → cálculo de economia → família abraçada",
      audio: "Voz em off: 'Consegui pijamas de qualidade para TODA a minha família por apenas R$ 39,90 cada! Economizei R$ 440!' Música no pico de alegria.",
      texto: "1 PIJAMA: R$ 39,90 | 4 PIJAMAS: R$ 159,60 | ECONOMIA: R$ 440! | QUALIDADE + ECONOMIA + FAMÍLIA FELIZ",
      efeito: "Transições suaves (0.5s). Cores vibrantes e quentes. Confete digital quando economia aparece. Glow ao redor da família.",
      duracao: "8 segundos"
    },
    {
      segundo: "20-25",
      titulo: "COMO FUNCIONA (Simplicidade)",
      descricao: "3 cenas: escolhendo quantidade → escolhendo cores com filhos → caixa chegando e abrindo",
      audio: "Voz em off: 'É simples: 1) Escolha quantos pijamas sua família precisa, 2) Escolha as cores, 3) Receba em casa em 24-48h!'",
      texto: "1. ESCOLHA A QUANTIDADE | 2. ESCOLHA AS CORES | 3. RECEBA EM CASA",
      efeito: "Transições suaves. Números com efeito 'pop'. Highlight em botões. Cores quentes.",
      duracao: "5 segundos"
    },
    {
      segundo: "25-28",
      titulo: "PROVA SOCIAL (Depoimentos)",
      descricao: "3 mães diferentes (1s cada): 'Minha família toda usa!' / 'Economizei R$ 500!' / 'Meus filhos pedem todo dia!'",
      audio: "Voz em off: 'Milhares de famílias já confiam na Feminnita...' Ding de notificação em cada depoimento.",
      texto: "⭐ MÃE VERIFICADA (acima de cada pessoa)",
      efeito: "Transições rápidas (0.3s). Frames ao redor. Efeito de coração (like) durante depoimentos.",
      duracao: "3 segundos"
    },
    {
      segundo: "28-30",
      titulo: "CALL-TO-ACTION (CTA)",
      descricao: "Mãe (ou família inteira) olhando para câmera, abraçados em pijamas, felizes. Ambiente aconchego.",
      audio: "Voz em off: 'Reúna sua família e economize! Clique no link da bio e comece AGORA!' Som de sucesso (ding).",
      texto: "REÚNA SUA FAMÍLIA | CLIQUE NO LINK DA BIO | ECONOMIZE AGORA! 👨‍👩‍👧‍👦",
      efeito: "Glow ao redor da família. Efeito 'pulse' no texto CTA. Cores quentes e aconchego.",
      duracao: "2 segundos"
    }
  ];

  const especificacoes = {
    audio: [
      { label: "Música de Fundo", valor: "Áudio viral alegre/familiar (Good as Hell remix, Walking on Sunshine)" },
      { label: "Volume Música", valor: "60% (mais baixo para voz clara)" },
      { label: "Voz em Off", valor: "Feminina, maternal, confiante, calorosa" },
      { label: "Volume Voz", valor: "80%" },
      { label: "Efeitos Sonoros", valor: "Notificação (ding), caixa abrindo, som de sucesso" },
      { label: "Volume Efeitos", valor: "40-50%" }
    ],
    visuais: [
      { label: "Resolução", valor: "1080x1920px (padrão TikTok vertical)" },
      { label: "Aspect Ratio", valor: "9:16" },
      { label: "FPS", valor: "30fps" },
      { label: "Duração", valor: "Exatamente 30 segundos" },
      { label: "Codec", valor: "H.264" },
      { label: "Tamanho Máximo", valor: "287.6MB" }
    ],
    cores: [
      { nome: "Rosa Feminnita", hex: "#E84C89", uso: "Acentos, texto principal" },
      { nome: "Branco", hex: "#FFFFFF", uso: "Fundo de texto, clareza" },
      { nome: "Preto", hex: "#000000", uso: "Contorno de texto" },
      { nome: "Cores Quentes", hex: "Laranja/Ouro", uso: "Aconchego, família" },
      { nome: "Vibrantes", hex: "Variadas", uso: "Cores dos pijamas" }
    ]
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Roteiro de Vídeo para Anúncio - Compra Familiar</h2>
        <p className="text-slate-600">
          "Pijama para Toda a Família por MENOS que Uma Blusa" - Roteiro completo de 30 segundos focado em economia familiar e conforto compartilhado.
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Roteiro de referência — adapte preços e detalhes antes de gravar</p>
              <p className="text-sm text-slate-600 mt-1">
                Os valores (R$ 149,90, R$ 600, etc.) e métricas de resultado são exemplos estratégicos. Atualize com os preços reais do seu catálogo antes de usar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Gerais */}
      <Card className="border-l-4 border-l-pink-400 bg-gradient-to-r from-pink-50 to-rose-50">
        <CardHeader>
          <CardTitle className="text-lg">Informações Gerais do Vídeo</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Objetivo</p>
            <p className="text-slate-700">Captar famílias que buscam economizar, mostrando valor real e conforto compartilhado</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Público-Alvo</p>
            <p className="text-slate-700">Mães 25-50 anos, responsáveis por compras familiares, buscando economia</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Formato</p>
            <p className="text-slate-700">Problema (Preço Alto) → Solução (Compra em Família) → Resultado (Economia + Conforto)</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Tom de Voz</p>
            <p className="text-slate-700">Amigável, entusiasmado, confiável, maternal</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Duração</p>
            <p className="text-slate-700 font-bold text-rose-600">30 segundos</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Estilo Visual</p>
            <p className="text-slate-700">Caloroso, familiar, aspiracional, real</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Detalhada */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Timeline Detalhada (30 segundos)</h3>
        
        {timeline.map((item, idx) => (
          <Card key={idx} className="border-l-4 border-l-pink-400">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-pink-100 text-pink-800">{item.segundo}s</Badge>
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
                <Heart className="w-5 h-5 text-pink-600" />
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
                <Palette className="w-5 h-5 text-purple-600" />
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

      {/* Diferenças: Renda Extra vs Compra Familiar */}
      <Card className="border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            Comparação: Renda Extra vs Compra Familiar
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
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Público</td>
                  <td className="py-2 px-2 text-slate-600">Mulheres 18-45, desempregadas</td>
                  <td className="py-2 px-2 text-slate-600">Mães 25-50, responsáveis por compras</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Problema</td>
                  <td className="py-2 px-2 text-slate-600">Sem renda</td>
                  <td className="py-2 px-2 text-slate-600">Preço alto</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Solução</td>
                  <td className="py-2 px-2 text-slate-600">Revender pijamas</td>
                  <td className="py-2 px-2 text-slate-600">Comprar em família</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Resultado</td>
                  <td className="py-2 px-2 text-slate-600">R$ 2.500 em 1 mês</td>
                  <td className="py-2 px-2 text-slate-600">R$ 440 de economia</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Tom</td>
                  <td className="py-2 px-2 text-slate-600">Entusiasmado, esperançoso</td>
                  <td className="py-2 px-2 text-slate-600">Caloroso, familiar</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Cores</td>
                  <td className="py-2 px-2 text-slate-600">Rosa/Laranja (urgência)</td>
                  <td className="py-2 px-2 text-slate-600">Quentes/Ouro (aconchego)</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">CTA</td>
                  <td className="py-2 px-2 text-slate-600">"Clique no link da bio"</td>
                  <td className="py-2 px-2 text-slate-600">"Reúna sua família"</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 px-2 font-semibold text-slate-600">Meta de Views</td>
                  <td className="py-2 px-2 text-slate-600">10K</td>
                  <td className="py-2 px-2 text-slate-600">15K</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 font-semibold text-slate-600">Meta de Conversão</td>
                  <td className="py-2 px-2 text-slate-600">10 registros</td>
                  <td className="py-2 px-2 text-slate-600">15 registros</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dicas Finais */}
      <Card className="border-pink-200 bg-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            8 Dicas Finais para Maximizar Sucesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Autenticidade Familiar", descricao: "Use famílias reais (amigas, clientes, família própria). Imperfeições aumentam confiança." },
            { titulo: "Números Específicos", descricao: "'Economizei R$ 440' converte melhor que 'Economize muito'." },
            { titulo: "Emoção é Chave", descricao: "Vídeos sobre família tocam emocionalmente. Mostre genuinamente a felicidade." },
            { titulo: "Velocidade + Aconchego", descricao: "Mantenha transições rápidas mas transmita aconchego (cores quentes, luz natural)." },
            { titulo: "CTA Emocional", descricao: "'Reúna sua família e economize' é mais poderoso que 'Compre agora'." },
            { titulo: "Teste Múltiplas Versões", descricao: "Poste versão principal, depois teste variações. Aprenda qual funciona melhor." },
            { titulo: "Engaje com Famílias", descricao: "Responda comentários de mães/pais. Agradeça shares. Crie comunidade." },
            { titulo: "Mantenha Consistência", descricao: "Se funcionar bem, crie variações similares. Consistência aumenta reconhecimento." }
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b border-pink-200 last:border-0">
              <div className="w-1 bg-pink-600 rounded-full flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">{tip.titulo}</p>
                <p className="text-sm text-slate-600">{tip.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Métricas de Sucesso */}
      <Card className="border-l-4 border-l-pink-400">
        <CardHeader>
          <CardTitle className="text-lg">Métricas para Acompanhar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { metrica: "Visualizações", meta: "Mínimo 15K views (público familiar é maior)" },
            { metrica: "Completion Rate", meta: "Mínimo 55% (vídeo emocional retém mais)" },
            { metrica: "Cliques no Link", meta: "Mínimo 150 cliques" },
            { metrica: "Compartilhamentos", meta: "Mínimo 80 shares (vídeo familiar é compartilhado mais)" },
            { metrica: "Comentários", meta: "Mínimo 30 comentários" },
            { metrica: "Conversão", meta: "Mínimo 15 registros (de 150 cliques)" }
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-slate-200 pb-2 last:border-0">
              <span className="font-semibold text-slate-700 text-sm">{item.metrica}</span>
              <span className="text-pink-600 font-medium text-sm">{item.meta}</span>
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
            "Vídeo tem exatamente 30 segundos",
            "Áudio está sincronizado com vídeo",
            "Texto está legível em celular",
            "Cores são quentes e aconchego",
            "Transições são suaves mas dinâmicas",
            "CTA é claro e emocional",
            "Link na bio está funcional",
            "Hashtags estão relevantes",
            "Legenda está atrativa e emocional",
            "Vídeo foi testado em diferentes celulares",
            "Áudio foi testado (volume correto)",
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
