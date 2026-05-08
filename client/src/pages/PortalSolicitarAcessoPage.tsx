import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

export default function PortalSolicitarAcessoPage() {
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profileType: "revendedora" as "revendedora" | "influencer",
    instagramHandle: "",
    phone: "",
  });

  const solicitar = trpc.portal.solicitarAcesso.useMutation({
    onSuccess: () => setSuccess(true),
    onError: (e) => toast.error(e.message),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  if (success) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <CheckCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Solicitação enviada!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sua solicitação de acesso foi enviada com sucesso. A equipe Feminnita irá analisar e aprovar em breve.
          </p>
          <Button
            onClick={() => setLocation("/portal/login")}
            variant="outline"
            className="border-rose-300 text-rose-600"
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-rose-700 tracking-tight">Feminnita</h1>
          <p className="text-rose-500 text-sm mt-1">Solicitar Acesso à Sala de Arquivos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
          <form
            onSubmit={e => { e.preventDefault(); solicitar.mutate(form); }}
            className="space-y-4"
          >
            <div>
              <Label className="text-sm text-gray-600">Nome completo</Label>
              <Input value={form.name} onChange={set("name")} required className="mt-1" placeholder="Seu nome" />
            </div>
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <Input type="email" value={form.email} onChange={set("email")} required className="mt-1" placeholder="seu@email.com" />
            </div>
            <div>
              <Label className="text-sm text-gray-600">Senha</Label>
              <Input type="password" value={form.password} onChange={set("password")} required minLength={6} className="mt-1" placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <Label className="text-sm text-gray-600 block mb-2">Perfil</Label>
              <div className="flex gap-3">
                {(["revendedora", "influencer"] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, profileType: type }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                      form.profileType === type
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Instagram (opcional)</Label>
              <Input value={form.instagramHandle} onChange={set("instagramHandle")} className="mt-1" placeholder="@seuinstagram" />
            </div>
            <div>
              <Label className="text-sm text-gray-600">WhatsApp (opcional)</Label>
              <Input value={form.phone} onChange={set("phone")} className="mt-1" placeholder="(11) 99999-9999" />
            </div>
            <Button
              type="submit"
              disabled={solicitar.isPending}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white"
            >
              {solicitar.isPending ? "Enviando..." : "Solicitar acesso"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Já tem acesso?{" "}
          <button onClick={() => setLocation("/portal/login")} className="text-rose-600 hover:underline font-medium">
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
