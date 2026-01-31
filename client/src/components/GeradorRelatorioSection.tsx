import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Mail, Share2 } from "lucide-react";
import { useState } from "react";

export default function GeradorRelatorioSection() {
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [formato, setFormato] = useState("pdf");

  const gerarRelatorio = () => {
    // Simular geração de relatório
    setRelatorioGerado(true);
    
    // Aqui você poderia integrar uma biblioteca como jsPDF ou html2pdf
    // Por enquanto, vamos simular o download
    setTimeout(() => {
      const conteudo = `
RELATÓRIO DE ESTRATÉGIA DE MARKETING DIGITAL - FEMINNITA PIJAMAS
================================================================

DATA: ${new Date().toLocaleDateString('pt-BR')}
PERÍODO: Semana 1 - Lançamento de Pijama de Inverno

1. RESUMO EXECUTIVO
===================
Investimento Total: R$ 500
Duração: 3 dias (Sexta, Sábado, Domingo)
Visualizações Esperadas: 150K-250K
Novos Seguidores: 600-1.2K
Lucro Esperado: R$ 1.350
ROI: 270%

2. PERSONAS DE INFLUENCIADORAS
==============================
- Carol: Empreendedora Iniciante (Renda Extra)
- Renata: Dona de Loja (Revendedora)
- Vanessa: Líder de Grupo (Compra Coletiva)
- Luiza: Trendsetter (Lifestyle)

3. PLANEJAMENTO SEMANAL
======================
Segunda: Teaser + Anúncio
Terça: Cores + Enquete
Quarta: Características + Educação
Quinta: Prova Social + Depoimentos
Sexta: Votação de Promoção + Urgência
Sábado: Lifestyle + Inspiração
Domingo: Fechamento + Último Chamado

4. ROTEIROS DE VÍDEOS
====================
- Stories: 3 roteiros personalizados por persona
- TikTok: 3 roteiros com formatos virais
- Instagram Reels: Bastidores + Lançamento
- Ads: Renda Extra + Compra Familiar

5. ANÁLISE DE CUSTOS
===================
CPV Médio: R$ 0,0027
CPS Médio: R$ 0,63
CPA Médio: R$ 0,040

6. RECOMENDAÇÕES
================
✅ Poste o Reels organicamente sexta-feira 20h
✅ Deixe rodar 2-3 horas sem ads
✅ Verifique performance inicial
✅ Se bom, comece ads com R$ 500
✅ Monitore CPV e CPS em tempo real
✅ Responda comentários rapidamente

7. PRÓXIMAS AÇÕES
================
1. Produzir as imagens em lote
2. Criar calendário de agendamento
3. Preparar sistema de monitoramento
4. Executar campanha
5. Compilar dados

---
Relatório gerado automaticamente pela Plataforma Feminnita
      `;

      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(conteudo));
      element.setAttribute('download', `Relatorio_Feminnita_${new Date().getTime()}.txt`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setTimeout(() => setRelatorioGerado(false), 2000);
    }, 1500);
  };

  const secoes = [
    {
      titulo: "Resumo Executivo",
      descricao: "Visão geral da campanha com métricas principais",
      itens: ["Investimento", "ROI", "Métricas esperadas", "Timeline"]
    },
    {
      titulo: "4 Personas",
      descricao: "Detalhes completos das influenciadoras humanizadas",
      itens: ["Carol - Renda Extra", "Renata - Lojista", "Vanessa - Grupo", "Luiza - Trendsetter"]
    },
    {
      titulo: "Planejamento Semanal",
      descricao: "Calendário de 7 dias com temas e CTAs",
      itens: ["Temas diários", "Tipos de conteúdo", "Personas responsáveis", "Horários de postagem"]
    },
    {
      titulo: "Roteiros de Vídeos",
      descricao: "Todos os roteiros com timing e especificações",
      itens: ["Stories (3x)", "TikTok (3x)", "Reels (2x)", "Ads (2x)"]
    },
    {
      titulo: "42 Stories Completos",
      descricao: "Textos, descrições visuais e elementos interativos",
      itens: ["Textos prontos", "Descrições visuais", "Enquetes/Votações", "Horários"]
    },
    {
      titulo: "Análise de Ads",
      descricao: "3 cenários com CPV, CPS, ROI e benchmarks",
      itens: ["Conservador", "Moderado", "Agressivo", "Comparação"]
    },
    {
      titulo: "Tendências TikTok",
      descricao: "6 formatos virais que já venderam milhares",
      itens: ["Provador Rápido", "Tour Fábrica", "Renda Extra", "Pijama na Rua", "Compra Coletiva", "ASMR"]
    },
    {
      titulo: "Legendas Instagram",
      descricao: "3 legendas com 3 versões cada e CTAs",
      itens: ["Promoção Relâmpago", "Lançamento Verão", "Abastecimento Estoque", "Múltiplas versões"]
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Gerador de Relatório PDF Exportável</h2>
        <p className="text-slate-600">
          Gere um relatório completo em PDF com toda a sua estratégia de marketing. Perfeito para apresentar a clientes ou compartilhar com sua equipe.
        </p>
      </div>

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
          <CardDescription>O relatório inclui as seguintes seções:</CardDescription>
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
              { titulo: "Profissionalismo", descricao: "Apresente sua estratégia de forma profissional e organizada" },
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
            "Customize o relatório com seu logo e cores da marca",
            "Adicione sua assinatura digital antes de enviar",
            "Inclua um índice para fácil navegação",
            "Use como documento de proposta para novos clientes",
            "Atualize regularmente com resultados reais",
            "Compartilhe versões resumidas em redes sociais",
            "Mantenha cópias arquivadas para referência futura",
            "Use como base para próximas campanhas"
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
