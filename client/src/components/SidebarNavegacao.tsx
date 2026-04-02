'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AbaItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
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
      { id: 'roi-consolidado', label: 'ROI Consolidado', icon: '💰' },
      { id: 'performance-persona', label: 'Performance Persona', icon: '👥' },
      { id: 'metricas-realtime', label: 'Métricas Real-time', icon: '⚡' },
    ],
  },
  {
    nome: 'Marketing & Campanhas',
    icon: '📢',
    abas: [
      { id: 'email-marketing', label: 'Email Marketing', icon: '📧' },
      { id: 'meta-ads', label: 'Meta Ads', icon: '📱' },
      { id: 'google-ads', label: 'Google Ads', icon: '🔍' },
      { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
      { id: 'automacao-email', label: 'Automação Email', icon: '🤖' },
    ],
  },
  {
    nome: 'Integrações',
    icon: '🔗',
    abas: [
      { id: 'bling', label: 'Bling ERP', icon: '📦' },
      { id: 'tray', label: 'Tray', icon: '🛒' },
      { id: 'zapier', label: 'Zapier', icon: '⚙️' },
      { id: 'slack', label: 'Slack', icon: '💼' },
      { id: 'google-drive', label: 'Google Drive', icon: '☁️' },
    ],
  },
  {
    nome: 'IA & Automação',
    icon: '🤖',
    abas: [
      { id: 'chatbot', label: 'Chatbot IA', icon: '💬' },
      { id: 'geracao-conteudo', label: 'Geração Conteúdo', icon: '✨' },
      { id: 'previsao-demanda', label: 'Previsão Demanda', icon: '🔮' },
      { id: 'recomendacao', label: 'Recomendação', icon: '💡' },
      { id: 'automacao-respostas', label: 'Respostas IA', icon: '🤖' },
    ],
  },
  {
    nome: 'Relatórios & Exportação',
    icon: '📄',
    abas: [
      { id: 'relatorio', label: 'Relatórios', icon: '📊' },
      { id: 'exportar', label: 'Exportar', icon: '📥' },
      { id: 'crm', label: 'CRM', icon: '👥' },
      { id: 'afiliados', label: 'Afiliados (Legado)', icon: '🤝' },
      { id: 'notificacoes', label: 'Notificações', icon: '🔔' },
    ],
  },
  {
    nome: 'Vendas & Crescimento 🚀',
    icon: '🚀',
    abas: [
      { id: 'afiliadas-page', label: 'Afiliadas/Revendedoras', icon: '🤝', href: '/afiliadas' },
      { id: 'tiktok-live-page', label: 'TikTok Live Commerce', icon: '🎥', href: '/tiktok-live' },
      { id: 'drops-planner', label: 'Drops & Coleções', icon: '🧥' },
      { id: 'ugc-collector', label: 'UGC de Clientes', icon: '📸' },
      { id: 'abandono-recovery', label: 'Recuperação Abandono', icon: '💌' },
      { id: 'brand-book-page', label: 'Brand Book', icon: '🎨', href: '/brand-book' },
    ],
  },
];

export default function SidebarNavegacao({ onSelectTab, activeTab }: SidebarNavegacaoProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categorias.map(c => c.nome)
  );
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const filteredCategorias = categorias.map(cat => ({
    ...cat,
    abas: cat.abas.filter(aba =>
      aba.label.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(cat => cat.abas.length > 0 || searchTerm === '');

  return (
    <>
      {/* Botão Toggle para Mobile/Desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-amber-200 p-2 rounded-lg hover:bg-amber-50 transition-colors"
        title={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay para Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-screen bg-white border-r border-amber-200 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-2xl">🏠</span>
                <span className="font-bold" style={{ color: '#A63D4A' }}>
                  Feminnita
                </span>
              </div>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:block p-1 hover:bg-amber-50 rounded transition-colors"
                title={isOpen ? 'Retrair' : 'Expandir'}
              >
                {isOpen ? (
                  <ChevronUp className="w-5 h-5" style={{ color: '#A63D4A' }} />
                ) : (
                  <ChevronDown className="w-5 h-5" style={{ color: '#A63D4A' }} />
                )}
              </button>
            </div>

            {/* Search */}
            {isOpen && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-amber-600" />
                <Input
                  placeholder="Buscar aba..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 py-1 text-sm border-amber-200 focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto">
            {isOpen ? (
              <div className="space-y-2 p-4">
                {filteredCategorias.map((categoria) => (
                  <div key={categoria.nome}>
                    <button
                      onClick={() => toggleCategory(categoria.nome)}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-amber-50 transition-colors text-left"
                    >
                      <span className="text-lg">{categoria.icon}</span>
                      <span className="flex-1 font-medium text-sm" style={{ color: '#A63D4A' }}>
                        {categoria.nome}
                      </span>
                      {expandedCategories.includes(categoria.nome) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {/* Abas */}
                    {expandedCategories.includes(categoria.nome) && (
                      <div className="ml-4 space-y-1 mt-1">
                        {categoria.abas.map((aba) => (
                          <button
                            key={aba.id}
                            onClick={() => {
                              if (aba.href) {
                                window.location.href = aba.href;
                              } else {
                                onSelectTab(aba.id);
                                setIsOpen(false);
                              }
                            }}
                            className={`w-full flex items-center gap-2 p-2 rounded text-sm transition-colors text-left ${
                              activeTab === aba.id
                                ? 'bg-amber-100 text-slate-900'
                                : 'hover:bg-amber-50 text-slate-700'
                            }`}
                          >
                            <span className="text-base">{aba.icon}</span>
                            <span className="truncate">{aba.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Modo Retraído - Apenas Ícones
              <div className="space-y-2 p-2">
                {filteredCategorias.map((categoria) => (
                  <div key={categoria.nome} className="space-y-1">
                    <button
                      onClick={() => toggleCategory(categoria.nome)}
                      className="w-full flex justify-center p-2 rounded hover:bg-amber-50 transition-colors"
                      title={categoria.nome}
                    >
                      <span className="text-xl">{categoria.icon}</span>
                    </button>

                    {expandedCategories.includes(categoria.nome) && (
                      <div className="space-y-1">
                        {categoria.abas.map((aba) => (
                          <button
                            key={aba.id}
                            onClick={() => {
                              if (aba.href) {
                                window.location.href = aba.href;
                              } else {
                                onSelectTab(aba.id);
                              }
                            }}
                            className={`w-full flex justify-center p-2 rounded text-sm transition-colors ${
                              activeTab === aba.id
                                ? 'bg-amber-100'
                                : 'hover:bg-amber-50'
                            }`}
                            title={aba.label}
                          >
                            <span className="text-base">{aba.icon}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {isOpen && (
            <div className="p-4 border-t border-amber-200 text-xs text-slate-500">
              <p>144 abas disponíveis</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
