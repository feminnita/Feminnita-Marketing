import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, Check } from "lucide-react";

export default function InfluencersDashboard() {
  const { data: influencersData } = trpc.autonomousInfluencers.listInfluencers.useQuery();
  const influencers = (influencersData?.influencers ?? []).map((inf: any) => ({
    id: inf.id,
    name: inf.name,
    description: inf.personality || "Gerenciar contas de redes sociais",
  }));

  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null);
  const effectiveInfluencer = selectedInfluencer ?? influencers[0]?.id ?? 1;
  const [formData, setFormData] = useState({
    email: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    whatsapp: "",
    youtube: "",
  });
  const [saved, setSaved] = useState(false);

  const saveAccountsMutation = trpc.influencerAccounts.saveAccounts.useMutation({
    onSuccess: () => {
      toast.success("Contas salvas com sucesso!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setFormData({
        email: "",
        instagram: "",
        tiktok: "",
        facebook: "",
        whatsapp: "",
        youtube: "",
      });
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!effectiveInfluencer) {
      toast.error("Selecione uma influenciadora");
      return;
    }

    saveAccountsMutation.mutate({
      influencerId: effectiveInfluencer,
      email: formData.email || undefined,
      instagram: formData.instagram || undefined,
      tiktok: formData.tiktok || undefined,
      facebook: formData.facebook || undefined,
      whatsapp: formData.whatsapp || undefined,
      youtube: formData.youtube || undefined,
    });
  };

  const currentInfluencer = influencers.find((i) => i.id === effectiveInfluencer);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciar Influenciadoras</h1>
        <p className="text-gray-600">Gerencie as contas de redes sociais das influenciadoras</p>
      </div>

      <Tabs defaultValue="contas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contas">Contas</TabsTrigger>
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="emails">E-mails</TabsTrigger>
        </TabsList>

        <TabsContent value="contas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seletor de Influenciadora */}
            <Card>
              <CardHeader>
                <CardTitle>Selecione uma Influenciadora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {influencers.map((influencer) => (
                  <button
                    key={influencer.id}
                    onClick={() => setSelectedInfluencer(influencer.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedInfluencer === influencer.id
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    <div className="font-semibold">{influencer.name}</div>
                    <div className="text-sm text-gray-600">{influencer.description}</div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Formulário de Contas */}
            <Card>
              <CardHeader>
                <CardTitle>{currentInfluencer?.name}</CardTitle>
                <CardDescription>Gerenciar contas de redes sociais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="@usuario_instagram"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange("instagram", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    placeholder="@usuario_tiktok"
                    value={formData.tiktok}
                    onChange={(e) => handleInputChange("tiktok", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    placeholder="@usuario_youtube"
                    value={formData.youtube}
                    onChange={(e) => handleInputChange("youtube", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook/Blog</Label>
                  <Input
                    id="facebook"
                    placeholder="@usuario_facebook"
                    value={formData.facebook}
                    onChange={(e) => handleInputChange("facebook", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saveAccountsMutation.isPending}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {saveAccountsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : saved ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Salvo!
                    </>
                  ) : (
                    "Salvar Contas"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="painel">
          <Card>
            <CardHeader>
              <CardTitle>Painel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Conteúdo do painel em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>E-mails</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Gerenciamento de e-mails em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
