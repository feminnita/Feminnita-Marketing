import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, BarChart3, TrendingUp, Users, Eye, Link2, Zap } from "lucide-react";
import { useState } from "react";

const GA_FEATURES = [
  { icon: <Users className="w-4 h-4 text-blue-600" />, titulo: "Usuários e Sessões", desc: "Total de usuários únicos, sessões e taxa de rejeição em tempo real" },
  { icon: <Eye className="w-4 h-4 text-purple-600" />, titulo: "Visualizações de Página", desc: "Páginas mais visitadas, tempo médio e jornada do usuário" },
  { icon: <TrendingUp className="w-4 h-4 text-green-600" />, titulo: "Fontes de Tráfego", desc: "Orgânico, direto, social, email — atribuição de origem por canal" },
  { icon: <BarChart3 className="w-4 h-4 text-orange-600" />, titulo: "Conversões por Campanha", desc: "Integração com Meta Ads e Google Ads para ROI real por campanha" },
];

export default function GoogleAnalyticsSection() {
  const [gaId, setGaId] = useState("");
  const [conectado, setConectado] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Integração Google Analytics</h2>
        <p className="text-slate-500 text-sm mt-1">Conecte sua propriedade GA4 para monitorar dados reais de campanhas e tráfego</p>
      </div>

      {/* Connection card */}
      <Card className="border-0 shadow-sm border-l-4 border-orange-400 bg-orange-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-800">
            Métricas reais de tráfego, conversões e funil requerem conexão direta com a <strong>Google Analytics 4 API</strong>.
            Insira o ID da sua propriedade abaixo para ativar.
          </p>
        </CardContent>
      </Card>

      {/* Connect form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="w-4 h-4" style={{ color: '#8B2635' }} />
            Conectar Google Analytics 4
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!conectado ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">ID da Propriedade GA4</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="G-XXXXXXXXXX"
                    value={gaId}
                    onChange={(e) => setGaId(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => { if (gaId.trim()) setConectado(true); }}
                    style={{ backgroundColor: '#8B2635' }}
                    className="text-white hover:opacity-90"
                  >
                    Conectar
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Encontre em: Google Analytics → Admin → Propriedade → ID da Propriedade
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-slate-700">Como obter acesso à API:</p>
                <p>1. Acesse Google Analytics → Admin → Propriedade → Acesso da Propriedade</p>
                <p>2. Crie uma Service Account no Google Cloud Console</p>
                <p>3. Habilite a API do Google Analytics Data (GA4)</p>
                <p>4. Adicione a Service Account com permissão de "Leitor" na propriedade</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-semibold text-green-900 text-sm">ID configurado: {gaId}</p>
                <p className="text-xs text-green-700">Aguardando conexão com a API GA4</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setConectado(false); setGaId(""); }}
              >
                Remover
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What you get */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4" style={{ color: '#8B2635' }} />
            O que você terá após conectar
          </CardTitle>
          <CardDescription className="text-xs">Dados reais sincronizados da sua propriedade GA4</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {GA_FEATURES.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                {item.icon}
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.titulo}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
