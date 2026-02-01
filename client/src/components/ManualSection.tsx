import { BookOpen, ChevronDown, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function ManualSection() {
  const [expandedSection, setExpandedSection] = useState<string | null>("glossario");
  const [searchTerm, setSearchTerm] = useState("");

  const glossarioTermos = [
    { termo: "Aba (Tab)", def: "Seção específica da plataforma que agrupa informações relacionadas" },
    { termo: "Ativo (Segmento)", def: "Clientes que fizeram compra nos últimos 30 dias" },
    { termo: "Atribuição de Conversão", def: "Identificar qual canal foi responsável pela venda" },
    { termo: "Automação", def: "Sistema que executa ações automaticamente quando certas condições são atendidas" },
    { termo: "CAC (Customer Acquisition Cost)", def: "Custo médio para adquirir um novo cliente" },
    { termo: "Churn", def: "Porcentagem de clientes que deixam de comprar" },
    { termo: "CRM", def: "Sistema para gerenciar informações e relacionamento com clientes" },
    { termo: "CTR (Click-Through Rate)", def: "Porcentagem de pessoas que clicaram em um anúncio" },
    { termo: "Dashboard", def: "Tela visual que mostra métricas e dados em tempo real" },
    { termo: "Email Marketing", def: "Envio de mensagens de marketing para lista de clientes via email" },
    { termo: "LTV (Lifetime Value)", def: "Valor total que um cliente vai gastar ao longo da relação com a marca" },
    { termo: "ROI (Return on Investment)", def: "Retorno financeiro de um investimento em marketing" }
  ];

  const passoAPasso = [
    {
      numero: 1,
      titulo: "Acessar Personas",
      descricao: "Clique na aba 'Personas' para ver as 4 influenciadoras (Carol, Renata, Vanessa, Luiza)",
      acao: "Entender quem são seus clientes ideais"
    },
    {
      numero: 2,
      titulo: "Planejar Conteúdo",
      descricao: "Use a aba 'Planejamento Semanal' para agendar posts e campanhas",
      acao: "Organizar conteúdo para toda a semana"
    },
    {
      numero: 3,
      titulo: "Criar Roteiros",
      descricao: "Acesse 'Roteiros de Vídeos' para gerar scripts de stories e ads",
      acao: "Produzir conteúdo de vídeo de qualidade"
    },
    {
      numero: 4,
      titulo: "Analisar Tendências",
      descricao: "Veja 'Tendências TikTok' para identificar o que está viralizando",
      acao: "Ficar atualizado com o que funciona"
    },
    {
      numero: 5,
      titulo: "Monitorar Ads",
      descricao: "Dashboard de 'Análise de Ads' mostra performance de campanhas",
      acao: "Otimizar gastos em publicidade"
    },
    {
      numero: 6,
      titulo: "Segmentar Clientes",
      descricao: "Use 'Segmentação' para dividir clientes por comportamento",
      acao: "Enviar mensagens personalizadas"
    }
  ];

  const emailMarketing = [
    {
      template: "Bem-vindo",
      segmento: "Novo Cliente",
      conteudo: "Email com cupom 10% de desconto",
      resultado: "45% abertura, 2.500% ROI"
    },
    {
      template: "Novo Produto",
      segmento: "VIP + Ativos",
      conteudo: "Lançamento exclusivo",
      resultado: "28% abertura, 1.200% ROI"
    },
    {
      template: "Desconto",
      segmento: "Em Risco",
      conteudo: "Cupom 15% + 'Sentimos sua falta'",
      resultado: "35% abertura, 1.800% ROI"
    },
    {
      template: "Reativação",
      segmento: "Dormentes",
      conteudo: "Oferta especial para voltar",
      resultado: "22% abertura, 800% ROI"
    }
  ];

  const atribuicaoModelos = [
    {
      modelo: "Last-Click",
      descricao: "Último canal clicado recebe 100%",
      uso: "Simples, mostra canal mais próximo da compra"
    },
    {
      modelo: "First-Click",
      descricao: "Primeiro canal clicado recebe 100%",
      uso: "Mostra qual canal traz o cliente"
    },
    {
      modelo: "Linear",
      descricao: "Todos os canais recebem crédito igual",
      uso: "Reconhece papel de todos os canais"
    },
    {
      modelo: "Time-Decay",
      descricao: "Canais próximos da compra recebem mais",
      uso: "Mais realista e confiável (RECOMENDADO)"
    }
  ];

  const filteredGlossario = glossarioTermos.filter(
    (item) =>
      item.termo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.def.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Seções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">8</div>
            <p className="text-xs text-slate-500 mt-1">Glossário, Passo a Passo, Email, etc</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Termos Explicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">50+</div>
            <p className="text-xs text-slate-500 mt-1">De forma simples e didática</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Passo a Passo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">12</div>
            <p className="text-xs text-slate-500 mt-1">Funcionalidades principais</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Templates Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">5</div>
            <p className="text-xs text-slate-500 mt-1">Prontos para usar</p>
          </CardContent>
        </Card>
      </div>

      {/* Glossário */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setExpandedSection(expandedSection === "glossario" ? null : "glossario")}>
              <BookOpen className="w-5 h-5 text-blue-600" />
              <CardTitle>Glossário Completo</CardTitle>
              <ChevronDown className={`w-5 h-5 transition ${expandedSection === "glossario" ? "rotate-180" : ""}`} />
            </div>
          </div>
          <CardDescription>50+ termos de marketing explicados de forma simples</CardDescription>
        </CardHeader>
        {expandedSection === "glossario" && (
          <CardContent className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar termo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredGlossario.map((item, idx) => (
                <div key={idx} className="border border-slate-200/50 rounded-lg p-3 hover:bg-blue-50/50 transition">
                  <h4 className="font-semibold text-slate-900 text-sm">{item.termo}</h4>
                  <p className="text-xs text-slate-600 mt-1">{item.def}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Passo a Passo */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setExpandedSection(expandedSection === "passo" ? null : "passo")}>
              <CardTitle>📋 Passo a Passo das Funcionalidades</CardTitle>
              <ChevronDown className={`w-5 h-5 transition ${expandedSection === "passo" ? "rotate-180" : ""}`} />
            </div>
          </div>
          <CardDescription>Como usar cada aba da plataforma</CardDescription>
        </CardHeader>
        {expandedSection === "passo" && (
          <CardContent>
            <div className="space-y-3">
              {passoAPasso.map((passo) => (
                <div key={passo.numero} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {passo.numero}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{passo.titulo}</h4>
                      <p className="text-sm text-slate-600 mt-1">{passo.descricao}</p>
                      <p className="text-xs text-slate-500 mt-2">✅ {passo.acao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Email Marketing */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setExpandedSection(expandedSection === "email" ? null : "email")}>
              <CardTitle>📧 Templates de Email Marketing</CardTitle>
              <ChevronDown className={`w-5 h-5 transition ${expandedSection === "email" ? "rotate-180" : ""}`} />
            </div>
          </div>
          <CardDescription>5 templates prontos para usar por segmento</CardDescription>
        </CardHeader>
        {expandedSection === "email" && (
          <CardContent>
            <div className="space-y-3">
              {emailMarketing.map((email, idx) => (
                <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{email.template}</h4>
                    <Badge variant="secondary">{email.segmento}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{email.conteudo}</p>
                  <p className="text-xs text-green-600 font-medium">{email.resultado}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Atribuição Multi-canal */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setExpandedSection(expandedSection === "atribuicao" ? null : "atribuicao")}>
              <CardTitle>📊 Atribuição Multi-canal</CardTitle>
              <ChevronDown className={`w-5 h-5 transition ${expandedSection === "atribuicao" ? "rotate-180" : ""}`} />
            </div>
          </div>
          <CardDescription>4 modelos de atribuição explicados</CardDescription>
        </CardHeader>
        {expandedSection === "atribuicao" && (
          <CardContent>
            <div className="space-y-3">
              {atribuicaoModelos.map((modelo, idx) => (
                <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{modelo.modelo}</h4>
                    {modelo.modelo === "Time-Decay" && <Badge className="bg-green-100 text-green-700">RECOMENDADO</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{modelo.descricao}</p>
                  <p className="text-xs text-slate-500">💡 {modelo.uso}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Dicas Importantes */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-slate-900">💡 Dicas Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>Comece pelas Personas:</strong> Entender quem são seus clientes é o primeiro passo para qualquer estratégia</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>Teste antes de escalar:</strong> Use A/B Testing para validar campanhas antes de aumentar o budget</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>Segmente seus clientes:</strong> Mensagens personalizadas têm 3x mais chance de conversão</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>Use Time-Decay para atribuição:</strong> É o modelo mais realista para decisões de investimento</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <p><strong>Monitore ROI constantemente:</strong> Campanhas que não geram retorno devem ser pausadas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
