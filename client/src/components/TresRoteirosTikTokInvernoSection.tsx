import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2, Zap, Music, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

export default function TresRoteirosTikTokInvernoSection() {
  const roteiros = [
    {
      numero: 1,
      titulo: "ASMR + SENSORIAL",
      descricao: "Foco em experiência sensorial: toque, som, conforto. Usa ASMR para criar conexão emocional.",
      duracao: "30s",
      gancho: "Som ASMR de tecido sendo tocado (muito satisfatório)",
      publico: "Mulheres 18-40, buscando relaxamento",
      tone: "Sussurrado, relaxante, confortável",
      musica: "Relaxante, suave",
      completionRate: "60-70%",
      cliques: "100-150",
      conversao: "8-12 registros",
      melhorPara: "Relaxamento, conforto, satisfação sensorial",
      cor: "bg-purple-50 border-purple-200"
    },
    {
      numero: 2,
      titulo: "ANTES/DEPOIS + TRANSFORMAÇÃO",
      descricao: "Foco em transformação: de frio/desconforto para conforto máximo. Formato viral.",
      duracao: "30s",
      gancho: "Contraste visual claro entre antes (frio) e depois (conforto)",
      publico: "Mulheres 20-45, buscando solução prática",
      tone: "Entusiasmado, confiante, prático",
      musica: "Energética, com beat claro",
      completionRate: "65-75%",
      cliques: "150-200",
      conversao: "12-18 registros",
      melhorPara: "Urgência, solução, transformação visível",
      cor: "bg-blue-50 border-blue-200"
    },
    {
      numero: 3,
      titulo: "TREND HIJACK + DESAFIO",
      descricao: "Foco em trend viral: 'Show Me Your...' ou 'Fit Check'. Múltiplas cores, divertido.",
      duracao: "30s",
      gancho: "Trend reconhecível (Fit Check) que público já conhece",
      publico: "Mulheres 16-40, buscando trends e fashion",
      tone: "Descontraído, divertido, convidativo",
      musica: "Viral, energética, trendy",
      completionRate: "70-80%",
      cliques: "200-300",
      conversao: "15-25 registros",
      melhorPara: "Engajamento, viralidade, compartilhamentos",
      cor: "bg-pink-50 border-pink-200"
    }
  ];

  const timeline1 = [
    { tempo: "0-3s", titulo: "Gancho Sensorial", descricao: "Close-up: mão tocando tecido. Som ASMR claro de tecido." },
    { tempo: "3-10s", titulo: "Experiência Sensorial", descricao: "Montagem 4 cenas com sons ASMR: tecido, lençol, movimento, respiração." },
    { tempo: "10-20s", titulo: "Reveal + Lifestyle", descricao: "Mulher acordando, tomando chá, relaxada em pijama de inverno." },
    { tempo: "20-28s", titulo: "Prova Social", descricao: "Depoimento de cliente + 3 cores diferentes do pijama." },
    { tempo: "28-30s", titulo: "CTA", descricao: "Mulher relaxada olhando para câmera. 'Seu conforto perfeito. Link na bio!'" }
  ];

  const timeline2 = [
    { tempo: "0-3s", titulo: "Gancho Antes", descricao: "Mulher tremendo de frio, desconfortável. Pijama inadequado." },
    { tempo: "3-6s", titulo: "Transição Dinâmica", descricao: "Efeito spin/flip rápido. Cores mudam de frias para quentes." },
    { tempo: "6-15s", titulo: "Depois (Solução)", descricao: "Mesma mulher confortável, relaxada, feliz em pijama de inverno." },
    { tempo: "15-24s", titulo: "Prova Social + Números", descricao: "Depoimentos de clientes + números (4 cores, 100% algodão, frete grátis)." },
    { tempo: "24-30s", titulo: "CTA + Urgência", descricao: "'Quantidade limitada! Clique no link da bio AGORA!'" }
  ];

  const timeline3 = [
    { tempo: "0-2s", titulo: "Gancho Trend", descricao: "Mulher fazendo 'fit check' em frente ao espelho. Trend reconhecível." },
    { tempo: "2-12s", titulo: "Montagem Rápida", descricao: "5 cenas (2s cada): azul marinho, cinza, vinho, preto, todas as cores." },
    { tempo: "12-20s", titulo: "Prova Social", descricao: "3 mulheres mostrando seus pijamas favoritos. Depoimentos entusiasmados." },
    { tempo: "20-28s", titulo: "CTA + Desafio", descricao: "'Clique no link e mostre seu fit check! Pode ser?'" },
    { tempo: "28-30s", titulo: "Fechamento", descricao: "Mulher acenando/sorrindo. 'Vem! Feminnita te espera!'" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Três Roteiros de Vídeo para TikTok - Variações do Lançamento de Inverno</h2>
        <p className="text-slate-600">
          Três abordagens diferentes para testar qual narrativa funciona melhor com seu público. Poste todos em paralelo durante 1-2 semanas e dobre a frequência do que melhor funcionar.
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Roteiros de referência — taxas de conversão são estimativas de mercado</p>
              <p className="text-sm text-slate-600 mt-1">
                As taxas de conclusão, cliques e conversões são benchmarks do nicho de moda/revenda no TikTok. Resultados reais variam conforme audiência e execução.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visão Geral dos 3 Roteiros */}
      <div className="grid md:grid-cols-3 gap-4">
        {roteiros.map((roteiro) => (
          <Card key={roteiro.numero} className={`${roteiro.cor} border-l-4`}>
            <CardHeader className="pb-3">
              <Badge className="w-fit mb-2 bg-slate-200 text-slate-800">Roteiro {roteiro.numero}</Badge>
              <CardTitle className="text-base">{roteiro.titulo}</CardTitle>
              <CardDescription className="text-xs">{roteiro.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="font-semibold text-slate-700">Gancho</p>
                <p className="text-slate-600">{roteiro.gancho}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Completion Rate</p>
                <p className="text-slate-600 font-bold text-green-600">{roteiro.completionRate}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Conversão</p>
                <p className="text-slate-600 font-bold text-blue-600">{roteiro.conversao}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detalhes de Cada Roteiro */}
      <Tabs defaultValue="roteiro1" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="roteiro1">Roteiro 1: ASMR</TabsTrigger>
          <TabsTrigger value="roteiro2">Roteiro 2: Antes/Depois</TabsTrigger>
          <TabsTrigger value="roteiro3">Roteiro 3: Trend Hijack</TabsTrigger>
        </TabsList>

        {/* ROTEIRO 1 */}
        <TabsContent value="roteiro1" className="space-y-4">
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-600" />
                Roteiro 1: ASMR + SENSORIAL
              </CardTitle>
              <CardDescription>Foco em experiência sensorial com sons ASMR satisfatórios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border border-purple-200">
                  <p className="text-xs font-semibold text-purple-600 uppercase mb-2">Público-Alvo</p>
                  <p className="text-sm text-slate-700">Mulheres 18-40 anos, buscando relaxamento e conforto</p>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <p className="text-xs font-semibold text-purple-600 uppercase mb-2">Tom de Voz</p>
                  <p className="text-sm text-slate-700">Sussurrado, relaxante, confortável</p>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <p className="text-xs font-semibold text-purple-600 uppercase mb-2">Música</p>
                  <p className="text-sm text-slate-700">Relaxante, suave (volume 40-50%)</p>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <p className="text-xs font-semibold text-purple-600 uppercase mb-2">Áudio Principal</p>
                  <p className="text-sm text-slate-700">Sons ASMR: tecido, lençol, movimento, respiração (70-85%)</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900 mb-3">Timeline (30 segundos)</p>
                <div className="space-y-2">
                  {timeline1.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-white p-3 rounded border border-purple-100">
                      <div className="w-1 bg-purple-600 rounded-full flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-purple-600 text-sm">{item.tempo} - {item.titulo}</p>
                        <p className="text-sm text-slate-600">{item.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-purple-200">
                <p className="font-semibold text-slate-900 mb-2">Métricas Esperadas</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Completion Rate</p>
                    <p className="font-bold text-purple-600">60-70%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Cliques</p>
                    <p className="font-bold text-purple-600">100-150</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Conversão</p>
                    <p className="font-bold text-purple-600">8-12</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROTEIRO 2 */}
        <TabsContent value="roteiro2" className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Roteiro 2: ANTES/DEPOIS + TRANSFORMAÇÃO
              </CardTitle>
              <CardDescription>Foco em transformação clara e contrastante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Público-Alvo</p>
                  <p className="text-sm text-slate-700">Mulheres 20-45 anos, buscando solução prática</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Tom de Voz</p>
                  <p className="text-sm text-slate-700">Entusiasmado, confiante, prático</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Música</p>
                  <p className="text-sm text-slate-700">Energética, com beat claro (volume 70%)</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Efeitos</p>
                  <p className="text-sm text-slate-700">Transição dinâmica (spin/flip), ding, tick-tock</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900 mb-3">Timeline (30 segundos)</p>
                <div className="space-y-2">
                  {timeline2.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-white p-3 rounded border border-blue-100">
                      <div className="w-1 bg-blue-600 rounded-full flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-600 text-sm">{item.tempo} - {item.titulo}</p>
                        <p className="text-sm text-slate-600">{item.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="font-semibold text-slate-900 mb-2">Métricas Esperadas</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Completion Rate</p>
                    <p className="font-bold text-blue-600">65-75%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Cliques</p>
                    <p className="font-bold text-blue-600">150-200</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Conversão</p>
                    <p className="font-bold text-blue-600">12-18</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROTEIRO 3 */}
        <TabsContent value="roteiro3" className="space-y-4">
          <Card className="bg-pink-50 border-pink-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                Roteiro 3: TREND HIJACK + DESAFIO
              </CardTitle>
              <CardDescription>Foco em trend viral (Fit Check) para máximo engajamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border border-pink-200">
                  <p className="text-xs font-semibold text-pink-600 uppercase mb-2">Público-Alvo</p>
                  <p className="text-sm text-slate-700">Mulheres 16-40 anos, buscando trends e fashion</p>
                </div>
                <div className="bg-white p-3 rounded border border-pink-200">
                  <p className="text-xs font-semibold text-pink-600 uppercase mb-2">Tom de Voz</p>
                  <p className="text-sm text-slate-700">Descontraído, divertido, convidativo</p>
                </div>
                <div className="bg-white p-3 rounded border border-pink-200">
                  <p className="text-xs font-semibold text-pink-600 uppercase mb-2">Música</p>
                  <p className="text-sm text-slate-700">Viral, energética, trendy (volume 80%)</p>
                </div>
                <div className="bg-white p-3 rounded border border-pink-200">
                  <p className="text-xs font-semibold text-pink-600 uppercase mb-2">Estilo Visual</p>
                  <p className="text-sm text-slate-700">Colorido, dinâmico, fashion-forward</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900 mb-3">Timeline (30 segundos)</p>
                <div className="space-y-2">
                  {timeline3.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-white p-3 rounded border border-pink-100">
                      <div className="w-1 bg-pink-600 rounded-full flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-pink-600 text-sm">{item.tempo} - {item.titulo}</p>
                        <p className="text-sm text-slate-600">{item.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-3 rounded border border-pink-200">
                <p className="font-semibold text-slate-900 mb-2">Métricas Esperadas</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Completion Rate</p>
                    <p className="font-bold text-pink-600">70-80%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Cliques</p>
                    <p className="font-bold text-pink-600">200-300</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Conversão</p>
                    <p className="font-bold text-pink-600">15-25</p>
                  </div>
                </div>
              </div>

              <div className="bg-pink-100 p-3 rounded border border-pink-300">
                <p className="text-sm text-pink-900"><strong>Vantagem:</strong> Trend Hijack incentiva compartilhamentos (150-250 shares esperados). Melhor para viralidade.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Estratégia de Postagem */}
      <Card className="border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg">Estratégia de Postagem Recomendada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold text-slate-900 mb-2">Semana 1-2: Teste Paralelo</p>
            <p className="text-sm text-slate-700 mb-3">Poste todos os 3 roteiros em paralelo para identificar qual funciona melhor:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 bg-white p-2 rounded">
                <span className="font-semibold text-purple-600">Segunda:</span>
                <span className="text-slate-700">Roteiro 1 (ASMR) - 21h-23h</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded">
                <span className="font-semibold text-blue-600">Quarta:</span>
                <span className="text-slate-700">Roteiro 2 (Antes/Depois) - 19h-21h</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded">
                <span className="font-semibold text-pink-600">Sexta:</span>
                <span className="text-slate-700">Roteiro 3 (Trend Hijack) - 18h-20h</span>
              </div>
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-900 mb-2">Semana 3+: Dobrar o Melhor</p>
            <p className="text-sm text-slate-700">Baseado em métricas (completion rate, cliques, conversões), dobre a frequência do roteiro que melhor funcionou. Continue testando os outros 2 com frequência menor.</p>
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-blue-900"><strong>Dica:</strong> Acompanhe métricas em tempo real. Responda comentários nos primeiros 30 minutos para aumentar chances de viralizar.</p>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            Checklist de Produção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-semibold text-slate-900 mb-2">Antes de Gravar</p>
            <div className="space-y-1 text-sm">
              {[
                "Equipamento testado (câmera, microfone, iluminação)",
                "Áudio preparado (ASMR para Roteiro 1, música viral para Roteiros 2 e 3)",
                "Ambiente preparado (limpeza, iluminação, fundo)",
                "Pijamas prontos (todas as cores para Roteiro 3)",
                "Roteiros memorizados ou em cards fora de câmera",
                "Múltiplas takes preparadas (mínimo 3 takes por cena)"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-900 mb-2">Durante a Edição</p>
            <div className="space-y-1 text-sm">
              {[
                "Sincronizar áudio com vídeo",
                "Adicionar transições (0.3s)",
                "Adicionar texto com animações",
                "Balancear volumes",
                "Adicionar efeitos visuais",
                "Testar em celular real"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-900 mb-2">Antes de Postar</p>
            <div className="space-y-1 text-sm">
              {[
                "Vídeo tem exatamente 30 segundos",
                "Qualidade visual é boa (não pixelado)",
                "Áudio está claro (sem ruído)",
                "CTA é claro e visível",
                "Link na bio está funcional",
                "Hashtags estão relevantes",
                "Legenda está atrativa"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas Finais */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">8 Dicas Finais para Maximizar Sucesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Qualidade de Áudio é Crítica", descricao: "Especialmente para Roteiro 1 (ASMR). Invista em microfone externo de qualidade." },
            { titulo: "Velocidade + Dinamismo", descricao: "TikTok adora velocidade. Mantenha transições rápidas (0.3s) e mudanças constantes." },
            { titulo: "Teste Múltiplas Versões", descricao: "Não espere versão 'perfeita'. Poste os 3 roteiros e meça qual funciona melhor." },
            { titulo: "Responda Comentários Rapidamente", descricao: "Engajamento rápido aumenta chances de viralizar. Responda nos primeiros 30 minutos." },
            { titulo: "Use Trending Sounds", descricao: "Especialmente para Roteiro 3. Use sons que estão em alta no TikTok no momento." },
            { titulo: "Mantenha Consistência", descricao: "Se um roteiro funcionar bem, crie variações similares. Consistência aumenta reconhecimento." },
            { titulo: "Acompanhe Métricas", descricao: "Rastreie completion rate, cliques, conversões. Otimize baseado em dados reais." },
            { titulo: "Crie Urgência", descricao: "Todos os roteiros devem ter elemento de urgência ('Quantidade limitada', 'Agora', 'Mostre seu fit check')." }
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
    </div>
  );
}
