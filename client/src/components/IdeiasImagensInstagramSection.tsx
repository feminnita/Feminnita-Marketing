import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Target, Palette, Type, Users, Zap } from "lucide-react";

const ideiasImagens = [
  {
    id: 1,
    titulo: "Promoção Relâmpago - 40% OFF em Coleção Suede",
    tipo: "Promoção com Urgência",
    objetivo: "Captar atenção rápida e incentivar compra imediata",
    publicoAlvo: "Consumidoras finais, revendedoras iniciantes",
    duracao: "3-5 dias",
    melhorHorario: "19h-22h",
    cor: "from-pink-100 to-orange-100",
    borderColor: "border-pink-300",
    conceito: "A imagem deve transmitir urgência, exclusividade e valor. O design combina elementos dinâmicos com tipografia impactante para criar um senso de 'não perder essa oportunidade'.",
    fundo: "Gradiente diagonal de rosa quente (#E84C89) para laranja coral (#FF6B5B) com padrão geométrico sutil (triângulos pequenos)",
    elementoPrincipal: "Pijama Suede em cor rosa pastel ou lilás, fotografado em ângulo 45 graus, bem iluminado, mostrando a textura do tecido",
    elementosDestaque: [
      "Fita vermelha/amarela atravessando diagonalmente com 'ÚLTIMAS PEÇAS'",
      "Texto '40% OFF' em branco bold com contorno preto no canto superior direito",
      "Relógio/ampulheta com 'Válido até 23:59 de Hoje!'",
      "Badge com '⭐⭐⭐⭐⭐ 4.8/5 - 2.340 avaliações'"
    ],
    paleta: [
      { nome: "Gradiente Primário", cor: "#E84C89" },
      { nome: "Gradiente Secundário", cor: "#FF6B5B" },
      { nome: "Texto Principal", cor: "#FFFFFF" },
      { nome: "Contorno", cor: "#000000" },
      { nome: "Fita", cor: "#DC143C" }
    ],
    copy: "🔥 PROMOÇÃO RELÂMPAGO - 40% OFF! 🔥\n\nA coleção Suede que você ama agora com DESCONTO IMPERDÍVEL!\n\n✨ Tecido macio e durável\n✨ Cores exclusivas\n✨ Perfeito para revender\n\n⏰ Válido apenas HOJE até 23:59!\n\nClique no link da bio e garanta a sua! 🛍️\n\n#PromoçãoRelâmpago #FeminnitaSuede #Desconto40",
    dicas: "Poste entre 19h-22h. Use Carrossel: primeira imagem é a promoção, segunda mostra o pijama em uso, terceira mostra depoimento de cliente. Isso aumenta o tempo de visualização e engajamento.",
    resolucao: "1080x1350px"
  },
  {
    id: 2,
    titulo: "Lançamento Coleção Verão 2026 - Cores Vibrantes",
    tipo: "Lançamento de Produto",
    objetivo: "Gerar buzz, criar expectativa e posicionar como inovador",
    publicoAlvo: "Influenciadoras, revendedoras, consumidoras finais",
    duracao: "1-2 semanas",
    melhorHorario: "12h-14h ou 19h-21h",
    cor: "from-yellow-100 to-green-100",
    borderColor: "border-green-300",
    conceito: "A imagem deve transmitir novidade, frescor, energia e estilo. O design celebra cores vibrantes e tendências de verão, posicionando a Feminnita como marca moderna e atualizada.",
    fundo: "Fundo branco limpo (#FFFFFF) com padrão sutil de flores/folhas em aquarela nos cantos (rosa, amarelo, azul claro com opacidade 20-30%)",
    elementoPrincipal: "3-4 pijamas em cores diferentes (amarelo vibrante, verde limão, rosa chiclete, azul turquesa) dispostos em arranjo circular ou cascata",
    elementosDestaque: [
      "Círculos geométricos coloridos atrás dos pijamas com opacidade reduzida",
      "Texto 'VERÃO 2026' em Playfair Display grande no topo",
      "Subtítulo 'Cores Vibrantes, Conforto Infinito'",
      "Badge 'NOVO' em forma de estrela/círculo no canto superior direito",
      "Seção com 3 ícones + texto: 🌟 Tecido Premium, 💨 Respirável, 🌈 Cores Exclusivas"
    ],
    paleta: [
      { nome: "Fundo", cor: "#FFFFFF" },
      { nome: "Amarelo Vibrante", cor: "#FFD700" },
      { nome: "Verde Limão", cor: "#32CD32" },
      { nome: "Rosa Chiclete", cor: "#FF1493" },
      { nome: "Azul Turquesa", cor: "#40E0D0" }
    ],
    copy: "☀️ COLEÇÃO VERÃO 2026 CHEGOU! ☀️\n\nPrepare-se para o verão com nossas cores mais vibrantes e exclusivas!\n\n✨ Amarelo Ouro\n✨ Verde Limão\n✨ Rosa Chiclete\n✨ Azul Turquesa\n\nTecido premium, respirável e super confortável. Perfeito para dormir, relaxar ou revender!\n\n🛍️ Já disponível no link da bio!\n\nQual é sua cor favorita? Comente abaixo! 👇\n\n#VerãoFeminnita #CoresVibrantes #LançamentoExclusivo",
    dicas: "Poste entre 12h-14h ou 19h-21h. Use enquete nos Stories para perguntar qual cor é favorita. Crie Carrossel mostrando cada cor individualmente em posts seguintes.",
    resolucao: "1080x1350px"
  },
  {
    id: 3,
    titulo: "Abastecimento de Estoque - Compre em Quantidade",
    tipo: "Promoção de Volume/Atacado",
    objetivo: "Incentivar compras em quantidade, posicionar como fornecedor confiável",
    publicoAlvo: "Revendedoras, lojistas, grupos de compra",
    duracao: "1 semana",
    melhorHorario: "9h-11h ou 14h-16h",
    cor: "from-slate-100 to-slate-200",
    borderColor: "border-slate-400",
    conceito: "A imagem deve transmitir confiabilidade, abundância, oportunidade de negócio e economia de escala. O design mostra quantidade, organização e profissionalismo.",
    fundo: "Fundo cinza claro (#F5F5F5) com textura sutil de madeira ou padrão de caixas (opacidade 10-15%)",
    elementoPrincipal: "3-4 pilhas de caixas/pijamas fotografadas mostrando volume e organização, com cores diferentes de pijamas visíveis",
    elementosDestaque: [
      "Números grandes em rosa (#E84C89): '500+' (Peças em Estoque), '5 Cores' (Disponíveis), 'Pronta Entrega'",
      "Tabela de preços na base: 1-10 peças R$ 49,90 | 11-50 peças R$ 44,90 (-10%) | 51+ peças R$ 39,90 (-20%)",
      "Ícone de 'verificado' com 'Fornecedor Confiável' no canto superior esquerdo",
      "Botão visual com 'PEÇA SEU ORÇAMENTO' em rosa com texto branco"
    ],
    paleta: [
      { nome: "Fundo", cor: "#F5F5F5" },
      { nome: "Números Grandes", cor: "#E84C89" },
      { nome: "Texto Principal", cor: "#000000" },
      { nome: "Texto Secundário", cor: "#666666" },
      { nome: "Botão CTA", cor: "#E84C89" }
    ],
    copy: "📦 ABASTECIMENTO DE ESTOQUE - COMPRE EM QUANTIDADE! 📦\n\nTemos 500+ peças prontas para entrega HOJE!\n\n💰 Quanto mais você compra, mais você economiza:\n\n✅ 1-10 peças: R$ 49,90 cada\n✅ 11-50 peças: R$ 44,90 cada (-10%)\n✅ 51+ peças: R$ 39,90 cada (-20%)\n\nPerfeito para:\n🏪 Lojistas\n👥 Grupos de Compra\n💼 Revendedoras\n\nPeça seu orçamento agora! Clique no link da bio ou mande DM! 📲\n\n#AtacadoPijamas #EstoqueDisponível #MelhorPreço #FornecedorConfiável",
    dicas: "Poste entre 9h-11h (manhã, quando lojistas estão trabalhando) ou 14h-16h (tarde). Use Mensagens Diretas para responder rapidamente. Crie Carrossel mostrando diferentes cenários de uso.",
    resolucao: "1080x1350px"
  }
];

export default function IdeiasImagensInstagramSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Três Ideias de Imagens para Posts no Feed do Instagram</h2>
        <p className="text-slate-600">
          Conceitos visuais detalhados para promoções, lançamentos e campanhas de abastecimento. Cada ideia inclui descrição completa de composição, paleta de cores, copy e dicas de engajamento.
        </p>
      </div>

      <Tabs defaultValue="promocao" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="promocao">Promoção</TabsTrigger>
          <TabsTrigger value="lancamento">Lançamento</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
        </TabsList>

        {ideiasImagens.map((ideia) => (
          <TabsContent key={ideia.id} value={ideia.id === 1 ? "promocao" : ideia.id === 2 ? "lancamento" : "estoque"} className="space-y-6">
            {/* Header Card */}
            <Card className={`border-l-4 ${ideia.borderColor} bg-gradient-to-r ${ideia.cor}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{ideia.titulo}</CardTitle>
                    <CardDescription className="text-base font-semibold text-slate-700 mt-2">
                      {ideia.tipo}
                    </CardDescription>
                  </div>
                  <Badge className="text-sm">{ideia.resolucao}</Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Metadata Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Objetivo</p>
                    <p className="text-slate-700">{ideia.objetivo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Público-Alvo</p>
                    <p className="text-slate-700">{ideia.publicoAlvo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Duração</p>
                    <p className="text-slate-700">{ideia.duracao}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Timing & Estratégia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Melhor Horário
                    </p>
                    <p className="text-slate-700 font-medium text-rose-600">{ideia.melhorHorario}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Tipo de Conteúdo</p>
                    <p className="text-slate-700">{ideia.tipo}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conceito */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Conceito Visual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed">{ideia.conceito}</p>
              </CardContent>
            </Card>

            {/* Composição */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Descrição Detalhada da Composição</h3>
              
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-600" />
                    Fundo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-900">{ideia.fundo}</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Elemento Principal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-900">{ideia.elementoPrincipal}</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Elementos de Destaque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {ideia.elementosDestaque.map((elemento, idx) => (
                    <div key={idx} className="flex gap-2 text-sm text-green-900">
                      <span className="font-bold text-green-600">•</span>
                      <span>{elemento}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Paleta de Cores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Paleta de Cores</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ideia.paleta.map((cor, idx) => (
                  <Card key={idx} className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded border border-slate-300"
                          style={{ backgroundColor: cor.cor }}
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase">{cor.nome}</p>
                          <p className="text-sm font-mono text-slate-700">{cor.cor}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Copy */}
            <Card className="border-rose-200 bg-rose-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Type className="w-5 h-5 text-rose-600" />
                  Copy para Legenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-rose-900 whitespace-pre-wrap font-mono">{ideia.copy}</p>
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Dicas de Engajamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed">{ideia.dicas}</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* General Tips */}
      <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg">10 Dicas Gerais de Design para Posts no Instagram Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">1. Consistência Visual</p>
              <p className="text-sm text-slate-600">Mantenha paleta de cores consistente. Use rosa (#E84C89) e laranja (#FF6B5B) como destaque em todos os posts.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">2. Tipografia</p>
              <p className="text-sm text-slate-600">Use no máximo 2 fontes: Playfair Display (elegante, títulos) + Poppins (moderna, corpo). Evite fontes decorativas.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">3. Proporção de Texto vs Imagem</p>
              <p className="text-sm text-slate-600">Mantenha 60% visual (pijama, cores, elementos) e 40% texto (promoção, benefícios, CTA). Não sobrecarregue.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">4. Contraste e Legibilidade</p>
              <p className="text-sm text-slate-600">Use contorno preto ou branco em textos coloridos. Teste legibilidade em tamanho pequeno (como aparece no celular).</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">5. Qualidade de Imagem</p>
              <p className="text-sm text-slate-600">Use fotos de alta qualidade (mínimo 1080px). Garanta boa iluminação, foco nítido e coerência visual.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">6. Elementos de Prova Social</p>
              <p className="text-sm text-slate-600">Inclua avaliações, número de seguidores ou depoimentos. Isso aumenta confiança e engajamento.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">7. Call-to-Action Clara</p>
              <p className="text-sm text-slate-600">Sempre termine com CTA claro: "Clique no link da bio", "Comente abaixo", "Marque uma amiga".</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">8. Teste e Otimização</p>
              <p className="text-sm text-slate-600">Acompanhe métricas (curtidas, comentários, cliques). Identifique qual estilo gera mais engajamento e replique.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">9. Frequência de Postagem</p>
              <p className="text-sm text-slate-600">Poste 3-4 vezes por semana. Combine promoção, lançamento e abastecimento com lifestyle (pijamas em uso, depoimentos).</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">10. Carrossel vs Post Único</p>
              <p className="text-sm text-slate-600">Use Carrossel para contar histórias (gancho → detalhe → prova social). Carrosséis geram 3x mais engajamento.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
