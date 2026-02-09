import { ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BlogLink {
  name: string;
  influencer: string;
  description: string;
  color: string;
  url: string;
  icon: string;
}

const blogs: BlogLink[] = [
  {
    name: 'Blog - Carol',
    influencer: 'Carol - A Mãe Moderna',
    description: 'Dicas de maternidade, trabalho remoto e estilo de vida. Descubra como os pijamas Feminnita se encaixam na rotina de mães modernas.',
    color: 'bg-yellow-50 border-yellow-200',
    url: 'https://carol-blog.manus.space', // URL será preenchida depois
    icon: '👩‍👧‍👦'
  },
  {
    name: 'Blog - Renata',
    influencer: 'Renata - A Executiva Elegante',
    description: 'Elegância, profissionalismo e bem-estar. Veja como manter a sofisticação mesmo nos momentos de descanso com Feminnita.',
    color: 'bg-purple-50 border-purple-200',
    url: 'https://renata-blog.manus.space', // URL será preenchida depois
    icon: '👩‍💼'
  },
  {
    name: 'Blog - Vanessa',
    influencer: 'Vanessa - A Criativa Artística',
    description: 'Arte, criatividade e design. Explore como a criatividade se expressa até nos pijamas com as edições limitadas Feminnita.',
    color: 'bg-pink-50 border-pink-200',
    url: 'https://vanessa-blog.manus.space', // URL será preenchida depois
    icon: '🎨'
  },
  {
    name: 'Blog - Luiza',
    influencer: 'Luiza - A Fitness Aventureira',
    description: 'Fitness, aventura e performance. Descubra a importância do sono de qualidade para atletas com os pijamas Feminnita.',
    color: 'bg-green-50 border-green-200',
    url: 'https://luiza-blog.manus.space', // URL será preenchida depois
    icon: '💪'
  }
];

export default function InfluencerBlogsLinksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" style={{ color: '#A63D4A' }} />
            <h1 className="text-4xl font-bold text-slate-900">Blogs das Influenciadoras</h1>
          </div>
          <p className="text-lg text-slate-600">
            Acompanhe o dia a dia de cada influenciadora e descubra como os pijamas Feminnita se encaixam em suas vidas
          </p>
        </div>

        {/* Grid de Blogs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {blogs.map((blog) => (
            <Card key={blog.name} className={`border-2 ${blog.color} hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-4xl mb-2">{blog.icon}</div>
                    <CardTitle className="text-2xl">{blog.name}</CardTitle>
                    <CardDescription className="text-base mt-1">{blog.influencer}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-6 leading-relaxed">{blog.description}</p>
                <a href={blog.url} target="_blank" rel="noopener noreferrer">
                  <Button 
                    className="w-full gap-2"
                    style={{ backgroundColor: '#A63D4A' }}
                  >
                    Acessar Blog
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seção de Informações */}
        <Card className="bg-white border-2 border-slate-200">
          <CardHeader>
            <CardTitle>Sobre os Blogs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">📝 Conteúdo Autêntico</h3>
              <p className="text-slate-700">
                Cada influenciadora compartilha sua história, rotina e como os produtos Feminnita se encaixam naturalmente em suas vidas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">🛍️ Produtos Destacados</h3>
              <p className="text-slate-700">
                Descubra os pijamas Feminnita recomendados por cada influenciadora, com links diretos para compra.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">💬 Comunidade</h3>
              <p className="text-slate-700">
                Interaja com as influenciadoras, deixe comentários e faça parte de uma comunidade de mulheres que se apoiam.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
