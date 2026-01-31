import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "personas", label: "Personas", icon: "👥" },
  { id: "planejamento", label: "Planejamento", icon: "📅" },
  { id: "roteiros", label: "Roteiros", icon: "🎬" },
  { id: "tendencias", label: "Tendências", icon: "📈" },
  { id: "novos-roteiros", label: "Novos Stories", icon: "🎥" },
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "imagens", label: "Imagens IG", icon: "🖼️" },
  { id: "legendas", label: "Legendas", icon: "💬" },
  { id: "anuncio", label: "Anúncio", icon: "▶️" },
  { id: "familiar", label: "Familiar", icon: "👨‍👩‍👧‍👦" },
  { id: "reels", label: "Reels", icon: "🎬" },
  { id: "tiktok-inverno", label: "TikTok 3x", icon: "❄️" },
  { id: "stories", label: "Stories", icon: "📖" },
  { id: "stories-42", label: "42 Stories", icon: "📱" },
  { id: "ads-analise", label: "Análise Ads", icon: "📊" },
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "relatorio", label: "Relatório", icon: "📄" },
  { id: "calculadora", label: "Calculadora", icon: "🧮" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "calendario", label: "Calendário", icon: "📆" },
  { id: "templates", label: "Templates", icon: "💾" },
  { id: "zapier", label: "Zapier", icon: "⚡" },
  { id: "ratings", label: "Ratings", icon: "⭐" },
  { id: "notificacoes", label: "Notificações", icon: "🔔" },
  { id: "meta", label: "Meta", icon: "📱" },
  { id: "abtest", label: "A/B Test", icon: "🧪" },
  { id: "ia", label: "IA", icon: "🤖" },
  { id: "googleads", label: "Google Ads", icon: "🎯" },
  { id: "agendamento", label: "Agendamento", icon: "⏰" },
  { id: "roi", label: "ROI", icon: "💰" },
  { id: "slack", label: "Slack", icon: "💬" },
  { id: "previsao", label: "Previsão", icon: "🔮" },
  { id: "concorrentes", label: "Concorrentes", icon: "🏆" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  { id: "atribuicao", label: "Atribuição", icon: "🎯" },
  { id: "chat", label: "Chat IA", icon: "💭" },
  { id: "calendario-conteudo", label: "Calendário Conteúdo", icon: "📋" },
  { id: "relatorios", label: "Relatórios", icon: "📊" },
  { id: "biblioteca", label: "Biblioteca", icon: "📚" },
  { id: "whatsapp-api", label: "WhatsApp API", icon: "📲" },
  { id: "performance", label: "Performance", icon: "⚡" },
  { id: "cupons", label: "Cupons", icon: "🎟️" },
];

interface BarraBuscaAbasProps {
  onSelectTab: (tabId: string) => void;
}

export default function BarraBuscaAbas({ onSelectTab }: BarraBuscaAbasProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredTabs = TABS.filter(tab =>
    tab.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input
          placeholder="🔍 Buscar abas..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
            className="absolute right-2 top-2 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && searchTerm && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
            {filteredTabs.length > 0 ? (
              filteredTabs.map(tab => (
                <Button
                  key={tab.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSelectTab(tab.id);
                    setSearchTerm("");
                    setIsOpen(false);
                  }}
                  className="justify-start text-xs h-auto py-2 flex flex-col items-start"
                >
                  <span className="text-lg mb-1">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </Button>
              ))
            ) : (
              <div className="col-span-4 text-center py-4 text-slate-500">
                Nenhuma aba encontrada
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
