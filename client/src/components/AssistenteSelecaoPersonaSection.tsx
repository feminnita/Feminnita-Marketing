import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Lightbulb, AlertCircle } from "lucide-react";
import { useState } from "react";
import PersonaAvatar from "./PersonaAvatar";

export default function AssistenteSelecaoPersonaSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);

  const questions = [
    {
      id: 0,
      question: "Qual é o objetivo principal da sua campanha?",
      options: [
        { text: "Gerar renda extra rápida", value: "carol" },
        { text: "Escalar negócio e aumentar faturamento", value: "renata" },
        { text: "Economizar e comprar em grupo", value: "vanessa" },
        { text: "Viralizar e ganhar influência", value: "luiza" },
      ],
    },
    {
      id: 1,
      question: "Qual é o seu público-alvo principal?",
      options: [
        { text: "Pessoas buscando primeira oportunidade", value: "carol" },
        { text: "Lojistas e revendedoras experientes", value: "renata" },
        { text: "Grupos de amigas e famílias", value: "vanessa" },
        { text: "Jovens e influenciadores", value: "luiza" },
      ],
    },
    {
      id: 2,
      question: "Qual é seu orçamento para a campanha?",
      options: [
        { text: "Baixo (até R$ 500)", value: "carol" },
        { text: "Alto (acima de R$ 5.000)", value: "renata" },
        { text: "Médio (R$ 1.000 - R$ 3.000)", value: "vanessa" },
        { text: "Flexível com foco em conteúdo", value: "luiza" },
      ],
    },
    {
      id: 3,
      question: "Qual plataforma você quer focar?",
      options: [
        { text: "Instagram Stories (autêntico)", value: "carol" },
        { text: "Instagram Feed + TikTok (profissional)", value: "renata" },
        { text: "WhatsApp + Instagram (grupos)", value: "vanessa" },
        { text: "TikTok + Instagram Reels (viral)", value: "luiza" },
      ],
    },
    {
      id: 4,
      question: "Qual é o seu tempo disponível?",
      options: [
        { text: "Part-time (flexível)", value: "carol" },
        { text: "Full-time (dedicado)", value: "renata" },
        { text: "Part-time (fins de semana)", value: "vanessa" },
        { text: "Flexível (content creator)", value: "luiza" },
      ],
    },
  ];

  const personaResults = {
    carol: {
      name: "Carol",
      title: "A Empreendedora Iniciante",
      description: "Você é alguém que busca renda extra com facilidade e rapidez. Foco em autenticidade e conexão pessoal.",
      estrategia: [
        "Crie stories autênticos mostrando seu dia a dia",
        "Destaque o lucro rápido e facilidade de começar",
        "Use linguagem casual e próxima",
        "Poste 3-5x por semana",
        "Foque em amigas e conhecidas como primeira base",
      ],
      plataforma: "Instagram Stories",
      budget: "R$ 200-500",
      tempo: "Part-time",
      roi: "30-40%",
    },
    renata: {
      name: "Renata",
      title: "A Dona de Loja",
      description: "Você é uma empreendedora experiente buscando escala. Foco em qualidade, profissionalismo e dados.",
      estrategia: [
        "Crie conteúdo profissional e informativo",
        "Destaque qualidade, variedade e margem de lucro",
        "Use dados e números para convencer",
        "Poste diariamente com consistência",
        "Foque em lojistas e revendedoras como público",
      ],
      plataforma: "Instagram Feed + TikTok",
      budget: "R$ 5.000+",
      tempo: "Full-time",
      roi: "50-70%",
    },
    vanessa: {
      name: "Vanessa",
      title: "A Líder de Grupo",
      description: "Você organiza compras coletivas e busca economia familiar. Foco em comunidade e relacionamento.",
      estrategia: [
        "Crie conteúdo prático e afetivo",
        "Destaque economia e conforto familiar",
        "Use WhatsApp para coordenar grupos",
        "Poste 2-3x por semana",
        "Foque em amigas, família e grupos como público",
      ],
      plataforma: "WhatsApp + Instagram",
      budget: "R$ 1.000-2.000",
      tempo: "Part-time",
      roi: "20-30%",
    },
    luiza: {
      name: "Luiza",
      title: "A Trendsetter",
      description: "Você é uma criadora de conteúdo focada em tendências. Foco em viralidade e influência.",
      estrategia: [
        "Crie conteúdo visual e dinâmico",
        "Destaque tendências e moda loungewear",
        "Use trends e sons virais",
        "Poste diariamente com múltiplos posts",
        "Foque em jovens e influenciadores como público",
      ],
      plataforma: "TikTok + Instagram Reels",
      budget: "R$ 500-1.000",
      tempo: "Flexível",
      roi: "40-50%",
    },
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentStep]: value };
    setAnswers(newAnswers);

    if (currentStep === questions.length - 1) {
      // Calculate result based on most common answer
      const values = Object.values(newAnswers);
      const counts = values.reduce((acc: Record<string, number>, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      const mostCommon = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
      setResult(mostCommon);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  if (result) {
    const persona = personaResults[result as keyof typeof personaResults];
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Resultado do Quiz</h2>
          <p className="text-slate-600">Sua persona ideal foi identificada!</p>
        </div>

        {/* Result Card */}
        <Card className="border-2 border-pink-500">
          <CardContent className="pt-8">
            <div className="text-center space-y-6">
              <PersonaAvatar name={persona.name} size="lg" />
              <div>
                <h3 className="text-3xl font-bold text-slate-900">{persona.name}</h3>
                <p className="text-lg text-slate-600 mt-2">{persona.title}</p>
              </div>
              <p className="text-slate-600 text-center max-w-2xl">{persona.description}</p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600">Plataforma</p>
                  <p className="font-bold text-slate-900 mt-1">{persona.plataforma}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600">Budget</p>
                  <p className="font-bold text-slate-900 mt-1">{persona.budget}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600">Tempo</p>
                  <p className="font-bold text-slate-900 mt-1">{persona.tempo}</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <p className="text-xs text-slate-600">ROI Esperado</p>
                  <p className="font-bold text-slate-900 mt-1">{persona.roi}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Estratégia Recomendada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {persona.estrategia.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">📋 Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900 space-y-2 text-sm">
            <p>1. Acesse a aba "4 Personas" para conhecer melhor sua persona</p>
            <p>2. Vá para "Galeria Looks" e escolha um template visual</p>
            <p>3. Acesse "Planejamento Semanal" e crie seu primeiro conteúdo</p>
            <p>4. Use "Roteiros de Vídeos" para estruturar seu primeiro vídeo</p>
            <p>5. Monitore performance na aba "Performance por Persona"</p>
          </CardContent>
        </Card>

        {/* Reset Button */}
        <div className="flex justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-medium"
          >
            Fazer Quiz Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Assistente de Seleção de Persona</h2>
        <p className="text-slate-600">Responda 5 perguntas rápidas para descobrir qual persona é ideal para sua campanha</p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Recomendação orientativa — métricas são estimativas de mercado</p>
              <p className="text-sm text-slate-600 mt-1">
                As faixas de investimento e ROI exibidas no resultado são referências baseadas em benchmarks do nicho. Resultados reais variam conforme execução e contexto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-900">Progresso</span>
              <span className="text-slate-600">
                {currentStep + 1} de {questions.length}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{questions[currentStep].question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questions[currentStep].options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="w-full p-4 text-left border-2 border-slate-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 group-hover:text-pink-600">{option.text}</span>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-pink-500" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 text-sm">💡 Dica</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 text-sm">
          Responda com base na sua situação atual. Você pode mudar de persona a qualquer momento conforme sua estratégia evolui!
        </CardContent>
      </Card>
    </div>
  );
}
