import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Music } from "lucide-react";
import { AgentPanel, AGENTS, AGENT_PHOTOS, type AccountType } from "./TiktokTeamPage";

const BANNER_FROM = "#881337";
const BANNER_TO = "#9d174d";

export default function TiktokAgentPage({ agentName }: { agentName: string }) {
  const [, setLocation] = useLocation();
  const [account, setAccount] = useState<AccountType>("feminnita");

  const agent = AGENTS.find((a) => a.id === agentName);

  if (!agent) {
    return (
      <div className="p-6 text-center text-gray-500">
        Agente "{agentName}" não encontrada.
      </div>
    );
  }

  return (
    <div className="-m-4 flex flex-col flex-1 min-h-0 bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/tiktok-team")}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img
            src={AGENT_PHOTOS[agent.id]}
            alt={agent.name}
            className="w-11 h-14 rounded-xl object-cover object-top border border-slate-200 flex-shrink-0 shadow-sm"
          />
          <div>
            <h1 className="text-base font-bold text-slate-900">{agent.name}</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-emerald-700 font-medium">Online</span>
              <span className="text-xs text-slate-400 ml-1">· {agent.role}</span>
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 flex items-center gap-0.5">
                <Music className="w-2.5 h-2.5" /> TikTok
              </span>
            </div>
          </div>
        </div>

        {/* Seletor de conta */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setAccount("feminnita")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${account === "feminnita" ? "bg-white text-[#FE2C55] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            🎵 Feminnita
          </button>
          <button
            onClick={() => setAccount("fnt")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${account === "fnt" ? "bg-white text-[#FE2C55] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            🎵 FNT
          </button>
        </div>
      </header>

      {/* Banner */}
      <div
        className="flex items-stretch flex-shrink-0"
        style={{ background: `linear-gradient(to right, ${BANNER_FROM}, ${BANNER_TO})` }}
      >
        <div className="flex-shrink-0">
          <img
            src={AGENT_PHOTOS[agent.id]}
            alt={agent.name}
            className="h-44 w-32 object-cover object-top"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-4 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            {agent.role}
          </p>
          <h2 className="text-2xl font-bold text-white leading-tight">{agent.name}</h2>
          <p className="text-sm mt-1.5 leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
            {agent.description}
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-xs text-emerald-300 font-medium">Online agora</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-pink-900/50 text-pink-200">
              {agent.emoji} TikTok
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo do agente */}
      <div className="flex-1 overflow-y-auto p-6">
        <AgentPanel agent={agent} account={account} />
      </div>
    </div>
  );
}
