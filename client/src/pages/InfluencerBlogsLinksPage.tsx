import { BookOpen, ArrowRight, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PERSONA_CONFIG: Record<string, { color: string; bg: string; border: string; emoji: string; tagline: string; desc: string }> = {
  carol:   {
    color: "#D97706", bg: "bg-yellow-50", border: "border-yellow-200", emoji: "👩‍👧‍👦",
    tagline: "A Mãe Moderna",
    desc: "Dicas de maternidade, trabalho remoto e estilo de vida. Veja como os pijamas Feminnita se encaixam na rotina de mães modernas.",
  },
  renata:  {
    color: "#7C3AED", bg: "bg-purple-50", border: "border-purple-200", emoji: "👩‍💼",
    tagline: "A Executiva Elegante",
    desc: "Elegância, profissionalismo e bem-estar. Sofisticação que não termina no escritório — continua em casa com Feminnita.",
  },
  vanessa: {
    color: "#DB2777", bg: "bg-pink-50", border: "border-pink-200", emoji: "🎨",
    tagline: "A Criativa Artística",
    desc: "Arte, criatividade e design. Explore como a criatividade se expressa até nos pijamas com as coleções exclusivas Feminnita.",
  },
  luiza:   {
    color: "#059669", bg: "bg-green-50", border: "border-green-200", emoji: "💪",
    tagline: "A Fitness Aventureira",
    desc: "Fitness, aventura e performance. A importância do sono de qualidade para atletas — com os pijamas Feminnita.",
  },
};

function getPersonaConfig(name: string) {
  const key = name.toLowerCase().split(" ")[0];
  return PERSONA_CONFIG[key] ?? {
    color: "#8B2635", bg: "bg-rose-50", border: "border-rose-200", emoji: "✨",
    tagline: "Influenciadora Feminnita",
    desc: "Acompanhe o dia a dia desta influenciadora e descubra como os pijamas Feminnita fazem parte da sua história.",
  };
}

export default function InfluencerBlogsLinksPage() {
  const { data: influencers, isLoading } = trpc.publicBlogs.listInfluencers.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" style={{ color: "#8B2635" }} />
            <h1 className="text-4xl font-bold text-slate-900">Blogs das Influenciadoras</h1>
          </div>
          <p className="text-lg text-slate-600">
            Acompanhe o dia a dia de cada influenciadora e descubra como os pijamas Feminnita se encaixam em suas vidas
          </p>
        </div>

        {/* Grid de Blogs */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 bg-white rounded-xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : !influencers?.length ? (
          <div className="text-center py-20 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">Nenhuma influenciadora cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {influencers.map((inf: any) => {
              const p = getPersonaConfig(inf.name);
              return (
                <Card key={inf.id} className={`border-2 ${p.bg} ${p.border} hover:shadow-lg transition-shadow`}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-2 border-white shadow overflow-hidden"
                        style={{ backgroundColor: p.color }}
                      >
                        {inf.avatar
                          ? <img src={inf.avatar} alt={inf.name} className="w-full h-full object-cover" />
                          : <span>{p.emoji}</span>
                        }
                      </div>
                      <div>
                        <CardTitle className="text-xl">{inf.name}</CardTitle>
                        <CardDescription className="text-sm mt-0.5" style={{ color: p.color }}>
                          {p.tagline}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 mb-5 leading-relaxed text-sm">
                      {inf.bio || p.desc}
                    </p>
                    <a href={`/blog-publico/${inf.id}`}>
                      <Button className="w-full gap-2" style={{ backgroundColor: p.color }}>
                        Acessar Blog
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Sobre os blogs */}
        <Card className="bg-white border-2 border-slate-200">
          <CardHeader>
            <CardTitle>Sobre os Blogs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">📝 Conteúdo Autêntico</h3>
              <p className="text-slate-700">Cada influenciadora compartilha sua história, rotina e como os produtos Feminnita se encaixam naturalmente em suas vidas.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">🛍️ Produtos Destacados</h3>
              <p className="text-slate-700">Descubra os pijamas Feminnita recomendados por cada influenciadora, com links diretos para compra.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">💬 Comunidade</h3>
              <p className="text-slate-700">Faça parte de uma comunidade de mulheres que se apoiam e compartilham dicas de bem-estar e estilo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
