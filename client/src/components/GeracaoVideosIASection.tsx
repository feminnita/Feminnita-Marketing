import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Copy, ExternalLink, Download, Zap } from "lucide-react";

const PERSONAS = [
  {
    id: "carol",
    name: "Carol - Empreendedora Iniciante",
    description: "Renda Extra | Iniciante | Entusiasmada",
    roteiros: [
      { titulo: "Meu Primeiro Pedido Chegou!", duracao: "15s", tipo: "Story" },
      { titulo: "Como Ganhei R$ 500 em 1 Semana", duracao: "25s", tipo: "TikTok" },
      { titulo: "Unboxing do Primeiro Pedido", duracao: "30s", tipo: "Reels" },
    ]
  },
  {
    id: "renata",
    name: "Renata - Dona de Loja",
    description: "Lojista | Profissional | Confiável",
    roteiros: [
      { titulo: "Análise Rápida de Qualidade", duracao: "18s", tipo: "Story" },
      { titulo: "Lojista Revela o Segredo da Margem", duracao: "28s", tipo: "TikTok" },
      { titulo: "Tour pela Fábrica", duracao: "40s", tipo: "Reels" },
    ]
  },
  {
    id: "vanessa",
    name: "Vanessa - Líder de Grupo",
    description: "Compra Coletiva | Comunidade | Alegre",
    roteiros: [
      { titulo: "Compra Coletiva com as Amigas", duracao: "20s", tipo: "Story" },
      { titulo: "Como Economizei R$ 250", duracao: "30s", tipo: "TikTok" },
      { titulo: "Unboxing em Grupo", duracao: "35s", tipo: "Reels" },
    ]
  },
  {
    id: "luiza",
    name: "Luiza - Trendsetter",
    description: "Lifestyle | Influenciadora | Moderna",
    roteiros: [
      { titulo: "Pijama Inverno 2026", duracao: "25s", tipo: "Story" },
      { titulo: "Fit Check com Pijamas", duracao: "35s", tipo: "TikTok" },
      { titulo: "ASMR de Conforto", duracao: "45s", tipo: "Reels" },
    ]
  },
];

const AI_SERVICES = [
  {
    id: "synthesia",
    name: "Synthesia",
    logo: "🎬",
    url: "https://www.synthesia.io",
    features: ["Avatares realistas", "Múltiplos idiomas", "Customização completa"],
    preco: "Começando em $25/mês",
    tempo: "5-10 min por vídeo"
  },
  {
    id: "d-id",
    name: "D-ID",
    logo: "🤖",
    url: "https://www.d-id.com",
    features: ["Avatares com IA", "Expressões naturais", "Fácil de usar"],
    preco: "Começando em $5.99/mês",
    tempo: "3-5 min por vídeo"
  },
  {
    id: "heygen",
    name: "HeyGen",
    logo: "🎥",
    url: "https://www.heygen.com",
    features: ["Avatares 3D", "Lip-sync perfeito", "Integração com APIs"],
    preco: "Começando em $15/mês",
    tempo: "5-8 min por vídeo"
  },
  {
    id: "runway",
    name: "Runway",
    logo: "✨",
    url: "https://www.runwayml.com",
    features: ["Geração de vídeos", "Edição com IA", "Efeitos avançados"],
    preco: "Começando em $12/mês",
    tempo: "10-15 min por vídeo"
  },
];

export default function GeracaoVideosIASection() {
  const [selectedPersona, setSelectedPersona] = useState("carol");
  const [selectedService, setSelectedService] = useState("d-id");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const persona = PERSONAS.find(p => p.id === selectedPersona);
  const service = AI_SERVICES.find(s => s.id === selectedService);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(text);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const getScriptForRoteiro = (roteiro: typeof PERSONAS[0]["roteiros"][0]) => {
    const scripts: Record<string, string> = {
      "Meu Primeiro Pedido Chegou!": "Oi meninas! Meu primeiro pedido da Feminnita chegou! 📦✨ Olha só que lindo! A qualidade é incrível, o tecido é super macio... Estou tão feliz! Já estou recebendo pedidos de amigas para revender. Quem quer começar a ganhar renda extra comigo? Clique no link da bio! 💖",
      "Como Ganhei R$ 500 em 1 Semana": "Vocês não vão acreditar! Em apenas 1 semana revendendo pijamas Feminnita, já ganhei R$ 500! 🤑 Sem experiência, sem estoque prévio, nada! Tudo começou quando descobri os preços de atacado... Quer saber como? Clique no link da bio e se registre agora! 🚀",
      "Análise Rápida de Qualidade": "Como lojista, preciso garantir qualidade para meus clientes. Olha só a costura perfeita, o tecido premium, a etiqueta... Tudo impecável! Por isso confio na Feminnita para abastecer minha loja. Margem de lucro excelente, qualidade garantida. Quer conhecer nossos preços? Clique no link! 💼",
      "Lojista Revela o Segredo da Margem": "Vou revelar o segredo: enquanto outras marcas cobram R$ 60, a Feminnita vende por R$ 39,90. Isso significa R$ 20 de lucro por peça em vez de R$ 40! Qualidade igual, preço melhor, margem maior! Se você é lojista, não pode perder isso. Clique no link da bio! 📊",
      "Compra Coletiva com as Amigas": "Meninas, vocês já pensaram em fazer compra coletiva? Juntei com minhas amigas e conseguimos R$ 250 de desconto! 🎉 Pijamas lindos, confortáveis, e ainda economizamos juntas. Quer fazer o mesmo? Chama suas amigas e clica no link da bio! 👯‍♀️",
      "Como Economizei R$ 250": "Simples: ao invés de pagar R$ 800 em 4 pijamas em loja, paguei R$ 550 comprando em grupo na Feminnita! 💰 Qualidade igual, preço muito melhor. Quer economizar também? Clique no link! 🛍️",
      "Pijama Inverno 2026": "Chegou! A coleção de inverno 2026 da Feminnita é simplesmente perfeita! 🥶✨ Olha só essas cores: azul marinho, cinza, vinho... Tecido super quentinho e confortável. Já estou usando e não tiro mais! Quer a sua? Clique no link da bio! 💙",
      "Fit Check com Pijamas": "Vocês acham que pijama é só para dormir? Errado! Olha como fica lindo para usar em casa, em vídeos, até para sair! 📸 A Feminnita tem estilos para todos os gostos. Qual é o seu favorito? Clique no link e escolha o seu! 🛍️",
      "ASMR de Conforto": "Escuta só esse som... *toca o tecido* Macio, macio demais! 😍 Esse é o pijama de inverno da Feminnita. Conforto máximo para as noites frias. Quer sentir também? Clique no link da bio! ❄️✨",
    };
    return scripts[roteiro.titulo] || "Script padrão para este vídeo.";
  };

  return (
    <div className="space-y-6">
      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-rose-600" />
            Geração de Vídeos com IA Realista
          </CardTitle>
          <CardDescription>
            Crie vídeos humanizados das influencers usando os roteiros preparados. Escolha a persona, o roteiro e o serviço de IA preferido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Persona */}
          <div>
            <h3 className="font-semibold text-sm mb-4">1️⃣ Escolha a Persona</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {PERSONAS.map(p => (
                <Button
                  key={p.id}
                  variant={selectedPersona === p.id ? "default" : "outline"}
                  onClick={() => setSelectedPersona(p.id)}
                  className="justify-start h-auto py-3 text-left"
                >
                  <div>
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className="text-xs opacity-75">{p.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Roteiros da Persona */}
          {persona && (
            <div>
              <h3 className="font-semibold text-sm mb-4">2️⃣ Escolha o Roteiro</h3>
              <div className="space-y-2">
                {persona.roteiros.map((roteiro, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{roteiro.titulo}</h4>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{roteiro.duracao}</Badge>
                          <Badge variant="outline" className="text-xs">{roteiro.tipo}</Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-3 mb-3">
                          {getScriptForRoteiro(roteiro)}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(getScriptForRoteiro(roteiro))}
                          className="gap-2 text-xs"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedScript === getScriptForRoteiro(roteiro) ? "Copiado!" : "Copiar Script"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de Serviço IA */}
          <div>
            <h3 className="font-semibold text-sm mb-4">3️⃣ Escolha o Serviço de IA</h3>
            <Tabs value={selectedService} onValueChange={setSelectedService}>
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                {AI_SERVICES.map(s => (
                  <TabsTrigger key={s.id} value={s.id} className="text-xs">
                    {s.logo} {s.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {AI_SERVICES.map(s => (
                <TabsContent key={s.id} value={s.id}>
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{s.name}</h4>
                        <p className="text-sm text-slate-600 mb-4">
                          Plataforma especializada em geração de vídeos com avatares de IA realistas.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-sm mb-2">✨ Recursos</h5>
                          <ul className="text-sm space-y-1 text-slate-600">
                            {s.features.map((f, i) => (
                              <li key={i}>• {f}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm mb-2">📊 Informações</h5>
                          <div className="text-sm space-y-2">
                            <div>
                              <span className="text-slate-600">Preço:</span>
                              <div className="font-semibold">{s.preco}</div>
                            </div>
                            <div>
                              <span className="text-slate-600">Tempo/Vídeo:</span>
                              <div className="font-semibold">{s.tempo}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-semibold text-sm mb-2">📋 Como Usar:</h5>
                        <ol className="text-sm space-y-2 text-slate-700">
                          <li>1. Clique no botão abaixo para acessar {s.name}</li>
                          <li>2. Crie uma conta (teste grátis disponível)</li>
                          <li>3. Copie o script acima e cole no editor de vídeo</li>
                          <li>4. Escolha um avatar realista (feminino, tom de pele, cabelo)</li>
                          <li>5. Gere o vídeo e baixe em MP4</li>
                          <li>6. Edite no CapCut ou DaVinci Resolve se necessário</li>
                          <li>7. Poste no Instagram/TikTok!</li>
                        </ol>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => window.open(s.url, "_blank")}
                          className="gap-2 flex-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Acessar {s.name}
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Guia Completo
                        </Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Resumo de Próximos Passos */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              Próximos Passos
            </h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>✅ Escolha uma persona acima</li>
              <li>✅ Copie o script do roteiro</li>
              <li>✅ Acesse o serviço de IA selecionado</li>
              <li>✅ Crie o avatar da influenciadora</li>
              <li>✅ Gere o vídeo com o script</li>
              <li>✅ Baixe e edite se necessário</li>
              <li>✅ Poste nos horários otimizados (veja aba "Performance")</li>
              <li>✅ Acompanhe métricas (veja aba "Dashboard")</li>
            </ol>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
