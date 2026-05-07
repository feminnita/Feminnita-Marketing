import { useLocation } from "wouter";
import {
  Bot, TrendingUp, ShoppingCart, MessageSquare, FileText,
  Users, Megaphone, Instagram, BookOpen, Zap, BarChart2,
  Package, Music, Bell,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import gabiPhoto from "@/assets/gabi.jpg";
import luizaShopeePhoto from "@/assets/luiza-shopee.jpg";
import isabelaPhoto from "@/assets/isabela-shein.jpg";
import alicePhoto from "@/assets/alice.jpg";
import dudaPhoto from "@/assets/duda.jpg";
import anyPhoto from "@/assets/any.jpg";

// ─── Cards de acesso rápido ───────────────────────────────────────────────────

interface QuickCard {
  icon: React.ReactNode;
  label: string;
  description: string;
  path: string;
  color: string;
}

const QUICK_CARDS: QuickCard[] = [
  {
    icon: <Bot className="w-5 h-5" />,
    label: "Ações da Equipe IA",
    description: "Aprove ou rejeite ações propostas pelos agentes",
    path: "/acoes-agentes",
    color: "#6B1D28",
  },
  {
    icon: <Megaphone className="w-5 h-5" />,
    label: "Meta Ads",
    description: "Campanhas e performance no Facebook/Instagram",
    path: "/gestor-trafego",
    color: "#1877F2",
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    label: "Mercado Livre",
    description: "Especialista IA para ML Ads",
    path: "/ml-ads",
    color: "#FFE600",
  },
  {
    icon: <Package className="w-5 h-5" />,
    label: "Shopee Ads",
    description: "Especialista IA para Shopee",
    path: "/shopee-ads",
    color: "#EE4D2D",
  },
  {
    icon: <Package className="w-5 h-5" />,
    label: "Amazon",
    description: "Especialista IA para Amazon Brasil",
    path: "/amazon",
    color: "#FF9900",
  },
  {
    icon: <Music className="w-5 h-5" />,
    label: "TikTok Shop",
    description: "Especialista IA para TikTok Shop",
    path: "/tiktok-shop",
    color: "#010101",
  },
  {
    icon: <Instagram className="w-5 h-5" />,
    label: "Instagram",
    description: "Dashboard de métricas orgânicas",
    path: "/instagram",
    color: "#E1306C",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: "Blog Feminnita",
    description: "Gerar e publicar posts com IA",
    path: "/blog-feminnita",
    color: "#6B1D28",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    label: "WhatsApp",
    description: "Disparos em massa para revendedoras",
    path: "/whatsapp-disparos",
    color: "#25D366",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Afiliadas",
    description: "Gestão de revendedoras e afiliadas",
    path: "/afiliadas",
    color: "#A63D4A",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Relatório Performance",
    description: "Relatórios consolidados de marketing",
    path: "/relatorio-performance",
    color: "#6366F1",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    label: "Analytics",
    description: "Google Analytics e métricas avançadas",
    path: "/analytics",
    color: "#F59E0B",
  },
];

// ─── Equipe IA ────────────────────────────────────────────────────────────────

const TEAM = [
  { name: "Fernanda", role: "Meta Ads", path: "/traffic-manager", photo: "/agents/fernanda.jpg" },
  { name: "Sofia", role: "Instagram", path: "/agente/sofia", photo: "/agents/sofia.jpg" },
  { name: "Clara", role: "Análise de Mercado", path: "/agente/clara", photo: "/agents/clara.jpg" },
  { name: "Mariana", role: "Vendas", path: "/agente/mariana", photo: "/agents/mariana.jpg" },
];

const MARKETPLACE_TEAM = [
  { name: "Gabi", role: "Mercado Livre", path: "/ml-gabi", photo: gabiPhoto, color: "#FFD100", textColor: "#1a1a1a" },
  { name: "Luiza", role: "Shopee Ads", path: "/shopee-luiza", photo: luizaShopeePhoto, color: "#EE4D2D", textColor: "#fff" },
  { name: "Isabela", role: "Shein", path: "/shein-isabela", photo: isabelaPhoto, color: "#FF2D55", textColor: "#fff" },
  { name: "Alice", role: "Amazon", path: "/amazon-alice", photo: alicePhoto, color: "#FF9900", textColor: "#1a1a1a" },
  { name: "Duda", role: "Tray SEO", path: "/duda-seo", photo: dudaPhoto, color: "#6B1D28", textColor: "#fff" },
  { name: "Any", role: "Tray Afil.", path: "/any-afiliadas", photo: anyPhoto, color: "#7C3AED", textColor: "#fff" },
];

// ─── Página ───────────────────────────────────────────────────────────────────

export default function Home() {
  const [, setLocation] = useLocation();

  const pendingActionsQuery = trpc.agentActions.listPending.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const pendingCount = pendingActionsQuery.data?.length ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-2">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#6B1D28" }}>
            Gestão de Marketing
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Atacado de Pijamas · Painel de controle centralizado
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          Equipe IA ativa
        </div>
      </div>

      {/* Banner ações pendentes */}
      {pendingCount > 0 && (
        <button
          onClick={() => setLocation("/acoes-agentes")}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border text-left transition-colors hover:opacity-90"
          style={{ background: "#FFF5F6", borderColor: "#f9c0c8" }}
        >
          <Bell className="w-5 h-5 shrink-0" style={{ color: "#6B1D28" }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: "#6B1D28" }}>
              {pendingCount} {pendingCount === 1 ? "ação pendente" : "ações pendentes"} da equipe IA
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Clique para revisar e aprovar as recomendações de hoje
            </p>
          </div>
          <Zap className="w-4 h-4 ml-auto shrink-0" style={{ color: "#6B1D28" }} />
        </button>
      )}

      {/* Equipe IA */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Equipe IA
        </h2>
        <div className="flex flex-wrap gap-5">
          {TEAM.map((agent) => (
            <button
              key={agent.name}
              onClick={() => setLocation(agent.path)}
              className="flex flex-col items-center gap-4 px-6 py-5 bg-white border border-slate-200 rounded-2xl hover:border-rose-200 hover:bg-rose-50 transition-colors w-44"
            >
              <img src={agent.photo} alt={agent.name} className="w-24 h-32 rounded-xl object-cover object-top border border-slate-200 shadow-sm" />
              <div className="text-center">
                <p className="font-semibold text-slate-800 text-base leading-none">{agent.name}</p>
                <p className="text-sm text-slate-400 mt-1">{agent.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Especialistas de Marketplace */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Especialistas de Marketplace
        </h2>
        <div className="flex flex-wrap gap-3">
          {MARKETPLACE_TEAM.map((agent) => (
            <button
              key={agent.name}
              onClick={() => setLocation(agent.path)}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all w-44"
            >
              <div
                className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
                style={{ borderColor: agent.color }}
              >
                <img src={agent.photo} alt={agent.name} className="w-full h-full object-cover object-top" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800 text-sm leading-none">{agent.name}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: agent.color }}>{agent.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Acesso rápido */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Acesso rápido
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {QUICK_CARDS.map((card) => (
            <button
              key={card.path}
              onClick={() => setLocation(card.path)}
              className="group flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all text-left"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ background: card.color }}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 leading-tight">{card.label}</p>
                <p className="text-xs text-slate-400 mt-1 leading-snug">{card.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Meta de vendas */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: "#6B1D28" }} />
            Meta de Vendas
          </h2>
          <span className="text-xs text-slate-400">Atualizado pela Mariana</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-800">R$20K</p>
            <p className="text-xs text-slate-400 mt-1">Atual / mês</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: "#6B1D28" }}>R$100K</p>
            <p className="text-xs text-slate-400 mt-1">Meta urgente</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">5×</p>
            <p className="text-xs text-slate-400 mt-1">Crescimento necessário</p>
          </div>
        </div>
        <div className="mt-4 bg-slate-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: "20%", background: "#6B1D28" }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 text-right">20% da meta</p>
      </div>

    </div>
  );
}
