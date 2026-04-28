import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Zap, AlertCircle, ExternalLink } from "lucide-react";

const FLUXOS = [
  {
    fluxo: "Pergunta sobre Produto",
    trigger: "Comentário com 'qual é', 'qual tamanho', 'qual preço'",
    resposta: "Olá [Nome]! 👋 O Pijama [modelo] tem [detalhes]. Acesse feminnita.com.br para ver todos os tamanhos.",
    canal: "Instagram / TikTok"
  },
  {
    fluxo: "Pergunta sobre Entrega",
    trigger: "Comentário com 'quanto tempo', 'quando chega', 'frete'",
    resposta: "Oi [Nome]! 📦 Entregamos em [prazo] dias úteis. Rastreie em feminnita.com.br/rastrear",
    canal: "Todos"
  },
  {
    fluxo: "Reclamação / Problema",
    trigger: "Palavras-chave: 'problema', 'defeito', 'não gostei', 'ruim'",
    resposta: "Desculpa! 😞 Queremos resolver isso. Envie DM com foto/detalhes. Nosso time responde em 2h.",
    canal: "Todos"
  },
  {
    fluxo: "Elogio / Feedback Positivo",
    trigger: "Palavras-chave: 'amei', 'adorei', 'perfeito', 'muito bom'",
    resposta: "Que alegria! 🎉 Muito obrigada! Compartilhe sua foto com #Feminnita para aparecer em nosso feed!",
    canal: "Todos"
  },
  {
    fluxo: "Pedido de Cupom / Desconto",
    trigger: "Comentário com 'cupom', 'desconto', 'promoção'",
    resposta: "Ótimo timing! 🎁 Use BEMVINDA15 para 15% OFF na primeira compra. Válido até [data].",
    canal: "Instagram / Facebook"
  },
  {
    fluxo: "Dúvida sobre Personas",
    trigger: "Comentário com 'qual é melhor', 'qual escolher', 'diferença'",
    resposta: "Carol é descontraída, Renata é premium, Vanessa é acessível. Qual seu estilo? 😊",
    canal: "Todos"
  },
];

const FERRAMENTAS = [
  { nome: "ManyChat", url: "https://manychat.com", desc: "Automações para Instagram DM e WhatsApp com fluxos visuais", melhor: "Instagram DM" },
  { nome: "Zenvia", url: "https://zenvia.com", desc: "Plataforma brasileira para WhatsApp Business API e chatbots", melhor: "WhatsApp" },
  { nome: "Take Blip", url: "https://blip.ai", desc: "Chatbot omnichannel (WhatsApp, Instagram, site) com IA", melhor: "Omnichannel" },
];

export function AutomacaoRespostasRedesSociaisSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Automação de Respostas</h2>
        <p className="text-slate-500 text-sm mt-1">Templates de resposta automática para comentários e DMs nas redes sociais</p>
      </div>

      {/* Aviso */}
      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Automação de comentários requer ferramentas externas (ManyChat, Zenvia, Blip).
            Os templates abaixo são para configuração nessas plataformas.
          </p>
        </CardContent>
      </Card>

      {/* Fluxos de automação */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-amber-500" />
            Templates de resposta automática
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FLUXOS.map((f, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-sm text-slate-900">{f.fluxo}</p>
                  <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">{f.canal}</Badge>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase">Gatilho: </span>
                    <span className="text-xs text-slate-600">{f.trigger}</span>
                  </div>
                  <div className="bg-slate-50 rounded p-2.5">
                    <span className="text-xs font-medium text-slate-500 uppercase">Resposta: </span>
                    <span className="text-xs text-slate-700">{f.resposta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ferramentas recomendadas */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Ferramentas recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FERRAMENTAS.map((f, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{f.nome}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                  <Badge variant="outline" className="text-xs mt-1.5">{f.melhor}</Badge>
                </div>
                <button onClick={() => window.open(f.url, "_blank")}
                  className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 ml-3">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
