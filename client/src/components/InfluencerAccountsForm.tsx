import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Instagram, Music, Facebook, MessageCircle, Youtube } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface InfluencerAccountsFormProps {
  influencerId: number;
  influencerName: string;
  onSaved?: () => void;
}

export function InfluencerAccountsForm({
  influencerId,
  influencerName,
  onSaved,
}: InfluencerAccountsFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    whatsapp: "",
    youtube: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Buscar contas existentes
  const { data: existingAccounts } = trpc.influencerAccounts.getAccounts.useQuery({
    influencerId,
  });

  // Preencher formulário com contas existentes
  React.useEffect(() => {
    if (existingAccounts && typeof existingAccounts === 'object' && 'email' in existingAccounts) {
      const accounts = existingAccounts as any;
      setFormData({
        email: accounts.email || "",
        instagram: accounts.instagram || "",
        tiktok: accounts.tiktok || "",
        facebook: accounts.facebook || "",
        whatsapp: accounts.whatsapp || "",
        youtube: accounts.youtube || "",
      });
    }
  }, [existingAccounts]);

  // Mutation para salvar contas
  const saveAccountsMutation = trpc.influencerAccounts.saveAccounts.useMutation({
    onSuccess: () => {
      setMessage({ type: "success", text: "✅ Contas salvas com sucesso!" });
      setTimeout(() => setMessage(null), 3000);
      onSaved?.();
    },
    onError: (error) => {
      setMessage({ type: "error", text: `❌ Erro: ${error.message}` });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAccountsMutation.mutateAsync({
        influencerId,
        email: formData.email || undefined,
        instagram: formData.instagram || undefined,
        tiktok: formData.tiktok || undefined,
        facebook: formData.facebook || undefined,
        whatsapp: formData.whatsapp || undefined,
        youtube: formData.youtube || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="w-5 h-5" style={{ color: "#A63D4A" }} />
          Contas de {influencerName}
        </CardTitle>
        <CardDescription>Adicione as contas de redes sociais para enviar postagens automaticamente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <Input
              type="email"
              name="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="flex-1"
            />
          </div>

          {/* Instagram */}
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-pink-600" />
            <Input
              type="text"
              name="instagram"
              placeholder="@seu_instagram"
              value={formData.instagram}
              onChange={handleChange}
              className="flex-1"
            />
          </div>

          {/* TikTok */}
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-black" />
            <Input
              type="text"
              name="tiktok"
              placeholder="@seu_tiktok"
              value={formData.tiktok}
              onChange={handleChange}
              className="flex-1"
            />
          </div>

          {/* Facebook */}
          <div className="flex items-center gap-2">
            <Facebook className="w-4 h-4 text-blue-600" />
            <Input
              type="text"
              name="facebook"
              placeholder="seu_facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="flex-1"
            />
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-green-600" />
            <Input
              type="tel"
              name="whatsapp"
              placeholder="11999999999"
              value={formData.whatsapp}
              onChange={handleChange}
              className="flex-1"
            />
          </div>

          {/* YouTube */}
          <div className="flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-600" />
            <Input
              type="text"
              name="youtube"
              placeholder="@seu_youtube"
              value={formData.youtube}
              onChange={handleChange}
              className="flex-1"
            />
          </div>
        </div>

        {/* Botão Salvar */}
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full text-white"
          style={{ backgroundColor: "#A63D4A" }}
        >
          {isSaving ? "Salvando..." : "💾 Salvar Contas"}
        </Button>
      </CardContent>
    </Card>
  );
}
