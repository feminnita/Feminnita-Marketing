import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Volume2, Target, Zap, AlertCircle } from "lucide-react";

const novosRoteiros = [
  {
    id: 1,
    nome: "Carol",
    titulo: "Meu Primeiro Pedido Chegou!",
    duracao: "15 segundos",
    objetivo: "Criar identificação com pessoas que estão considerando começar a revender",
    tom: "Entusiasmado, autêntico",
    ambiente: "Casa (casual)",
    publicoAlvo: "Iniciantes, mães",
    cta: "Clique no link da bio e peça o seu catálogo!",
    emocaoDominante: "Surpresa positiva",
    cor: "from-amber-100 to-orange-100",
    borderColor: "border-amber-300",
    scenes: [
      {
        time: "0-2s",
        descricao: "Carol abre a porta de casa com uma caixa de papelão nos braços, olhando para câmera com surpresa",
        audio: "Som de campainha + música animada (upbeat)",
        texto: "Chegou! 📦",
        emocao: "Entusiasmo"
      },
      {
        time: "2-5s",
        descricao: "Ela coloca a caixa na mesa e abre rapidamente, mostrando os pijamas bem embalados",
        audio: "Música continua, som de papel sendo rasgado (ASMR)",
        texto: "Meu primeiro pedido Feminnita!",
        emocao: "Alegria"
      },
      {
        time: "5-8s",
        descricao: "Close-up: Carol pega um pijama, mostra a etiqueta de preço (R$ 39,90) e faz expressão de aprovação",
        audio: "Voz de Carol: 'Que qualidade! Que preço!'",
        texto: "Comprei por R$ 39,90",
        emocao: "Satisfação"
      },
      {
        time: "8-12s",
        descricao: "Carol mostra o celular com mensagens de amigas perguntando sobre o pijama (simuladas)",
        audio: "Notificações de WhatsApp (som) + música",
        texto: "Já tô recebendo pedidos! 💬",
        emocao: "Surpresa positiva"
      },
      {
        time: "12-15s",
        descricao: "Carol aponta para câmera com um sorriso confiante",
        audio: "Voz de Carol: 'Quer começar também?'",
        texto: "Clique no link da bio! ⬆️",
        emocao: "Convite amigável"
      }
    ],
    hashtags: ["#RendaExtra", "#PrimeiroNegócio", "#FeminnitaLucro", "#EmpreendedorismoFeminino"],
    dicasProducao: "Carol deve parecer genuinamente surpresa e feliz. O foco é transmitir que é fácil começar e que o resultado é imediato. Use roupas casuais para manter a autenticidade. A caixa deve estar bem embalada (transmite profissionalismo da Feminnita)."
  },
  {
    id: 2,
    nome: "Renata",
    titulo: "Análise Rápida de Qualidade",
    duracao: "18 segundos",
    objetivo: "Demonstrar autoridade e conhecimento técnico para lojistas",
    tom: "Profissional, confiante",
    ambiente: "Escritório/loja (profissional)",
    publicoAlvo: "Lojistas experientes",
    cta: "Cadastre-se como revendedor Feminnita!",
    emocaoDominante: "Segurança profissional",
    cor: "from-blue-100 to-cyan-100",
    borderColor: "border-blue-300",
    scenes: [
      {
        time: "0-2s",
        descricao: "Renata em seu escritório/loja, com uma mesa limpa. Ela pega um pijama de Suede com confiança",
        audio: "Música profissional (instrumental)",
        texto: "Dica de Lojista 💡",
        emocao: "Profissionalismo"
      },
      {
        time: "2-5s",
        descricao: "Close-up: Renata mostra a costura do pijama, passando o dedo pela borda",
        audio: "Voz de Renata: 'Vejam a costura perfeita, sem fios soltos'",
        texto: "Costura de Qualidade",
        emocao: "Análise técnica"
      },
      {
        time: "5-8s",
        descricao: "Renata toca o tecido (Suede) e faz expressão de aprovação",
        audio: "Voz de Renata: 'Tecido macio, durável, não desbota'",
        texto: "Tecido Premium",
        emocao: "Satisfação profissional"
      },
      {
        time: "8-11s",
        descricao: "Renata mostra a etiqueta interna com informações (tamanho, composição)",
        audio: "Voz de Renata: 'Etiqueta clara, informações completas para seus clientes'",
        texto: "Transparência Total",
        emocao: "Confiança"
      },
      {
        time: "11-15s",
        descricao: "Renata aponta para câmera com expressão séria mas amigável",
        audio: "Voz de Renata: 'Seus clientes vão perceber a diferença'",
        texto: "Qualidade que Vende",
        emocao: "Segurança"
      },
      {
        time: "15-18s",
        descricao: "Renata segura o pijama em destaque e aponta para o link",
        audio: "Voz de Renata: 'Cadastre-se como revendedor Feminnita!'",
        texto: "Fale com a gente! 📲",
        emocao: "Convite profissional"
      }
    ],
    hashtags: ["#AtacadoPijamas", "#FornecedorConfiável", "#MargemDeLucro", "#QualidadeGarantida"],
    dicasProducao: "Renata deve parecer confiante e experiente. Use linguagem técnica mas acessível. O ambiente deve ser profissional mas não intimidador. O foco é transmitir que a Feminnita é um fornecedor sério e confiável. Profissionalismo é mais importante que carisma aqui."
  },
  {
    id: 3,
    nome: "Vanessa",
    titulo: "Compra Coletiva com as Amigas",
    duracao: "20 segundos",
    objetivo: "Criar senso de comunidade e mostrar economia ao comprar em grupo",
    tom: "Alegre, descontraído",
    ambiente: "Sala de estar (aconchego)",
    publicoAlvo: "Grupos de amigas/família",
    cta: "Marque suas amigas e organize uma compra coletiva!",
    emocaoDominante: "Felicidade compartilhada",
    cor: "from-rose-100 to-pink-100",
    borderColor: "border-rose-300",
    scenes: [
      {
        time: "0-3s",
        descricao: "Vanessa em casa com 2-3 amigas/familiares ao redor. Todas segurando pijamas diferentes",
        audio: "Música alegre, som de risadas",
        texto: "Compra Coletiva Feminnita! 👯‍♀️",
        emocao: "Diversão"
      },
      {
        time: "3-6s",
        descricao: "Câmera faz zoom em cada pessoa mostrando o pijama que escolheu",
        audio: "Voz de Vanessa: 'Cada uma escolhe o seu!'",
        texto: "Variedade para Todos",
        emocao: "Inclusão"
      },
      {
        time: "6-9s",
        descricao: "Vanessa mostra uma nota fiscal (simulada ou real) na câmera com o valor total destacado",
        audio: "Voz de Vanessa: 'Olha só quanto economizamos!'",
        texto: "De R$ 800 por R$ 550! 💰",
        emocao: "Surpresa positiva"
      },
      {
        time: "9-12s",
        descricao: "Cena de todas sentadas no sofá, vestindo os pijamas novos, rindo e se mostrando",
        audio: "Música alegre, som de risadas",
        texto: "Conforto e Economia!",
        emocao: "Felicidade"
      },
      {
        time: "12-15s",
        descricao: "Vanessa aponta para câmera com expressão amigável",
        audio: "Voz de Vanessa: 'Vocês também podem fazer isso!'",
        texto: "Marque suas Amigas! 👇",
        emocao: "Convite"
      },
      {
        time: "15-20s",
        descricao: "Vanessa segura o celular mostrando o link",
        audio: "Voz de Vanessa: 'Clique aqui e organize sua compra coletiva!'",
        texto: "Clique no Link da Bio 📱",
        emocao: "Ação"
      }
    ],
    hashtags: ["#CompraColetiva", "#PijamaFamília", "#EconomiaFamiliar", "#ConfortoEmCasa"],
    dicasProducao: "Este roteiro é o mais descontraído e divertido. Vanessa deve parecer genuinamente feliz e conectada com as pessoas ao seu redor. O foco é transmitir união, economia e conforto. Use cores vibrantes nos pijamas para criar contraste visual. As pessoas ao fundo devem estar naturais e autênticas."
  }
];

export default function NovoRoteiroStoriesSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Três Novos Roteiros de Stories - Personas Específicas</h2>
        <p className="text-slate-600">
          Roteiros detalhados de 15-20 segundos, cada um focado em uma persona diferente. Estes vídeos são projetados para Stories com máxima autenticidade e engajamento direto.
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Roteiros de referência — adapte ao seu produto e estilo</p>
              <p className="text-sm text-slate-600 mt-1">
                Os roteiros abaixo são exemplos estratégicos baseados nas personas da Feminnita. Personalize o texto, preços e detalhes antes de gravar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="carol" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="carol">Carol</TabsTrigger>
          <TabsTrigger value="renata">Renata</TabsTrigger>
          <TabsTrigger value="vanessa">Vanessa</TabsTrigger>
        </TabsList>

        {novosRoteiros.map((roteiro) => (
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
                <p className="text-sm text-slate-700 mt-4 italic">{roteiro.objetivo}</p>
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
                    <p className="text-xs font-semibold text-slate-500 uppercase">Tom</p>
                    <p className="text-slate-700">{roteiro.tom}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Ambiente</p>
                    <p className="text-slate-700">{roteiro.ambiente}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Público-Alvo</p>
                    <p className="text-slate-700">{roteiro.publicoAlvo}</p>
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
                      <p className="text-xs font-semibold text-rose-600 uppercase">{scene.emocao}</p>
                    </div>
                    <CardTitle className="text-base mt-2">{scene.descricao}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase mb-1 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> Áudio
                        </p>
                        <p className="text-sm text-blue-900">{scene.audio}</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded border border-amber-200">
                        <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Texto na Tela</p>
                        <p className="text-sm text-amber-900 font-medium">{scene.texto}</p>
                      </div>
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
          <CardTitle className="text-lg">Dicas Gerais de Produção para Stories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Qualidade de Vídeo</p>
              <p className="text-sm text-slate-600">Use câmera do celular em boa iluminação (evita parecer amador demais, mas mantém autenticidade).</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Áudio Claro</p>
              <p className="text-sm text-slate-600">Invista em áudio claro. Use música de fundo baixa (não abafe a voz). Considere usar legendas para melhor engajamento.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Timing de Postagem</p>
              <p className="text-sm text-slate-600">Poste nos horários de pico: 19h-22h (noite) e 12h-13h (almoço). Stories têm validade de 24h, então reposte a cada dia em horários diferentes.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Autenticidade</p>
              <p className="text-sm text-slate-600">Não precisa ser perfeito. Imperfeições (pequenos erros, risadas, momentos naturais) aumentam a identificação com o público.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Replicação e Testes</p>
              <p className="text-sm text-slate-600">Após criar os vídeos, replique com pequenas variações (diferentes roupas, ambientes, horários) para testar qual versão gera mais engajamento.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
