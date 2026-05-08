import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Download, ExternalLink, LogOut, Image, Video, Layout,
  FileText, BookOpen, Calculator, Link, GraduationCap, FolderOpen,
} from "lucide-react";

const B = "#8C2F39";
const CHAMPAGNE = "#D4A956";
const CREME = "#FAF6F2";
const PESSEGO = "#F5E6D3";
const PRETO = "#1A1A1A";

const CATEGORY_CONFIG = [
  { key: "fotos",       label: "Fotos",       icon: Image },
  { key: "videos",      label: "Vídeos",      icon: Video },
  { key: "banners",     label: "Banners",     icon: Layout },
  { key: "lookbook",    label: "Lookbook",    icon: BookOpen },
  { key: "treinamento", label: "Treinamento", icon: GraduationCap },
  { key: "calculadora", label: "Calculadora", icon: Calculator },
  { key: "links",       label: "Links",       icon: Link },
  { key: "copy",        label: "Copy",        icon: FileText },
] as const;

export default function PortalMateriaisPage() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>("fotos");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Montserrat:wght@300;400;600;700&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const { data: me } = trpc.portal.me.useQuery(undefined, {
    onError: () => setLocation("/portal/login"),
  });

  const { data: materiais = [], isLoading } = trpc.portal.materiais.useQuery(undefined, {
    enabled: !!me,
    onError: () => setLocation("/portal/login"),
  });

  const logout = trpc.portal.logout.useMutation({
    onSuccess: () => setLocation("/portal/login"),
    onError: () => setLocation("/portal/login"),
  });

  if (!me) return null;

  const grouped = CATEGORY_CONFIG.reduce((acc, cat) => {
    const items = (materiais as any[]).filter(m => m.category === cat.key);
    acc[cat.key] = items;
    return acc;
  }, {} as Record<string, any[]>);

  const activeItems = grouped[activeCategory] ?? [];

  const subcats = activeItems.reduce((acc, item) => {
    const sub = item.subcategory || "__sem_sub__";
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const hasSubs = Object.keys(subcats).some(k => k !== "__sem_sub__");
  const ActiveIcon = CATEGORY_CONFIG.find(c => c.key === activeCategory)?.icon ?? FolderOpen;
  const activeLabel = CATEGORY_CONFIG.find(c => c.key === activeCategory)?.label ?? "";

  return (
    <div style={{ minHeight: "100vh", background: CREME, fontFamily: "'Montserrat', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: `1px solid ${CHAMPAGNE}40`, padding: "0.875rem 1.25rem", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", display: "none" }}
              className="mobile-menu-btn"
            />
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: B, lineHeight: 1, letterSpacing: "0.01em" }}>
                Feminn<span style={{ color: CHAMPAGNE }}>ita</span>
              </h1>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", color: B, textTransform: "uppercase", marginTop: 2 }}>
                Sala de Arquivos
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: PRETO }}>{(me as any).name}</p>
              <p style={{ fontSize: "0.65rem", color: "#999", textTransform: "capitalize", letterSpacing: "0.04em" }}>{(me as any).profileType}</p>
            </div>
            <button
              onClick={() => logout.mutate()}
              title="Sair"
              style={{ background: "none", border: `1px solid #e8ddd5`, borderRadius: 8, padding: "0.375rem 0.75rem", cursor: "pointer", color: "#aaa", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem", fontFamily: "'Montserrat', sans-serif" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = B; (e.currentTarget as HTMLButtonElement).style.color = B; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8ddd5"; (e.currentTarget as HTMLButtonElement).style.color = "#aaa"; }}
            >
              <LogOut style={{ width: 13, height: 13 }} />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, maxWidth: 1000, margin: "0 auto", width: "100%", padding: "1.5rem 1.25rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>

        {/* Sidebar */}
        <aside style={{ width: 200, flexShrink: 0, background: "#fff", border: `1.5px solid ${CHAMPAGNE}40`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(140,47,57,0.06)" }}>
          <div style={{ padding: "0.875rem 1rem", borderBottom: `1px solid ${PESSEGO}` }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.15em", color: CHAMPAGNE, textTransform: "uppercase" }}>
              Categorias
            </p>
          </div>
          <nav>
            {CATEGORY_CONFIG.map(cat => {
              const count = grouped[cat.key]?.length ?? 0;
              const isActive = activeCategory === cat.key;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.7rem 1rem",
                    background: isActive ? `${B}08` : "transparent",
                    border: "none",
                    borderLeft: isActive ? `3px solid ${B}` : "3px solid transparent",
                    cursor: "pointer",
                    fontFamily: "'Montserrat', sans-serif",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = `${PESSEGO}80`; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <Icon style={{ width: 14, height: 14, color: isActive ? B : "#aaa", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: isActive ? 700 : 500, color: isActive ? B : "#666", flex: 1 }}>
                    {cat.label}
                  </span>
                  {count > 0 && (
                    <span style={{ fontSize: "0.65rem", background: isActive ? `${B}18` : "#f0f0f0", color: isActive ? B : "#999", borderRadius: 10, padding: "1px 6px", fontWeight: 600 }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Category header */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ padding: "0.5rem", background: `${B}10`, borderRadius: 10, border: `1px solid ${B}20` }}>
              <ActiveIcon style={{ width: 16, height: 16, color: B }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: PRETO, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.01em" }}>
                {activeLabel}
              </h2>
              <p style={{ fontSize: "0.7rem", color: "#aaa" }}>
                {activeItems.length === 0 ? "Nenhum material ainda" : `${activeItems.length} ${activeItems.length === 1 ? "material" : "materiais"}`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
              <div style={{ width: 24, height: 24, border: `2px solid ${B}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : activeItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", background: "#fff", borderRadius: 16, border: `1.5px solid ${CHAMPAGNE}30` }}>
              <ActiveIcon style={{ width: 32, height: 32, color: `${CHAMPAGNE}80`, margin: "0 auto 0.75rem" }} />
              <p style={{ fontSize: "0.9rem", color: "#bbb", fontWeight: 500 }}>Nenhum material nesta categoria ainda.</p>
              <p style={{ fontSize: "0.75rem", color: "#ccc", marginTop: "0.375rem" }}>Novos conteúdos serão adicionados em breve.</p>
            </div>
          ) : hasSubs ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {Object.entries(subcats).map(([sub, items]) => (
                <div key={sub}>
                  {sub !== "__sem_sub__" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <div style={{ height: 1, width: 16, background: CHAMPAGNE }} />
                      <p style={{ fontSize: "0.65rem", fontWeight: 700, color: CHAMPAGNE, letterSpacing: "0.12em", textTransform: "uppercase" }}>{sub}</p>
                      <div style={{ height: 1, flex: 1, background: `${CHAMPAGNE}30` }} />
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.625rem" }}>
                    {(items as any[]).map((m: any) => <MaterialCard key={m.id} material={m} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.625rem" }}>
              {activeItems.map((m: any) => <MaterialCard key={m.id} material={m} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function MaterialCard({ material }: { material: any }) {
  const isDownload = material.filename || ["fotos", "videos", "banners", "lookbook"].includes(material.category);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", background: "#fff", borderRadius: 12, border: `1.5px solid #f0eae4`, transition: "border-color 0.15s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${CHAMPAGNE}70`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#f0eae4"; }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: PRETO, lineHeight: 1.3 }}>{material.title}</p>
        {material.description && (
          <p style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{material.description}</p>
        )}
      </div>
      <a
        href={material.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.875rem", borderRadius: 8, background: B, color: "#fff", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.05em", textDecoration: "none", textTransform: "uppercase", transition: "background 0.15s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "#5C1A22"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = B; }}
      >
        {isDownload ? <Download style={{ width: 11, height: 11 }} /> : <ExternalLink style={{ width: 11, height: 11 }} />}
        {isDownload ? "Baixar" : "Acessar"}
      </a>
    </div>
  );
}
