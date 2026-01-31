import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, BarChart3, Zap, Target, TrendingUp, CheckCircle2 } from "lucide-react";

export default function PlanoStoriesSemanSection() {
  const dias = [
    {
      dia: "Segunda",
      titulo: "Teaser + Anúncio",
      objetivo: "Criar buzz e antecipação",
      stories: 4,
      elementos: "Contagem Regressiva, Enquete, Caixa de Perguntas, Votação",
      dados: "Interesse geral, sensibilidade a preço, dúvidas, preferência de cor",
      engajamento: "200-300 respostas"
    },
    {
      dia: "Terça",
      titulo: "Cores + Enquete",
      objetivo: "Apresentar cores e coletar preferências",
      stories: 6,
      elementos: "Enquetes (3x), Votação, Caixa de Perguntas",
      dados: "Preferência de cores, tamanhos, interesse em combos, dúvidas",
      engajamento: "300-400 respostas"
    },
    {
      dia: "Quarta",
      titulo: "Características + Educação",
      objetivo: "Educar sobre produto e construir confiança",
      stories: 6,
      elementos: "Enquete, Caixa de Perguntas, Votação",
      dados: "O que importa mais, dúvidas técnicas, qual característica mais impressiona",
      engajamento: "250-350 respostas"
    },
    {
      dia: "Quinta",
      titulo: "Prova Social + Depoimentos",
      objetivo: "Construir confiança através de clientes reais",
      stories: 6,
      elementos: "Enquete, Caixa de Perguntas, Votação",
      dados: "Eficácia de depoimentos, qual tipo de cliente mais inspira",
      engajamento: "300-400 respostas"
    },
    {
      dia: "Sexta",
      titulo: "Votação de Promoção + Urgência",
      objetivo: "Criar urgência e FOMO, deixar clientes votarem",
      stories: 6,
      elementos: "Votação, Contagem Regressiva, Caixa de Perguntas, Link",
      dados: "Qual promoção preferem, dúvidas sobre promoção",
      engajamento: "400-500 respostas (dia com mais urgência)"
    },
    {
      dia: "Sábado",
      titulo: "Lifestyle + Inspiração",
      objetivo: "Inspirar e manter engajamento no fim de semana",
      stories: 6,
      elementos: "Enquete, Caixa de Perguntas, Votação",
      dados: "Ritmo diário do público, momentos favoritos, histórias pessoais",
      engajamento: "250-350 respostas"
    },
    {
      dia: "Domingo",
      titulo: "Fechamento + Último Chamado",
      objetivo: "Encerrar com força, último chamado para compra",
      stories: 6,
      elementos: "Enquete, Contagem Regressiva, Caixa de Perguntas, Link",
      dados: "Intenção de compra final, últimas dúvidas",
      engajamento: "300-400 respostas"
    }
  ];

  const elementosInterativos = [
    { nome: "Enquetes", total: 12, descricao: "Perguntas com 2-4 opções. Ótimas para coletar preferências." },
    { nome: "Votações", total: 7, descricao: "Comparação visual entre 2 opções. Muito engajadoras." },
    { nome: "Caixas de Perguntas", total: 7, descricao: "Clientes fazem perguntas abertas. Constrói FAQ." },
    { nome: "Contagem Regressiva", total: 3, descricao: "Conta tempo até evento. Cria urgência." },
    { nome: "Links/Localização", total: 2, descricao: "Direciona para compra ou loja física." }
  ];

  const metricas = [
    { metrica: "Total de Stories", valor: "42 stories (6 por dia)" },
    { metrica: "Elementos Interativos", valor: "31 elementos" },
    { metrica: "Respostas Esperadas", valor: "2.000-3.000 (se 5K+ seguidoras)" },
    { metrica: "Cliques para Compra", valor: "200-300" },
    { metrica: "Conversões Esperadas", valor: "50-100 vendas" },
    { metrica: "ROI Estimado", valor: "R$ 5.000-10.000 (lucro)" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Plano de Campanha de Uma Semana - Instagram Stories</h2>
        <p className="text-slate-600">
          Campanha completa com enquetes, votações, caixas de perguntas e elementos interativos para aumentar engajamento, coletar dados e gerar vendas.
        </p>
      </div>

      {/* Visão Geral da Campanha */}
      <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg">Visão Geral da Campanha</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Objetivo Principal</p>
            <p className="text-slate-700">Aumentar engajamento, coletar dados sobre preferências, gerar buzz e conversões</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Duração</p>
            <p className="text-slate-700 font-bold text-blue-600">7 dias (segunda a domingo)</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Frequência</p>
            <p className="text-slate-700">3-4 Stories por dia (9h, 13h, 19h)</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Público-Alvo</p>
            <p className="text-slate-700">Mulheres 18-50 anos, seguidoras, potenciais clientes</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Elementos Interativos</p>
            <p className="text-slate-700">Enquetes, votações, caixas de perguntas, contagem regressiva</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Resultado Esperado</p>
            <p className="text-slate-700 font-bold text-green-600">50-100 vendas, R$ 5K-10K lucro</p>
          </div>
        </CardContent>
      </Card>

      {/* Dias da Semana */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Plano Dia a Dia</h3>
        
        <Tabs defaultValue="segunda" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6 bg-slate-100 p-1 overflow-x-auto">
            {dias.map((d, idx) => (
              <TabsTrigger key={idx} value={d.dia.toLowerCase()} className="text-xs sm:text-sm">
                {d.dia.slice(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {dias.map((dia, idx) => (
            <TabsContent key={idx} value={dia.dia.toLowerCase()} className="space-y-4">
              <Card className="border-l-4 border-l-blue-400">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2 bg-blue-100 text-blue-800">{dia.dia}</Badge>
                      <CardTitle className="text-lg">{dia.titulo}</CardTitle>
                      <CardDescription>{dia.objetivo}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">{dia.stories} Stories</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-xs font-semibold text-blue-600 uppercase mb-2 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> Elementos Interativos
                      </p>
                      <p className="text-sm text-blue-900">{dia.elementos}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                      <p className="text-xs font-semibold text-purple-600 uppercase mb-2 flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" /> Dados Coletados
                      </p>
                      <p className="text-sm text-purple-900">{dia.dados}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-xs font-semibold text-green-600 uppercase mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Engajamento Esperado
                    </p>
                    <p className="text-sm text-green-900 font-bold">{dia.engajamento}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Elementos Interativos */}
      <Card className="border-slate-300 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-slate-600" />
            Elementos Interativos Usados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {elementosInterativos.map((elem, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-200 last:border-0">
              <Badge className="bg-blue-100 text-blue-800 mt-1">{elem.total}x</Badge>
              <div>
                <p className="font-semibold text-slate-900">{elem.nome}</p>
                <p className="text-sm text-slate-600">{elem.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Métricas da Campanha */}
      <Card className="border-l-4 border-l-green-400">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Métricas da Campanha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {metricas.map((m, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-slate-200 pb-2 last:border-0">
              <span className="font-semibold text-slate-700">{m.metrica}</span>
              <span className="text-green-600 font-bold text-sm">{m.valor}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dicas de Execução */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            8 Dicas para Executar com Sucesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Prepare Conteúdo com Antecedência", descricao: "Grave todos os stories no domingo anterior. Agende para postar automaticamente." },
            { titulo: "Responda Comentários Rapidamente", descricao: "Respostas rápidas aumentam engajamento. Tente responder nos primeiros 30 minutos." },
            { titulo: "Salve Dados Coletados", descricao: "Compile todas as respostas em spreadsheet. Cria FAQ e guia futuras campanhas." },
            { titulo: "Teste Diferentes Horários", descricao: "Poste no mesmo horário todos os dias. Depois analise qual horário gera mais engajamento." },
            { titulo: "Use Emojis Estrategicamente", descricao: "Emojis chamam atenção. Use 2-3 emojis por story para parecer menos formal." },
            { titulo: "Mantenha Tons Consistentes", descricao: "Todos os stories devem ter tom de voz consistente. Isso constrói marca." },
            { titulo: "Crie Senso de Comunidade", descricao: "Mostre que você ouve clientes. Responda perguntas, agradeça votações, compartilhe resultados." },
            { titulo: "Prepare Próxima Campanha", descricao: "No domingo, comece a planejar próxima semana. Isso mantém momentum." }
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b border-amber-200 last:border-0">
              <div className="w-1 bg-amber-600 rounded-full flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">{tip.titulo}</p>
                <p className="text-sm text-slate-600">{tip.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Análise Pós-Campanha */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Análise Pós-Campanha</CardTitle>
          <CardDescription>Perguntas para fazer após a semana terminar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "Qual elemento interativo gerou mais respostas? (Enquetes, votações, ou caixas de perguntas?)",
            "Qual horário gerou mais engajamento? (9h, 13h, ou 19h?)",
            "Qual dia teve mais engajamento? (Segunda, terça, etc?)",
            "Qual cor foi mais votada? (Use isso para produção)",
            "Qual tamanho foi mais votado? (Use isso para estoque)",
            "Qual promoção foi mais votada? (Use em futuras campanhas)",
            "Quantas conversões você teve? (Calcule ROI)",
            "Qual foi o feedback mais comum? (Use para melhorar produto/serviço)"
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">{idx + 1}.</span>
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Checklist de Execução */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Checklist de Execução
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            "Prepare conteúdo visual (fotos/vídeos) com antecedência",
            "Crie roteiros para cada story",
            "Configure agendamento de stories",
            "Prepare respostas para perguntas frequentes",
            "Configure alarme para responder comentários",
            "Prepare link para compra (site/WhatsApp)",
            "Prepare equipe de vendas (vai ter pico de demanda)",
            "Configure spreadsheet para coletar dados",
            "Teste todos os links antes de postar",
            "Prepare próxima campanha (para manter momentum)"
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" />
              <span className="text-slate-700">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resumo Executivo */}
      <Card className="border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg">Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-slate-900 mb-1">Estrutura da Campanha</p>
            <p className="text-slate-700">7 dias com narrativa que constrói antecipação, coleta feedback, e converte em vendas. Cada dia tem tema estratégico e CTAs específicas.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-1">Dados Coletados</p>
            <p className="text-slate-700">Interesse geral, preferência de cores/tamanhos, o que importa mais, características que impressionam, eficácia de depoimentos, promoção preferida, ritmo diário, intenção de compra final.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-1">Resultado Esperado</p>
            <p className="text-slate-700 font-bold text-green-600">2.000-3.000 respostas, 200-300 cliques, 50-100 vendas, R$ 5.000-10.000 de lucro (se cada venda gera R$ 100 de lucro).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
