import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Play, Volume2, Palette, Settings, CheckCircle2 } from "lucide-react";

export default function RoteiroanunciaTikTokSection() {
  const timeline = [
    {
      segundo: "0-3",
      titulo: "GANCHO (Crítico)",
      descricao: "Close-up no rosto com frustração. Expressão de desespero olhando para celular.",
      audio: "Música viral começa (70%). Voz em off: 'Eu estava QUEBRADA...'",
      texto: "EU ESTAVA QUEBRADA",
      efeito: "Zoom leve no rosto. Filtro de saturação reduzida (cinza).",
      duracao: "3 segundos"
    },
    {
      segundo: "3-6",
      titulo: "PROBLEMA EXPANDIDO",
      descricao: "Montagem rápida: carteira vazia → contas/boletos → sentada pensativa",
      audio: "Voz em off: 'Sem emprego, sem renda, sem esperança...'",
      texto: "SEM EMPREGO → SEM RENDA → SEM ESPERANÇA",
      efeito: "Transições rápidas (0.5s). Zoom out suave. Saturação reduzida.",
      duracao: "3 segundos"
    },
    {
      segundo: "6-10",
      titulo: "VIRADA (Esperança)",
      descricao: "Notificação no celular: 'Aprovada para revender Feminnita'. Expressão muda para alegria.",
      audio: "Música muda para tom positivo. Voz em off: 'Até que um dia, descobri a Feminnita...' Som de notificação (ding).",
      texto: "ATÉ QUE UM DIA... → DESCOBRI A FEMINNITA",
      efeito: "Flash de luz branca (esperança). Saturação volta ao normal. Efeito de brilho.",
      duracao: "4 segundos"
    },
    {
      segundo: "10-18",
      titulo: "RESULTADO (Coração do Vídeo)",
      descricao: "Montagem 4 cenas: pijamas na cama → pedidos chegando → contando dinheiro → comprando",
      audio: "Voz em off: 'Em apenas 1 mês, ganhei R$ 2.500! Sem experiência, sem estoque, sem complicações!' Sons de notificação e dinheiro.",
      texto: "SEMANA 1: R$ 500 → SEMANA 2: R$ 750 → SEMANA 3: R$ 1.200 → TOTAL: R$ 2.500 EM APENAS 1 MÊS!",
      efeito: "Transições rápidas (0.5s). Números com efeito 'pop'. Confete digital quando total aparece.",
      duracao: "8 segundos"
    },
    {
      segundo: "18-24",
      titulo: "COMO FUNCIONA",
      descricao: "3 cenas: clicando no link → browsing catálogo → fotografando pijamas",
      audio: "Voz em off: 'É simples: 1) Se registre, 2) Escolha seus pijamas com desconto, 3) Comece a vender!'",
      texto: "1. SE REGISTRE → 2. ESCOLHA SEUS PIJAMAS → 3. COMECE A VENDER",
      efeito: "Transições suaves. Números com efeito 'pop'. Highlight em botões interativos.",
      duracao: "6 segundos"
    },
    {
      segundo: "24-27",
      titulo: "PROVA SOCIAL",
      descricao: "3 depoimentos rápidos de diferentes pessoas (1s cada): 'Ganhei R$ 1.500!' / 'Melhor cliente comprou 20 peças!' / 'Recomendo demais!'",
      audio: "Voz em off: 'Milhares de pessoas já estão ganhando com a Feminnita...' Ding de notificação em cada depoimento.",
      texto: "⭐ DEPOIMENTO REAL (acima de cada pessoa)",
      efeito: "Transições rápidas (0.3s). Frames ao redor de cada pessoa. Efeito de coração (like) durante depoimentos.",
      duracao: "3 segundos"
    },
    {
      segundo: "27-30",
      titulo: "CALL-TO-ACTION (CTA)",
      descricao: "Close-up no rosto, olhando direto para câmera, expressão confiante. Ambiente limpo, bem iluminado.",
      audio: "Voz em off: 'Você também pode! Clique no link da bio e comece AGORA!' Som de sucesso (ding positivo).",
      texto: "CLIQUE NO LINK DA BIO → COMECE AGORA! 🚀",
      efeito: "Glow ao redor do rosto. Efeito 'pulse' no texto CTA para atrair atenção.",
      duracao: "3 segundos"
    }
  ];

  const especificacoes = {
    audio: [
      { label: "Música de Fundo", valor: "Áudio viral do TikTok (ex: Levitating remix, Good as Hell remix)" },
      { label: "Volume Música", valor: "70%" },
      { label: "Voz em Off", valor: "Feminina, confiante, amigável, clara" },
      { label: "Volume Voz", valor: "80%" },
      { label: "Efeitos Sonoros", valor: "Notificação (ding), som de dinheiro, som de sucesso" },
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
      { nome: "Preto", hex: "#000000", uso: "Contorno de texto, profundidade" },
      { nome: "Vibrantes", hex: "Variadas", uso: "Cores dos pijamas (rosa, azul, verde, amarelo)" }
    ]
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Roteiro Detalhado de Vídeo para Anúncio TikTok</h2>
        <p className="text-slate-600">
          "Como Ganhei R$ 2.500 em 1 Mês Revendendo Pijamas (Sem Experiência)" - Roteiro completo de 30 segundos com timeline detalhada, áudio, efeitos visuais e dicas de produção.
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Roteiro de referência — valores são exemplos ilustrativos</p>
              <p className="text-sm text-slate-600 mt-1">
                Os ganhos (R$ 2.500/mês) e faturamento semanal são exemplos estratégicos para a narrativa do vídeo. Adapte com seus resultados reais antes de gravar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Gerais */}
      <Card className="border-l-4 border-l-rose-400 bg-gradient-to-r from-rose-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg">Informações Gerais do Vídeo</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Objetivo</p>
            <p className="text-slate-700">Captar pessoas que buscam renda extra, mostrar viabilidade e facilidade</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Público-Alvo</p>
            <p className="text-slate-700">Mulheres 18-45 anos, desempregadas ou buscando renda complementar</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Formato</p>
            <p className="text-slate-700">Antes/Depois + Prova Social + CTA</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Tom de Voz</p>
            <p className="text-slate-700">Entusiasmado, confiante, acessível</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Duração</p>
            <p className="text-slate-700 font-bold text-rose-600">30 segundos</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Estrutura Narrativa</p>
            <p className="text-slate-700">Problema → Solução → Resultado → CTA</p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Detalhada */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Timeline Detalhada (30 segundos)</h3>
        
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
                <Play className="w-5 h-5 text-green-600" />
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

      {/* Dicas de Produção */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-600" />
            Dicas de Produção e Gravação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold text-slate-900 mb-2">Equipamento Mínimo:</p>
            <ul className="text-sm text-slate-700 space-y-1 ml-4">
              <li>• Celular com câmera decente (iPhone 11+ ou Android equivalente)</li>
              <li>• Tripé ou suporte para celular</li>
              <li>• Luz natural (janela) ou anel de luz (R$ 50-100)</li>
              <li>• Microfone externo (opcional, mas recomendado)</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-900 mb-2">Ambiente de Gravação:</p>
            <ul className="text-sm text-slate-700 space-y-1 ml-4">
              <li>• Quarto/espaço pessoal limpo e organizado</li>
              <li>• Bem iluminado (preferencialmente luz natural)</li>
              <li>• Fundo neutro ou com elementos de "trabalho de casa"</li>
              <li>• Gravar perto de janela para melhor iluminação</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-900 mb-2">Técnica de Gravação:</p>
            <ul className="text-sm text-slate-700 space-y-1 ml-4">
              <li>• Primeiros 3s: Close-up no rosto (queixo até topo da cabeça)</li>
              <li>• Cenas de ação: Medium shot (cintura para cima) ou close-up em mãos</li>
              <li>• CTA final: Close-up no rosto (mesmo enquadramento do gancho)</li>
              <li>• Mantenha câmera estável (use tripé)</li>
              <li>• Evite movimento de câmera excessivo</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-900 mb-2">Expressões e Atuação:</p>
            <ul className="text-sm text-slate-700 space-y-1 ml-4">
              <li>• Primeira cena: Expressão genuína de preocupação</li>
              <li>• Virada: Mudança rápida para sorriso genuíno</li>
              <li>• Cenas de ação: Natural, como se estivesse realmente fazendo</li>
              <li>• CTA final: Olhar direto para câmera, sorriso confiante</li>
            </ul>
          </div>
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
            "Texto está legível em celular (teste em celular real)",
            "Cores estão vibrantes (não muito escuro ou claro)",
            "Transições são suaves e rápidas",
            "CTA é claro e visível",
            "Link na bio está funcional",
            "Hashtags estão relevantes e populares",
            "Legenda está atrativa",
            "Vídeo foi testado em diferentes celulares",
            "Áudio foi testado (sem ruído, volume correto)",
            "Você está satisfeita com o resultado final"
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1 rounded" />
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dicas Finais */}
      <Card className="border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">8 Dicas Finais para Maximizar Sucesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Autenticidade é Tudo", descricao: "Imperfeições aumentam confiança. Não tente parecer perfeita." },
            { titulo: "Números Específicos Convertem", descricao: "'R$ 2.500 em 1 mês' converte melhor que 'Ganhe muito dinheiro'." },
            { titulo: "Problema → Solução → Resultado", descricao: "Sempre siga esta estrutura. Pessoas precisam sentir o problema." },
            { titulo: "Velocidade é Chave", descricao: "Mantenha transições rápidas (0.3-0.5s). Não deixe cena por >3s." },
            { titulo: "CTA Clara e Direta", descricao: "'Clique no link da bio' é melhor que 'Saiba mais'." },
            { titulo: "Teste Múltiplas Versões", descricao: "Poste, meça, aprenda, otimize. Versão 2 sempre é melhor." },
            { titulo: "Engaje com Seu Público", descricao: "Responda comentários, DMs, agradeça shares." },
            { titulo: "Mantenha Consistência", descricao: "Se funcionar bem, crie variações similares." }
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b border-slate-300 last:border-0">
              <div className="w-1 bg-slate-600 rounded-full flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">{tip.titulo}</p>
                <p className="text-sm text-slate-600">{tip.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Métricas de Sucesso */}
      <Card className="border-l-4 border-l-rose-400">
        <CardHeader>
          <CardTitle className="text-lg">Métricas para Acompanhar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { metrica: "Visualizações", meta: "Mínimo 10K views" },
            { metrica: "Completion Rate", meta: "Mínimo 50% (assistindo até o final)" },
            { metrica: "Cliques no Link", meta: "Mínimo 100 cliques" },
            { metrica: "Compartilhamentos", meta: "Mínimo 50 shares" },
            { metrica: "Comentários", meta: "Mínimo 20 comentários" },
            { metrica: "Conversão", meta: "Mínimo 10 registros (de 100 cliques)" }
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-slate-200 pb-2 last:border-0">
              <span className="font-semibold text-slate-700 text-sm">{item.metrica}</span>
              <span className="text-rose-600 font-medium text-sm">{item.meta}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
