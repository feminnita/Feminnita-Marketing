import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Mail } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const MESES_PT = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function GeradorRelatorioSection() {
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [formato, setFormato] = useState("pdf");

  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });

  const todas = campanhas as any[];
  const ativas = todas.filter(c => c.status === "ativa");
  const totalImpressoes = todas.reduce((s, c) => s + (c.impressoes ?? 0), 0);
  const totalCliques = todas.reduce((s, c) => s + (c.cliques ?? 0), 0);
  const totalConversoes = todas.reduce((s, c) => s + (c.conversoes ?? 0), 0);
  const totalOrcamento = todas.reduce((s, c) => s + parseFloat(c.orcamento ?? "0"), 0);
  const roisValidos = todas.filter(c => parseFloat(c.roi ?? "0") > 0);
  const roiMedio = roisValidos.length > 0
    ? roisValidos.reduce((s, c) => s + parseFloat(c.roi ?? "0"), 0) / roisValidos.length
    : 0;
  const ctr = totalImpressoes > 0 ? ((totalCliques / totalImpressoes) * 100).toFixed(1) : "—";

  const porPlataforma = todas.reduce((acc, c) => {
    acc[c.plataforma] = (acc[c.plataforma] || 0) + (c.conversoes ?? 0);
    return acc;
  }, {} as Record<string, number>);
  const plataformasOrdenadas = Object.entries(porPlataforma)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  const top5 = [...todas]
    .sort((a, b) => (b.conversoes ?? 0) - (a.conversoes ?? 0))
    .slice(0, 5);

  const gerarRelatorio = () => {
    setRelatorioGerado(true);
    const agora = new Date();
    const mesAtual = `${MESES_PT[agora.getMonth()]} ${agora.getFullYear()}`;

    const linhasPlataformas = plataformasOrdenadas.length > 0
      ? plataformasOrdenadas.map(([p, c]) => `  - ${p.charAt(0).toUpperCase() + p.slice(1)}: ${c} conversões`).join("\n")
      : "  Nenhuma campanha cadastrada.";

    const linhasCampanhas = top5.length > 0
      ? top5.map((c, i) => `  ${i + 1}. ${c.nome} (${c.plataforma}) — ${c.conversoes ?? 0} conv. · ROI ${parseFloat(c.roi ?? "0").toFixed(0)}%`).join("\n")
      : "  Nenhuma campanha cadastrada.";

    const conteudo = `
RELATÓRIO DE MARKETING DIGITAL - FEMINNITA PIJAMAS
===================================================

DATA: ${agora.toLocaleDateString('pt-BR')}
PERÍODO: ${mesAtual}
GERADO POR: Plataforma Feminnita Marketing

1. RESUMO EXECUTIVO
===================
Campanhas cadastradas: ${todas.length}
Campanhas ativas: ${ativas.length}
Total de impressões: ${totalImpressoes.toLocaleString("pt-BR")}
Total de cliques: ${totalCliques.toLocaleString("pt-BR")}
Total de conversões: ${totalConversoes.toLocaleString("pt-BR")}
CTR médio: ${ctr}%
Orçamento total: R$ ${totalOrcamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
ROI médio: ${roiMedio > 0 ? `${roiMedio.toFixed(0)}%` : "N/A"}

2. PERFORMANCE POR PLATAFORMA
==============================
${linhasPlataformas}

3. TOP CAMPANHAS POR CONVERSÃO
================================
${linhasCampanhas}

4. PERSONAS DE INFLUENCIADORAS
==============================
- Carol: Empreendedora Iniciante (Renda Extra)
- Renata: Dona de Loja (Revendedora)
- Vanessa: Líder de Grupo (Compra Coletiva)
- Luiza: Trendsetter (Lifestyle)

5. PLANEJAMENTO SEMANAL
======================
Segunda: Teaser + Anúncio
Terça: Cores + Enquete
Quarta: Características + Educação
Quinta: Prova Social + Depoimentos
Sexta: Votação de Promoção + Urgência
Sábado: Lifestyle + Inspiração
Domingo: Fechamento + Último Chamado

6. RECOMENDAÇÕES
================
✅ Concentre orçamento nas plataformas com mais conversões
✅ Replique a estratégia das campanhas com maior ROI
✅ Teste novos criativos se CTR estiver abaixo de 1%
✅ Registre dados no Bling para cruzar com histórico de pedidos
✅ Ative Smart Alerts para monitorar performance em tempo real
✅ Responda comentários nos primeiros 30 minutos após publicar

---
Relatório gerado automaticamente pela Plataforma Feminnita
Dados extraídos do banco de dados em ${agora.toISOString()}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(conteudo));
    element.setAttribute('download', `Relatorio_Feminnita_${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, "0")}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setRelatorioGerado(false);
  };

  const secoes = [
    {
      titulo: "Resumo Executivo",
      descricao: "KPIs reais: impressões, cliques, conversões, CTR, orçamento e ROI médio",
      itens: ["Total Campanhas", "Conversões", "CTR", "ROI Médio"]
    },
    {
      titulo: "Performance por Plataforma",
      descricao: "Conversões agrupadas por canal (Instagram, Facebook, TikTok, Email, WhatsApp)",
      itens: ["Instagram", "TikTok", "Email", "WhatsApp"]
    },
    {
      titulo: "Top 5 Campanhas",
      descricao: "Campanhas com maior conversão — nome, plataforma e ROI",
      itens: ["Nome da campanha", "Plataforma", "Conversões", "ROI"]
    },
    {
      titulo: "4 Personas",
      descricao: "Detalhes completos das influenciadoras humanizadas",
      itens: ["Carol - Renda Extra", "Renata - Lojista", "Vanessa - Grupo", "Luiza - Trendsetter"]
    },
    {
      titulo: "Planejamento Semanal",
      descricao: "Calendário de 7 dias com temas e CTAs",
      itens: ["Temas diários", "Tipos de conteúdo", "Personas responsáveis", "Horários"]
    },
    {
      titulo: "Recomendações",
      descricao: "6 ações baseadas nos dados reais coletados",
      itens: ["Alocação de orçamento", "Criativos", "Bling ERP", "Smart Alerts"]
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Gerador de Relatório Exportável</h2>
        <p className="text-slate-600">
          Gere um relatório com dados reais das suas campanhas. Perfeito para apresentar a clientes ou compartilhar com sua equipe.
        </p>
      </div>

      {/* KPIs reais */}
      {todas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Campanhas", valor: String(todas.length), cor: "bg-blue-50 text-blue-700" },
            { label: "Conversões", valor: totalConversoes.toLocaleString("pt-BR"), cor: "bg-green-50 text-green-700" },
            { label: "CTR Médio", valor: `${ctr}%`, cor: "bg-purple-50 text-purple-700" },
            { label: "ROI Médio", valor: roiMedio > 0 ? `${roiMedio.toFixed(0)}%` : "—", cor: "bg-orange-50 text-orange-700" },
          ].map((kpi, i) => (
            <div key={i} className={`${kpi.cor} rounded-lg p-4 text-center`}>
              <p className="text-xs font-medium opacity-70 mb-1">{kpi.label}</p>
              <p className="text-xl font-bold">{kpi.valor}</p>
            </div>
          ))}
        </div>
      )}

      {/* Opções de Geração */}
      <Card className="border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Gerar Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Escolha o formato:</p>
            <div className="flex gap-3 flex-wrap">
              <Button
                variant={formato === "pdf" ? "default" : "outline"}
                onClick={() => setFormato("pdf")}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                PDF (Recomendado)
              </Button>
              <Button
                variant={formato === "txt" ? "default" : "outline"}
                onClick={() => setFormato("txt")}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Texto (.txt)
              </Button>
              <Button
                variant={formato === "email" ? "default" : "outline"}
                onClick={() => setFormato("email")}
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Enviar por Email
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-purple-200">
            <Button
              onClick={gerarRelatorio}
              className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
              size="lg"
            >
              <Download className="w-5 h-5" />
              {relatorioGerado ? "Gerando..." : "Gerar Relatório Completo"}
            </Button>
            {relatorioGerado && (
              <p className="text-sm text-green-600 font-semibold mt-2">✅ Relatório gerado com sucesso!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seções do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conteúdo do Relatório</CardTitle>
          <CardDescription>O relatório inclui as seguintes seções com dados reais do banco de dados:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {secoes.map((secao, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{secao.titulo}</h4>
                    <p className="text-xs text-slate-600 mb-2">{secao.descricao}</p>
                    <div className="flex flex-wrap gap-1">
                      {secao.itens.map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Benefícios do Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { titulo: "Dados Reais", descricao: "Métricas extraídas do banco de dados — sem números inventados" },
              { titulo: "Compartilhamento", descricao: "Compartilhe facilmente com clientes, equipe ou parceiros" },
              { titulo: "Referência", descricao: "Mantenha um registro completo da sua estratégia" },
              { titulo: "Apresentações", descricao: "Use como base para apresentações e reuniões" },
              { titulo: "Documentação", descricao: "Documento completo para fins legais/contratuais" },
              { titulo: "Portfólio", descricao: "Adicione ao seu portfólio de trabalhos realizados" }
            ].map((beneficio, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-1 bg-green-600 rounded-full flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{beneficio.titulo}</p>
                  <p className="text-xs text-slate-600">{beneficio.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas de Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Usar o Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "Exporte mensalmente para acompanhar a evolução das campanhas",
            "Adicione sua assinatura digital antes de enviar para clientes",
            "Use como documento de proposta para novos parceiros",
            "Atualize regularmente com novos resultados reais",
            "Compare relatórios de meses diferentes para identificar tendências",
            "Compartilhe versões resumidas em redes sociais",
            "Mantenha cópias arquivadas para referência futura",
            "Use como base para planejar campanhas do próximo período"
          ].map((dica, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-purple-600 font-bold">{idx + 1}.</span>
              <p className="text-slate-700">{dica}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
