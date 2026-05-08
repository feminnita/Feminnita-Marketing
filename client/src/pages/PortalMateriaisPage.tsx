import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, ExternalLink, LogOut, Image, Video, Layout, FileText, BookOpen, Calculator, Link } from "lucide-react";

const CATEGORIES = [
  { key: "todos", label: "Todos" },
  { key: "fotos", label: "Fotos", icon: Image },
  { key: "videos", label: "Vídeos", icon: Video },
  { key: "banners", label: "Banners", icon: Layout },
  { key: "copy", label: "Copy", icon: FileText },
  { key: "lookbook", label: "Lookbook", icon: BookOpen },
  { key: "calculadora", label: "Calculadora", icon: Calculator },
  { key: "links", label: "Links", icon: Link },
] as const;

export default function PortalMateriaisPage() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>("todos");

  const { data: me } = trpc.portal.me.useQuery();
  const { data: materiais = [], isLoading } = trpc.portal.materiais.useQuery(undefined, {
    enabled: !!me,
    onError: () => setLocation("/portal/login"),
  });

  const logout = trpc.portal.logout.useMutation({
    onSuccess: () => setLocation("/portal/login"),
    onError: () => setLocation("/portal/login"),
  });

  if (!me) {
    setLocation("/portal/login");
    return null;
  }

  const filtered = activeCategory === "todos"
    ? materiais
    : materiais.filter((m: any) => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-rose-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-rose-700">Feminnita</h1>
            <p className="text-xs text-rose-400">Sala de Arquivos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{(me as any).name}</p>
              <p className="text-xs text-gray-400 capitalize">{(me as any).profileType}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout.mutate()}
              className="text-gray-400 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Materiais</h2>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-rose-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-rose-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhum material disponível nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((material: any) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function MaterialCard({ material }: { material: any }) {
  const categoryIcon: Record<string, React.ReactNode> = {
    fotos: <Image className="h-5 w-5 text-rose-400" />,
    videos: <Video className="h-5 w-5 text-rose-400" />,
    banners: <Layout className="h-5 w-5 text-rose-400" />,
    copy: <FileText className="h-5 w-5 text-rose-400" />,
    lookbook: <BookOpen className="h-5 w-5 text-rose-400" />,
    calculadora: <Calculator className="h-5 w-5 text-rose-400" />,
    links: <Link className="h-5 w-5 text-rose-400" />,
  };

  const isDownload = material.filename || ["fotos", "videos", "banners", "lookbook"].includes(material.category);

  return (
    <div className="bg-white rounded-xl border border-rose-100 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-rose-50 rounded-lg">
          {categoryIcon[material.category] ?? <FileText className="h-5 w-5 text-rose-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 text-sm leading-snug">{material.title}</p>
          {material.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{material.description}</p>
          )}
          <span className="inline-block mt-1 text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full capitalize">
            {material.category}
          </span>
        </div>
      </div>
      <a
        href={material.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
      >
        {isDownload ? <Download className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
        {isDownload ? "Baixar" : "Acessar"}
      </a>
    </div>
  );
}
