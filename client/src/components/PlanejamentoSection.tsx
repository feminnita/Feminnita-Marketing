import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Video, MessageSquare } from "lucide-react";

const weekPlan = [
  {
    day: "Segunda-feira",
    theme: "Motivação e Renda Extra",
    contentType: "Reel (Vídeo dinâmico)",
    persona: "Carol",
    cta: "Comece a lucrar hoje! Clique no link da bio.",
    icon: Video,
    color: "from-amber-100 to-orange-100",
    borderColor: "border-amber-300"
  },
  {
    day: "Terça-feira",
    theme: "Qualidade e Diferencial",
    contentType: "Carrossel (Imagens detalhadas)",
    persona: "Renata",
    cta: "Salve este post para conferir os detalhes.",
    icon: Image,
    color: "from-blue-100 to-cyan-100",
    borderColor: "border-blue-300"
  },
  {
    day: "Quarta-feira",
    theme: "Lançamento e Novidade",
    contentType: "Reel (Provador rápido/Transições)",
    persona: "Luiza",
    cta: "Comente 'QUERO' para receber o catálogo.",
    icon: Video,
    color: "from-purple-100 to-fuchsia-100",
    borderColor: "border-purple-300"
  },
  {
    day: "Quinta-feira",
    theme: "Abastecimento de Estoque",
    contentType: "Imagem/Reel (Foto de caixas)",
    persona: "Renata",
    cta: "Garanta suas peças antes que acabem.",
    icon: Image,
    color: "from-blue-100 to-cyan-100",
    borderColor: "border-blue-300"
  },
  {
    day: "Sexta-feira",
    theme: "Compra Coletiva e Família",
    contentType: "Reel (Cenas de família/Amigas)",
    persona: "Vanessa",
    cta: "Marque as amigas que vão dividir o pedido!",
    icon: Video,
    color: "from-rose-100 to-pink-100",
    borderColor: "border-rose-300"
  },
  {
    day: "Sábado",
    theme: "Promoção e Oportunidade",
    contentType: "Imagem (Destaque de preço/Outlet)",
    persona: "Carol",
    cta: "Últimas peças! Preços a partir de R$ 10.",
    icon: Image,
    color: "from-amber-100 to-orange-100",
    borderColor: "border-amber-300"
  },
  {
    day: "Domingo",
    theme: "Engajamento e Lifestyle",
    contentType: "Story (Enquete/Caixa de Perguntas)",
    persona: "Luiza",
    cta: "Qual seu pijama favorito? Responda!",
    icon: MessageSquare,
    color: "from-purple-100 to-fuchsia-100",
    borderColor: "border-purple-300"
  }
];

const storyIdeas = [
  { day: "Segunda", content: "Caixa de Perguntas: Carol responde dúvidas sobre revenda.", objective: "Quebrar objeções iniciais" },
  { day: "Terça", content: "Enquete: Qual tecido você prefere? Suede ou Algodão?", objective: "Educar sobre o produto" },
  { day: "Quarta", content: "Contagem Regressiva para lançamento da nova coleção.", objective: "Criar hype e gerar tráfego" },
  { day: "Quinta", content: "Repost de Cliente: Pedidos sendo embalados (Prova Social).", objective: "Transmitir confiança" },
  { day: "Sexta", content: "Quiz: Qual pijama da família combina com você?", objective: "Entretenimento e identificação" },
  { day: "Sábado", content: "Flash Sale: Promoção relâmpago de 24h em um produto.", objective: "Venda imediata" },
  { day: "Domingo", content: "Bastidores: Preparação do estoque para a semana.", objective: "Humanizar a marca" }
];

export default function PlanejamentoSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Planejamento Semanal de Conteúdo</h2>
        <p className="text-slate-600">
          Calendário estratégico de postagens para Instagram e TikTok, cobrindo renda extra, qualidade, lançamentos, estoque, compras coletivas e promoções.
        </p>
      </div>

      {/* Weekly Calendar */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Feed Principal (Instagram & TikTok)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {weekPlan.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <Card key={idx} className={`border-l-4 ${item.borderColor} hover:shadow-md transition-shadow`}>
                <CardHeader className={`bg-gradient-to-r ${item.color} pb-4`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{item.day}</CardTitle>
                      <CardDescription className="font-semibold text-slate-700 mt-1">
                        {item.theme}
                      </CardDescription>
                    </div>
                    <IconComponent className="w-5 h-5 text-slate-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Tipo de Conteúdo</p>
                    <p className="text-sm text-slate-700 font-medium">{item.contentType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Persona</p>
                    <Badge variant="outline" className="mt-1">{item.persona}</Badge>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">CTA</p>
                    <p className="text-sm text-slate-700 italic">"{item.cta}"</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Stories Strategy */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Stories Diários (15 segundos cada)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {storyIdeas.map((story, idx) => (
            <Card key={idx} className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">{story.day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Conteúdo</p>
                  <p className="text-sm text-slate-700">{story.content}</p>
                </div>
                <div className="bg-rose-50 p-2 rounded border border-rose-200">
                  <p className="text-xs font-semibold text-rose-600 uppercase">Objetivo</p>
                  <p className="text-sm text-rose-700 font-medium">{story.objective}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Strategy Tips */}
      <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="text-lg">Dicas Estratégicas para Imagens e Vídeos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Imagens de Promoção</p>
              <p className="text-sm text-slate-600">Devem ser limpas, com o preço em destaque e informação de ATACADO e PEDIDO MÍNIMO R$ 199 sempre visível.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Lançamento</p>
              <p className="text-sm text-slate-600">Focar em vídeos curtos com música em alta, mostrando a peça em movimento e com transições de câmera.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">Abastecimento de Estoque</p>
              <p className="text-sm text-slate-600">Vídeos curtos e satisfatórios (ASMR de caixas abrindo) com legenda: "Seu estoque garantido para a semana!"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
