import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { eq, like } from "drizzle-orm";

/**
 * Schema para tabela de FAQs (será criada dinamicamente)
 */
interface FAQ {
  id?: number;
  userId: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  confidence: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Simulação de armazenamento de FAQs (em produção, usar banco de dados)
const faqDatabase: Map<number, FAQ[]> = new Map();

export const whatsappFaqRouter = router({
  /**
   * Adicionar nova FAQ
   */
  addFAQ: protectedProcedure
    .input(
      z.object({
        category: z.string().min(1),
        question: z.string().min(10),
        answer: z.string().min(10),
        keywords: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const faq: FAQ = {
        userId: ctx.user.id,
        category: input.category,
        question: input.question,
        answer: input.answer,
        keywords: input.keywords,
        confidence: 0.9,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Armazenar em memória (em produção, salvar no banco)
      if (!faqDatabase.has(ctx.user.id)) {
        faqDatabase.set(ctx.user.id, []);
      }
      faqDatabase.get(ctx.user.id)!.push(faq);

      return {
        success: true,
        faq,
      };
    }),

  /**
   * Listar todas as FAQs do usuário
   */
  listFAQs: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      let faqs = faqDatabase.get(ctx.user.id) || [];

      if (input.category) {
        faqs = faqs.filter((f) => f.category === input.category);
      }

      return faqs.slice(0, input.limit);
    }),

  /**
   * Buscar FAQ por pergunta (para responder automaticamente)
   */
  searchFAQ: protectedProcedure
    .input(
      z.object({
        question: z.string().min(5),
        threshold: z.number().default(0.7),
      })
    )
    .query(async ({ ctx, input }) => {
      const faqs = faqDatabase.get(ctx.user.id) || [];

      // Buscar por palavras-chave
      const results = faqs
        .filter((faq) => faq.isActive)
        .map((faq) => {
          const questionLower = input.question.toLowerCase();
          const matchedKeywords = faq.keywords.filter((kw) =>
            questionLower.includes(kw.toLowerCase())
          ).length;

          const confidence =
            matchedKeywords > 0
              ? Math.min((matchedKeywords / faq.keywords.length) * 0.9 + 0.1, 1.0)
              : 0;

          return { faq, confidence };
        })
        .filter((result) => result.confidence >= input.threshold)
        .sort((a, b) => b.confidence - a.confidence);

      return results.length > 0
        ? results[0]
        : {
            faq: null,
            confidence: 0,
          };
    }),

  /**
   * Atualizar FAQ
   */
  updateFAQ: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        category: z.string().optional(),
        question: z.string().optional(),
        answer: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const faqs = faqDatabase.get(ctx.user.id) || [];
      const faqIndex = faqs.findIndex((f) => f.id === input.id);

      if (faqIndex === -1) {
        throw new Error("FAQ não encontrada");
      }

      const faq = faqs[faqIndex];
      faqs[faqIndex] = {
        ...faq,
        category: input.category || faq.category,
        question: input.question || faq.question,
        answer: input.answer || faq.answer,
        keywords: input.keywords || faq.keywords,
        isActive: input.isActive !== undefined ? input.isActive : faq.isActive,
        updatedAt: new Date(),
      };

      return {
        success: true,
        faq: faqs[faqIndex],
      };
    }),

  /**
   * Deletar FAQ
   */
  deleteFAQ: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const faqs = faqDatabase.get(ctx.user.id) || [];
      const filtered = faqs.filter((f) => f.id !== input.id);
      faqDatabase.set(ctx.user.id, filtered);

      return { success: true };
    }),

  /**
   * Obter categorias de FAQs
   */
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const faqs = faqDatabase.get(ctx.user.id) || [];
    const categoriesSet = new Set(faqs.map((f) => f.category));
    const categories = Array.from(categoriesSet);

    return categories.map((cat) => ({
      name: cat,
      count: faqs.filter((f) => f.category === cat).length,
    }));
  }),

  /**
   * Obter estatísticas de FAQs
   */
  getFAQStats: protectedProcedure.query(async ({ ctx }) => {
    const faqs = faqDatabase.get(ctx.user.id) || [];

    return {
      totalFAQs: faqs.length,
      activeFAQs: faqs.filter((f) => f.isActive).length,
      categories: Array.from(new Set(faqs.map((f) => f.category))).length,
      averageConfidence:
        faqs.length > 0
          ? faqs.reduce((sum, f) => sum + f.confidence, 0) / faqs.length
          : 0,
      topCategories: Object.entries(
        faqs.reduce(
          (acc: Record<string, number>, f) => {
            acc[f.category] = (acc[f.category] || 0) + 1;
            return acc;
          },
          {}
        )
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
    };
  }),

  /**
   * Importar FAQs de template padrão
   */
  importDefaultFAQs: protectedProcedure.mutation(async ({ ctx }) => {
    const defaultFAQs: FAQ[] = [
      {
        userId: ctx.user.id,
        category: "Tamanho",
        question: "Qual é o tamanho disponível?",
        answer: "Temos tamanhos P, M, G e GG disponíveis. Qual você prefere?",
        keywords: ["tamanho", "tamanhos", "disponível", "qual"],
        confidence: 0.95,
        isActive: true,
      },
      {
        userId: ctx.user.id,
        category: "Preço",
        question: "Qual é o preço?",
        answer: "Os preços variam de R$ 79,90 a R$ 149,90 dependendo do modelo. Qual você está interessado?",
        keywords: ["preço", "preços", "quanto custa", "valor", "caro"],
        confidence: 0.95,
        isActive: true,
      },
      {
        userId: ctx.user.id,
        category: "Entrega",
        question: "Quanto tempo demora a entrega?",
        answer: "Entregamos em 7 a 15 dias úteis para todo o Brasil. Você quer rastrear seu pedido?",
        keywords: ["entrega", "demora", "prazo", "quanto tempo", "quando chega"],
        confidence: 0.95,
        isActive: true,
      },
      {
        userId: ctx.user.id,
        category: "Devolução",
        question: "Qual é a política de devolução?",
        answer: "Você tem 30 dias para devolver se não gostar. Nós pagamos o frete de retorno!",
        keywords: ["devolução", "devolver", "retorno", "trocar", "não gostei"],
        confidence: 0.95,
        isActive: true,
      },
      {
        userId: ctx.user.id,
        category: "Pagamento",
        question: "Quais são as formas de pagamento?",
        answer: "Aceitamos cartão de crédito, débito, PIX e boleto. Qual você prefere?",
        keywords: ["pagamento", "pagar", "cartão", "pix", "boleto", "crédito"],
        confidence: 0.95,
        isActive: true,
      },
      {
        userId: ctx.user.id,
        category: "Material",
        question: "Do que é feito o pijama?",
        answer: "Nossos pijamas são feitos de algodão 100% ou algodão com elastano, super confortáveis!",
        keywords: ["material", "feito", "algodão", "tecido", "composição"],
        confidence: 0.95,
        isActive: true,
      },
    ];

    if (!faqDatabase.has(ctx.user.id)) {
      faqDatabase.set(ctx.user.id, []);
    }

    const userFAQs = faqDatabase.get(ctx.user.id)!;
    defaultFAQs.forEach((faq, idx) => {
      faq.id = (userFAQs.length || 0) + idx + 1;
      userFAQs.push(faq);
    });

    return {
      success: true,
      imported: defaultFAQs.length,
    };
  }),
});
