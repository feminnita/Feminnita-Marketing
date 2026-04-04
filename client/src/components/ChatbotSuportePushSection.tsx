import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Bell, ExternalLink, Zap, Package, ShoppingCart, RotateCcw, Star } from "lucide-react";

const CHATBOT_TOOLS = [
  {
    name: "ManyChat",
    url: "https://manychat.com",
    desc: "Automações para Instagram DM e WhatsApp com fluxos visuais",
    best: "Instagram DM",
  },
  {
    name: "Zenvia",
    url: "https://zenvia.com",
    desc: "Plataforma brasileira para WhatsApp Business API e chatbots",
    best: "WhatsApp",
  },
  {
    name: "Take Blip",
    url: "https://blip.ai",
    desc: "Chatbot omnichannel (WhatsApp, Instagram, site) com IA",
    best: "Omnichannel",
  },
];

const PUSH_TOOLS = [
  {
    name: "OneSignal",
    url: "https://onesignal.com",
    desc: "Push notifications para web e app — plano gratuito disponível",
  },
  {
    name: "Firebase Cloud Messaging",
    url: "https://firebase.google.com",
    desc: "Push gratuito do Google, integra com Android/iOS/Web",
  },
];

const NOTIFICATION_TEMPLATES = [
  {
    icon: <ShoppingCart className="w-4 h-4" />,
    trigger: "Após pagamento",
    msg: "Seu pedido foi confirmado! 🎉 Você receberá atualizações por aqui.",
  },
  {
    icon: <Package className="w-4 h-4" />,
    trigger: "Pedido enviado",
    msg: "Seu pijama saiu para entrega! Rastreie em feminnita.com.br/rastrear 📦",
  },
  {
    icon: <RotateCcw className="w-4 h-4" />,
    trigger: "4h após abandono",
    msg: "Você esqueceu algo no carrinho! Finalize com 10% OFF: VOLTAR10 🛒",
  },
  {
    icon: <Star className="w-4 h-4" />,
    trigger: "5 dias após entrega",
    msg: "Adorou seu pijama? Deixe sua avaliação e ganhe pontos! ⭐",
  },
];

export default function ChatbotSuportePushSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Chatbot, Suporte & Push</h2>
        <p className="text-slate-500 text-sm mt-1">
          Automação de atendimento e notificações push para clientes.
        </p>
      </div>

      {/* Chatbot tools */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4" style={{ color: '#8B2635' }} />
            Ferramentas de chatbot recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {CHATBOT_TOOLS.map((t) => (
            <a
              key={t.name}
              href={t.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                  {t.best}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-0.5 transition-colors" />
            </a>
          ))}
        </CardContent>
      </Card>

      {/* Push notification tools */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="w-4 h-4" style={{ color: '#8B2635' }} />
            Push notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PUSH_TOOLS.map((t) => (
            <a
              key={t.name}
              href={t.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-0.5 transition-colors" />
            </a>
          ))}
        </CardContent>
      </Card>

      {/* Notification templates */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Templates de mensagem sugeridos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {NOTIFICATION_TEMPLATES.map((t, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 text-slate-500">
                {t.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.trigger}</p>
                <p className="text-sm text-slate-700 mt-0.5">{t.msg}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommended flows */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-700">Fluxos prioritários para Feminnita</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
            <li>Boas-vindas automático no Instagram DM após seguir</li>
            <li>Rastreamento de pedido via WhatsApp (integrar com Bling/Tray)</li>
            <li>Recuperação de carrinho abandonado (4h depois)</li>
            <li>Pedido de avaliação pós-entrega (D+5)</li>
            <li>Promoção flash para clientes inativos (30+ dias)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
