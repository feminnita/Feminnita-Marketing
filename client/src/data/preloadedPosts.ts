/**
 * 15 Postagens Pré-carregadas para Instagram
 * 10 postagens simples + 5 carrosséis
 * Otimizadas para conversão de vendas de pijamas no ATACADO
 */

export interface PostSlide {
  imageUrl: string;
  headline?: string;
  description?: string;
}

export interface PreloadedPost {
  id: string;
  type: "simple" | "carousel";
  caption: string;
  slides: PostSlide[];
  hashtags: string[];
  scheduledDate: string;
  scheduledTime: string;
  platforms: ("instagram" | "facebook" | "whatsapp")[];
  cta: string;
}

export const preloadedPosts: PreloadedPost[] = [
  // ===== POSTAGENS SIMPLES (10) =====

  {
    id: "post-1",
    type: "simple",
    caption: `🔥 COMPRE NO ATACADO COM PREÇO DE FÁBRICA! 🔥

FEMINNITA PIJAMAS - Pedido mínimo de R$199

Você revende e LUCRA! 💰
Nossas revendedoras ganham até 100% de lucro!

✨ Qualidade Premium
✨ Estoque Limitado
✨ Entrega Rápida

Ideal para lojistas e revendedoras que querem giro fácil!

Chama no WhatsApp agora! 📱
Link na bio para comprar 👆

#AtacadoPijamas #PreçoDeFábrica #RevendaLucro #PijamasAtacado #FemininaPijamas #LucreFácil`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "ATACADO COM PREÇO DE FÁBRICA",
        description: "Pedido mínimo de R$199",
      },
    ],
    hashtags: [
      "#AtacadoPijamas",
      "#PreçoDeFábrica",
      "#RevendaLucro",
      "#PijamasAtacado",
      "#FemininaPijamas",
    ],
    scheduledDate: "2026-02-10",
    scheduledTime: "10:00",
    platforms: ["instagram", "facebook"],
    cta: "Chama no WhatsApp",
  },

  {
    id: "post-2",
    type: "simple",
    caption: `💎 QUALIDADE QUE VENDE! 💎

Pijamas FEMINNITA - Conforto + Estilo + Lucro

Nossas clientes amam! ❤️
Seus clientes vão amar também!

🎁 Tecido Premium
🎁 Modelos Exclusivos
🎁 Preço Imbatível

ATACADO - Pedido mínimo R$199
Ideal para revenda e lojistas!

Estoque limitado - Reserve agora! 🚀
Link na bio 👆

#PijamasQualidade #AtacadoFeminino #RevendaPijamas #LucroGarantido #FemininaPijamas`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "QUALIDADE QUE VENDE",
        description: "Tecido Premium + Modelos Exclusivos",
      },
    ],
    hashtags: [
      "#PijamasQualidade",
      "#AtacadoFeminino",
      "#RevendaPijamas",
      "#LucroGarantido",
    ],
    scheduledDate: "2026-02-11",
    scheduledTime: "14:00",
    platforms: ["instagram", "facebook"],
    cta: "Reserve agora",
  },

  {
    id: "post-3",
    type: "simple",
    caption: `🌟 REVENDA COM LUCRO FÁCIL! 🌟

FEMINNITA PIJAMAS - O Melhor Atacado do Brasil

Ganhe até 100% de lucro! 💰
Produtos que VENDEM sozinhos!

✅ Qualidade Garantida
✅ Preço de Fábrica
✅ Pedido Mínimo R$199
✅ Entrega Rápida

Junte-se a centenas de revendedoras que já lucram com a gente!

Chama agora! 📞
Link na bio para comprar 👆

#RevendaPijamas #GanheComNosco #AtacadoLucro #PijamasParaRevender #FemininaPijamas`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "REVENDA COM LUCRO FÁCIL",
        description: "Ganhe até 100% de lucro",
      },
    ],
    hashtags: [
      "#RevendaPijamas",
      "#GanheComNosco",
      "#AtacadoLucro",
      "#PijamasParaRevender",
    ],
    scheduledDate: "2026-02-12",
    scheduledTime: "11:00",
    platforms: ["instagram", "facebook"],
    cta: "Chama agora",
  },

  {
    id: "post-4",
    type: "simple",
    caption: `🎯 GIRO FÁCIL, LUCRO GARANTIDO! 🎯

FEMINNITA PIJAMAS - Atacado Inteligente

Produtos que seus clientes DESEJAM!
Preço que seus clientes PAGAM!
Lucro que VOCÊ QUER! 💵

📦 Pedido Mínimo: R$199
📦 Qualidade Premium
📦 Modelos Exclusivos
📦 Entrega Rápida

Ideal para lojistas, revendedoras e influenciadoras!

Não perca essa oportunidade! 🚀
Link na bio para comprar 👆

#GiroFácil #LucroGarantido #AtacadoPijamas #RevendaInteligente #FemininaPijamas`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "GIRO FÁCIL, LUCRO GARANTIDO",
        description: "Produtos que vendem sozinhos",
      },
    ],
    hashtags: [
      "#GiroFácil",
      "#LucroGarantido",
      "#AtacadoPijamas",
      "#RevendaInteligente",
    ],
    scheduledDate: "2026-02-13",
    scheduledTime: "15:30",
    platforms: ["instagram", "facebook"],
    cta: "Compre agora",
  },

  {
    id: "post-5",
    type: "simple",
    caption: `✨ ESTOQUE LIMITADO - APROVEITA! ✨

FEMINNITA PIJAMAS - Atacado Exclusivo

Modelos que VENDEM rápido! 🔥
Preço que LUCRA muito! 💰

🎁 Conforto Premium
🎁 Estilo Exclusivo
🎁 Preço de Fábrica

COMPRE NO ATACADO
Pedido mínimo de R$199

Ideal para revendedoras e lojistas que querem lucrar!

Estoque limitado - Reserve agora! ⏰
Link na bio 👆

#EstoqueLimitado #AtacadoPijamas #PreçoDeFábrica #RevendaLucro #FemininaPijamas`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "ESTOQUE LIMITADO",
        description: "Reserve agora antes que acabe",
      },
    ],
    hashtags: [
      "#EstoqueLimitado",
      "#AtacadoPijamas",
      "#PreçoDeFábrica",
      "#RevendaLucro",
    ],
    scheduledDate: "2026-02-14",
    scheduledTime: "09:00",
    platforms: ["instagram", "facebook"],
    cta: "Reserve agora",
  },

  {
    id: "post-6",
    type: "simple",
    caption: `💪 COMECE SUA REVENDA AGORA! 💪

FEMINNITA PIJAMAS - Seu Atacado de Confiança

Quer começar a ganhar dinheiro?
Nós temos a solução! 💵

✅ Produtos de Qualidade
✅ Preço Competitivo
✅ Suporte Total
✅ Lucro Garantido

Pedido mínimo de R$199
Perfeito para começar sua revenda!

Chama no WhatsApp agora! 📱
Link na bio para mais informações 👆

#ComeceSuaRevenda #AtacadoPijamas #GanheComNosco #RevendaFácil #FemininaPijamas`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "COMECE SUA REVENDA AGORA",
        description: "Pedido mínimo de R$199",
      },
    ],
    hashtags: [
      "#ComeceSuaRevenda",
      "#AtacadoPijamas",
      "#GanheComNosco",
      "#RevendaFácil",
    ],
    scheduledDate: "2026-02-15",
    scheduledTime: "13:00",
    platforms: ["instagram", "facebook"],
    cta: "Chama agora",
  },

  {
    id: "post-7",
    type: "simple",
    caption: `🎊 PROMOÇÃO ESPECIAL ATACADO! 🎊

FEMINNITA PIJAMAS - Preço de Fábrica

Aproveita essa oportunidade! 🔥
Seus clientes vão amar! ❤️

💎 Qualidade Premium
💎 Modelos Exclusivos
💎 Preço Imbatível

ATACADO - Pedido mínimo R$199
Ideal para lojistas e revendedoras!

Lucro garantido em cada venda! 💰
Link na bio para comprar 👆

#PromoçãoEspecial #AtacadoPijamas #PreçoDeFábrica #LucroGarantido #FemininaPijamas`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "PROMOÇÃO ESPECIAL",
        description: "Preço de Fábrica + Lucro Garantido",
      },
    ],
    hashtags: [
      "#PromoçãoEspecial",
      "#AtacadoPijamas",
      "#PreçoDeFábrica",
      "#LucroGarantido",
    ],
    scheduledDate: "2026-02-16",
    scheduledTime: "10:30",
    platforms: ["instagram", "facebook"],
    cta: "Compre agora",
  },

  {
    id: "post-8",
    type: "simple",
    caption: `🌈 CORES E MODELOS QUE VENDEM! 🌈

FEMINNITA PIJAMAS - Atacado Exclusivo

Variedade que seus clientes DESEJAM! 🎨
Preço que você LUCRA! 💵

✨ Modelos Exclusivos
✨ Cores Tendência
✨ Qualidade Garantida

Pedido mínimo de R$199
Perfeito para revenda!

Estoque limitado - Não perca! ⏰
Link na bio para comprar 👆

#CoresETendências #AtacadoPijamas #ModelosExclusivos #RevendaLucro #FemininaPijamas`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "CORES E MODELOS QUE VENDEM",
        description: "Variedade que seus clientes desejam",
      },
    ],
    hashtags: [
      "#CoresETendências",
      "#AtacadoPijamas",
      "#ModelosExclusivos",
      "#RevendaLucro",
    ],
    scheduledDate: "2026-02-17",
    scheduledTime: "14:00",
    platforms: ["instagram", "facebook"],
    cta: "Compre agora",
  },

  {
    id: "post-9",
    type: "simple",
    caption: `🚀 ACELERA SEU NEGÓCIO! 🚀

FEMINNITA PIJAMAS - Atacado Inteligente

Quer crescer rápido?
Nós temos tudo que você precisa! 💪

🎯 Produtos que Vendem
🎯 Preço Competitivo
🎯 Suporte Completo

Pedido mínimo de R$199
Comece sua revenda hoje!

Centenas de revendedoras já lucram com a gente! 💰
Link na bio para mais info 👆

#AceleraSeunegócio #AtacadoPijamas #RevendaLucro #GanheComNosco #FemininaPijamas`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "ACELERA SEU NEGÓCIO",
        description: "Comece sua revenda hoje",
      },
    ],
    hashtags: [
      "#AceleraSeunegócio",
      "#AtacadoPijamas",
      "#RevendaLucro",
      "#GanheComNosco",
    ],
    scheduledDate: "2026-02-18",
    scheduledTime: "11:00",
    platforms: ["instagram", "facebook"],
    cta: "Chama agora",
  },

  {
    id: "post-10",
    type: "simple",
    caption: `💝 PRESENTE PERFEITO PARA REVENDA! 💝

FEMINNITA PIJAMAS - Atacado Feminino

Pijamas que TODOS QUEREM! ❤️
Preço que VOCÊ LUCRA! 💵

🎁 Conforto Total
🎁 Estilo Premium
🎁 Preço de Fábrica

COMPRE NO ATACADO
Pedido mínimo de R$199

Ideal para lojistas, revendedoras e influenciadoras!

Não perca essa oportunidade! 🔥
Link na bio para comprar 👆

#PresentePerfeit #AtacadoPijamas #PreçoDeFábrica #RevendaLucro #FemininaPijamas`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "PRESENTE PERFEITO",
        description: "Para revenda e lucro",
      },
    ],
    hashtags: [
      "#PresentePerfeit",
      "#AtacadoPijamas",
      "#PreçoDeFábrica",
      "#RevendaLucro",
    ],
    scheduledDate: "2026-02-19",
    scheduledTime: "15:30",
    platforms: ["instagram", "facebook"],
    cta: "Compre agora",
  },

  // ===== CARROSSÉIS (5) =====

  {
    id: "carousel-1",
    type: "carousel",
    caption: `🔥 CARROSSEL COMPLETO: COMO LUCRAR COM PIJAMAS! 🔥

Desliza para ver tudo! 👉

#AtacadoPijamas #RevendaLucro #PreçoDeFábrica #FemininaPijamas #GanheComNosco`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "SLIDE 1: ATACADO COM PREÇO DE FÁBRICA",
        description: "Pedido mínimo de R$199 - Comece agora!",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "SLIDE 2: BENEFÍCIOS DO PIJAMA",
        description: "Conforto, Qualidade, Estilo - Tudo em um!",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "SLIDE 3: VANTAGEM PARA REVENDA",
        description: "Lucre até 100% - Giro fácil - Produtos que vendem!",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "SLIDE 4: PEDIDO MÍNIMO",
        description: "Apenas R$199 para começar sua revenda!",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "SLIDE 5: CHAMA AGORA!",
        description: "WhatsApp na bio - Estoque limitado - Reserve já!",
      },
    ],
    hashtags: [
      "#AtacadoPijamas",
      "#RevendaLucro",
      "#PreçoDeFábrica",
      "#FemininaPijamas",
      "#CarrosselVendas",
    ],
    scheduledDate: "2026-02-20",
    scheduledTime: "10:00",
    platforms: ["instagram", "facebook"],
    cta: "Desliza para ver tudo",
  },

  {
    id: "carousel-2",
    type: "carousel",
    caption: `💎 CARROSSEL: 5 RAZÕES PARA REVENDER CONOSCO! 💎

Desliza e descobre! 👉

#RevendaPijamas #AtacadoLucro #PreçoDeFábrica #FemininaPijamas #GanheComNosco`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "RAZÃO 1: QUALIDADE PREMIUM",
        description: "Tecido macio, durável e confortável",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "RAZÃO 2: PREÇO DE FÁBRICA",
        description: "Os menores preços do mercado",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "RAZÃO 3: LUCRO GARANTIDO",
        description: "Ganhe até 100% de lucro",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "RAZÃO 4: SUPORTE COMPLETO",
        description: "Estamos sempre aqui para ajudar",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "RAZÃO 5: PRODUTOS QUE VENDEM",
        description: "Modelos exclusivos que seus clientes amam",
      },
    ],
    hashtags: [
      "#RevendaPijamas",
      "#AtacadoLucro",
      "#PreçoDeFábrica",
      "#FemininaPijamas",
      "#CarrosselVendas",
    ],
    scheduledDate: "2026-02-21",
    scheduledTime: "14:00",
    platforms: ["instagram", "facebook"],
    cta: "Desliza para descobrir",
  },

  {
    id: "carousel-3",
    type: "carousel",
    caption: `🌟 CARROSSEL: HISTÓRIAS DE SUCESSO! 🌟

Veja como nossas revendedoras lucram! 👉

#HistóriasDeSucesso #RevendaPijamas #AtacadoLucro #FemininaPijamas #CasosDeSucesso`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "HISTÓRIA 1: COMEÇOU COM R$199",
        description: "Hoje fatura R$5.000+ por mês",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "HISTÓRIA 2: INFLUENCIADORA",
        description: "Ganhou R$10.000 em vendas no primeiro mês",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "HISTÓRIA 3: LOJISTA",
        description: "Aumentou faturamento em 300%",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "HISTÓRIA 4: MÃE EMPREENDEDORA",
        description: "Agora trabalha de casa e ganha bem",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "PRÓXIMA HISTÓRIA PODE SER A SUA!",
        description: "Chama agora e comece a lucrar",
      },
    ],
    hashtags: [
      "#HistóriasDeSucesso",
      "#RevendaPijamas",
      "#AtacadoLucro",
      "#FemininaPijamas",
      "#CasosDeSucesso",
    ],
    scheduledDate: "2026-02-22",
    scheduledTime: "11:00",
    platforms: ["instagram", "facebook"],
    cta: "Veja as histórias",
  },

  {
    id: "carousel-4",
    type: "carousel",
    caption: `🎯 CARROSSEL: GUIA COMPLETO DA REVENDA! 🎯

Aprenda como lucrar! 👉

#GuiaCompleto #RevendaPijamas #ComoLucrar #AtacadoPijamas #FemininaPijamas`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "PASSO 1: FAÇA SEU PEDIDO",
        description: "Mínimo de R$199 - Escolha seus modelos",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "PASSO 2: RECEBA OS PRODUTOS",
        description: "Entrega rápida e segura",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "PASSO 3: VENDA PARA SEUS CLIENTES",
        description: "Produtos que vendem sozinhos",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "PASSO 4: LUCRE ATÉ 100%",
        description: "Ganhe muito com cada venda",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "PASSO 5: REPITA E CRESÇA",
        description: "Aumente seus pedidos e seu lucro",
      },
    ],
    hashtags: [
      "#GuiaCompleto",
      "#RevendaPijamas",
      "#ComoLucrar",
      "#AtacadoPijamas",
      "#FemininaPijamas",
    ],
    scheduledDate: "2026-02-23",
    scheduledTime: "15:30",
    platforms: ["instagram", "facebook"],
    cta: "Aprenda agora",
  },

  {
    id: "carousel-5",
    type: "carousel",
    caption: `✨ CARROSSEL: TUDO QUE VOCÊ PRECISA SABER! ✨

Desliza e descobre os segredos! 👉

#TudoQueVocêPrecisaSaber #AtacadoPijamas #RevendaLucro #FemininaPijamas #Segredos`,
    slides: [
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "SEGREDO 1: QUALIDADE PREMIUM",
        description: "Nossos pijamas são feitos com os melhores tecidos",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "SEGREDO 2: PREÇO IMBATÍVEL",
        description: "Compramos direto da fábrica e repassamos o melhor preço",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1586883256402-75ba57a235e9?w=1080&h=1350&fit=crop",
        headline: "SEGREDO 3: SUPORTE VIP",
        description: "Você não está sozinho - temos um time pronto para ajudar",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1618886996285-b3c5e9e1b5e5?w=1080&h=1350&fit=crop",
        headline: "SEGREDO 4: MODELOS EXCLUSIVOS",
        description: "Designs que você não encontra em outro lugar",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1591080876657-2d5e6b8e0d3e?w=1080&h=1350&fit=crop",
        headline: "AGORA É SUA VEZ DE LUCRAR!",
        description: "Chama no WhatsApp e comece hoje mesmo",
      },
    ],
    hashtags: [
      "#TudoQueVocêPrecisaSaber",
      "#AtacadoPijamas",
      "#RevendaLucro",
      "#FemininaPijamas",
      "#Segredos",
    ],
    scheduledDate: "2026-02-24",
    scheduledTime: "10:00",
    platforms: ["instagram", "facebook"],
    cta: "Chama agora",
  },
];
