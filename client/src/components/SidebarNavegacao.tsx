import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AbaItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface Categoria {
  nome: string;
  icon: React.ReactNode;
  abas: AbaItem[];
}

interface SidebarNavegacaoProps {
  onSelectTab: (tabId: string) => void;
  activeTab: string;
}

const categorias: Categoria[] = [
  {
    nome: 'Personas & Planejamento',
    icon: '👥',
    abas: [
      { id: 'personas', label: 'Personas', icon: '👤' },
      { id: 'planejamento', label: 'Planejamento', icon: '📅' },
      { id: 'tendencias', label: 'Tendências', icon: '📈' },
      { id: 'calendario-conteudo', label: 'Calendário', icon: '📆' },
    ],
  },
  {
    nome: 'Conteúdo & Criação',
    icon: '🎬',
    abas: [
      { id: 'roteiros', label: 'Roteiros', icon: '📹' },
      { id: 'imagens', label: 'Imagens IG', icon: '🖼️' },
      { id: 'legendas', label: 'Legendas', icon: '✍️' },
      { id: 'reels', label: 'Reels', icon: '🎞️' },
      { id: 'tiktok', label: 'TikTok', icon: '🎵' },
      { id: 'canva-integracao', label: 'Canva', icon: '🎨' },
    ],
  },
  {
    nome: 'Análise & Dados',
    icon: '📊',
    abas: [
      { id: 'dashboard-exec', label: 'Dashboard Executivo', icon: '📊' },
      { id: 'google-analytics', label: 'Google Analytics 4', icon: '📈' },
      { id: 'analise-competitiva', label: 'Análise Competitiva', icon: '🏆' },
      { id: 'concorrencia-tempo-real', label: 'Concorrência Real-time', icon: '⚡' },
      { id: 'ltv-detalhado', label: 'Lifetime Value', icon: '💰' },
      { id: 'roi-segmento', label: 'ROI por Segmento', icon: '💵' },
    ],
  },
  {
    nome: 'Marketing & Campanhas',
    icon: '📢',
    abas: [
      { id: 'email-marketing', label: 'Email Marketing', icon: '📧' },
      { id: 'facebook-ads', label: 'Facebook Ads', icon: 'f' },
      { id: 'instagram-ads', label: 'Instagram Ads', icon: '📷' },
      { id: 'tiktok-ads', label: 'TikTok Ads', icon: '🎵' },
      { id: 'meta-vs-google', label: 'Meta vs Google', icon: '⚖️' },
      { id: 'whatsapp-integracao', label: 'WhatsApp', icon: '💬' },
    ],
  },
  {
    nome: 'Integrações',
    icon: '🔗',
    abas: [
      { id: 'automacao-bling', label: 'Bling ERP', icon: '📦' },
      { id: 'integracao-tray', label: 'Tray', icon: '🛒' },
      { id: 'crm-clientes', label: 'CRM', icon: '👥' },
      { id: 'apis-integracao', label: 'APIs', icon: '⚙️' },
    ],
  },
  {
    nome: 'IA & Automação',
    icon: '🤖',
    abas: [
      { id: 'demanda-ml', label: 'Previsão Demanda ML', icon: '🧠' },
      { id: 'respostas-ia', label: 'Respostas IA', icon: '💬' },
      { id: 'recomendacao-ia', label: 'Recomendação IA', icon: '⭐' },
      { id: 'automacao-segmentacao', label: 'Auto Segmentação', icon: '⚡' },
      { id: 'previsao-churn', label: 'Previsão Churn', icon: '⚠️' },
    ],
  },
  {
    nome: 'Relatórios & Exportação',
    icon: '📄',
    abas: [
      { id: 'relatorios-mensais', label: 'Relatórios Mensais', icon: '📋' },
      { id: 'google-sheets', label: 'Google Sheets', icon: '📊' },
      { id: 'manual', label: 'Manual', icon: '📖' },
      { id: 'relatorio-influenciadores', label: 'Personas ROI', icon: '⭐' },
    ],
  },
];

export default function SidebarNavegacao({ onSelectTab, activeTab }: SidebarNavegacaoProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Personas & Planejamento', 'Análise & Dados'])
  );
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoria: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoria)) {
      newExpanded.delete(categoria);
    } else {
      newExpanded.add(categoria);
    }
    setExpandedCategories(newExpanded);
  };

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
  };

  const filteredCategorias = categorias.map(cat => ({
    ...cat,
    abas: cat.abas.filter(aba =>
      aba.label.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(cat => cat.abas.length > 0 || searchTerm === '');

  return (
    <div className="w-64 bg-gradient-to-b from-amber-50 to-amber-100 border-r border-amber-200 h-screen overflow-y-auto flex flex-col sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-700 to-amber-600 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-amber-900">Menu</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-amber-400" />
          <Input
            placeholder="Buscar aba..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm border-amber-200 bg-white"
          />
        </div>
      </div>

      {/* Categorias */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategorias.map((categoria) => (
          <div key={categoria.nome} className="mb-2">
            <button
              onClick={() => toggleCategory(categoria.nome)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-amber-200 transition-colors text-sm font-semibold text-amber-900"
            >
              <div className="flex items-center gap-2">
                <span>{categoria.icon}</span>
                <span>{categoria.nome}</span>
              </div>
              {expandedCategories.has(categoria.nome) ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedCategories.has(categoria.nome) && (
              <div className="ml-2 mt-1 space-y-1">
                {categoria.abas.map((aba) => (
                  <button
                    key={aba.id}
                    onClick={() => handleTabClick(aba.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeTab === aba.id
                        ? 'bg-amber-200 text-amber-900 font-semibold'
                        : 'text-amber-700 hover:bg-amber-150'
                    }`}
                  >
                    <span>{aba.icon}</span>
                    <span>{aba.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-amber-200 bg-gradient-to-r from-white to-amber-50 text-xs text-amber-700">
        <p>138 abas disponíveis</p>
      </div>
    </div>
  );
}
