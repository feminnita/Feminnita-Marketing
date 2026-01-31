import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Eye, Heart, MessageCircle, Share2 } from "lucide-react";

const CONCORRENTES_DADOS = [
  {
    id: 1,
    nome: "Lua Chic Pijamas",
    url: "https://www.instagram.com/luachicpijamas",
    preco_medio: 54.90,
    seguidores: 45200,
    engajamento: 8.5,
    posts_semana: 3,
    ultima_atualizacao: "Há 2 horas",
    estrategia: "Lifestyle + Influenciadores",
    forca: "Design premium",
    fraqueza: "Preço alto"
  },
  {
    id: 2,
    nome: "Levezza Pijamas",
    url: "https://www.instagram.com/levezza.pijamas",
    preco_medio: 44.90,
    seguidores: 32100,
    engajamento: 7.2,
    posts_semana: 2,
    ultima_atualizacao: "Há 4 horas",
    estrategia: "Conforto + Qualidade",
    forca: "Preço competitivo",
    fraqueza: "Pouco engajamento"
  },
  {
    id: 3,
    nome: "Mania Pijamas",
    url: "https://www.instagram.com/maniapijamas",
    preco_medio: 39.90,
    seguidores: 28500,
    engajamento: 9.1,
    posts_semana: 4,
    ultima_atualizacao: "Há 1 hora",
    estrategia: "Volume + Promoções",
    forca: "Alto engajamento",
    fraqueza: "Qualidade questionável"
  },
];

const FEMINNITA_DADOS = {
  preco_medio: 49.90,
  seguidores: 15000,
  engajamento: 8.8,
  posts_semana: 3,
  estrategia: "Renda Extra + Qualidade",
};

const ALERTAS_MONITORAMENTO = [
  {
    id: 1,
    tipo: "preco",
    titulo: "⚠️ Lua Chic Reduziu Preço",
    descricao: "Pijama Suede agora R$ 49.90 (era R$ 54.90)",
    acao: "Considere ajustar preço",
    urgencia: "Alta"
  },
  {
    id: 2,
    tipo: "engajamento",
    titulo: "📈 Mania Pijamas Cresceu",
    descricao: "Engajamento subiu para 9.1% (era 8.5%)",
    acao: "Analisar estratégia de conteúdo",
    urgencia: "Média"
  },
  {
    id: 3,
    tipo: "estrategia",
    titulo: "🎯 Levezza Lançou Coleção",
    descricao: "Nova coleção Inverno 2026 com 15 cores",
    acao: "Acelerar lançamento da Feminnita",
    urgencia: "Alta"
  },
];

export default function AnaliseConorrentesAutomaticoSection() {
  const [monitorando, setMonitorando] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  const calcularDiferenca = (valor: number, media: number) => {
    const diff = valor - media;
    return {
      valor: Math.abs(diff),
      positivo: diff > 0,
      percentual: ((diff / media) * 100).toFixed(1)
    };
  };

  const precoDiff = calcularDiferenca(FEMINNITA_DADOS.preco_medio, 
    (CONCORRENTES_DADOS.reduce((sum, c) => sum + c.preco_medio, 0) / CONCORRENTES_DADOS.length));
  
  const engajamentoDiff = calcularDiferenca(FEMINNITA_DADOS.engajamento,
    (CONCORRENTES_DADOS.reduce((sum, c) => sum + c.engajamento, 0) / CONCORRENTES_DADOS.length));

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Análise de Concorrentes Automática
          </CardTitle>
          <CardDescription>
            Monitore preços, estratégias e performance dos 7 concorrentes em tempo real com alertas automáticos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status de Monitoramento */}
          <Card className={`p-4 ${monitorando ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {monitorando ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">
                    {monitorando ? "✓ Monitoramento Ativo" : "✗ Monitoramento Inativo"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {monitorando
                      ? "Atualizando a cada 1 hora"
                      : "Clique para ativar monitoramento"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={monitorando ? "outline" : "default"}
                onClick={() => setMonitorando(!monitorando)}
              >
                {monitorando ? "Pausar" : "Ativar"}
              </Button>
            </div>
          </Card>

          {/* Posicionamento Feminnita vs Concorrentes */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📊 Posicionamento Feminnita</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Preço Médio</h4>
                  {precoDiff.positivo ? (
                    <TrendingUp className="w-4 h-4 text-red-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-2xl font-bold text-pink-600">R$ {FEMINNITA_DADOS.preco_medio.toFixed(2)}</p>
                <p className={`text-xs mt-1 ${precoDiff.positivo ? "text-red-600" : "text-green-600"}`}>
                  {precoDiff.positivo ? "+" : "-"} R$ {precoDiff.valor.toFixed(2)} ({precoDiff.percentual}%)
                </p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Engajamento</h4>
                  {engajamentoDiff.positivo ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <p className="text-2xl font-bold text-blue-600">{FEMINNITA_DADOS.engajamento.toFixed(1)}%</p>
                <p className={`text-xs mt-1 ${engajamentoDiff.positivo ? "text-green-600" : "text-red-600"}`}>
                  {engajamentoDiff.positivo ? "+" : "-"} {engajamentoDiff.percentual}% vs média
                </p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Seguidores</h4>
                  <Eye className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{FEMINNITA_DADOS.seguidores.toLocaleString()}</p>
                <p className="text-xs text-slate-600 mt-1">+2.5% vs mês anterior</p>
              </Card>
            </div>
          </div>

          {/* Alertas de Monitoramento */}
          <div>
            <h3 className="font-semibold text-sm mb-3">🔔 Alertas de Monitoramento</h3>
            <div className="space-y-2">
              {ALERTAS_MONITORAMENTO.map(alerta => (
                <Card key={alerta.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{alerta.titulo}</h4>
                        <Badge
                          variant={alerta.urgencia === "Alta" ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {alerta.urgencia}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{alerta.descricao}</p>
                      <p className="text-xs font-semibold text-blue-600">→ {alerta.acao}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Comparação Detalhada */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📈 Comparação Detalhada</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-2 font-semibold">Concorrente</th>
                    <th className="text-center py-2 px-2 font-semibold">Preço</th>
                    <th className="text-center py-2 px-2 font-semibold">Seguidores</th>
                    <th className="text-center py-2 px-2 font-semibold">Engajamento</th>
                    <th className="text-center py-2 px-2 font-semibold">Posts/Sem</th>
                  </tr>
                </thead>
                <tbody>
                  {CONCORRENTES_DADOS.map(concorrente => (
                    <tr key={concorrente.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-2">
                        <a href={concorrente.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs font-semibold">
                          {concorrente.nome}
                        </a>
                      </td>
                      <td className="text-center py-2 px-2">R$ {concorrente.preco_medio.toFixed(2)}</td>
                      <td className="text-center py-2 px-2">{concorrente.seguidores.toLocaleString()}</td>
                      <td className="text-center py-2 px-2">{concorrente.engajamento.toFixed(1)}%</td>
                      <td className="text-center py-2 px-2">{concorrente.posts_semana}</td>
                    </tr>
                  ))}
                  <tr className="bg-pink-50 font-semibold">
                    <td className="py-2 px-2">Feminnita</td>
                    <td className="text-center py-2 px-2">R$ {FEMINNITA_DADOS.preco_medio.toFixed(2)}</td>
                    <td className="text-center py-2 px-2">{FEMINNITA_DADOS.seguidores.toLocaleString()}</td>
                    <td className="text-center py-2 px-2">{FEMINNITA_DADOS.engajamento.toFixed(1)}%</td>
                    <td className="text-center py-2 px-2">{FEMINNITA_DADOS.posts_semana}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Análise de Estratégias */}
          <div>
            <h3 className="font-semibold text-sm mb-3">🎯 Análise de Estratégias</h3>
            <div className="space-y-2">
              {CONCORRENTES_DADOS.map(concorrente => (
                <Card key={concorrente.id} className="p-3">
                  <div className="mb-2">
                    <h4 className="font-semibold text-sm">{concorrente.nome}</h4>
                    <p className="text-xs text-slate-600">{concorrente.estrategia}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-xs">
                    <div className="bg-green-50 p-2 rounded">
                      <p className="font-semibold text-green-700">✓ Força:</p>
                      <p className="text-slate-600">{concorrente.forca}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <p className="font-semibold text-red-700">✗ Fraqueza:</p>
                      <p className="text-slate-600">{concorrente.fraqueza}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recomendações */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">💡 Recomendações</h4>
            <ul className="text-sm space-y-2 text-slate-700">
              <li>• <strong>Preço:</strong> Feminnita está R$ 5 acima da média - considere promoção</li>
              <li>• <strong>Engajamento:</strong> Seu engajamento (8.8%) está acima da média - mantenha estratégia</li>
              <li>• <strong>Frequência:</strong> Aumente para 4 posts/semana como Mania Pijamas</li>
              <li>• <strong>Estratégia:</strong> Combine "Renda Extra" + "Lifestyle" como Lua Chic</li>
              <li>• <strong>Ação Imediata:</strong> Responda ao lançamento de Levezza com promoção</li>
            </ul>
          </Card>

          {/* Histórico de Mudanças */}
          <div>
            <h3 className="font-semibold text-sm mb-3">📜 Histórico de Mudanças</h3>
            <div className="space-y-2 text-xs">
              {[
                { data: "31 Jan 14:00", evento: "Lua Chic reduziu preço em 9%", tipo: "preco" },
                { data: "31 Jan 12:30", evento: "Mania Pijamas postou 2 novos Reels", tipo: "conteudo" },
                { data: "30 Jan 18:00", evento: "Levezza lançou coleção Inverno", tipo: "lancamento" },
              ].map((item, idx) => (
                <Card key={idx} className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.evento}</p>
                      <p className="text-slate-600">{item.data}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{item.tipo}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
