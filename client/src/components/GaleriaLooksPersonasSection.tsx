import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star } from "lucide-react";
import PersonaAvatar from "./PersonaAvatar";

export default function GaleriaLooksPersonasSection() {
  const looks = [
    {
      id: 1,
      persona: "Carol",
      title: "Look Casual Confortável",
      description: "Pijama básico em cores neutras, perfeito para trabalhar de casa",
      products: ["Baby Doll Básico", "Calça Moletom", "Chinelo Fofinho"],
      image: "bg-gradient-to-br from-blue-100 to-blue-200",
      rating: 4.8,
      uses: 245,
    },
    {
      id: 2,
      persona: "Carol",
      title: "Look Noite Aconchego",
      description: "Pijama quentinho para noites frias de inverno",
      products: ["Pijama Flanela", "Meia Térmica", "Robe Aconchego"],
      image: "bg-gradient-to-br from-orange-100 to-red-200",
      rating: 4.9,
      uses: 312,
    },
    {
      id: 3,
      persona: "Renata",
      title: "Look Profissional Elegante",
      description: "Pijama premium para apresentações e fotos de catálogo",
      products: ["Pijama Seda", "Blazer Pijama", "Sapato Conforto"],
      image: "bg-gradient-to-br from-purple-100 to-pink-200",
      rating: 4.7,
      uses: 189,
    },
    {
      id: 4,
      persona: "Renata",
      title: "Look Revenda Plus Size",
      description: "Coleção exclusiva tamanhos maiores com alta margem",
      products: ["Pijama Plus Size", "Camisola Alongada", "Bermuda Conforto"],
      image: "bg-gradient-to-br from-green-100 to-emerald-200",
      rating: 4.6,
      uses: 156,
    },
    {
      id: 5,
      persona: "Vanessa",
      title: "Look Família Completa",
      description: "Kit pijama para toda a família em cores coordenadas",
      products: ["Pijama Adulto", "Pijama Infantil", "Pijama Bebê"],
      image: "bg-gradient-to-br from-rose-100 to-pink-200",
      rating: 4.9,
      uses: 428,
    },
    {
      id: 6,
      persona: "Vanessa",
      title: "Look Compra Coletiva",
      description: "Promoção especial para grupos de 5+ pessoas",
      products: ["Pijama Sortido", "Desconto Progressivo", "Frete Grátis"],
      image: "bg-gradient-to-br from-yellow-100 to-amber-200",
      rating: 4.8,
      uses: 367,
    },
    {
      id: 7,
      persona: "Luiza",
      title: "Look Loungewear Trendy",
      description: "Pijama que você pode usar na rua - moda e conforto",
      products: ["Pijama Oversized", "Cropped Pijama", "Tênis Conforto"],
      image: "bg-gradient-to-br from-cyan-100 to-blue-200",
      rating: 4.9,
      uses: 523,
    },
    {
      id: 8,
      persona: "Luiza",
      title: "Look TikTok Viral",
      description: "Combinações que explodem em visualizações",
      products: ["Pijama Estampado", "Acessórios Trendy", "Makeup Conforto"],
      image: "bg-gradient-to-br from-fuchsia-100 to-pink-200",
      rating: 5.0,
      uses: 612,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Galeria de Looks por Persona</h2>
        <p className="text-slate-600">Estilos de pijamas recomendados para cada persona com produtos sugeridos</p>
      </div>

      {/* Looks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {looks.map((look) => (
          <Card key={look.id} className="overflow-hidden hover:shadow-lg transition-all">
            {/* Image Preview */}
            <div className={`h-40 ${look.image} flex items-center justify-center`}>
              <PersonaAvatar name={look.persona} size="lg" />
            </div>

            {/* Content */}
            <CardHeader className="pb-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm">{look.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">{look.persona}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {look.rating}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">{look.description}</p>
              </div>
            </CardHeader>

            {/* Products */}
            <CardContent className="space-y-3">
              <div className="space-y-1">
                {look.products.map((product, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                    <ShoppingCart className="w-3 h-3 text-pink-500" />
                    {product}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">{look.uses} usos</span>
                <button className="text-pink-600 hover:text-pink-700 text-xs font-medium">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Dica de Uso</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-2">
          <p>Use esses looks como referência para:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Criar conteúdo visual para Stories e Reels</li>
            <li>Sugerir combinações para clientes</li>
            <li>Planejar campanhas por persona</li>
            <li>Treinar revendedoras sobre styling</li>
            <li>Inspirar novos designs de produtos</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
