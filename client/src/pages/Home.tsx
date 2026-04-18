import { useLocation } from "wouter";
import {
  Bot, TrendingUp, ShoppingCart, MessageSquare, FileText,
  Users, Megaphone, Instagram, BookOpen, Zap, BarChart2,
  Package, Music, Bell,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

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
    color: "#8B2635",
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
    color: "#8B2635",
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
  { name: "Fernanda", role: "Meta Ads", path: "/gestor-trafego", emoji: "📊" },
  { name: "Sofia", role: "Instagram", path: "/agente/sofia", emoji: "📸" },
  { name: "Beatriz", role: "Conteúdo", path: "/agente/beatriz", emoji: "✍️" },
  { name: "Clara", role: "Competição", path: "/agente/clara", emoji: "🔍" },
  { name: "Mariana", role: "Vendas", path: "/agente/mariana", emoji: "🚀" },
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
          <h1 className="text-2xl font-bold" style={{ color: "#8B2635" }}>
            Feminnita — Gestão de Marketing
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
          <Bell className="w-5 h-5 shrink-0" style={{ color: "#8B2635" }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: "#8B2635" }}>
              {pendingCount} {pendingCount === 1 ? "ação pendente" : "ações pendentes"} da equipe IA
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Clique para revisar e aprovar as recomendações de hoje
            </p>
          </div>
          <Zap className="w-4 h-4 ml-auto shrink-0" style={{ color: "#8B2635" }} />
        </button>
      )}

      {/* Equipe IA */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Equipe IA
        </h2>
        <div className="flex flex-wrap gap-3">
          {TEAM.map((agent) => (
            <button
              key={agent.name}
              onClick={() => setLocation(agent.path)}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-rose-200 hover:bg-rose-50 transition-colors text-sm font-medium text-slate-700"
            >
              <span className="text-base">{agent.emoji}</span>
              <div className="text-left">
                <p className="font-semibold text-slate-800 leading-none">{agent.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{agent.role}</p>
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
            <TrendingUp className="w-4 h-4" style={{ color: "#8B2635" }} />
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
            <p className="text-2xl font-bold" style={{ color: "#8B2635" }}>R$100K</p>
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
            style={{ width: "20%", background: "#8B2635" }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 text-right">20% da meta</p>
      </div>

    </div>
  );
}
