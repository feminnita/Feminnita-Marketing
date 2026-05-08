import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PortalLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.portal.login.useMutation({
    onSuccess: () => {
      setLocation("/portal/materiais");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-rose-700 tracking-tight">Feminnita</h1>
          <p className="text-rose-500 text-sm mt-1">Sala de Arquivos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Entrar</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-600">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white"
            >
              {login.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Ainda não tem acesso?{" "}
          <button
            onClick={() => setLocation("/portal/solicitar-acesso")}
            className="text-rose-600 hover:underline font-medium"
          >
            Solicitar acesso
          </button>
        </p>
      </div>
    </div>
  );
}
