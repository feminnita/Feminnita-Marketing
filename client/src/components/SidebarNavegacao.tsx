'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AbaItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
}

interface Categoria {
  nome: string;
  icon: string;
  abas: AbaItem[];
}

interface SidebarNavegacaoProps {
  onSelectTab: (tabId: string) => void;
  activeTab: string;
}

const categorias: Categoria[] = [
  {
    nome: 'Início',
    icon: '🏠',
    abas: [
      { id: 'dashboard-exec', label: 'Dashboard', icon: '📊' },
      { id: 'tendencias', label: 'Tendências Virais', icon: '📈' },
      { id: 'calendario-conteudo', label: 'Calendário', icon: '📆' },
      { id: 'notificacoes', label: 'Notificações', icon: '🔔' },
    ],
  },
  {
    nome: 'Personas & Planejamento',
    icon: '👥',
    abas: [
      { id: 'personas', label: 'Personas', icon: '👤' },
      { id: 'planejamento', label: 'Planejamento Semanal', icon: '📅' },
      { id: 'performance', label: 'Performance por Persona', icon: '🎯' },
    ],
  },
  {
    nome: 'Conteúdo & Criação',
    icon: '🎬',
    abas: [
      { id: 'roteiros', label: 'Roteiros', icon: '📹' },
      { id: 'reels', label: 'Reels', icon: '🎞️' },
      { id: 'tiktok', label: 'TikTok', icon: '🎵' },
      { id: 'imagens', label: 'Imagens Instagram', icon: '🖼️' },
      { id: 'legendas', label: 'Legendas', icon: '✍️' },
      { id: 'canva-integracao', label: 'Canva', icon: '🎨' },
    ],
  },
  {
    nome: 'Marketing & Campanhas',
    icon: '📢',
    abas: [
      { id: 'gestor-trafego', label: 'Gestor de Tráfego IA', icon: '🤖', href: '/gestor-trafego' },
      { id: 'traffic-manager', label: 'Tráfego IA', icon: '📊', href: '/traffic-manager' },
      { id: 'blog-feminnita', label: 'Blog Feminnita', icon: '✍️', href: '/blog-feminnita' },
      { id: 'meta', label: 'Meta Ads', icon: '📱' },
      { id: 'googleads', label: 'Google Ads', icon: '🔍' },
      { id: 'email-marketing', label: 'Email Marketing', icon: '📧' },
      { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
      { id: 'whatsapp-disparos', label: 'Disparo em Massa', icon: '📨', href: '/whatsapp-disparos' },
      { id: 'criativos', label: 'Pipeline Criativos', icon: '🎨', href: '/criativos' },
    ],
  },
  {
    nome: 'Marketplaces',
    icon: '🏪',
    abas: [
      { id: 'tiktok-shop', label: 'TikTok — Lia (Shop)', icon: '🎵', href: '/tiktok-shop' },
      { id: 'tiktok-team', label: 'Time TikTok (Agentes)', icon: '👥', href: '/tiktok-team' },
      { id: 'tiktok-live-page2', label: 'TikTok LIVE Commerce', icon: '🔴', href: '/tiktok-live' },
      { id: 'ml-ads', label: 'ML — Ads IA', icon: '🛒', href: '/ml-ads' },
      { id: 'shopee-ads', label: 'Shopee Ads IA', icon: '🛍️', href: '/shopee-ads' },
      { id: 'amazon', label: 'Amazon IA', icon: '📦', href: '/amazon' },
    ],
  },
  {
    nome: 'Equipe IA',
    icon: '🤖',
    abas: [
      { id: 'equipe-marketing', label: 'Equipe de Agentes', icon: '👥', href: '/equipe-marketing' },
      { id: 'fernanda', label: 'Fernanda — Tráfego', icon: '🟣', href: '/gestor-trafego' },
      { id: 'sofia', label: 'Sofia — Instagram', icon: '🩷', href: '/agente/sofia' },
      { id: 'beatriz', label: 'Beatriz — Criativos', icon: '🟡', href: '/beatriz' },
      { id: 'clara', label: 'Clara — Inteligência', icon: '🔵', href: '/agente/clara' },
      { id: 'mariana', label: 'Mariana — Vendas', icon: '🟢', href: '/agente/mariana' },
      { id: 'especialistas', label: 'Especialistas', icon: '🎓', href: '/especialistas' },
      { id: 'acoes-agentes', label: 'Ações dos Agentes', icon: '⚡', href: '/acoes-agentes' },
    ],
  },
  {
    nome: 'Análise & Relatórios',
    icon: '📊',
    abas: [
      { id: 'google-analytics', label: 'Google Analytics 4', icon: '📈' },
      { id: 'roi', label: 'ROI Consolidado', icon: '💰' },
      { id: 'relatorios', label: 'Relatórios', icon: '📄' },
      { id: 'exportacao', label: 'Exportar Dados', icon: '📥' },
    ],
  },
  {
    nome: 'IA & Automação',
    icon: '🤖',
    abas: [
      { id: 'gerador-ia', label: 'Geração de Conteúdo', icon: '✨' },
      { id: 'chatbot', label: 'Chatbot IA', icon: '💬' },
      { id: 'abandono-recovery', label: 'Recuperação Abandono', icon: '💌' },
      { id: 'automacao-email', label: 'Automação de Email', icon: '🤖' },
    ],
  },
  {
    nome: 'Integrações',
    icon: '🔗',
    abas: [
      { id: 'automacao-bling', label: 'Bling ERP', icon: '📦' },
      { id: 'integracao-tray', label: 'Tray', icon: '🛒' },
      { id: 'crm-clientes', label: 'CRM', icon: '👥' },
    ],
  },
  {
    nome: 'Vendas & Crescimento',
    icon: '🚀',
    abas: [
      { id: 'drops-planner', label: 'Drops & Coleções', icon: '🧥' },
      { id: 'ugc-collector', label: 'UGC de Clientes', icon: '📸' },
      { id: 'afiliadas-page', label: 'Afiliadas/Revendedoras', icon: '🤝', href: '/afiliadas' },
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

  const totalAbas = categorias.reduce((sum, cat) => sum + cat.abas.length, 0);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-amber-200 p-2 rounded-lg hover:bg-amber-50 transition-colors"
        title={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-screen bg-white border-r border-amber-200 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-0 lg:w-16'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                <span className="font-bold text-lg" style={{ color: '#8B2635' }}>Feminnita</span>
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

            {isOpen && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-amber-600" />
                <Input
                  placeholder="Buscar..."
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
              <div className="space-y-1 p-3">
                {filteredCategorias.map((categoria) => (
                  <div key={categoria.nome}>
                    <button
                      onClick={() => toggleCategory(categoria.nome)}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-amber-50 transition-colors text-left"
                    >
                      <span className="text-base">{categoria.icon}</span>
                      <span className="flex-1 font-semibold text-xs uppercase tracking-wide" style={{ color: '#A63D4A' }}>
                        {categoria.nome}
                      </span>
                      {expandedCategories.includes(categoria.nome) ? (
                        <ChevronUp className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>

                    {expandedCategories.includes(categoria.nome) && (
                      <div className="ml-4 space-y-0.5 mb-2">
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
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-left ${
                              activeTab === aba.id
                                ? 'font-medium'
                                : 'hover:bg-amber-50 text-slate-600'
                            }`}
                            style={{
                              minWidth: 0,
                              ...(activeTab === aba.id ? { backgroundColor: '#fdf0e8', color: '#8B2635' } : {}),
                            }}
                          >
                            <span className="text-sm" style={{ flexShrink: 0 }}>{aba.icon}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{aba.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Collapsed — icons only
              <div className="space-y-1 p-2">
                {filteredCategorias.map((categoria) => (
                  <div key={categoria.nome} className="space-y-0.5">
                    <button
                      onClick={() => toggleCategory(categoria.nome)}
                      className="w-full flex justify-center p-2 rounded hover:bg-amber-50 transition-colors"
                      title={categoria.nome}
                    >
                      <span className="text-lg">{categoria.icon}</span>
                    </button>

                    {expandedCategories.includes(categoria.nome) && (
                      <div className="space-y-0.5">
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
                            className={`w-full flex justify-center p-1.5 rounded text-sm transition-colors ${
                              activeTab === aba.id ? 'bg-amber-100' : 'hover:bg-amber-50'
                            }`}
                            title={aba.label}
                          >
                            <span className="text-sm">{aba.icon}</span>
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
            <div className="p-3 border-t border-amber-200 text-xs text-slate-400">
              {totalAbas} seções disponíveis
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
