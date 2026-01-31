import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, MessageCircle, Share2, Heart, Zap } from "lucide-react";

const legendas = [
  {
    id: 1,
    titulo: "Promoção Relâmpago - 40% OFF",
    tipo: "Urgência + Conversão",
    publicoAlvo: "Consumidoras finais, revendedoras iniciantes",
    objetivo: "Incentivar compra rápida",
    comprimento: "280 caracteres",
    melhorHorario: "19h-22h",
    cor: "from-pink-100 to-orange-100",
    borderColor: "border-pink-300",
    engajamentoEsperado: "Alto (urgência + desconto)",
    versoes: [
      {
        numero: 1,
        titulo: "Versão 1 - Direto e Urgente",
        texto: "🔥 **PROMOÇÃO RELÂMPAGO - 40% OFF!** 🔥\n\nA coleção Suede que você ama agora com **DESCONTO IMPERDÍVEL**!\n\n✨ Tecido macio e durável\n✨ Cores exclusivas\n✨ Perfeito para revender\n\n⏰ **Válido apenas HOJE até 23:59!**\n\nClique no link da bio e garanta a sua! 🛍️\n\nMarque uma amiga que vai amar! 👇\n\n#PromoçãoRelâmpago #FeminnitaSuede #Desconto40 #PijamaPerfeito #UltimasPeças #CompreagoraAntes",
        ctaPrimaria: "Clique no link da bio",
        ctaSecundaria: "Marque uma amiga",
        analise: "Direta, cria urgência com 'HOJE até 23:59', lista benefícios claros, termina com dois CTAs: clique (link) e engajamento (marcar amiga)."
      },
      {
        numero: 2,
        titulo: "Versão 2 - Storytelling + Emoção",
        texto: "😍 Sabe aquele pijama que você viu e pensou \"vou comprar depois\"?\n\n**POIS É! Agora é a hora!** 🎉\n\nA coleção Suede está com **40% OFF** e as peças estão acabando RÁPIDO.\n\n💰 De R$ 79,90 por **apenas R$ 47,94**\n🌟 Qualidade premium que dura anos\n👥 Perfeito para você, sua família ou para revender\n\nNão deixe passar essa oportunidade! ⏰\n\n**👉 Clique no link da bio e finalize sua compra!**\n\nDúvidas? Manda DM! 💬\n\n#FeminnitaSuede #DescontoImperdível #QualidadePremium #PijamaConforto #PromoçãoDoMês",
        ctaPrimaria: "Clique no link da bio",
        ctaSecundaria: "Manda DM",
        analise: "Usa storytelling para criar conexão emocional. Mostra valor real (R$ 79,90 → R$ 47,94), benefícios múltiplos, oferece dois canais de ação."
      },
      {
        numero: 3,
        titulo: "Versão 3 - Prova Social + Urgência",
        texto: "⭐⭐⭐⭐⭐ \"Melhor compra que fiz! Qualidade impecável!\" - Maria S.\n\nIsso é o que nossos clientes dizem sobre a coleção Suede! 💕\n\nE agora, **pela primeira vez, com 40% OFF!**\n\n🎁 Estoque limitado (apenas 150 peças)\n🚚 Entrega rápida\n💯 Garantia de qualidade\n\nNão perca! Quando acaba, acaba! 🔥\n\n**👉 Link na bio para comprar AGORA!**\n\nCompartilhe com uma amiga que merece esse conforto! 💕\n\n#ClientesFelizes #FeminnitaSuede #QualidadeGarantida #EstoqueLimitado #PromoçãoExclusiva",
        ctaPrimaria: "Link na bio para comprar AGORA",
        ctaSecundaria: "Compartilhe com uma amiga",
        analise: "Começa com prova social (depoimento). Cria urgência com 'estoque limitado (150 peças)'. Enfatiza benefícios tangíveis. CTA final incentiva compartilhamento."
      }
    ]
  },
  {
    id: 2,
    titulo: "Lançamento Coleção Verão 2026",
    tipo: "Expectativa + Buzz",
    publicoAlvo: "Influenciadoras, revendedoras, consumidoras finais",
    objetivo: "Gerar buzz e criar expectativa",
    comprimento: "320 caracteres",
    melhorHorario: "12h-14h ou 19h-21h",
    cor: "from-yellow-100 to-green-100",
    borderColor: "border-green-300",
    engajamentoEsperado: "Muito Alto (novo lançamento)",
    versoes: [
      {
        numero: 1,
        titulo: "Versão 1 - Anúncio Entusiasmado",
        texto: "☀️ **COLEÇÃO VERÃO 2026 CHEGOU!** ☀️\n\nPrepare-se para o verão com nossas **cores mais vibrantes e exclusivas**!\n\n🌟 Amarelo Ouro - Energia e Alegria\n🌟 Verde Limão - Frescor e Vitalidade\n🌟 Rosa Chiclete - Feminilidade e Ousadia\n🌟 Azul Turquesa - Serenidade e Estilo\n\nTecido premium, respirável e super confortável. Perfeito para dormir, relaxar ou revender!\n\n🛍️ **Já disponível no link da bio!**\n\nQual é sua cor favorita? Comente abaixo! 👇\n\n#VerãoFeminnita #CoresVibrantes #LançamentoExclusivo #PijamaConforto #NovaColecao #Verão2026",
        ctaPrimaria: "Já disponível no link da bio",
        ctaSecundaria: "Qual é sua cor favorita? Comente abaixo!",
        analise: "Entusiasmada e celebratória. Lista cada cor com benefício emocional. CTA duplo: compra (link) e engajamento (comentário sobre cor favorita)."
      },
      {
        numero: 2,
        titulo: "Versão 2 - Influenciadora/Revendedora",
        texto: "🌈 Atenção revendedoras e influenciadoras!\n\nA Feminnita acaba de lançar a **COLEÇÃO VERÃO 2026** e as cores são INCRÍVEIS! 🔥\n\nEssas cores estão em alta no TikTok e Instagram. Seus clientes vão AMAR!\n\n💰 **Margem de lucro de até 100%**\n🚀 **Tendência em alta**\n📦 **Pronta entrega**\n🎨 **4 cores exclusivas**\n\nSe você quer ficar à frente da concorrência, essa é a sua chance!\n\n**👉 Peça seu catálogo completo no link da bio ou mande DM!**\n\nVamos crescer juntas! 💪\n\n#OportunidadeDeNegócio #RevendedorFeminnita #LançamentoExclusivo #TendênciaVerão #VendasAltas",
        ctaPrimaria: "Peça seu catálogo no link da bio",
        ctaSecundaria: "Mande DM",
        analise: "Direcionada para revendedoras. Enfatiza margem de lucro, tendência em alta, oportunidade. Usa linguagem de comunidade ('Vamos crescer juntas')."
      },
      {
        numero: 3,
        titulo: "Versão 3 - Lifestyle + Aspiração",
        texto: "Imagine acordar em um pijama tão confortável e bonito quanto este... ☀️\n\nBem, não é mais só imaginação! A **COLEÇÃO VERÃO 2026** está aqui para fazer seus dias mais coloridos e confortáveis!\n\nCada cor foi escolhida com cuidado para refletir a energia do verão:\n\n🌻 **Amarelo Ouro** - Para os dias cheios de sol\n🌿 **Verde Limão** - Para aquela sensação de frescor\n💗 **Rosa Chiclete** - Para quem ama ser ousada\n🌊 **Azul Turquesa** - Para noites de puro relaxamento\n\nTecido respirável, macio e durável. Perfeito para dormir, trabalhar de home office ou sair de casa!\n\n🛍️ **Descubra sua cor no link da bio!**\n\nQual cor combina mais com você? 💭\n\n#PijamaPerfeito #VerãoFeminnita #ConfortoEEstilo #CoresVibrantes #AutocuidadoComEstilo",
        ctaPrimaria: "Descubra sua cor no link da bio",
        ctaSecundaria: "Qual cor combina mais com você?",
        analise: "Usa aspiração e lifestyle. Cria narrativa emocional sobre cada cor. Mostra múltiplos usos (dormir, home office, sair). CTA suave."
      }
    ]
  },
  {
    id: 3,
    titulo: "Abastecimento de Estoque",
    tipo: "Oportunidade + Confiabilidade",
    publicoAlvo: "Lojistas, grupos de compra, revendedoras",
    objetivo: "Incentivar compras em volume",
    comprimento: "350 caracteres",
    melhorHorario: "9h-11h ou 14h-16h",
    cor: "from-slate-100 to-slate-200",
    borderColor: "border-slate-400",
    engajamentoEsperado: "Alto (oportunidade clara)",
    versoes: [
      {
        numero: 1,
        titulo: "Versão 1 - Direto e Profissional",
        texto: "📦 **ABASTECIMENTO DE ESTOQUE - COMPRE EM QUANTIDADE!**\n\nTemos **500+ peças** prontas para entrega HOJE!\n\n💰 **Quanto mais você compra, mais você economiza:**\n\n✅ 1-10 peças: R$ 49,90 cada\n✅ 11-50 peças: R$ 44,90 cada (-10%)\n✅ 51+ peças: R$ 39,90 cada (-20%)\n\nPerfeito para:\n🏪 Lojistas\n👥 Grupos de Compra\n💼 Revendedoras\n\n**Peça seu orçamento agora!** Clique no link da bio ou mande DM! 📲\n\nFornecedor confiável desde 2020 ✓\n\n#AtacadoPijamas #EstoqueDisponível #MelhorPreço #FornecedorConfiável #CompreagoraAntes",
        ctaPrimaria: "Clique no link da bio",
        ctaSecundaria: "Mande DM",
        analise: "Direta e profissional. Mostra quantidade em estoque, tabela de preços clara, múltiplos públicos-alvo. Termina com credibilidade ('Fornecedor confiável desde 2020')."
      },
      {
        numero: 2,
        titulo: "Versão 2 - Oportunidade + Urgência",
        texto: "🚨 **AVISO IMPORTANTE PARA LOJISTAS E REVENDEDORAS!**\n\nEstamos com **abastecimento de estoque COMPLETO** e preços especiais para compras em quantidade!\n\nIsso é raro! Normalmente nosso estoque sai em 2-3 semanas. 📉\n\n**APROVEITE AGORA:**\n\n💎 Qualidade premium (Suede, Algodão, Poliamida)\n💎 5 cores disponíveis\n💎 Pronta entrega (24-48h)\n💎 Margem de lucro de até 100%\n\nQuanto maior o pedido, maior o desconto! 🎁\n\n**👉 Não deixe para depois! Estoques limitados!**\n\nFale com a gente:\n📱 Link na bio para WhatsApp\n💬 Mande DM aqui\n📧 Email no link da bio\n\n#OportunidadeDeOuro #EstoqueLimitado #MelhorForecedor #AtacadoPijamas #VendasAltas",
        ctaPrimaria: "Link na bio para WhatsApp",
        ctaSecundaria: "Mande DM",
        analise: "Cria urgência ('Isso é raro', 'Estoques limitados'). Mostra qualidade e benefícios múltiplos. Oferece três canais de contato."
      },
      {
        numero: 3,
        titulo: "Versão 3 - Comunidade + Confiabilidade",
        texto: "🤝 **Somos mais que um fornecedor, somos seus parceiros de sucesso!**\n\nHá anos trabalhando com lojistas e revendedoras, e agora temos **ESTOQUE COMPLETO** para você crescer!\n\nNossos clientes dizem:\n⭐ \"Melhor qualidade do mercado\"\n⭐ \"Preços super competitivos\"\n⭐ \"Entrega rápida e confiável\"\n⭐ \"Suporte excelente\"\n\n**E agora, com DESCONTO ESPECIAL para compras em quantidade!**\n\n📊 Tabela de preços:\n• 1-10: R$ 49,90\n• 11-50: R$ 44,90 (-10%)\n• 51+: R$ 39,90 (-20%)\n\nVamos crescer juntas! 💪\n\n**👉 Peça seu orçamento personalizado no link da bio!**\n\n#ParceirosDeSucesso #FornecedorConfiável #CrescerJuntas #AtacadoPijamas #QualidadeGarantida",
        ctaPrimaria: "Peça seu orçamento personalizado",
        ctaSecundaria: "Clique no link da bio",
        analise: "Enfatiza comunidade e confiabilidade. Começa com depoimentos de clientes. Mostra que é parceiro de longo prazo. CTA suave."
      }
    ]
  }
];

export default function LegendaPostsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Três Exemplos de Legendas para Posts de Imagem</h2>
        <p className="text-slate-600">
          Legendas profissionais e persuasivas com chamadas para ação claras e específicas. Cada legenda inclui 3 versões adaptadas para diferentes tons e públicos.
        </p>
      </div>

      <Tabs defaultValue="promocao" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="promocao">Promoção</TabsTrigger>
          <TabsTrigger value="lancamento">Lançamento</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
        </TabsList>

        {legendas.map((legenda) => (
          <TabsContent key={legenda.id} value={legenda.id === 1 ? "promocao" : legenda.id === 2 ? "lancamento" : "estoque"} className="space-y-6">
            {/* Header Card */}
            <Card className={`border-l-4 ${legenda.borderColor} bg-gradient-to-r ${legenda.cor}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{legenda.titulo}</CardTitle>
                    <CardDescription className="text-base font-semibold text-slate-700 mt-2">
                      {legenda.tipo}
                    </CardDescription>
                  </div>
                  <Badge className="text-sm">{legenda.comprimento}</Badge>
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
                    <p className="text-xs font-semibold text-slate-500 uppercase">Público-Alvo</p>
                    <p className="text-slate-700">{legenda.publicoAlvo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Objetivo</p>
                    <p className="text-slate-700">{legenda.objetivo}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Timing & Engajamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Melhor Horário</p>
                    <p className="text-slate-700 font-medium text-rose-600">{legenda.melhorHorario}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Engajamento Esperado</p>
                    <p className="text-slate-700 text-sm">{legenda.engajamentoEsperado}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Versões de Legendas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Três Versões de Legenda</h3>
              
              {legenda.versoes.map((versao, idx) => (
                <Card key={idx} className="border-l-4 border-l-rose-400">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{versao.titulo}</CardTitle>
                      <Badge variant="outline" className="text-xs">Versão {versao.numero}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Legenda */}
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">{versao.texto}</p>
                    </div>

                    {/* CTAs */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase mb-1 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> CTA Primária
                        </p>
                        <p className="text-sm text-blue-900 font-medium">{versao.ctaPrimaria}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="text-xs font-semibold text-green-600 uppercase mb-1 flex items-center gap-1">
                          <Share2 className="w-3 h-3" /> CTA Secundária
                        </p>
                        <p className="text-sm text-green-900 font-medium">{versao.ctaSecundaria}</p>
                      </div>
                    </div>

                    {/* Análise */}
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                      <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Análise</p>
                      <p className="text-sm text-amber-900">{versao.analise}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* General Tips */}
      <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg">10 Dicas Gerais para Escrever Legendas que Convertem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">1. Comece com um Gancho</p>
              <p className="text-sm text-slate-600">Primeiros 125 caracteres são críticos. Comece com pergunta, número, emoji ou afirmação ousada.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">2. Use Quebras de Linha</p>
              <p className="text-sm text-slate-600">Legendas densas são difíceis de ler. Quebras de linha aumentam legibilidade em 50%.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">3. Inclua Múltiplos CTAs</p>
              <p className="text-sm text-slate-600">Nem todos vão clicar no link. Ofereça alternativas: comentar, marcar amiga, enviar DM, compartilhar.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">4. Crie Urgência ou Expectativa</p>
              <p className="text-sm text-slate-600">Use palavras como HOJE, AGORA, LIMITADO, EXCLUSIVO, NOVO. Urgência aumenta conversão em 40%.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">5. Mostre Valor</p>
              <p className="text-sm text-slate-600">Sempre responda: "Por que devo fazer isso?" Mostre benefício claro, economia, qualidade ou oportunidade.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">6. Use Emojis Estrategicamente</p>
              <p className="text-sm text-slate-600">Emojis aumentam engajamento em 25%. Use 5-8 por legenda. Cada emoji deve ter propósito.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">7. Inclua Prova Social</p>
              <p className="text-sm text-slate-600">Depoimentos, números de clientes satisfeitos ou avaliações aumentam confiança e conversão.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">8. Termine com Pergunta ou Convite</p>
              <p className="text-sm text-slate-600">Perguntas no final aumentam comentários em 60%. Exemplo: "Qual é sua cor favorita?"</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">9. Use Hashtags Estrategicamente</p>
              <p className="text-sm text-slate-600">Use 15-30 hashtags. Combine hashtags virais (#FYP) com hashtags de nicho (#RendaExtra).</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-rose-600 rounded-full" />
            <div>
              <p className="font-semibold text-slate-900">10. Teste e Otimize</p>
              <p className="text-sm text-slate-600">Poste legendas diferentes e acompanhe qual gera mais engajamento. Replique o que funciona.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fórmula Pronta */}
      <Card className="border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Fórmula Pronta para Criar Suas Próprias Legendas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-700 font-semibold">Estrutura Base (7 Passos):</p>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <span className="font-bold text-rose-600 min-w-fit">1. Gancho:</span>
              <span className="text-slate-700">Algo que capture atenção (1 linha)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-rose-600 min-w-fit">2. Problema:</span>
              <span className="text-slate-700">Por que isso importa (2-3 linhas)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-rose-600 min-w-fit">3. Solução:</span>
              <span className="text-slate-700">O que você oferece (3-4 linhas)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-rose-600 min-w-fit">4. Benefício:</span>
              <span className="text-slate-700">Prova social ou número (1-2 linhas)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-rose-600 min-w-fit">5. CTA Primária:</span>
              <span className="text-slate-700">Ação principal (1 linha)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-rose-600 min-w-fit">6. CTA Secundária:</span>
              <span className="text-slate-700">Ação alternativa (1 linha)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-rose-600 min-w-fit">7. Hashtags:</span>
              <span className="text-slate-700">15-30 hashtags (1 linha)</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded border border-slate-300 mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Exemplo Preenchido:</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono">1. 🔥 PROMOÇÃO RELÂMPAGO - 40% OFF!
2. Você ama pijamas de qualidade mas acha caro?
3. Agora a coleção Suede está com desconto imperdível!
4. ⭐⭐⭐⭐⭐ 2.340 clientes satisfeitos
5. Clique no link da bio e garanta a sua!
6. Marque uma amiga que vai amar!
7. #PromoçãoRelâmpago #FeminnitaSuede #Desconto40</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
