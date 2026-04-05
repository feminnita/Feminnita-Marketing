import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Target, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import PersonaAvatar from "./PersonaAvatar";
import { useState } from "react";

export default function ComparadorPersonasSection() {
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(["Carol", "Renata"]);

  const personas = [
    {
      name: "Carol",
      age: 24,
      title: "A Empreendedora Iniciante",
      icon: Sparkles,
      color: "from-amber-500 to-orange-500",
      attributes: {
        "Idade": "24 anos",
        "Experiência": "Iniciante",
        "Objetivo Principal": "Renda extra",
        "Investimento Inicial": "R$ 200-500",
        "Tempo Disponível": "Flexível (part-time)",
        "Estilo de Conteúdo": "Autêntico e Entusiasmado",
        "Plataforma Principal": "Instagram Stories",
        "Frequência de Posts": "3-5x por semana",
        "Tipo de Público": "Amigas e conhecidas",
        "Margem de Lucro": "30-40%",
      },
    },
    {
      name: "Renata",
      age: 38,
      title: "A Dona de Loja",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      attributes: {
        "Idade": "38 anos",
        "Experiência": "Experiente",
        "Objetivo Principal": "Escala de negócio",
        "Investimento Inicial": "R$ 5.000+",
        "Tempo Disponível": "Full-time",
        "Estilo de Conteúdo": "Profissional e Informativo",
        "Plataforma Principal": "Instagram Feed + TikTok",
        "Frequência de Posts": "Diária",
        "Tipo de Público": "Lojistas e revendedoras",
        "Margem de Lucro": "50-70%",
      },
    },
    {
      name: "Vanessa",
      age: 45,
      title: "A Líder de Grupo",
      icon: Users,
      color: "from-rose-500 to-pink-500",
      attributes: {
        "Idade": "45 anos",
        "Experiência": "Intermediária",
        "Objetivo Principal": "Economia familiar",
        "Investimento Inicial": "R$ 1.000-2.000",
        "Tempo Disponível": "Part-time",
        "Estilo de Conteúdo": "Prático e Afetivo",
        "Plataforma Principal": "WhatsApp + Instagram",
        "Frequência de Posts": "2-3x por semana",
        "Tipo de Público": "Amigas e família",
        "Margem de Lucro": "20-30%",
      },
    },
    {
      name: "Luiza",
      age: 21,
      title: "A Trendsetter",
      icon: TrendingUp,
      color: "from-purple-500 to-fuchsia-500",
      attributes: {
        "Idade": "21 anos",
        "Experiência": "Iniciante (mas conectada)",
        "Objetivo Principal": "Influência + Renda",
        "Investimento Inicial": "R$ 500-1.000",
        "Tempo Disponível": "Flexível (content creator)",
        "Estilo de Conteúdo": "Visual e Dinâmico",
        "Plataforma Principal": "TikTok + Instagram Reels",
        "Frequência de Posts": "Diária (múltiplos posts)",
        "Tipo de Público": "Jovens e influencers",
        "Margem de Lucro": "40-50%",
      },
    },
  ];

  const togglePersona = (name: string) => {
    setSelectedPersonas((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const selectedData = personas.filter((p) => selectedPersonas.includes(p.name));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Comparador de Personas</h2>
        <p className="text-slate-600">Selecione as personas para comparar características, objetivos e estratégias</p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Dados de referência — perfis de persona ilustrativos</p>
              <p className="text-sm text-slate-600 mt-1">
                As faixas de investimento, ROI e métricas exibidas são estimativas de mercado para orientar a estratégia. Resultados reais dependem de execução, produto e sazonalidade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Persona Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Selecione as Personas para Comparar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {personas.map((persona) => (
              <button
                key={persona.name}
                onClick={() => togglePersona(persona.name)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  selectedPersonas.includes(persona.name)
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <PersonaAvatar name={persona.name} size="md" />
                <p className="font-semibold text-sm mt-2">{persona.name}</p>
                <p className="text-xs text-slate-600">{persona.age} anos</p>
                {selectedPersonas.includes(persona.name) && (
                  <CheckCircle className="w-4 h-4 text-pink-500 mx-auto mt-2" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Atributo</th>
                    {selectedData.map((persona) => (
                      <th key={persona.name} className="text-center py-3 px-4 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <PersonaAvatar name={persona.name} size="sm" />
                          <span>{persona.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedData[0].attributes).map(([key]) => (
                    <tr key={key} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{key}</td>
                      {selectedData.map((persona) => (
                        <td key={`${persona.name}-${key}`} className="py-3 px-4 text-center text-slate-600">
                          {persona.attributes[key as keyof typeof persona.attributes]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Persona Cards */}
      {selectedData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Detalhes das Personas Selecionadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedData.map((persona) => {
              const IconComponent = persona.icon;
              return (
                <Card key={persona.name} className="border-slate-200">
                  <div className={`h-1 bg-gradient-to-r ${persona.color}`} />
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <PersonaAvatar name={persona.name} size="lg" />
                      <div>
                        <CardTitle>{persona.name}</CardTitle>
                        <CardDescription>{persona.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(persona.attributes).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start border-b border-slate-100 pb-2 last:border-0">
                          <span className="font-medium text-slate-700 text-sm">{key}</span>
                          <span className="text-slate-600 text-sm text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {selectedData.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">✨ Recomendação de Estratégia</CardTitle>
          </CardHeader>
          <CardContent className="text-green-900 space-y-2">
            <p>
              <strong>Para atingir {selectedData.map((p) => p.name).join(" + ")}:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {selectedData.includes(personas[0]) && (
                <li>Carol: Foque em stories autênticos mostrando lucro rápido e facilidade</li>
              )}
              {selectedData.includes(personas[1]) && (
                <li>Renata: Ofereça conteúdo profissional sobre qualidade, margem e escala</li>
              )}
              {selectedData.includes(personas[2]) && (
                <li>Vanessa: Destaque economia familiar, kits e promoções para grupos</li>
              )}
              {selectedData.includes(personas[3]) && (
                <li>Luiza: Crie conteúdo viral, tendências e looks que ela possa usar na rua</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
