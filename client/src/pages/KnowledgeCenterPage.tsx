import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Brain, RefreshCw, CheckCircle, AlertTriangle, Clock,
  Loader2, Zap, TrendingUp, ShoppingBag, MessageSquare,
  Instagram, BarChart3, Sparkles,
} from "lucide-react";

const DOMAIN_META: Record<string, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  meta_ads: {
    label: "Meta Ads",
    description: "Algoritmo, benchmarks, públicos, formatos e estratégias de performance",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "#1877F2",
  },
  instagram_organic: {
    label: "Instagram Orgânico",
    description: "Algoritmo, tendências de conteúdo, horários e formatos em alta",
    icon: <Instagram className="w-5 h-5" />,
    color: "#E1306C",
  },
  ecommerce_marketplaces: {
    label: "Marketplaces",
    description: "Mercado Livre, Shopee, Amazon, TikTok Shop — taxas, algoritmos e oportunidades",
    icon: <ShoppingBag className="w-5 h-5" />,
    color: "#FF6600",
  },
  fashion_trends: {
    label: "Tendências de Produto",
    description: "Produtos, categorias, sazonalidade e comportamento do comprador",
    icon: <Sparkles className="w-5 h-5" />,
    color: "#6B1D28",
  },
  whatsapp_sales: {
    label: "WhatsApp Vendas",
    description: "Estratégias de conversão, scripts de reativação e boas práticas",
    icon: <MessageSquare className="w-5 h-5" />,
    color: "#25D366",
  },
};

function freshnessBadge(daysOld: number) {
  if (daysOld === 999)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Nunca atualizado</span>;
  if (daysOld === 0)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Hoje</span>;
  if (daysOld <= 3)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{daysOld}d atrás</span>;
  if (daysOld <= 7)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {daysOld}d atrás</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {daysOld}d atrás</span>;
}

export default function KnowledgeCenterPage() {
  const [updatingDomain, setUpdatingDomain] = useState<string | null>(null);

  const statusQuery = trpc.marketKnowledge.getStatus.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const triggerMut = trpc.marketKnowledge.triggerUpdate.useMutation({
    onSuccess: (data, vars) => {
      toast.success(
        data.updated.length > 0
          ? `${data.updated.length} domínio(s) atualizado(s) com sucesso!`
          : "Nenhum domínio atualizado"
      );
      if (data.errors.length > 0) toast.error(`Erros: ${data.errors.join(", ")}`);
      statusQuery.refetch();
      setUpdatingDomain(null);
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
      setUpdatingDomain(null);
    },
  });

  function updateAll() {
    setUpdatingDomain("all");
    triggerMut.mutate({});
  }

  function updateDomain(domain: string) {
    setUpdatingDomain(domain);
    triggerMut.mutate({ domain });
  }

  const isUpdatingAll = updatingDomain === "all" && triggerMut.isPending;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#6B1D28]" /> Central de Conhecimento
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Inteligência de mercado atualizada semanalmente e injetada automaticamente nos agentes de IA
          </p>
        </div>
        <button
          onClick={updateAll}
          disabled={triggerMut.isPending}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6B1D28] text-white rounded-xl font-medium text-sm hover:bg-[#7a1f2d] disabled:opacity-50 transition-colors"
        >
          {isUpdatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {isUpdatingAll ? "Atualizando…" : "Atualizar Tudo"}
        </button>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <TrendingUp className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Como funciona</p>
          <p>Toda semana (domingo às 8h) o sistema gera automaticamente um briefing atualizado de mercado para cada domínio. Esse conhecimento é injetado nos prompts dos agentes antes de cada análise, mantendo as recomendações sempre alinhadas com o que está acontecendo agora no mercado.</p>
        </div>
      </div>

      {/* Domain cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statusQuery.isLoading && (
          <div className="col-span-2 flex items-center gap-2 text-sm text-gray-400 py-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando status…
          </div>
        )}

        {(statusQuery.data || []).map((item) => {
          const meta = DOMAIN_META[item.domain];
          if (!meta) return null;
          const isUpdating = updatingDomain === item.domain && triggerMut.isPending;

          return (
            <div key={item.domain} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: meta.color }}>
                    {meta.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{meta.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {freshnessBadge(item.daysOld)}
                <button
                  onClick={() => updateDomain(item.domain)}
                  disabled={triggerMut.isPending}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  {isUpdating ? "Atualizando…" : "Atualizar"}
                </button>
              </div>

              {item.lastUpdate && (
                <p className="text-xs text-gray-400">
                  Última atualização: {new Date(item.lastUpdate).toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Agents using this */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 text-sm mb-3">Agentes que usam este conhecimento</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-600">
          {[
            { agent: "Fernanda", domains: "Meta Ads" },
            { agent: "Sofia", domains: "Instagram Orgânico" },
            { agent: "Clara", domains: "Tendências + Marketplaces" },
            { agent: "Mariana", domains: "Marketplaces + WhatsApp" },
          ].map((a) => (
            <div key={a.agent} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <img src={`/agents/${a.agent.toLowerCase()}.jpg`} alt={a.agent} className="w-7 h-9 rounded object-cover object-top" />
              <div>
                <p className="font-semibold text-gray-800">{a.agent}</p>
                <p className="text-gray-400">{a.domains}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
