import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Heart, Eye } from "lucide-react";

const tendencias = [
  {
    id: 1,
    titulo: "Provador Rápido com Transições",
    descricao: "Modelo veste o pijama rapidamente com transições de câmera ou efeitos de corte.",
    viralidade: "Muito Alta",
    engajamento: "256.5K curtidas",
    formato: "Reel/TikTok (15-30s)",
    elementos: [
      "Música animada em alta",
      "Cortes rápidos entre diferentes ângulos",
      "Destaque do detalhe (estampa, tecido)",
      "Transição suave para o próximo look"
    ],
    exemplo: "Vídeo de @valeserikawa mostrando haul de pijamas com transições dinâmicas",
    aplicacao: "Ideal para lançamentos e novidades. Use com as personas Luiza e Carol."
  },
  {
    id: 2,
    titulo: "Tour pela Fábrica/Loja (Autoridade)",
    descricao: "Mostrar o processo de fabricação, estoque ou loja transmite confiança e volume.",
    viralidade: "Alta",
    engajamento: "Milhares de comentários",
    formato: "Reel/TikTok (30-60s)",
    elementos: [
      "Câmera dinâmica percorrendo o espaço",
      "Pilhas de pijamas em destaque",
      "Funcionários trabalhando (humanização)",
      "Números/estatísticas de produção"
    ],
    exemplo: "Vídeos de fornecedores no Brás mostrando estoque gigantesco",
    aplicacao: "Use com a persona Renata para transmitir profissionalismo e escala."
  },
  {
    id: 3,
    titulo: "Renda Extra e Primeiro Investimento",
    descricao: "Narrativa de 'Comprei R$ 199 e lucrei X' com prova social (mensagens de clientes).",
    viralidade: "Muito Alta",
    engajamento: "Altíssimo (identificação emocional)",
    formato: "Reel/TikTok (20-45s)",
    elementos: [
      "Unboxing do pedido mínimo",
      "Mostragem de lucro/margem",
      "Mensagens de clientes (screenshots)",
      "Depoimento autêntico e entusiasmado"
    ],
    exemplo: "Vídeos com hashtags #RendaExtra #PrimeiroNegócio que viralizam regularmente",
    aplicacao: "Use com a persona Carol para captar empreendedoras iniciantes."
  },
  {
    id: 4,
    titulo: "Pijama na Rua (Loungewear Trend)",
    descricao: "Tendência 2026: Mostrar o pijama sendo usado fora de casa, como moda casual.",
    viralidade: "Alta (Tendência Emergente)",
    engajamento: "Crescente",
    formato: "Reel/TikTok (15-30s)",
    elementos: [
      "Cenas de rua ou espaço público",
      "Styling do pijama com acessórios",
      "Confiança e naturalidade",
      "Hashtags: #Loungewear #PijamaNaRua #ModaTikTok"
    ],
    exemplo: "Vídeos de fashionistas mostrando pijamas como peça de moda",
    aplicacao: "Use com a persona Luiza para posicionar a marca como trendsetter."
  },
  {
    id: 5,
    titulo: "Compra Coletiva e Economia Familiar",
    descricao: "Cenas de família/amigas unidas, mostrando economia ao comprar em grupo.",
    viralidade: "Alta",
    engajamento: "Muito alto (conexão emocional)",
    formato: "Reel/TikTok (20-40s)",
    elementos: [
      "Cenas de união e diversão",
      "Destaque do valor economizado",
      "Kits Família em destaque",
      "Mensagem de inclusão e comunidade"
    ],
    exemplo: "Vídeos de mães e amigas mostrando compras coletivas",
    aplicacao: "Use com a persona Vanessa para captar grupos de compra."
  },
  {
    id: 6,
    titulo: "ASMR de Satisfação (Estoque/Caixas)",
    descricao: "Vídeos satisfatórios de caixas abrindo, pijamas sendo dobrados, pilhas crescendo.",
    viralidade: "Alta",
    engajamento: "Muito alto (relaxante e satisfatório)",
    formato: "Reel/TikTok (15-30s)",
    elementos: [
      "Som de caixa abrindo (ASMR)",
      "Movimento lento e deliberado",
      "Cores e texturas em destaque",
      "Música de fundo relaxante"
    ],
    exemplo: "Vídeos de unboxing e preparação de estoque",
    aplicacao: "Use para posts de abastecimento de estoque e logística."
  }
];

const estrategiaAplicacao = [
  {
    titulo: "Combinar Formatos",
    descricao: "Use 2-3 formatos diferentes por semana para manter a audiência engajada."
  },
  {
    titulo: "Testar e Iterar",
    descricao: "Analise qual formato gera mais engajamento e replique com variações."
  },
  {
    titulo: "Usar Áudio Viral",
    descricao: "Acompanhe sons em alta no TikTok e aplique aos seus vídeos de pijamas."
  },
  {
    titulo: "Hashtags Estratégicas",
    descricao: "Use hashtags de tendência + hashtags de nicho (#RendaExtra, #AtacadoPijamas)."
  },
  {
    titulo: "Timing de Postagem",
    descricao: "Poste nos horários de pico: 19h-22h (noite) e 12h-13h (almoço)."
  }
];

export default function TendenciasSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Tendências Virais do TikTok & Instagram</h2>
        <p className="text-slate-600">
          Análise dos formatos de vídeo que já venderam milhares de peças de pijamas. Cada tendência inclui elementos-chave, exemplos reais e aplicação estratégica.
        </p>
      </div>

      {/* Tendencias Grid */}
      <div className="space-y-4">
        {tendencias.map((tendencia) => (
          <Card key={tendencia.id} className="border-slate-200 hover:shadow-lg transition-shadow overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
            <CardHeader>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <CardTitle className="text-lg">{tendencia.titulo}</CardTitle>
                  <CardDescription className="mt-2">{tendencia.descricao}</CardDescription>
                </div>
                <TrendingUp className="w-5 h-5 text-rose-600 flex-shrink-0" />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                  {tendencia.viralidade}
                </Badge>
                <Badge variant="outline">{tendencia.formato}</Badge>
                <Badge variant="secondary" className="text-xs">{tendencia.engajamento}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Elementos-Chave
                </h4>
                <ul className="space-y-2">
                  {tendencia.elementos.map((elemento, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-rose-500 font-bold">✓</span>
                      {elemento}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Exemplo Real
                  </p>
                  <p className="text-sm text-blue-900">{tendencia.exemplo}</p>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-xs font-semibold text-green-600 uppercase mb-2 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Aplicação
                  </p>
                  <p className="text-sm text-green-900">{tendencia.aplicacao}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estratégia de Aplicação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Estratégia de Aplicação</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {estrategiaAplicacao.map((item, idx) => (
            <Card key={idx} className="border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  {item.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{item.descricao}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <Card className="border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg">Checklist de Conteúdo Viral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-3">
            <input type="checkbox" id="check1" className="w-4 h-4 rounded border-slate-300" />
            <label htmlFor="check1" className="text-sm text-slate-700">Gancho nos primeiros 3 segundos (pergunta, surpresa ou promessa)</label>
          </div>
          <div className="flex gap-3">
            <input type="checkbox" id="check2" className="w-4 h-4 rounded border-slate-300" />
            <label htmlFor="check2" className="text-sm text-slate-700">Áudio em alta (música viral ou som original)</label>
          </div>
          <div className="flex gap-3">
            <input type="checkbox" id="check3" className="w-4 h-4 rounded border-slate-300" />
            <label htmlFor="check3" className="text-sm text-slate-700">Transições dinâmicas ou cortes rápidos</label>
          </div>
          <div className="flex gap-3">
            <input type="checkbox" id="check4" className="w-4 h-4 rounded border-slate-300" />
            <label htmlFor="check4" className="text-sm text-slate-700">Prova social (mensagens, números, depoimentos)</label>
          </div>
          <div className="flex gap-3">
            <input type="checkbox" id="check5" className="w-4 h-4 rounded border-slate-300" />
            <label htmlFor="check5" className="text-sm text-slate-700">CTA clara e direta no final</label>
          </div>
          <div className="flex gap-3">
            <input type="checkbox" id="check6" className="w-4 h-4 rounded border-slate-300" />
            <label htmlFor="check6" className="text-sm text-slate-700">Hashtags relevantes (#RendaExtra, #Atacado, #Pijamas)</label>
          </div>
          <div className="flex gap-3">
            <input type="checkbox" id="check7" className="w-4 h-4 rounded border-slate-300" />
            <label htmlFor="check7" className="text-sm text-slate-700">Qualidade de vídeo clara (mínimo 720p)</label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
