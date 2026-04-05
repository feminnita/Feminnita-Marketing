import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Zap, Target, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NOVAS_CAMPANHAS = [
  {
    id: 1,
    nome: "Renda Extra - Search Ads",
    descricao: "Segmente por: 'como ganhar dinheiro extra', 'trabalho em casa', 'renda passiva'",
    budget: 500,
    duracao: "7 dias",
    alvo: "Mulheres 25-45 anos, Brasil"
  },
  {
    id: 2,
    nome: "Compra Familiar - Display Ads",
    descricao: "Remarketing para visitantes do site que não compraram",
    budget: 300,
    duracao: "14 dias",
    alvo: "Visitantes anteriores do site"
  },
  {
    id: 3,
    nome: "Lançamento Inverno - Shopping Ads",
    descricao: "Mostre produtos do catálogo em Google Shopping",
    budget: 400,
    duracao: "30 dias",
    alvo: "Pessoas buscando 'pijama inverno'"
  }
];

export default function GoogleAdsSection() {
  const [googleKey, setGoogleKey] = useState("");

  const conectarGoogle = () => {
    toast.error("Integração Google Ads não configurada. Configure as credenciais OAuth do Google Ads no backend para ativar a sincronização.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integração com Google Ads</h2>
        <p className="text-slate-600">
          Crie campanhas de ads diretamente na plataforma com budget automático e otimização de CPA baseada em dados históricos.
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Campanhas de exemplo — integração Google Ads não configurada</p>
              <p className="text-sm text-slate-600 mt-1">
                As campanhas sugeridas abaixo são modelos de referência. Para criar campanhas reais no Google Ads, configure as credenciais OAuth do Google Ads nas integrações.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conexão com Google Ads */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Conectar Google Ads
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Token de Acesso Google Ads</label>
            <div className="flex gap-2">
              <Input
                placeholder="Seu token de acesso Google Ads"
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                type="password"
                className="flex-1"
              />
              <Button onClick={conectarGoogle} className="bg-blue-600 hover:bg-blue-700">
                Conectar
              </Button>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Encontre seu token em: Google Ads → Configurações → Acesso à API
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-semibold text-blue-900 mb-2">Como Obter Seu Token Google Ads:</p>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Acesse ads.google.com</li>
              <li>Vá para Configurações → Acesso à API</li>
              <li>Clique em "Gerar Novo Token"</li>
              <li>Copie o token de acesso</li>
              <li>Cole aqui e clique em Conectar</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Campanhas sugeridas */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Campanhas Sugeridas para Feminnita
          </CardTitle>
          <CardDescription>Configure estas campanhas no Google Ads após conectar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {NOVAS_CAMPANHAS.map((camp) => (
            <div key={camp.id} className="border border-green-200 rounded-lg p-4 bg-white">
              <h4 className="font-bold text-slate-900 mb-1">{camp.nome}</h4>
              <p className="text-xs text-slate-600 mb-2">{camp.descricao}</p>
              <div className="flex gap-3 text-xs text-slate-500">
                <span>Budget sugerido: R$ {camp.budget}</span>
                <span>Duração: {camp.duracao}</span>
                <span>Alvo: {camp.alvo}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Por que Google Ads */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg">Por que usar Google Ads?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { titulo: "Alcance Massivo", descricao: "Bilhões de buscas por dia no Google" },
            { titulo: "Segmentação Precisa", descricao: "Chegue exatamente quem procura seus produtos" },
            { titulo: "ROI Rastreável", descricao: "Veja exatamente quanto cada real gerou" },
            { titulo: "Múltiplos Formatos", descricao: "Search, Display, Shopping, Video Ads" },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="text-amber-600">✓</span>
              <div>
                <p className="font-semibold text-slate-900">{item.titulo}</p>
                <p className="text-xs text-slate-600">{item.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Máximo ROI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "Comece com Search Ads (melhor ROI para e-commerce)",
            "Use Remarketing para visitantes que não compraram",
            "Teste diferentes palavras-chave e anúncios",
            "Monitore CPA e ROAS diariamente",
            "Pause campanhas com CPA > R$ 15",
            "Aumente budget para campanhas com ROAS > 3x",
            "Use extensões de anúncio (promoção, avaliação)"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">✅ {dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
