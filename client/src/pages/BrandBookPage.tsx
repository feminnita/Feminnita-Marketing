import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Palette,
  Type,
  Hash,
  MessageSquare,
  Target,
  Eye,
} from "lucide-react";

type BrandBookForm = {
  corPrimaria: string;
  corSecundaria: string;
  corAcento: string;
  corTexto: string;
  fontePrimaria: string;
  fonteSecundaria: string;
  tomInstagram: string;
  tomTikTok: string;
  tomWhatsApp: string;
  tomEmail: string;
  hashtagsOficiais: string;
  hashtagsProibidas: string;
  palavrasChave: string;
  palavrasProibidas: string;
  propostaValor: string;
  diferenciais: string;
  publicoAlvo: string;
};

const EMPTY_FORM: BrandBookForm = {
  corPrimaria: "#D97706",
  corSecundaria: "#F59E0B",
  corAcento: "#FDE68A",
  corTexto: "#1E293B",
  fontePrimaria: "Inter",
  fonteSecundaria: "Playfair Display",
  tomInstagram: "",
  tomTikTok: "",
  tomWhatsApp: "",
  tomEmail: "",
  hashtagsOficiais: "",
  hashtagsProibidas: "",
  palavrasChave: "",
  palavrasProibidas: "",
  propostaValor: "",
  diferenciais: "",
  publicoAlvo: "",
};

export default function BrandBookPage() {
  const [form, setForm] = useState<BrandBookForm>(EMPTY_FORM);

  const { data, isLoading } = trpc.brandBook.get.useQuery();

  const salvar = trpc.brandBook.salvar.useMutation({
    onSuccess: () => {
      toast.success("Brand Book salvo com sucesso!");
    },
    onError: (err) => {
      toast.error("Erro ao salvar: " + err.message);
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        corPrimaria: data.corPrimaria ?? "#D97706",
        corSecundaria: data.corSecundaria ?? "#F59E0B",
        corAcento: data.corAcento ?? "#FDE68A",
        corTexto: data.corTexto ?? "#1E293B",
        fontePrimaria: data.fontePrimaria ?? "Inter",
        fonteSecundaria: data.fonteSecundaria ?? "Playfair Display",
        tomInstagram: data.tomInstagram ?? "",
        tomTikTok: data.tomTikTok ?? "",
        tomWhatsApp: data.tomWhatsApp ?? "",
        tomEmail: data.tomEmail ?? "",
        hashtagsOficiais: data.hashtagsOficiais ?? "",
        hashtagsProibidas: data.hashtagsProibidas ?? "",
        palavrasChave: data.palavrasChave ?? "",
        palavrasProibidas: data.palavrasProibidas ?? "",
        propostaValor: data.propostaValor ?? "",
        diferenciais: data.diferenciais ?? "",
        publicoAlvo: data.publicoAlvo ?? "",
      });
    }
  }, [data]);

  const handleChange = (field: keyof BrandBookForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    salvar.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse">Carregando Brand Book...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Book Digital</h1>
          <p className="text-muted-foreground mt-1">
            Guia completo de identidade visual e comunicação da Feminnita
          </p>
        </div>
        <Button onClick={handleSave} disabled={salvar.isPending} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {salvar.isPending ? "Salvando..." : "Salvar Brand Book"}
        </Button>
      </div>

      {/* Color Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview da Paleta de Cores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full border-2 border-border shadow-md"
                style={{ backgroundColor: form.corPrimaria }}
              />
              <span className="text-xs text-muted-foreground">Primária</span>
              <Badge variant="outline" className="text-xs font-mono">{form.corPrimaria}</Badge>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full border-2 border-border shadow-md"
                style={{ backgroundColor: form.corSecundaria }}
              />
              <span className="text-xs text-muted-foreground">Secundária</span>
              <Badge variant="outline" className="text-xs font-mono">{form.corSecundaria}</Badge>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full border-2 border-border shadow-md"
                style={{ backgroundColor: form.corAcento }}
              />
              <span className="text-xs text-muted-foreground">Acento</span>
              <Badge variant="outline" className="text-xs font-mono">{form.corAcento}</Badge>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full border-2 border-border shadow-md"
                style={{ backgroundColor: form.corTexto }}
              />
              <span className="text-xs text-muted-foreground">Texto</span>
              <Badge variant="outline" className="text-xs font-mono">{form.corTexto}</Badge>
            </div>
            <div
              className="ml-auto flex-1 min-w-[200px] rounded-xl p-4 shadow-inner border border-border"
              style={{ backgroundColor: form.corPrimaria }}
            >
              <p
                className="font-bold text-lg"
                style={{ fontFamily: form.fontePrimaria, color: form.corTexto }}
              >
                Feminnita
              </p>
              <p
                className="text-sm mt-1"
                style={{ fontFamily: form.fonteSecundaria, color: form.corTexto, opacity: 0.85 }}
              >
                Pijamas com elegância
              </p>
              <div
                className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: form.corAcento, color: form.corTexto }}
              >
                Nova Coleção
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="identidade" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="identidade" className="flex items-center gap-1">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Visual</span>
          </TabsTrigger>
          <TabsTrigger value="tom" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Tom de Voz</span>
          </TabsTrigger>
          <TabsTrigger value="hashtags" className="flex items-center gap-1">
            <Hash className="w-4 h-4" />
            <span className="hidden sm:inline">Hashtags</span>
          </TabsTrigger>
          <TabsTrigger value="vocabulario" className="flex items-center gap-1">
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">Vocabulário</span>
          </TabsTrigger>
          <TabsTrigger value="posicionamento" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Posiciona.</span>
          </TabsTrigger>
        </TabsList>

        {/* ── IDENTIDADE VISUAL ── */}
        <TabsContent value="identidade">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Identidade Visual
              </CardTitle>
              <CardDescription>
                Cores e tipografia que definem a marca Feminnita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                  Paleta de Cores
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="corPrimaria">Cor Primária</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="corPrimaria"
                        type="color"
                        value={form.corPrimaria}
                        onChange={(e) => handleChange("corPrimaria", e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-border"
                      />
                      <Input
                        value={form.corPrimaria}
                        onChange={(e) => handleChange("corPrimaria", e.target.value)}
                        className="font-mono"
                        placeholder="#D97706"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corSecundaria">Cor Secundária</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="corSecundaria"
                        type="color"
                        value={form.corSecundaria}
                        onChange={(e) => handleChange("corSecundaria", e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-border"
                      />
                      <Input
                        value={form.corSecundaria}
                        onChange={(e) => handleChange("corSecundaria", e.target.value)}
                        className="font-mono"
                        placeholder="#F59E0B"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corAcento">Cor de Acento</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="corAcento"
                        type="color"
                        value={form.corAcento}
                        onChange={(e) => handleChange("corAcento", e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-border"
                      />
                      <Input
                        value={form.corAcento}
                        onChange={(e) => handleChange("corAcento", e.target.value)}
                        className="font-mono"
                        placeholder="#FDE68A"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corTexto">Cor do Texto</Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="corTexto"
                        type="color"
                        value={form.corTexto}
                        onChange={(e) => handleChange("corTexto", e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer border border-border"
                      />
                      <Input
                        value={form.corTexto}
                        onChange={(e) => handleChange("corTexto", e.target.value)}
                        className="font-mono"
                        placeholder="#1E293B"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                  Tipografia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontePrimaria">Fonte Primária</Label>
                    <Input
                      id="fontePrimaria"
                      value={form.fontePrimaria}
                      onChange={(e) => handleChange("fontePrimaria", e.target.value)}
                      placeholder="Inter"
                    />
                    <p className="text-xs text-muted-foreground">Usada em títulos e destaques</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fonteSecundaria">Fonte Secundária</Label>
                    <Input
                      id="fonteSecundaria"
                      value={form.fonteSecundaria}
                      onChange={(e) => handleChange("fonteSecundaria", e.target.value)}
                      placeholder="Playfair Display"
                    />
                    <p className="text-xs text-muted-foreground">Usada em subtítulos e corpo</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={salvar.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {salvar.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TOM DE VOZ ── */}
        <TabsContent value="tom">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Tom de Voz por Canal
              </CardTitle>
              <CardDescription>
                Como a Feminnita se comunica em cada plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tomInstagram" className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">Instagram</Badge>
                </Label>
                <Textarea
                  id="tomInstagram"
                  value={form.tomInstagram}
                  onChange={(e) => handleChange("tomInstagram", e.target.value)}
                  rows={3}
                  placeholder="Ex: Acolhedor, feminino e inspirador. Use emojis com moderação..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tomTikTok" className="flex items-center gap-2">
                  <Badge className="bg-black text-white border-0">TikTok</Badge>
                </Label>
                <Textarea
                  id="tomTikTok"
                  value={form.tomTikTok}
                  onChange={(e) => handleChange("tomTikTok", e.target.value)}
                  rows={3}
                  placeholder="Ex: Energético, jovem e autêntico. CTAs diretos..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tomWhatsApp" className="flex items-center gap-2">
                  <Badge className="bg-green-600 text-white border-0">WhatsApp</Badge>
                </Label>
                <Textarea
                  id="tomWhatsApp"
                  value={form.tomWhatsApp}
                  onChange={(e) => handleChange("tomWhatsApp", e.target.value)}
                  rows={3}
                  placeholder="Ex: Direto, pessoal e caloroso. Como uma consultora de confiança..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tomEmail" className="flex items-center gap-2">
                  <Badge variant="secondary">E-mail</Badge>
                </Label>
                <Textarea
                  id="tomEmail"
                  value={form.tomEmail}
                  onChange={(e) => handleChange("tomEmail", e.target.value)}
                  rows={3}
                  placeholder="Ex: Profissional mas acessível. Assunto curto e objetivo..."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={salvar.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {salvar.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── HASHTAGS ── */}
        <TabsContent value="hashtags">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Hashtags
              </CardTitle>
              <CardDescription>
                Hashtags aprovadas e proibidas para os canais da Feminnita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hashtagsOficiais">
                  Hashtags Oficiais
                  <span className="ml-2 text-xs text-muted-foreground">(separadas por espaço ou uma por linha)</span>
                </Label>
                <Textarea
                  id="hashtagsOficiais"
                  value={form.hashtagsOficiais}
                  onChange={(e) => handleChange("hashtagsOficiais", e.target.value)}
                  rows={5}
                  placeholder="#Feminnita #PijamaFeminnita #PijamaConforto..."
                />
                {form.hashtagsOficiais && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.hashtagsOficiais
                      .split(/[\s\n]+/)
                      .filter((h) => h.startsWith("#"))
                      .map((h, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {h}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hashtagsProibidas">
                  Hashtags Proibidas / Evitar
                </Label>
                <Textarea
                  id="hashtagsProibidas"
                  value={form.hashtagsProibidas}
                  onChange={(e) => handleChange("hashtagsProibidas", e.target.value)}
                  rows={4}
                  placeholder="#Barato #Desconto — use alternativas como #OportunidadeÚnica..."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={salvar.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {salvar.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── VOCABULÁRIO ── */}
        <TabsContent value="vocabulario">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Vocabulário da Marca
              </CardTitle>
              <CardDescription>
                Palavras que reforçam (ou enfraquecem) o posicionamento da Feminnita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="palavrasChave">
                  Palavras-Chave
                  <span className="ml-2 text-xs text-muted-foreground">(use sempre que possível)</span>
                </Label>
                <Textarea
                  id="palavrasChave"
                  value={form.palavrasChave}
                  onChange={(e) => handleChange("palavrasChave", e.target.value)}
                  rows={4}
                  placeholder="conforto, qualidade, feminino, suavidade, elegância..."
                />
                {form.palavrasChave && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.palavrasChave
                      .split(/[,\n]+/)
                      .map((w) => w.trim())
                      .filter(Boolean)
                      .map((w, i) => (
                        <Badge key={i} className="text-xs bg-green-100 text-green-800 border-green-200">
                          {w}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="palavrasProibidas">
                  Palavras Proibidas
                  <span className="ml-2 text-xs text-muted-foreground">(evite em toda comunicação)</span>
                </Label>
                <Textarea
                  id="palavrasProibidas"
                  value={form.palavrasProibidas}
                  onChange={(e) => handleChange("palavrasProibidas", e.target.value)}
                  rows={4}
                  placeholder="barato, genérico, comum, simples demais..."
                />
                {form.palavrasProibidas && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.palavrasProibidas
                      .split(/[,\n]+/)
                      .map((w) => w.trim())
                      .filter(Boolean)
                      .map((w, i) => (
                        <Badge key={i} className="text-xs bg-red-100 text-red-800 border-red-200">
                          {w}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={salvar.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {salvar.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── POSICIONAMENTO ── */}
        <TabsContent value="posicionamento">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Posicionamento de Marca
              </CardTitle>
              <CardDescription>
                Proposta de valor, diferenciais e público-alvo da Feminnita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="propostaValor">Proposta de Valor</Label>
                <Textarea
                  id="propostaValor"
                  value={form.propostaValor}
                  onChange={(e) => handleChange("propostaValor", e.target.value)}
                  rows={4}
                  placeholder="O que torna a Feminnita única para seus clientes e revendedoras..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diferenciais">Diferenciais Competitivos</Label>
                <Textarea
                  id="diferenciais"
                  value={form.diferenciais}
                  onChange={(e) => handleChange("diferenciais", e.target.value)}
                  rows={4}
                  placeholder="Tecidos premium, modelagem exclusiva, entrega rápida..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicoAlvo">Público-Alvo</Label>
                <Textarea
                  id="publicoAlvo"
                  value={form.publicoAlvo}
                  onChange={(e) => handleChange("publicoAlvo", e.target.value)}
                  rows={4}
                  placeholder="Mulheres 25-50 anos, classe B/C, que valorizam qualidade..."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={salvar.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {salvar.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
