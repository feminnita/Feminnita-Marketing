import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FavoriteTab {
  id: string;
  label: string;
  icon: string;
}

const ALL_TABS = [
  { id: "personas", label: "Personas", icon: "👥" },
  { id: "planejamento", label: "Planejamento", icon: "📅" },
  { id: "roteiros", label: "Roteiros", icon: "🎬" },
  { id: "tendencias", label: "Tendências", icon: "📈" },
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "calculadora", label: "Calculadora", icon: "🧮" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "roi", label: "ROI", icon: "💰" },
  { id: "performance", label: "Performance", icon: "⚡" },
  { id: "cupons", label: "Cupons", icon: "🎟️" },
];

interface MenuFavoritosAbasProps {
  onSelectTab: (tabId: string) => void;
}

export default function MenuFavoritosAbas({ onSelectTab }: MenuFavoritosAbasProps) {
  const [favorites, setFavorites] = useState<FavoriteTab[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("favoriteTabs");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = (tab: FavoriteTab) => {
    const isFavorited = favorites.some(f => f.id === tab.id);
    let newFavorites;

    if (isFavorited) {
      newFavorites = favorites.filter(f => f.id !== tab.id);
    } else {
      newFavorites = [...favorites, tab];
    }

    setFavorites(newFavorites);
    localStorage.setItem("favoriteTabs", JSON.stringify(newFavorites));
  };

  const removeFavorite = (tabId: string) => {
    const newFavorites = favorites.filter(f => f.id !== tabId);
    setFavorites(newFavorites);
    localStorage.setItem("favoriteTabs", JSON.stringify(newFavorites));
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Star className="w-4 h-4" />
        <span className="hidden sm:inline">Favoritos</span>
        {favorites.length > 0 && (
          <Badge variant="secondary" className="ml-2">{favorites.length}</Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 z-50 w-80 max-h-96 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Abas Favoritas ({favorites.length})
            </h3>

            {favorites.length > 0 ? (
              <div className="space-y-2 mb-4">
                {favorites.map(tab => (
                  <div
                    key={tab.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 group"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onSelectTab(tab.id);
                        setIsOpen(false);
                      }}
                      className="justify-start flex-1 text-left"
                    >
                      <span className="mr-2">{tab.icon}</span>
                      <span className="text-xs">{tab.label}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(tab.id)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mb-4">
                Nenhuma aba favorita. Clique na estrela para adicionar!
              </p>
            )}

            <div className="border-t pt-4">
              <p className="text-xs font-semibold mb-3 text-slate-600">
                Adicionar Favoritos:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_TABS.map(tab => (
                  <Button
                    key={tab.id}
                    variant={favorites.some(f => f.id === tab.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFavorite(tab)}
                    className="justify-start text-xs h-auto py-2"
                  >
                    <Star className={`w-3 h-3 mr-1 ${favorites.some(f => f.id === tab.id) ? "fill-current" : ""}`} />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
