/**
 * Cosmetic data for the 4 Feminnita influencer personas.
 * Colors, emoji and display labels are static UI configuration
 * (not stored in DB). Name, bio and personality come from the DB
 * and take priority when available.
 */

export interface InfluencerCosmetics {
  name: string;
  title: string;
  color: string;        // Tailwind gradient (for headers/banners)
  bgColor: string;      // Tailwind bg (for card backgrounds)
  accentColor: string;  // Tailwind text color (for accents)
  image: string;        // Emoji avatar
  feminnita_url: string;
  dailyLife?: string[];
  feminnita?: string[];
  bio?: string;
}

export const INFLUENCER_COSMETICS: Record<number, InfluencerCosmetics> = {
  1: {
    name: "Carol",
    title: "A Mãe Moderna",
    bio: "Mãe de 2 filhos, equilibrando maternidade com vida pessoal. Amante de conforto e praticidade.",
    color: "from-pink-400 to-pink-600",
    bgColor: "bg-pink-50",
    accentColor: "text-pink-600",
    image: "👩‍👧‍👦",
    feminnita_url: "https://www.feminnita.com.br",
    dailyLife: [
      "Acordar cedo para preparar as crianças",
      "Trabalho remoto com os filhos",
      "Yoga 3x por semana",
      "Noites de série com o marido",
      "Finais de semana em família",
    ],
    feminnita: [
      "Pijamas confortáveis para noites de série",
      "Roupa prática para trabalhar em casa",
      "Pijamas para as crianças também",
      "Conforto durante o dia de trabalho",
    ],
  },
  2: {
    name: "Renata",
    title: "A Executiva Elegante",
    bio: "Executiva ambiciosa, sofisticada. Viajante, networking e desenvolvimento pessoal.",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-50",
    accentColor: "text-purple-600",
    image: "👩‍💼",
    feminnita_url: "https://www.feminnita.com.br",
    dailyLife: [
      "Reuniões importantes e apresentações",
      "Viagens de negócios frequentes",
      "Eventos corporativos",
      "Academia e autocuidado",
      "Leitura e desenvolvimento pessoal",
    ],
    feminnita: [
      "Pijamas sofisticados para viagens",
      "Conforto premium em hotéis",
      "Looks elegantes para home office",
      "Presentes corporativos",
    ],
  },
  3: {
    name: "Vanessa",
    title: "A Criativa Artística",
    bio: "Artista e criativa, expressando-se através da moda e arte. Ama cores, texturas e design.",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    accentColor: "text-blue-600",
    image: "🎨",
    feminnita_url: "https://www.feminnita.com.br",
    dailyLife: [
      "Sessões de pintura e arte",
      "Visitas a galerias e exposições",
      "Fotografia criativa",
      "Workshops de design",
      "Curadoria de moda",
    ],
    feminnita: [
      "Pijamas com estampas exclusivas",
      "Cores vibrantes e únicas",
      "Tecidos artisticamente trabalhados",
      "Edições limitadas",
    ],
  },
  4: {
    name: "Luiza",
    title: "A Fitness Aventureira",
    bio: "Apaixonada por esportes, aventura e vida saudável. Inspira mulheres a se cuidarem.",
    color: "from-green-400 to-green-600",
    bgColor: "bg-green-50",
    accentColor: "text-green-600",
    image: "💪",
    feminnita_url: "https://www.feminnita.com.br",
    dailyLife: [
      "Treino matinal intenso",
      "Trilhas e esportes ao ar livre",
      "Alimentação saudável",
      "Meditação e mindfulness",
      "Comunidade fitness",
    ],
    feminnita: [
      "Pijamas para recovery pós-treino",
      "Conforto para noites de descanso",
      "Tecidos respiráveis e leves",
      "Estilo ativo e moderno",
    ],
  },
};

export const DEFAULT_COSMETICS: InfluencerCosmetics = {
  name: "",
  title: "",
  bio: "",
  color: "from-gray-400 to-gray-600",
  bgColor: "bg-gray-50",
  accentColor: "text-gray-600",
  image: "👤",
  feminnita_url: "https://www.feminnita.com.br",
  dailyLife: [],
  feminnita: [],
};

export function getInfluencerCosmetics(id: number): InfluencerCosmetics {
  return INFLUENCER_COSMETICS[id] ?? DEFAULT_COSMETICS;
}
