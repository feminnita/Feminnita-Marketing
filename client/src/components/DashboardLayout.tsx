import { useAuth } from "@/_core/hooks/useAuth";
import c4xLogo from "@/assets/c4x-logo.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard, LogOut, PanelLeft, Users, Calendar,
  BookOpen, Newspaper, CheckCircle, Brain, MessageCircle,
  Bell, Image, Briefcase, TrendingUp, ChevronDown, ChevronRight,
  Settings, Megaphone, BarChart2, Bot, ShoppingBag, Music, Video, ClipboardCheck, Globe, Pencil, Zap,
  AlertTriangle, X, ExternalLink,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import ChatWidget from "./ChatWidget";

// ─── Banner diário da Fernanda ────────────────────────────────────────────────

function FernandaMorningBanner() {
  const today = new Date().toISOString().slice(0, 10);
  const dismissKey = `fernanda_briefing_dismissed_${today}`;
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(dismissKey));
  const [, setLocation] = useLocation();

  const { data } = trpc.morningBriefing.getToday.useQuery(undefined, {
    enabled: !dismissed,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (dismissed || !data) return null;

  const topAlert = data.topAlerts?.[0];
  const highCount = data.highPriorityActions ?? 0;

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, "1");
    setDismissed(true);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-rose-900 to-pink-800 text-white text-sm flex-shrink-0">
      <img
        src="/agents/fernanda.jpg"
        alt="Fernanda"
        className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0 border border-rose-400"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
      <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
        <span className="font-semibold text-rose-200 flex-shrink-0">Fernanda — {today}</span>
        {data.pathTo100k && (
          <span className="text-white/90 truncate">{data.pathTo100k}</span>
        )}
        {topAlert && (
          <span className="flex items-center gap-1 text-amber-300 flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
            {topAlert}
          </span>
        )}
        {highCount > 0 && (
          <span className="bg-rose-700 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
            {highCount} ação{highCount > 1 ? "ões" : ""} prioritária{highCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <button
        onClick={() => { setLocation("/briefing"); handleDismiss(); }}
        className="flex items-center gap-1 text-xs text-rose-200 hover:text-white transition-colors flex-shrink-0 underline underline-offset-2"
      >
        Ver briefing completo
        <ExternalLink className="w-3 h-3" />
      </button>
      <button
        onClick={handleDismiss}
        className="p-1 hover:bg-rose-700 rounded transition-colors flex-shrink-0"
        title="Dispensar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const influencers = [
  { id: 1, name: "Carol", emoji: "👩‍👧‍👦" },
  { id: 2, name: "Renata", emoji: "👩‍💼" },
  { id: 3, name: "Vanessa", emoji: "🎨" },
  { id: 4, name: "Luiza", emoji: "💪" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  const isDevelopment = import.meta.env.DEV;
  if (!isDevelopment && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Acesso restrito
          </h1>
          <Button onClick={() => { window.location.href = getLoginUrl(); }} size="lg" className="w-full">
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
      <ChatWidget />
    </SidebarProvider>
  );
}

function NavItem({ icon: Icon, label, path, location, setLocation, isCollapsed }: any) {
  const isActive = location === path;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => setLocation(path)}
        tooltip={label}
        className="h-9 font-normal"
      >
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function CollapsibleGroup({ icon: Icon, label, children, defaultOpen = false }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => setOpen(!open)} className="h-9 font-medium">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{label}</span>
        {open ? <ChevronDown className="h-3 w-3 shrink-0 ml-auto" /> : <ChevronRight className="h-3 w-3 shrink-0 ml-auto" />}
      </SidebarMenuButton>
      {open && (
        <SidebarMenuSub style={{ overflow: 'hidden' }}>
          {children}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

function InfluencerGroup({ influencer, location, setLocation }: any) {
  const [open, setOpen] = useState(false);
  const isAnyActive = location === `/influenciadora/${influencer.id}` || location === `/blog/${influencer.id}`;
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton onClick={() => setOpen(!open)} className="font-medium cursor-pointer">
        <span>{influencer.emoji}</span>
        <span className="flex-1">{influencer.name}</span>
        {open ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronRight className="h-3 w-3 ml-auto" />}
      </SidebarMenuSubButton>
      {open && (
        <div className="ml-4 mt-1 space-y-1">
          <button
            onClick={() => setLocation(`/influenciadora/${influencer.id}`)}
            className={`w-full text-left text-xs px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
              location === `/influenciadora/${influencer.id}`
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3 w-3" /> Perfil
          </button>
          <button
            onClick={() => setLocation(`/blog/${influencer.id}`)}
            className={`w-full text-left text-xs px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
              location === `/blog/${influencer.id}`
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Newspaper className="h-3 w-3" /> Blog
          </button>
        </div>
      )}
    </SidebarMenuSubItem>
  );
}

function DashboardLayoutContent({ children, setSidebarWidth }: {
  children: React.ReactNode;
  setSidebarWidth: (w: number) => void;
}) {
  const { user, logout, refresh } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => { refresh(); setEditNameOpen(false); },
  });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - left;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => { setIsResizing(false); };
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          <SidebarHeader className="justify-center py-3" style={{ overflow: "visible" }}>
            <div className="flex flex-col gap-2 px-2 w-full" style={{ overflow: "visible" }}>
              <button
                onClick={toggleSidebar}
                className="h-7 w-7 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none shrink-0"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed && (
                <img
                  src={c4xLogo}
                  alt="C4X Soluções IA"
                  className="w-full cursor-pointer hover:opacity-80 transition-opacity object-contain"
                  style={{ height: "215px" }}
                  onClick={() => setLocation("/")}
                />
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1 space-y-0.5">

              {/* Início */}
              <NavItem icon={LayoutDashboard} label="Início" path="/" location={location} setLocation={setLocation} />

              {/* Influenciadoras */}
              <CollapsibleGroup icon={Users} label="Influenciadoras" defaultOpen>
                {influencers.map(inf => (
                  <InfluencerGroup key={inf.id} influencer={inf} location={location} setLocation={setLocation} />
                ))}
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/contas-influenciadoras")}>
                    <Users className="h-3 w-3" /> Contas IG
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/blog-publico")}>
                    <Newspaper className="h-3 w-3" /> Blog Feminnita
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </CollapsibleGroup>

              {/* Conteúdo */}
              <CollapsibleGroup icon={Calendar} label="Conteúdo">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/agendar-posts")}>
                    <Calendar className="h-3 w-3" /> Agendar Posts
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/agendador-postagens")}>
                    <Calendar className="h-3 w-3" /> Agendador
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/dashboard-aprovacao")}>
                    <CheckCircle className="h-3 w-3" /> Aprovar Posts
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/banco-imagens")}>
                    <Image className="h-3 w-3" /> Banco de Imagens
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </CollapsibleGroup>

              {/* Marketing */}
              <CollapsibleGroup icon={Megaphone} label="Marketing">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/traffic-manager")}>
                    <Bot className="h-3 w-3" /> Gestor de Tráfego IA
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/meta-ads-campaigns")}>
                    <Megaphone className="h-3 w-3" /> Campanhas Meta Ads
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/analytics")}>
                    <BarChart2 className="h-3 w-3" /> Analytics
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/relatorio-performance")}>
                    <TrendingUp className="h-3 w-3" /> Relatório Performance
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/campanhas")}>
                    <Megaphone className="h-3 w-3" /> Campanhas
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/automaciones")}>
                    <CheckCircle className="h-3 w-3" /> Automações
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </CollapsibleGroup>

              {/* Equipe IA */}
              <CollapsibleGroup icon={Briefcase} label="Equipe IA">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/acoes-agentes")}>
                    <Bot className="h-3 w-3" /> Ações da Equipe IA
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/briefing")}>
                    <Zap className="h-3 w-3" /> Briefing Matinal
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/equipe-marketing")}>
                    <Briefcase className="h-3 w-3" /> Equipe de Marketing
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/traffic-manager")}>
                    <Bot className="h-3 w-3" /> Fernanda — Meta Ads
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/duda-seo")}>
                    <Globe className="h-3 w-3" /> Duda — SEO Site
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/any-afiliadas")}>
                    <Settings className="h-3 w-3" /> Any — Afiliadas Tray
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/agente/sofia")}>
                    <TrendingUp className="h-3 w-3" /> Sofia — Instagram
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/agente/clara")}>
                    <BarChart2 className="h-3 w-3" /> Clara — Mercado
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/agente/mariana")}>
                    <Megaphone className="h-3 w-3" /> Mariana — Vendas
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/colaboradores")}>
                    <Users className="h-3 w-3" /> Colaboradores
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </CollapsibleGroup>

              {/* Marketplaces */}
              <CollapsibleGroup icon={ShoppingBag} label="Marketplaces">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/tiktok-shop")}>
                    <Music className="h-3 w-3" /> TikTok — Lia (Shop)
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/tiktok-team")}>
                    <Music className="h-3 w-3" /> TikTok — Visão Geral
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/tiktok/luna")}>
                    <Music className="h-3 w-3" /> Luna — TikTok Ads
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/tiktok/maya")}>
                    <Music className="h-3 w-3" /> Maya — LIVE Commerce
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/tiktok/zara")}>
                    <Music className="h-3 w-3" /> Zara — Afiliados
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/tiktok/nina")}>
                    <Music className="h-3 w-3" /> Nina — Conteúdo
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/tiktok/marcela")}>
                    <Music className="h-3 w-3" /> Marcela — Shop
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => { setLocation("/tiktok-team"); window.dispatchEvent(new CustomEvent("tiktok-tab", { detail: "videos" })); }}>
                    <Video className="h-3 w-3" /> TikTok — Vídeos
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => { setLocation("/tiktok-team"); window.dispatchEvent(new CustomEvent("tiktok-tab", { detail: "studio" })); }}>
                    <Video className="h-3 w-3" /> TikTok — Studio ✨
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/tiktok-live")}>
                    <Video className="h-3 w-3" /> TikTok LIVE
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/ml-ads")}>
                    <ShoppingBag className="h-3 w-3" /> ML — Ads IA
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/ml-gabi")}>
                    <ShoppingBag className="h-3 w-3" /> ML — Gabi
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/shopee-ads")}>
                    <ShoppingBag className="h-3 w-3" /> Shopee — Ads IA
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/shopee-luiza")}>
                    <ShoppingBag className="h-3 w-3" /> Shopee — Luiza Ads
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/amazon")}>
                    <ShoppingBag className="h-3 w-3" /> Amazon IA
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/amazon-alice")}>
                    <ShoppingBag className="h-3 w-3" /> Amazon — Alice Ads
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/shein-isabela")}>
                    <ShoppingBag className="h-3 w-3" /> Shein — Isabela
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </CollapsibleGroup>

              {/* WhatsApp & IA */}
              <CollapsibleGroup icon={MessageCircle} label="WhatsApp & IA">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/whatsapp-setup")}>
                    <MessageCircle className="h-3 w-3" /> WhatsApp Setup
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/whatsapp-baileys")}>
                    <MessageCircle className="h-3 w-3" /> WhatsApp Baileys
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/whatsapp-notifications")}>
                    <Bell className="h-3 w-3" /> Notificações
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/whatsapp-funnel")}>
                    <MessageCircle className="h-3 w-3" /> Lia — Funil Vendas
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/ia-treinamento")}>
                    <Brain className="h-3 w-3" /> Treinar IA
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </CollapsibleGroup>

              {/* Configurações */}
              <CollapsibleGroup icon={Settings} label="Configurações">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/knowledge-center")}>
                    <Brain className="h-3 w-3" /> Central de Conhecimento
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/integration-guide")}>
                    <BookOpen className="h-3 w-3" /> Guia de Integrações
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton onClick={() => setLocation("/performance")}>
                    <BarChart2 className="h-3 w-3" /> Performance
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </CollapsibleGroup>

            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left focus:outline-none">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-none" style={{ color: '#FAF6EE' }}>{user?.name || user?.email || "-"}</p>
                      <p className="text-xs truncate mt-1" style={{ color: '#64748b' }}>{user?.email || "-"}</p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => { setNameInput(user?.name || ""); setEditNameOpen(true); }} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Editar nome</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <Dialog open={editNameOpen} onOpenChange={setEditNameOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Como você quer ser chamada?</DialogTitle>
            </DialogHeader>
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ex: Cris, Isa, Carol..."
              onKeyDown={(e) => { if (e.key === "Enter" && nameInput.trim()) updateProfile.mutate({ name: nameInput.trim() }); }}
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditNameOpen(false)}>Cancelar</Button>
              <Button
                onClick={() => { if (nameInput.trim()) updateProfile.mutate({ name: nameInput.trim() }); }}
                disabled={!nameInput.trim() || updateProfile.isPending}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => { if (!isCollapsed) setIsResizing(true); }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="flex flex-col h-svh overflow-hidden">
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur sticky top-0 z-40">
            <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
          </div>
        )}
        <FernandaMorningBanner />
        <div className="flex-1 min-h-0 p-4 flex flex-col overflow-y-auto">{children}</div>
      </SidebarInset>
    </>
  );
}
