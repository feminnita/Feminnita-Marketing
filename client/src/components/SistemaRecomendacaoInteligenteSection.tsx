import { Zap, Users, TrendingUp, CheckCircle, Target, Brain, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const ALGORITMOS = [
  { nome: "Histórico de Compra", descricao: "Recomenda produtos similares ao que já comprou", exemplo: "Comprou Pijama Carol → Recomenda Robe Carol" },
  { nome: "Visualizações", descricao: "Produtos que o cliente visualizou mas não comprou", exemplo: "Viu Pijama Renata 3x → Cupom 15%" },
  { nome: "Clientes Similares", descricao: "O que clientes parecidos compraram", exemplo: "Clientes como você compraram Robe Vanessa" },
  { nome: "Tendências Virais", descricao: "Produtos em alta no TikTok/Instagram", exemplo: "Pijama Luiza está em alta — veja agora" },
  { nome: "Sazonalidade", descricao: "Produtos populares nesta época do ano", exemplo: "Fevereiro: Robes para pós-carnaval" },
  { nome: "Cross-sell", descricao: "Produtos que combinam com a compra atual", exemplo: "Comprou Pijama → Recomenda Chinelo Combinando" },
];

const CASOS_USO = [
  { caso: "Cliente novo", estrategia: "Mostrar top 3 produtos mais vendidos + tendências" },
  { caso: "Cliente com 1 compra", estrategia: "Similar ao que comprou + sugestões de clientes parecidos" },
  { caso: "Cliente com 3+ compras", estrategia: "Histórico + Tendências + Cross-sell personalizado" },
  { caso: "Cliente inativo (20+ dias)", estrategia: "Produtos não vistos + Cupom de reativação 15%" },
  { caso: "Cliente VIP (LTV alto)", estrategia: "Exclusivos + Pré-lançamentos + Cupom VIP" },
];

const CANAIS = [
  { canal: "Email Marketing", frequencia: "2x/semana", exemplo: "Newsletter com recomendações personalizadas" },
  { canal: "Site / Homepage", frequencia: "Sempre visível", exemplo: "Seção 'Recomendado para você'" },
  { canal: "Página de Produto", frequencia: "Sempre visível", exemplo: "Clientes que compraram também compraram" },
  { canal: "Carrinho de Compras", frequencia: "Antes do checkout", exemplo: "Adicione X e ganhe frete grátis" },
  { canal: "WhatsApp", frequencia: "1x/semana", exemplo: "Seu produto favorito está em estoque!" },
];

export function SistemaRecomendacaoInteligenteSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });

  const todas = campanhas as any[];
  const comConversao = todas.filter(c => (Number(c.performance?.conversoes) || 0) > 0);
  const topCampanhas = [...comConversao]
    .sort((a, b) => (Number(b.performance?.conversoes) || 0) - (Number(a.performance?.conversoes) || 0))
    .slice(0, 3);
  const totalConversoes = todas.reduce((s, c) => s + (Number(c.performance?.conversoes) || 0), 0);
  const totalCampanhas = todas.length;

  return (
    <div className="space-y-6">
      {/* Performance real */}
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-slate-500">Campanhas ativas</p>
          <p className="text-2xl font-bold text-blue-700">{totalCampanhas}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-slate-500">Total de conversões</p>
          <p className="text-2xl font-bold text-green-700">{totalConversoes.toLocaleString("pt-BR")}</p>
        </CardContent></Card>
      </div>

      {/* Top campanhas (dados reais) */}
      {topCampanhas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Campanhas com Mais Conversões (dados reais)
            </CardTitle>
            <CardDescription>Use estas campanhas como base para suas recomendações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topCampanhas.map((c: any, i) => (
                <div key={c.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">#{i + 1}</span>
                    <div>
                      <p className="font-medium text-slate-900">{c.nome}</p>
                      <p className="text-xs text-slate-500 capitalize">{c.plataforma}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{c.performance?.conversoes} conv.</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {totalCampanhas === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">Nenhuma campanha cadastrada ainda.</p>
            <p className="text-sm text-slate-400 mt-1">Crie campanhas e registre conversões para ver dados de performance reais aqui.</p>
          </CardContent>
        </Card>
      )}

      {/* Estratégia de recomendação (guia, não métricas inventadas) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Algoritmos de Recomendação
          </CardTitle>
          <CardDescription>Estratégias para implementar no Bling + WhatsApp + Email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ALGORITMOS.map((algo, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-900 mb-1">{algo.nome}</p>
                <p className="text-sm text-slate-600 mb-1">{algo.descricao}</p>
                <p className="text-xs text-slate-500 italic">Ex: {algo.exemplo}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Estratégia por Tipo de Cliente
          </CardTitle>
          <CardDescription>Abordagem diferente para cada segmento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {CASOS_USO.map((caso, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-3 bg-white">
                <p className="font-semibold text-slate-900 text-sm">{caso.caso}</p>
                <p className="text-xs text-slate-600 mt-1">{caso.estrategia}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Canais para Implementar
          </CardTitle>
          <CardDescription>Onde e com que frequência enviar recomendações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {CANAIS.map((canal, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm">{canal.canal}</p>
                    <Badge variant="outline" className="text-xs">{canal.frequencia}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{canal.exemplo}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200 p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Próximos passos para implementar
        </h4>
        <ul className="text-sm space-y-2 text-slate-700">
          <li>• <strong>Conecte o Bling ERP</strong> para ter histórico de compras por cliente</li>
          <li>• <strong>Use o Abandono de Carrinho</strong> (aba Recuperação) para recomendações via WhatsApp</li>
          <li>• <strong>Configure Email Marketing</strong> com segmentação por perfil de compra</li>
          <li>• <strong>Use UGC Collector</strong> para coletar depoimentos e usar como prova social</li>
          <li>• <strong>Acompanhe conversões</strong> por campanha para identificar o que mais vende</li>
        </ul>
      </Card>
    </div>
  );
}
