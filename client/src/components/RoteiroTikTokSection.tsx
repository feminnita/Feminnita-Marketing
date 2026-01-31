import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Volume2, Target, Zap, Music } from "lucide-react";

const roteirosTickTok = [
  {
    id: 1,
    nome: "Carol",
    titulo: "Como Ganhei R$ 500 em 1 Semana Vendendo Pijamas",
    duracao: "25 segundos",
    formato: "Antes/Depois (Transformação)",
    objetivo: "Captar atenção de pessoas que buscam renda extra",
    tom: "Entusiasmado, motivador",
    gancho: "Lucro rápido (R$ 500/semana)",
    publicoAlvo: "Iniciantes, desempregados",
    cta: "Clique no link da bio!",
    emocaoDominante: "Esperança, sucesso",
    cor: "from-amber-100 to-orange-100",
    borderColor: "border-amber-300",
    scenes: [
      {
        time: "0-2s",
        descricao: "Carol em primeiro plano, expressão séria/pensativa, com a mão no queixo",
        transicao: "Nenhuma (estática)",
        audio: "Música viral em alta (upbeat, tipo 'Levitating')",
        texto: "Eu: Desempregada",
        efeitoVisual: "Filtro preto e branco ou sépia"
      },
      {
        time: "2-3s",
        descricao: "Carol pisca ou faz movimento rápido",
        transicao: "Corte seco/Zoom rápido",
        audio: "Continuação da música",
        texto: "Até que...",
        efeitoVisual: "Efeito de transição (zoom ou spin)"
      },
      {
        time: "3-5s",
        descricao: "Carol com pijama Feminnita, sorrindo, segurando dinheiro (notas simuladas)",
        transicao: "Corte seco",
        audio: "Música continua, som de dinheiro (ding!)",
        texto: "Eu: Ganho R$ 500/semana!",
        efeitoVisual: "Filtro colorido ou efeito de brilho"
      },
      {
        time: "5-8s",
        descricao: "Rápido montage de 3-4 screenshots de mensagens de clientes (WhatsApp simulado)",
        transicao: "Corte rápido entre cada screenshot",
        audio: "Notificação de WhatsApp (som)",
        texto: "Meus clientes: 'Quero 5 pijamas!'",
        efeitoVisual: "Zoom leve em cada screenshot"
      },
      {
        time: "8-12s",
        descricao: "Close-up do pijama sendo mostrado, câmera faz zoom na etiqueta de preço",
        transicao: "Zoom suave",
        audio: "Voz de Carol: 'Compro por R$ 39,90'",
        texto: "Vendo por R$ 79,90",
        efeitoVisual: "Destaque em amarelo/rosa na etiqueta"
      },
      {
        time: "12-15s",
        descricao: "Carol aponta para câmera com expressão confiante, números aparecem na tela",
        transicao: "Corte seco",
        audio: "Voz de Carol: 'Lucro de 50%!'",
        texto: "50% de Lucro Garantido! 💰",
        efeitoVisual: "Animação de números crescendo"
      },
      {
        time: "15-20s",
        descricao: "Carol faz pergunta para câmera (close-up rosto)",
        transicao: "Nenhuma",
        audio: "Voz de Carol: 'Quer começar também?'",
        texto: "Você também pode!",
        efeitoVisual: "Sem efeitos (autêntico)"
      },
      {
        time: "20-25s",
        descricao: "Carol aponta para câmera com sorriso, link aparece na tela",
        transicao: "Corte seco",
        audio: "Voz de Carol: 'Clique no link da bio!' + Som de sucesso (ding!)",
        texto: "Link na Bio ⬆️ #RendaExtra",
        efeitoVisual: "Animação de seta apontando para cima"
      }
    ],
    hashtags: ["#RendaExtra", "#PrimeiroNegócio", "#FeminnitaLucro", "#ComoGanharDinheiro", "#EmpreendedorismoFeminino"],
    dicasProducao: "Use iluminação natural (janela) ou luz branca. Grave em vertical (9:16 aspect ratio). Mantenha movimento constante (câmera dinâmica). Coloque o texto na tela em letras grandes e coloridas. Reposte a cada 3-4 dias com pequenas variações."
  },
  {
    id: 2,
    nome: "Renata",
    titulo: "Lojista Revela o Segredo da Margem de Lucro",
    duracao: "28 segundos",
    formato: "Educacional/Dica com Autoridade",
    objetivo: "Captar lojistas e revendedores experientes",
    tom: "Profissional, confiante",
    gancho: "Margem de lucro (50% vs 25%)",
    publicoAlvo: "Lojistas experientes",
    cta: "Cadastre-se como revendedor!",
    emocaoDominante: "Segurança, confiança",
    cor: "from-blue-100 to-cyan-100",
    borderColor: "border-blue-300",
    scenes: [
      {
        time: "0-2s",
        descricao: "Renata em seu escritório/loja, expressão séria e profissional",
        transicao: "Nenhuma",
        audio: "Música profissional (instrumental, tipo lo-fi)",
        texto: "Lojista: Quer Aumentar Lucro?",
        efeitoVisual: "Sem filtro (profissional)"
      },
      {
        time: "2-4s",
        descricao: "Renata mostra uma nota fiscal com preço alto de outro fornecedor",
        transicao: "Corte seco",
        audio: "Voz de Renata: 'Seu fornecedor te cobra quanto?'",
        texto: "Fornecedor A: R$ 60 por peça",
        efeitoVisual: "Zoom na nota fiscal"
      },
      {
        time: "4-6s",
        descricao: "Renata faz gesto de 'não' com a cabeça, expressão desaprovadora",
        transicao: "Corte seco",
        audio: "Som de 'erro' (buzzer)",
        texto: "Muito Caro! ❌",
        efeitoVisual: "Efeito de shake/vibração"
      },
      {
        time: "6-9s",
        descricao: "Renata mostra um pijama Feminnita e a etiqueta de preço",
        transicao: "Corte seco",
        audio: "Voz de Renata: 'Feminnita: R$ 39,90 por peça'",
        texto: "Feminnita: R$ 39,90 ✅",
        efeitoVisual: "Destaque em verde na etiqueta"
      },
      {
        time: "9-12s",
        descricao: "Close-up: Renata mostra a costura, tecido e qualidade",
        transicao: "Zoom suave",
        audio: "Voz de Renata: 'Mesma qualidade, preço menor'",
        texto: "Mesma Qualidade, Melhor Preço!",
        efeitoVisual: "Zoom em detalhes (costura, tecido)"
      },
      {
        time: "12-15s",
        descricao: "Números aparecem na tela (Fornecedor A vs Feminnita)",
        transicao: "Animação de números",
        audio: "Voz de Renata: 'Veja a diferença'",
        texto: "Lucro: R$ 20 vs R$ 40 por peça",
        efeitoVisual: "Animação de números crescendo em verde"
      },
      {
        time: "15-19s",
        descricao: "Rápido montage de 2-3 depoimentos de lojistas (texto ou áudio)",
        transicao: "Corte rápido",
        audio: "Áudio de depoimentos ou som de aprovação",
        texto: "Lojistas: 'Aumentei 40% de lucro!'",
        efeitoVisual: "Zoom em cada depoimento"
      },
      {
        time: "19-24s",
        descricao: "Renata aponta para câmera com confiança",
        transicao: "Corte seco",
        audio: "Voz de Renata: 'Cadastre-se como revendedor'",
        texto: "Cadastre-se Agora! 📲",
        efeitoVisual: "Sem efeitos (direto)"
      },
      {
        time: "24-28s",
        descricao: "Renata segura o pijama em destaque, link aparece",
        transicao: "Corte seco",
        audio: "Voz de Renata: 'Link na bio para mais info' + Som de sucesso",
        texto: "Link na Bio para Cadastro ⬆️",
        efeitoVisual: "Animação de seta"
      }
    ],
    hashtags: ["#AtacadoPijamas", "#FornecedorConfiável", "#DicaParaLojista", "#MargemDeLucro", "#RevendedorPijamas"],
    dicasProducao: "Ambiente profissional mas acessível (escritório, loja). Iluminação clara e branca. Mantenha expressão séria mas amigável. Use gráficos/números na tela. Reposte a cada 4-5 dias com diferentes produtos/comparações."
  },
  {
    id: 3,
    nome: "Vanessa",
    titulo: "Compra Coletiva: Como Economizei R$ 250",
    duracao: "30 segundos",
    formato: "Lifestyle/Comunidade",
    objetivo: "Captar grupos de amigas e famílias que buscam economia",
    tom: "Alegre, descontraído",
    gancho: "Economia em grupo (R$ 250)",
    publicoAlvo: "Grupos de amigas/família",
    cta: "Marque suas amigas!",
    emocaoDominante: "Felicidade, comunidade",
    cor: "from-rose-100 to-pink-100",
    borderColor: "border-rose-300",
    scenes: [
      {
        time: "0-2s",
        descricao: "Vanessa com 2-3 amigas/familiares em casa, todas com expressão de dúvida",
        transicao: "Nenhuma",
        audio: "Música alegre e descontraída (tipo 'Good as Hell')",
        texto: "Amigas: 'Pijama é caro!'",
        efeitoVisual: "Filtro colorido ou efeito de brilho"
      },
      {
        time: "2-4s",
        descricao: "Montage rápida mostrando preços altos em lojas (screenshots ou imagens)",
        transicao: "Corte rápido",
        audio: "Áudio de frustração ou som de 'não'",
        texto: "Loja: R$ 80 por peça ❌",
        efeitoVisual: "Efeito de shake/vibração"
      },
      {
        time: "4-6s",
        descricao: "Vanessa tem uma ideia (lâmpada aparece na tela ou expressão de 'eureka')",
        transicao: "Corte seco com efeito",
        audio: "Voz de Vanessa: 'E se a gente comprasse junto?'",
        texto: "Ideia Brilhante! 💡",
        efeitoVisual: "Efeito de lâmpada ou estrelas"
      },
      {
        time: "6-10s",
        descricao: "Montage rápida de amigas escolhendo pijamas, conversando, rindo",
        transicao: "Corte rápido entre cenas",
        audio: "Voz de Vanessa: 'Cada uma escolhe o seu!' + Som de risadas",
        texto: "Escolhendo Juntas! 👯‍♀️",
        efeitoVisual: "Zoom em cada pessoa, cores vibrantes"
      },
      {
        time: "10-14s",
        descricao: "Vanessa mostra a nota fiscal final com o valor economizado destacado",
        transicao: "Corte seco",
        audio: "Voz de Vanessa: 'Olha só quanto economizamos!' + Som de dinheiro (ding!)",
        texto: "De R$ 800 → R$ 550! 💰",
        efeitoVisual: "Animação de números descendo em verde"
      },
      {
        time: "14-18s",
        descricao: "Cálculo rápido aparece na tela",
        transicao: "Animação de números",
        audio: "Voz de Vanessa: 'R$ 250 economizados!'",
        texto: "R$ 250 de Economia! 🎉",
        efeitoVisual: "Confete animado ou efeito de celebração"
      },
      {
        time: "18-23s",
        descricao: "Cena de todas vestindo os pijamas novos, sentadas juntas, rindo e se abraçando",
        transicao: "Corte rápido",
        audio: "Música alegre continua, som de risadas",
        texto: "Conforto + Economia = Felicidade!",
        efeitoVisual: "Sem efeitos (autêntico e genuíno)"
      },
      {
        time: "23-27s",
        descricao: "Vanessa aponta para câmera com sorriso contagiante",
        transicao: "Corte seco",
        audio: "Voz de Vanessa: 'Vocês também podem fazer isso!'",
        texto: "Marque Suas Amigas! 👇",
        efeitoVisual: "Sem efeitos (direto)"
      },
      {
        time: "27-30s",
        descricao: "Vanessa segura o celular mostrando o link",
        transicao: "Corte seco",
        audio: "Voz de Vanessa: 'Clique no link da bio!' + Som de sucesso",
        texto: "Link na Bio ⬆️ #CompraColetiva",
        efeitoVisual: "Animação de seta apontando para cima"
      }
    ],
    hashtags: ["#CompraColetiva", "#PijamaFamília", "#EconomiaFamiliar", "#ConfortoEmCasa", "#DicaDeAmiga"],
    dicasProducao: "Ambiente aconchego (sala de estar, sofá). Iluminação quente. Inclua pessoas reais (amigas, familiares). Capture momentos genuínos de risada. Use cores vibrantes nos pijamas. Reposte a cada 3-4 dias com diferentes grupos."
  }
];

export default function RoteiroTikTokSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Três Roteiros de Vídeo Curtos para TikTok</h2>
        <p className="text-slate-600">
          Roteiros otimizados para TikTok (20-30 segundos) com ganchos virais, transições dinâmicas e formatos que já comprovadamente geram milhares de views e conversões.
        </p>
      </div>

      <Tabs defaultValue="carol" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="carol">Carol</TabsTrigger>
          <TabsTrigger value="renata">Renata</TabsTrigger>
          <TabsTrigger value="vanessa">Vanessa</TabsTrigger>
        </TabsList>

        {roteirosTickTok.map((roteiro) => (
          <TabsContent key={roteiro.id} value={roteiro.nome.toLowerCase()} className="space-y-6">
            {/* Header Card */}
            <Card className={`border-l-4 ${roteiro.borderColor} bg-gradient-to-r ${roteiro.cor}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{roteiro.titulo}</CardTitle>
                    <CardDescription className="text-base font-semibold text-slate-700 mt-2">
                      Persona: {roteiro.nome}
                    </CardDescription>
                  </div>
                  <Badge className="text-sm">{roteiro.duracao}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="text-xs">{roteiro.formato}</Badge>
                  <Badge variant="secondary" className="text-xs">{roteiro.tom}</Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Metadata Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Características</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Gancho Principal</p>
                    <p className="text-slate-700">{roteiro.gancho}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Público-Alvo</p>
                    <p className="text-slate-700">{roteiro.publicoAlvo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Objetivo</p>
                    <p className="text-slate-700 text-xs">{roteiro.objetivo}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Emoção & CTA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Emoção Dominante</p>
                    <p className="text-slate-700">{roteiro.emocaoDominante}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">CTA Primária</p>
                    <p className="text-slate-700 font-medium text-rose-600">{roteiro.cta}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scenes Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Estrutura da Cena (Timeline)</h3>
              {roteiro.scenes.map((scene, idx) => (
                <Card key={idx} className="border-l-4 border-l-rose-400">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-sm font-bold">{scene.time}</Badge>
                      <p className="text-xs font-semibold text-rose-600 uppercase">{scene.transicao}</p>
                    </div>
                    <CardTitle className="text-base mt-2">{scene.descricao}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase mb-1 flex items-center gap-1">
                          <Music className="w-3 h-3" /> Áudio
                        </p>
                        <p className="text-sm text-blue-900">{scene.audio}</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded border border-amber-200">
                        <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Texto na Tela</p>
                        <p className="text-sm text-amber-900 font-medium">{scene.texto}</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                      <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Efeito Visual</p>
                      <p className="text-sm text-purple-900">{scene.efeitoVisual}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Hashtags */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Hashtags Recomendadas</h3>
              <div className="flex flex-wrap gap-2">
                {roteiro.hashtags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dicas de Produção */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Dicas de Produção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed">{roteiro.dicasProducao}</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* General Tips */}
      <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg">10 Dicas Essenciais para Sucesso no TikTok</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">1. Gancho nos Primeiros 3 Segundos</p>
              <p className="text-sm text-slate-600">O algoritmo favorece vídeos que geram engajamento imediato. Mantenha atenção com transições dinâmicas.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">2. Grave em Vertical (9:16)</p>
              <p className="text-sm text-slate-600">Use câmera do celular em 1080p ou superior com boa iluminação. Evite vídeos escuros.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">3. Áudio é Tudo</p>
              <p className="text-sm text-slate-600">Use sons virais do TikTok em volume alto. Mantenha voz clara e confiante.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">4. Texto Grande e Colorido</p>
              <p className="text-sm text-slate-600">Use letras grandes, legíveis e em cores que contratem com o fundo. Reforce a mensagem.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">5. Poste nos Horários de Pico</p>
              <p className="text-sm text-slate-600">6h-9h (manhã), 12h-14h (almoço) e 19h-23h (noite). Reposte a cada 3-4 dias.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">6. Responda Comentários Rapidamente</p>
              <p className="text-sm text-slate-600">Use Dueto e Stitches para criar conversas. Isso aumenta visibilidade no algoritmo.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">7. Replique com Variações</p>
              <p className="text-sm text-slate-600">Teste diferentes roupas, produtos, ambientes e cenários para identificar qual versão gera mais views.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">8. Analise Desempenho</p>
              <p className="text-sm text-slate-600">Use TikTok Analytics para acompanhar views, completion rate, engagement e click-through rate.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">9. Use 3-5 Hashtags</p>
              <p className="text-sm text-slate-600">Combine hashtags virais (#FYP #ForYouPage) com hashtags de nicho. Evite spam.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">10. CTA Clara e Específica</p>
              <p className="text-sm text-slate-600">Termine sempre com CTA clara: "Clique no link", "Marque uma amiga", "Comente sua opinião".</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
