import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Instagram, Facebook, Music, MessageCircle, Youtube } from "lucide-react";

interface InfluencerAccount {
  email?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  whatsapp?: string;
  youtube?: string;
}

interface Props {
  influencerName: string;
  onSave: (accounts: InfluencerAccount) => void;
  initialData?: InfluencerAccount;
}

export function InfluencerAccountsModal({ influencerName, onSave, initialData }: Props) {
  const [accounts, setAccounts] = useState<InfluencerAccount>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (field: keyof InfluencerAccount, value: string) => {
    setAccounts(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave(accounts);
      setMessage("✅ Contas salvas com sucesso!");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Erro ao salvar contas");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full border-pink-200 bg-pink-50">
      <CardHeader>
        <CardTitle className="text-pink-600">Contas de {influencerName}</CardTitle>
        <CardDescription>Adicione as contas de redes sociais para enviar postagens automaticamente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email */}
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-pink-600" />
          <Input
            placeholder="Email"
            value={accounts.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Instagram */}
        <div className="flex items-center gap-3">
          <Instagram className="w-5 h-5 text-pink-600" />
          <Input
            placeholder="Instagram (@usuario)"
            value={accounts.instagram || ""}
            onChange={(e) => handleChange("instagram", e.target.value)}
            className="flex-1"
          />
        </div>

        {/* TikTok */}
        <div className="flex items-center gap-3">
          <Music className="w-5 h-5 text-pink-600" />
          <Input
            placeholder="TikTok (@usuario)"
            value={accounts.tiktok || ""}
            onChange={(e) => handleChange("tiktok", e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Facebook */}
        <div className="flex items-center gap-3">
          <Facebook className="w-5 h-5 text-pink-600" />
          <Input
            placeholder="Facebook (URL ou ID)"
            value={accounts.facebook || ""}
            onChange={(e) => handleChange("facebook", e.target.value)}
            className="flex-1"
          />
        </div>

        {/* WhatsApp */}
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-pink-600" />
          <Input
            placeholder="WhatsApp (11999999999)"
            value={accounts.whatsapp || ""}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            className="flex-1"
          />
        </div>

        {/* YouTube */}
        <div className="flex items-center gap-3">
          <Youtube className="w-5 h-5 text-pink-600" />
          <Input
            placeholder="YouTube (URL ou ID)"
            value={accounts.youtube || ""}
            onChange={(e) => handleChange("youtube", e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Botão Salvar */}
        <div className="pt-4 space-y-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isSaving ? "Salvando..." : "💾 Salvar Contas"}
          </Button>

          {message && (
            <div className={`text-center text-sm font-medium ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}>
              {message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
