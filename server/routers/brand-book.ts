import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { brandBook } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const DEFAULT_BRAND_BOOK = {
  corPrimaria: "#D97706",
  corSecundaria: "#F59E0B",
  corAcento: "#FDE68A",
  corTexto: "#1E293B",
  fontePrimaria: "Inter",
  fonteSecundaria: "Playfair Display",
  tomInstagram: "Acolhedor, feminino e inspirador. Use emojis com moderação. Foque em benefícios emocionais (conforto, autocuidado, beleza). Evite jargões técnicos.",
  tomTikTok: "Energético, jovem e autêntico. CTAs diretos. Fale como amiga. Use trending sounds e challenges quando relevante. Seja rápida nos primeiros 3 segundos.",
  tomWhatsApp: "Direto, pessoal e caloroso. Como uma consultora de confiança. Nunca pressione. Ofereça ajuda genuína. Use o nome do cliente sempre que possível.",
  tomEmail: "Profissional mas acessível. Assunto curto e objetivo. Destaque o benefício principal. CTA claro no primeiro parágrafo.",
  hashtagsOficiais: "#Feminnita #PijamaFeminnita #PijamaConforto #ModaFeminina #PijamaQualidade #AtacadoPijama #RevendaPijama #PijamaEstiloso",
  hashtagsProibidas: "#Barato #Promoção #Desconto (use alternativas como #OportunidadeÚnica #PreçoEspecial)",
  palavrasChave: "conforto, qualidade, feminino, suavidade, elegância, atacado, revendedora, exclusivo, coleção",
  palavrasProibidas: "barato, genérico, comum, simples demais",
  propostaValor: "Pijamas femininos de alta qualidade para mulheres que valorizam conforto com elegância. Para atacado: margem atrativa, qualidade garantida, parceria duradoura.",
  diferenciais: "Tecidos premium, modelagem exclusiva, entrega rápida, suporte à revendedora, novas coleções sazonais",
  publicoAlvo: "Mulheres 25-50 anos, classe B/C, que valorizam qualidade. Revendedoras buscando produto com boa margem e giro rápido.",
};

export const brandBookRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return DEFAULT_BRAND_BOOK;
    const [existing] = await db.select().from(brandBook).where(eq(brandBook.userId, ctx.user.id));
    return existing ?? DEFAULT_BRAND_BOOK;
  }),

  salvar: protectedProcedure
    .input(z.object({
      corPrimaria: z.string().optional(),
      corSecundaria: z.string().optional(),
      corAcento: z.string().optional(),
      corTexto: z.string().optional(),
      fontePrimaria: z.string().optional(),
      fonteSecundaria: z.string().optional(),
      tomInstagram: z.string().optional(),
      tomTikTok: z.string().optional(),
      tomWhatsApp: z.string().optional(),
      tomEmail: z.string().optional(),
      hashtagsOficiais: z.string().optional(),
      hashtagsProibidas: z.string().optional(),
      palavrasChave: z.string().optional(),
      palavrasProibidas: z.string().optional(),
      propostaValor: z.string().optional(),
      diferenciais: z.string().optional(),
      publicoAlvo: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const [existing] = await db.select({ id: brandBook.id }).from(brandBook).where(eq(brandBook.userId, ctx.user.id));
      if (existing) {
        await db.update(brandBook).set({ ...input, updatedAt: new Date() }).where(eq(brandBook.userId, ctx.user.id));
      } else {
        await db.insert(brandBook).values({ userId: ctx.user.id, ...input });
      }
      return { success: true };
    }),
});
