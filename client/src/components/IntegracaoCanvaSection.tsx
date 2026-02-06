import { Palette, TrendingUp, CheckCircle, Zap, Users, Target, ExternalLink, Copy, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function IntegracaoCanvaSection() {
  const metricas = [
    {
      titulo: "Templates Criados",
      valor: "48",
      descricao: "Designs prontos para usar",
      cor: "text-purple-600"
    },
    {
      titulo: "Tempo Economizado",
      valor: "120h/mês",
      descricao: "Design manual eliminado",
      cor: "text-blue-600"
    },
    {
      titulo: "Engajamento",
      valor: "+34%",
      descricao: "Posts com design profissional",
      cor: "text-green-600"
    },
    {
      titulo: "Receita Gerada",
      valor: "R$ 180K",
      descricao: "Via posts otimizados",
      cor: "text-emerald-600"
    }
  ];

  const templates = [
    {
      categoria: "Stories Instagram",
      quantidade: 12,
      personas: "Carol, Renata, Vanessa, Luiza",
      performance: "18.5% engajamento",
      tempo: "2 min por post",
      impacto: "R$ 45K/mês"
    },
    {
      categoria: "Posts Feed Instagram",
      quantidade: 8,
      personas: "Todas",
      performance: "12.3% engajamento",
      tempo: "3 min por post",
      impacto: "R$ 38K/mês"
    },
    {
      categoria: "Carrosséis",
      quantidade: 6,
      personas: "Carol, Luiza",
      performance: "22.1% engajamento",
      tempo: "5 min por post",
      impacto: "R$ 52K/mês"
    },
    {
      categoria: "Posts TikTok",
      quantidade: 12,
      personas: "Carol, Luiza",
      performance: "28.5% engajamento",
      tempo: "2 min por post",
      impacto: "R$ 65K/mês"
    },
    {
      categoria: "Banners Email",
      quantidade: 6,
      personas: "Todas",
      performance: "15.2% CTR",
      tempo: "1 min por post",
      impacto: "R$ 25K/mês"
    },
    {
      categoria: "Anúncios Pagos",
      quantidade: 4,
      personas: "Todas",
      performance: "8.7% CTR",
      tempo: "4 min por post",
      impacto: "R$ 18K/mês"
    }
  ];

  const fluxoTrabalho = [
    {
      etapa: "1. Selecionar Template",
      descricao: "Escolher template por persona/rede",
      tempo: "1 min",
      ferramentas: "Canva"
    },
    {
      etapa: "2. Adicionar Dados",
      descricao: "Inserir dados de performance (CTR, conversão, ROI)",
      tempo: "2 min",
      ferramentas: "Dashboard Feminnita"
    },
    {
      etapa: "3. Customizar Design",
      descricao: "Ajustar cores, fontes, imagens",
      tempo: "3 min",
      ferramentas: "Canva Editor"
    },
    {
      etapa: "4. Adicionar CTA",
      descricao: "Incluir call-to-action com cupom/link",
      tempo: "1 min",
      ferramentas: "Canva"
    },
    {
      etapa: "5. Exportar e Publicar",
      descricao: "Baixar e publicar nas redes",
      tempo: "2 min",
      ferramentas: "Canva + Buffer"
    }
  ];

  const templatesPorPersona = [
    {
      persona: "Carol",
      estilo: "Descontraído, viral, emojis",
      templates: 12,
      melhorPerformance: "Stories TikTok (28.5%)",
      exemplo: "Pijama Carol em trending",
      receita: "R$ 65K/mês"
    },
    {
      persona: "Renata",
      estilo: "Premium, elegante, sofisticado",
      templates: 10,
      melhorPerformance: "Carrosséis (22.1%)",
      exemplo: "Coleção Premium",
      receita: "R$ 48K/mês"
    },
    {
      persona: "Vanessa",
      estilo: "Prático, funcional, acessível",
      templates: 8,
      melhorPerformance: "Posts Feed (12.3%)",
      exemplo: "Combo Econômico",
      receita: "R$ 35K/mês"
    },
    {
      persona: "Luiza",
      estilo: "Criativo, tendências, influência",
      templates: 18,
      melhorPerformance: "Carrosséis (22.1%)",
      exemplo: "Edição Limitada",
      receita: "R$ 72K/mês"
    }
  ];

  const integracoes = [
    {
      integracao: "Buffer",
      funcao: "Agendar posts nas redes",
      beneficio: "Publicar automaticamente",
      status: "Ativo"
    },
    {
      integracao: "Zapier",
      funcao: "Conectar com CRM",
      beneficio: "Sincronizar dados de clientes",
      status: "Ativo"
    },
    {
      integracao: "Google Analytics",
      funcao: "Rastrear performance",
      beneficio: "Medir ROI de cada post",
      status: "Ativo"
    },
    {
      integracao: "Mailchimp",
      funcao: "Enviar banners por email",
      beneficio: "Campanhas integradas",
      status: "Ativo"
    }
  ];

  const metricsTemplate = [
    {
      template: "Story Carol",
      impressoes: "125K",
      cliques: "18.5%",
      conversoes: "2.8%",
      roi: "12.5x",
      receita: "R$ 8.5K"
    },
    {
      template: "Carrossel Renata",
      impressoes: "95K",
      cliques: "22.1%",
      conversoes: "3.5%",
      roi: "14.2x",
      receita: "R$ 9.2K"
    },
    {
      template: "Post Vanessa",
      impressoes: "45K",
      cliques: "12.3%",
      conversoes: "1.8%",
      roi: "8.5x",
      receita: "R$ 3.8K"
    },
    {
      template: "TikTok Luiza",
      impressoes: "280K",
      cliques: "28.5%",
      conversoes: "4.2%",
      roi: "16.8x",
      receita: "R$ 15.2K"
    }
  ];

  const beneficios = [
    {
      beneficio: "Designs Profissionais",
      descricao: "Templates prontos com dados de performance",
      impacto: "+34% engajamento"
    },
    {
      beneficio: "Economia de Tempo",
      descricao: "120h/mês economizadas em design",
      impacto: "R$ 12K/mês em custos"
    },
    {
      beneficio: "Consistência Visual",
      descricao: "Todos os posts seguem brand guidelines",
      impacto: "+18% reconhecimento"
    },
    {
      beneficio: "ROI Otimizado",
      descricao: "Dados de performance integrados",
      impacto: "+R$ 180K/mês"
    }
  ];

  const handleOpenCanva = (categoria: string) => {
    window.open(`https://www.canva.com/search?q=${encodeURIComponent(categoria)}`, '_blank');
    toast.success(`Abrindo templates de ${categoria} no Canva`);
  };

  const handleCopyCategory = (categoria: string) => {
    navigator.clipboard.writeText(categoria);
    toast.success(`Categoria copiada: ${categoria}`);
  };

  const handleViewDetails = (categoria: string, quantidade: number) => {
    toast.info(`${quantidade} templates disponíveis para ${categoria}`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => (
          <Card key={idx} className="border-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{metrica.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metrica.cor}`}>{metrica.valor}</div>
              <p className="text-xs text-slate-500 mt-1">{metrica.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Templates por Categoria */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            48 Templates Canva Prontos
          </CardTitle>
          <CardDescription>Designs otimizados com dados de performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templates.map((temp, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{temp.categoria}</h4>
                    <Badge className="bg-purple-100 text-purple-700 mt-1">{temp.quantidade} templates</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-slate-500 text-xs">Personas</p>
                    <p className="font-bold text-slate-900 text-xs">{temp.personas}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Performance</p>
                    <p className="font-bold text-green-600">{temp.performance}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Tempo/Post</p>
                    <p className="font-bold text-slate-900">{temp.tempo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-green-600">{temp.impacto}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleOpenCanva(temp.categoria)}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir no Canva
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyCategory(temp.categoria)}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewDetails(temp.categoria, temp.quantidade)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fluxo de Trabalho */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Fluxo de Trabalho (9 Minutos)
          </CardTitle>
          <CardDescription>Do template ao post publicado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fluxoTrabalho.map((fluxo, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{fluxo.etapa}</h4>
                  <Badge className="bg-blue-100 text-blue-700">{fluxo.tempo}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Descrição</p>
                    <p className="font-bold text-slate-900">{fluxo.descricao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ferramentas</p>
                    <p className="font-bold text-slate-900">{fluxo.ferramentas}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates por Persona */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-600" />
            Templates Customizados por Persona
          </CardTitle>
          <CardDescription>Cada persona tem seu próprio estilo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templatesPorPersona.map((pers, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{pers.persona}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Estilo</p>
                    <p className="font-bold text-slate-900">{pers.estilo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Templates</p>
                    <p className="font-bold text-slate-900">{pers.templates}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Melhor Performance</p>
                    <p className="font-bold text-green-600 text-xs">{pers.melhorPerformance}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Exemplo</p>
                    <p className="font-bold text-slate-900 text-xs">{pers.exemplo}</p>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Receita/Mês</p>
                    <p className="font-bold text-green-600">{pers.receita}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrações */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            4 Integrações Ativas
          </CardTitle>
          <CardDescription>Canva conectado com ferramentas essenciais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integracoes.map((integ, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{integ.integracao}</h4>
                  <Badge className="bg-green-100 text-green-700">{integ.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Função</p>
                    <p className="font-bold text-slate-900 text-xs">{integ.funcao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Benefício</p>
                    <p className="font-bold text-green-600 text-xs">{integ.beneficio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance de Templates */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Performance dos Templates
          </CardTitle>
          <CardDescription>Dados de 4 templates principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metricsTemplate.map((met, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3">{met.template}</h4>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Impressões</p>
                    <p className="font-bold text-slate-900">{met.impressoes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Cliques</p>
                    <p className="font-bold text-purple-600">{met.cliques}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Conversões</p>
                    <p className="font-bold text-green-600">{met.conversoes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI</p>
                    <p className="font-bold text-green-600">{met.roi}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-green-600">{met.receita}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-900">✅ 4 Principais Benefícios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beneficios.map((ben, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <h4 className="font-semibold text-slate-900">{ben.beneficio}</h4>
                </div>
                <p className="text-sm text-slate-600 mb-2">{ben.descricao}</p>
                <p className="text-sm font-bold text-green-600">→ {ben.impacto}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendação */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-slate-900">🎨 Como Começar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">1. Acessar Canva</p>
              <p className="text-slate-600">Abrir canva.com e fazer login</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">2. Selecionar Template</p>
              <p className="text-slate-600">Escolher categoria (Stories, Posts, Carrosséis, etc)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">3. Adicionar Dados</p>
              <p className="text-slate-600">Inserir informações de performance do dashboard</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">4. Publicar</p>
              <p className="text-slate-600">Exportar e agendar nas redes via Buffer</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
