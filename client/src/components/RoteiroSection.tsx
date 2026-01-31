import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Volume2, Target } from "lucide-react";

const roteiros = [
  {
    id: 1,
    title: "Renda Extra e Primeiro Investimento",
    persona: "Carol",
    audience: "Pessoas que buscam renda extra e revendedores iniciantes",
    duration: "20 segundos",
    scenes: [
      {
        time: "0-3s",
        title: "Gancho",
        description: "Carol aparece com uma caixa de papelão, expressão de surpresa.",
        audio: "Música animada em alta",
        text: "Comprei R$ 199 em pijamas e olha o que aconteceu!"
      },
      {
        time: "4-10s",
        title: "Desenvolvimento",
        description: "Carol abre a caixa, mostra os pijamas e a etiqueta de preço.",
        audio: "Voz da Carol: Esse foi o melhor investimento que fiz!",
        text: "Lucro de 50% garantido!"
      },
      {
        time: "11-15s",
        title: "Prova Social",
        description: "Carol mostra celular com mensagens de clientes (simuladas).",
        audio: "Continuação do áudio",
        text: "Já vendi metade em 2 dias!"
      },
      {
        time: "16-20s",
        title: "Fechamento/CTA",
        description: "Carol sorri e aponta para o link.",
        audio: "Clique aqui e peça o seu catálogo agora!",
        text: "QUERO O CATÁLOGO"
      }
    ],
    cta: "Quero o Catálogo de Atacado"
  },
  {
    id: 2,
    title: "Qualidade e Variedade para Lojistas",
    persona: "Renata",
    audience: "Lojistas e revendedores experientes",
    duration: "20 segundos",
    scenes: [
      {
        time: "0-3s",
        title: "Gancho",
        description: "Renata em sua loja/escritório, expressão profissional, segurando pijama de Suede.",
        audio: "Música profissional e confiável",
        text: "Lojista, seu fornecedor te entrega isso?"
      },
      {
        time: "4-10s",
        title: "Desenvolvimento",
        description: "Close-up do tecido, costura, etiqueta. Mostra variedade (Plus Size, Masculino).",
        audio: "Voz da Renata: Garanto qualidade para minhas clientes",
        text: "Tecido premium, modelagem perfeita"
      },
      {
        time: "11-15s",
        title: "Logística",
        description: "Imagem de caixas sendo postadas.",
        audio: "Continuação",
        text: "Postagem Imediata e 5% OFF no PIX"
      },
      {
        time: "16-20s",
        title: "Fechamento/CTA",
        description: "Renata aponta para o site.",
        audio: "Cadastre-se como revendedor Feminnita",
        text: "CADASTRE-SE AGORA"
      }
    ],
    cta: "Cadastre-se como Revendedor"
  },
  {
    id: 3,
    title: "Compra Coletiva e Economia Familiar",
    persona: "Vanessa",
    audience: "Grupos de amigas, mães e famílias",
    duration: "20 segundos",
    scenes: [
      {
        time: "0-3s",
        title: "Gancho",
        description: "Vanessa com família/amigas vestindo pijamas combinando (Kits Família).",
        audio: "Música alegre e familiar",
        text: "Pijamas para a família toda com preço de atacado!"
      },
      {
        time: "4-10s",
        title: "Desenvolvimento",
        description: "Mostra pilha de pijamas e nota fiscal com valor total e desconto.",
        audio: "Voz da Vanessa: Economizamos muito!",
        text: "Muito mais barato que loja de varejo"
      },
      {
        time: "11-15s",
        title: "Benefício",
        description: "Cenas de conforto e união (filme, café da manhã).",
        audio: "Música de fundo",
        text: "Conforto e economia para todos"
      },
      {
        time: "16-20s",
        title: "Fechamento/CTA",
        description: "Vanessa convida o público.",
        audio: "Organize sua compra coletiva agora!",
        text: "MARQUE SUAS AMIGAS"
      }
    ],
    cta: "Organizar Compra Coletiva"
  }
];

const storyRoteiros = [
  {
    theme: "Lançamento",
    cena: "Luiza faz transição rápida vestindo o novo pijama",
    texto: "O Baby Doll Blogueira que acabou de chegar! 💖 Atacado R$ 49,90",
    link: "Link na bio para ver a coleção"
  },
  {
    theme: "Estoque",
    cena: "Vídeo satisfatório de caixas sendo empilhadas",
    texto: "Seu estoque garantido! Postagem Imediata Feminnita",
    link: "Fale com nosso time no WhatsApp"
  },
  {
    theme: "Promoção",
    cena: "Carol mostra um pijama do Outlet",
    texto: "Últimas peças no Outlet! Pijamas a partir de R$ 10",
    link: "Corre antes que acabe! 🏃‍♀️"
  },
  {
    theme: "Dica de Revenda",
    cena: "Renata dando uma dica rápida",
    texto: "O segredo é ter variedade. Plus Size, Infantil e Masculino",
    link: "Fale com a gente para mais dicas"
  }
];

export default function RoteiroSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Roteiros de Vídeos para Stories e Ads</h2>
        <p className="text-slate-600">
          Roteiros detalhados baseados em formatos que já venderam milhares de peças no TikTok. Cada roteiro inclui timing, áudio, texto na tela e chamada para ação.
        </p>
      </div>

      {/* Main Roteiros */}
      <Tabs defaultValue="roteiro-1" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          {roteiros.map((roteiro) => (
            <TabsTrigger key={roteiro.id} value={`roteiro-${roteiro.id}`} className="text-xs sm:text-sm">
              {roteiro.persona}
            </TabsTrigger>
          ))}
        </TabsList>

        {roteiros.map((roteiro) => (
          <TabsContent key={roteiro.id} value={`roteiro-${roteiro.id}`} className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">{roteiro.title}</CardTitle>
                <CardDescription className="flex gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {roteiro.persona}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {roteiro.duration}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{roteiro.audience}</p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {roteiro.scenes.map((scene, idx) => (
                <Card key={idx} className="border-l-4 border-l-rose-400">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">{scene.time}</Badge>
                        <CardTitle className="text-base">{scene.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Descrição da Cena</p>
                      <p className="text-sm text-slate-700">{scene.description}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase mb-1 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> Áudio
                        </p>
                        <p className="text-sm text-blue-900">{scene.audio}</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded border border-amber-200">
                        <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Texto na Tela</p>
                        <p className="text-sm text-amber-900 font-medium">{scene.text}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
              <CardHeader>
                <CardTitle className="text-base">Chamada para Ação (CTA)</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-rose-600 hover:bg-rose-700 text-white text-sm py-2 px-4">
                  {roteiro.cta}
                </Badge>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Stories Roteiros */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Roteiros para Stories (15 segundos)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {storyRoteiros.map((story, idx) => (
            <Card key={idx} className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">{story.theme}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Cena</p>
                  <p className="text-sm text-slate-700">{story.cena}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Texto</p>
                  <p className="text-sm text-slate-800 font-medium">{story.texto}</p>
                </div>
                <div className="bg-rose-50 p-3 rounded border border-rose-200">
                  <p className="text-xs font-semibold text-rose-600 uppercase mb-1">Link/CTA</p>
                  <p className="text-sm text-rose-700">{story.link}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Elements */}
      <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Elementos-Chave para Sucesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Gancho (0-3 segundos)</p>
              <p className="text-sm text-slate-600">Deve captar atenção imediatamente com uma pergunta, surpresa ou promessa.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Prova Social</p>
              <p className="text-sm text-slate-600">Mostrar mensagens de clientes, números de vendas ou depoimentos reais (ou simulados de forma convincente).</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Transições Dinâmicas</p>
              <p className="text-sm text-slate-600">Usar cortes rápidos, mudanças de cenário e efeitos de transição para manter o engajamento.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">CTA Clara</p>
              <p className="text-sm text-slate-600">Sempre terminar com uma ação clara: "Clique", "Comente", "Marque", "Fale com a gente".</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
