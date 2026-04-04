import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";

export default function LoginSignup() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await loginMutation.mutateAsync({ email, password });
      } else {
        if (!name.trim()) { setError("Nome é obrigatório"); return; }
        if (password.length < 6) { setError("Senha deve ter pelo menos 6 caracteres"); return; }
        await registerMutation.mutateAsync({ email, password, name });
      }
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Erro ao autenticar");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#E8C99A' }}>Feminnita</h1>
          <p className="text-slate-400">Estratégia de Marketing Digital</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">
              {mode === "login" ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Acesse o painel de marketing"
                : "Crie uma nova conta para começar"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      disabled={isPending}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={isPending}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={isPending}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#8B2635] hover:bg-[#6B1E28] text-white"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando...</>
                ) : mode === "login" ? "Entrar" : "Criar Conta"}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-400">
              {mode === "login" ? (
                <>Não tem conta?{" "}
                  <button onClick={() => { setMode("signup"); setError(""); }}
                    className="text-[#8B2635] hover:text-[#C4A882] font-medium">
                    Criar uma
                  </button></>
              ) : (
                <>Já tem conta?{" "}
                  <button onClick={() => { setMode("login"); setError(""); }}
                    className="text-[#8B2635] hover:text-[#C4A882] font-medium">
                    Entrar
                  </button></>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-8">
          © 2026 Feminnita. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
