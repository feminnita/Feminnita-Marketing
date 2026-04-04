import { Palette, ExternalLink, BookOpen, Image, FileText, Layout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BRAND_KIT_ID = "kAGCCKIsNnA";

const DESIGNS = [
  {
    id: "DAGPOx2wA_Y",
    title: "CATÁLOGO FEMINNITA 2025",
    pages: 98,
    category: "Catálogo",
    editUrl: "https://www.canva.com/d/wmVPPo8M2H1ropd",
    icon: <BookOpen className="w-4 h-4" />,
    color: "#8B2635",
    bg: "#fdf0e8",
  },
  {
    id: "DAGD4_ibkgI",
    title: "CATÁLOGO FEMINNITA ATACADO",
    pages: 49,
    category: "Catálogo",
    editUrl: "https://www.canva.com/d/7-4VpImG71m2XZm",
    icon: <BookOpen className="w-4 h-4" />,
    color: "#8B2635",
    bg: "#fdf0e8",
  },
  {
    id: "DAGzVbIq3xY",
    title: "Identidade visual Feminnita",
    pages: 4,
    category: "Branding",
    editUrl: "https://www.canva.com/d/fTDNe-XVZy9sCxz",
    icon: <Palette className="w-4 h-4" />,
    color: "#6B7A3A",
    bg: "#f0f4e8",
  },
  {
    id: "DAGE2cL0IHI",
    title: "Stories",
    pages: 117,
    category: "Social",
    editUrl: "https://www.canva.com/d/NkpE4O4rh14iGEc",
    icon: <Image className="w-4 h-4" />,
    color: "#3A5A6B",
    bg: "#e8f0f4",
  },
  {
    id: "DAGJFCpNrWQ",
    title: "SITE VALORES FEMINNITA 2026",
    pages: 4,
    category: "Site",
    editUrl: "https://www.canva.com/design/DAGJFCpNrWQ/edit",
    icon: <Layout className="w-4 h-4" />,
    color: "#A63D4A",
    bg: "#fdecea",
  },
  {
    id: "DAG0dn9qXU4",
    title: "BANNER HEAD PC",
    pages: 14,
    category: "Site",
    editUrl: "https://www.canva.com/design/DAG0dn9qXU4/edit",
    icon: <Layout className="w-4 h-4" />,
    color: "#A63D4A",
    bg: "#fdecea",
  },
  {
    id: "DAGF9CTgMMc",
    title: "Banner site Desktop",
    pages: 43,
    category: "Site",
    editUrl: "https://www.canva.com/design/DAGF9CTgMMc/edit",
    icon: <Layout className="w-4 h-4" />,
    color: "#A63D4A",
    bg: "#fdecea",
  },
  {
    id: "DAHFDTzrcxk",
    title: "Porque escolher feminnita?",
    pages: 6,
    category: "Marketing",
    editUrl: "https://www.canva.com/design/DAHFDTzrcxk/edit",
    icon: <FileText className="w-4 h-4" />,
    color: "#6B7A3A",
    bg: "#f0f4e8",
  },
  {
    id: "social_consumidor",
    title: "Post Semana do Consumidor",
    pages: null,
    category: "Social",
    editUrl: "https://www.canva.com/search?q=Feminnita",
    icon: <Image className="w-4 h-4" />,
    color: "#3A5A6B",
    bg: "#e8f0f4",
  },
  {
    id: "social_feedback",
    title: "Story momento feedback",
    pages: null,
    category: "Social",
    editUrl: "https://www.canva.com/search?q=Feminnita",
    icon: <Image className="w-4 h-4" />,
    color: "#3A5A6B",
    bg: "#e8f0f4",
  },
];

const CATEGORIES = ["Todos", "Catálogo", "Branding", "Social", "Site", "Marketing"];

const CATEGORY_COLORS: Record<string, string> = {
  Catálogo: "bg-rose-100 text-rose-700",
  Branding: "bg-green-100 text-green-700",
  Social: "bg-blue-100 text-blue-700",
  Site: "bg-orange-100 text-orange-700",
  Marketing: "bg-purple-100 text-purple-700",
};

export function IntegracaoCanvaSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Canva — Designs Feminnita</h2>
        <p className="text-slate-500 text-sm mt-1">
          Seus designs reais no Canva. Clique em qualquer card para editar diretamente.
        </p>
      </div>

      {/* Brand kit info */}
      <Card className="border-0 shadow-sm" style={{ backgroundColor: '#fdf0e8' }}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8B2635' }}>
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Brand Kit Feminnita</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{BRAND_KIT_ID}</p>
              </div>
            </div>
            <a
              href={`https://www.canva.com/brand/kits/${BRAND_KIT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg"
              style={{ color: '#8B2635', backgroundColor: 'rgba(139,38,53,0.08)' }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir brand kit
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Designs", value: "25+" },
          { label: "Páginas totais", value: "330+" },
          { label: "Categorias", value: String(CATEGORIES.length - 1) },
        ].map(({ label, value }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold" style={{ color: '#8B2635' }}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Design grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Seus Designs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DESIGNS.map((d) => (
            <a
              key={d.id}
              href={d.editUrl}
              target="_blank"
              rel="noreferrer"
              className="block group"
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: d.bg, color: d.color }}
                      >
                        {d.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm leading-tight truncate group-hover:underline">
                          {d.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge className={`text-xs ${CATEGORY_COLORS[d.category] ?? 'bg-slate-100 text-slate-600'}`}>
                            {d.category}
                          </Badge>
                          {d.pages && (
                            <span className="text-xs text-slate-400">{d.pages} páginas</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-1 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: '#8B2635' }} />
            Atalhos rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Todos os designs", url: "https://www.canva.com/your-projects/", desc: "Ver biblioteca completa" },
              { label: "Criar novo design", url: "https://www.canva.com/create/", desc: "Começar do zero" },
              { label: "Buscar Feminnita", url: "https://www.canva.com/search?q=Feminnita", desc: "Buscar por nome" },
            ].map(({ label, url, desc }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#8B2635' }} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
