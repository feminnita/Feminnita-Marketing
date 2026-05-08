import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Download, ExternalLink, LogOut, Image, Video, Layout,
  FileText, BookOpen, Calculator, Link, ChevronDown, ChevronRight,
  GraduationCap, FolderOpen,
} from "lucide-react";

const CATEGORY_CONFIG = [
  { key: "fotos",       label: "Fotos",       icon: Image,         color: "bg-pink-50 text-pink-600 border-pink-200" },
  { key: "videos",      label: "Vídeos",      icon: Video,         color: "bg-purple-50 text-purple-600 border-purple-200" },
  { key: "banners",     label: "Banners",     icon: Layout,        color: "bg-blue-50 text-blue-600 border-blue-200" },
  { key: "lookbook",    label: "Lookbook",    icon: BookOpen,      color: "bg-amber-50 text-amber-600 border-amber-200" },
  { key: "treinamento", label: "Treinamento", icon: GraduationCap, color: "bg-green-50 text-green-600 border-green-200" },
  { key: "calculadora", label: "Calculadora", icon: Calculator,    color: "bg-orange-50 text-orange-600 border-orange-200" },
  { key: "links",       label: "Links",       icon: Link,          color: "bg-slate-50 text-slate-600 border-slate-200" },
  { key: "copy",        label: "Copy",        icon: FileText,      color: "bg-rose-50 text-rose-600 border-rose-200" },
] as const;

export default function PortalMateriaisPage() {
  const [, setLocation] = useLocation();

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

  // Group by category → subcategory
  const grouped = CATEGORY_CONFIG.reduce((acc, cat) => {
    const items = (materiais as any[]).filter(m => m.category === cat.key);
    if (items.length > 0) acc[cat.key] = items;
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-rose-50">
      <header className="bg-white border-b border-rose-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-rose-500" />
            <div>
              <h1 className="text-base font-bold text-rose-700 leading-none">Sala de Arquivos</h1>
              <p className="text-xs text-rose-400">Feminnita</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{(me as any).name}</p>
              <p className="text-xs text-gray-400 capitalize">{(me as any).profileType}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => logout.mutate()} className="text-gray-400 hover:text-rose-600">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum material disponível ainda.</p>
          </div>
        ) : (
          CATEGORY_CONFIG.filter(c => grouped[c.key]).map(cat => (
            <CategoryGroup
              key={cat.key}
              category={cat}
              items={grouped[cat.key]}
            />
          ))
        )}
      </main>
    </div>
  );
}

function CategoryGroup({ category, items }: { category: typeof CATEGORY_CONFIG[number]; items: any[] }) {
  const [open, setOpen] = useState(true);
  const Icon = category.icon;

  // Group by subcategory within this category
  const subcats = items.reduce((acc, item) => {
    const sub = item.subcategory || "__sem_sub__";
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const hasSubs = Object.keys(subcats).some(k => k !== "__sem_sub__");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className={`p-2 rounded-lg border ${category.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-semibold text-gray-800 flex-1 text-left">{category.label}</span>
        <span className="text-xs text-gray-400 mr-2">{items.length} {items.length === 1 ? "item" : "itens"}</span>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-4">
          {hasSubs ? (
            Object.entries(subcats).map(([sub, subItems]) => (
              <div key={sub}>
                {sub !== "__sem_sub__" && (
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{sub}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {subItems.map((m: any) => <MaterialCard key={m.id} material={m} />)}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((m: any) => <MaterialCard key={m.id} material={m} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MaterialCard({ material }: { material: any }) {
  const isDownload = material.filename || ["fotos", "videos", "banners", "lookbook"].includes(material.category);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50/30 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-snug">{material.title}</p>
        {material.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{material.description}</p>
        )}
      </div>
      <a
        href={material.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
      >
        {isDownload ? <Download className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
        {isDownload ? "Baixar" : "Acessar"}
      </a>
    </div>
  );
}
