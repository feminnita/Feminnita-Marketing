import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, TrendingUp, Heart } from "lucide-react";

const personas = [
  {
    id: 1,
    name: "Carol",
    age: 24,
    title: "A Empreendedora Iniciante",
    icon: Sparkles,
    color: "from-amber-500 to-orange-500",
    image: "/images/persona-carol.png",
    description: "Estudante ou recém-formada buscando renda extra para independência financeira.",
    audience: "Pessoas que buscam primeiro negócio, mães com flexibilidade de horário.",
    contentStyle: "Autêntico e Entusiasmado",
    videoHooks: [
      "Comprei R$ 199 em pijamas e olha quanto lucrei!",
      "Como ter renda extra sem sair de casa",
      "Meu primeiro pedido Feminnita chegou!"
    ],
    keywords: ["#RendaExtra", "#PrimeiroNegócio", "#EmpreendedorismoFeminino", "#FeminnitaLucroFácil"],
    focus: "Facilidade de começar e lucro rápido"
  },
  {
    id: 2,
    name: "Renata",
    age: 38,
    title: "A Dona de Loja",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    image: "/images/persona-renata.png",
    description: "Dona de loja física ou e-commerce buscando fornecedores confiáveis com qualidade.",
    audience: "Lojistas, revendedores experientes, empreendedores que buscam escala.",
    contentStyle: "Profissional e Informativo",
    videoHooks: [
      "O segredo do meu lucro: Fornecedor de Pijamas com 5% OFF no PIX",
      "Tecidos que vendem sozinhos: Análise de Qualidade Feminnita",
      "Como o Plus Size aumentou meu faturamento"
    ],
    keywords: ["#AtacadoDePijamas", "#FornecedorConfiável", "#MargemDeLucro", "#ModaIntimaAtacado"],
    focus: "Qualidade, variedade e postagem imediata"
  },
  {
    id: 3,
    name: "Vanessa",
    age: 45,
    title: "A Líder de Grupo",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    image: "/images/persona-vanessa.png",
    description: "Mãe de família que organiza compras coletivas para economizar com amigas e família.",
    audience: "Grupos de compra, famílias grandes, amigas que compram juntas.",
    contentStyle: "Prático e Afetivo",
    videoHooks: [
      "Compramos pijamas para a família inteira no atacado e economizamos R$ 500!",
      "Kits Família: O pijama perfeito para a noite do filme",
      "Como convencer suas amigas a fazerem uma compra coletiva"
    ],
    keywords: ["#CompraColetiva", "#PijamaFamília", "#EconomiaFamiliar", "#ConfortoEmCasa"],
    focus: "Economia e conforto familiar"
  },
  {
    id: 4,
    name: "Luiza",
    age: 21,
    title: "A Trendsetter",
    icon: TrendingUp,
    color: "from-purple-500 to-fuchsia-500",
    image: "/images/persona-luiza.png",
    description: "Fashionista antenada em tendências que vê o pijama como peça de moda e loungewear.",
    audience: "Jovens, público que valoriza estética, revendedores focados em moda.",
    contentStyle: "Visual e Dinâmico",
    videoHooks: [
      "Transformação: Do look do dia para o look da noite com o mesmo pijama!",
      "Tendência 2026: Pijamas que você pode usar na rua",
      "O Baby Doll Blogueira que está esgotando o estoque!"
    ],
    keywords: ["#Loungewear", "#PijamaNaRua", "#ModaTikTok", "#EstiloConfortável", "#BabyDollBlogueira"],
    focus: "Estilo, versatilidade e tendência"
  }
];

export default function PersonasSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">4 Personas de Influenciadoras Humanizadas</h2>
        <p className="text-slate-600">
          Cada persona representa um segmento diferente do público-alvo, com seus próprios ganchos, estilos de conteúdo e objetivos de compra.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {personas.map((persona) => {
          const IconComponent = persona.icon;
          return (
            <Card key={persona.id} className="border-slate-200 hover:shadow-lg transition-all overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${persona.color}`} />
              {persona.image && (
                <div className="w-full h-64 overflow-hidden bg-slate-100">
                  <img src={persona.image} alt={persona.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <CardTitle className="text-xl">{persona.name}</CardTitle>
                    <CardDescription className="text-base font-medium text-slate-700 mt-1">
                      {persona.title}
                    </CardDescription>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${persona.color} text-white`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 italic">{persona.age} anos</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Perfil</h4>
                  <p className="text-sm text-slate-600">{persona.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Público-Alvo</h4>
                  <p className="text-sm text-slate-600">{persona.audience}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Estilo de Conteúdo</h4>
                  <Badge variant="outline" className="bg-slate-50">
                    {persona.contentStyle}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Ganchos de Vídeo</h4>
                  <ul className="space-y-1">
                    {persona.videoHooks.map((hook, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex gap-2">
                        <span className="text-rose-500 font-bold">•</span>
                        {hook}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Foco Principal</h4>
                  <p className="text-sm font-medium text-rose-600 bg-rose-50 p-2 rounded">
                    {persona.focus}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
