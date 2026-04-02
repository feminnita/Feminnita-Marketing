import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Users, Mail, Instagram, Music, Facebook, MessageCircle, Youtube } from "lucide-react";

interface AccountFormData {
  email: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  whatsapp: string;
  youtube: string;
}

export default function InfluencerAccountsPage() {
  const { data: influencersData } = trpc.autonomousInfluencers.listInfluencers.useQuery();
  const INFLUENCERS = (influencersData?.influencers ?? []).map((inf: any) => ({ id: inf.id, name: inf.name }));

  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null);
  const resolvedInfluencer = selectedInfluencer ?? INFLUENCERS[0]?.id ?? 1;
  const [formData, setFormData] = useState<AccountFormData>({
    email: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    whatsapp: "",
    youtube: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Buscar contas existentes
  const { data: existingAccounts } = trpc.influencerAccounts.getAccounts.useQuery({
    influencerId: resolvedInfluencer,
  });

  // Preencher formulário quando mudar de influenciadora ou carregar dados
  React.useEffect(() => {
    if (existingAccounts && typeof existingAccounts === 'object') {
      const accounts = existingAccounts as any;
      setFormData({
        email: accounts.email || "",
        instagram: accounts.instagram || "",
        tiktok: accounts.tiktok || "",
        facebook: accounts.facebook || "",
        whatsapp: accounts.whatsapp || "",
        youtube: accounts.youtube || "",
      });
    } else {
      setFormData({
        email: "",
        instagram: "",
        tiktok: "",
        facebook: "",
        whatsapp: "",
        youtube: "",
      });
    }
  }, [existingAccounts, resolvedInfluencer]);

  // Mutation para salvar
  const saveAccountsMutation = trpc.influencerAccounts.saveAccounts.useMutation({
    onSuccess: () => {
      setMessage({ type: "success", text: "✅ Contas salvas com sucesso!" });
      setTimeout(() => setMessage(null), 3000);
      setLoading(false);
    },
    onError: (error) => {
      setMessage({ type: "error", text: `❌ Erro: ${error.message}` });
      setLoading(false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    saveAccountsMutation.mutate({
      influencerId: resolvedInfluencer,
      ...formData,
    });
  };

  const currentInfluencer = INFLUENCERS.find((inf) => inf.id === resolvedInfluencer);

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Users className="w-8 h-8" style={{ color: "#A63D4A" }} />
            Contas das Influenciadoras
          </h1>
          <p className="text-gray-600">Gerencie as contas de Instagram, TikTok, YouTube e outras plataformas para cada influenciadora</p>
        </div>

        {/* Seletor de Influenciadora */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecione uma Influenciadora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {INFLUENCERS.map((influencer) => (
                <button
                  key={influencer.id}
                  onClick={() => setSelectedInfluencer(influencer.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedInfluencer === influencer.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-center">{influencer.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Contas de {currentInfluencer?.name}</CardTitle>
            <CardDescription>Adicione ou atualize as contas sociais desta influenciadora</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  name="instagram"
                  placeholder="@usuario_instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                />
              </div>

              {/* TikTok */}
              <div className="space-y-2">
                <Label htmlFor="tiktok" className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  name="tiktok"
                  placeholder="@usuario_tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                />
              </div>

              {/* Facebook */}
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  name="facebook"
                  placeholder="usuario.facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  placeholder="(11) 99999-9999"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                />
              </div>

              {/* YouTube */}
              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  <Youtube className="w-4 h-4" />
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  name="youtube"
                  placeholder="@usuario_youtube"
                  value={formData.youtube}
                  onChange={handleInputChange}
                />
              </div>

              {/* Mensagem de Feedback */}
              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Botão de Salvar */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                style={{ backgroundColor: "#A63D4A" }}
              >
                {loading ? "Salvando..." : "💾 Salvar Contas"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
