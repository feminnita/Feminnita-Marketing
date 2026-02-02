import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Github, Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";

export default function LoginSignup() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mutations
  const loginMutation = trpc.collaborators.loginCollaborator.useMutation();
  const signupMutation = trpc.collaborators.createCollaborator.useMutation();
  const githubMutation = trpc.collaborators.connectGitHub.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Email e senha são obrigatórios");
        setLoading(false);
        return;
      }

      const result = await loginMutation.mutateAsync({
        email,
        password,
      });

      if (result.success) {
        setSuccess(true);
        setEmail("");
        setPassword("");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!name || !email || !password) {
        setError("Nome, email e senha são obrigatórios");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Senha deve ter pelo menos 6 caracteres");
        setLoading(false);
        return;
      }

      const result = await signupMutation.mutateAsync({
        name,
        email,
        password,
        role: "editor",
      });

      if (result.success) {
        setSuccess(true);
        setName("");
        setEmail("");
        setPassword("");
        setTimeout(() => {
          setMode("login");
          setSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // Gerar código de autorização GitHub
      const clientId = "YOUR_GITHUB_CLIENT_ID"; // Será substituído por env var
      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const scope = "user:email";
      const state = Math.random().toString(36).substring(7);

      // Salvar state na sessão
      sessionStorage.setItem("github_oauth_state", state);

      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
      window.location.href = githubAuthUrl;
    } catch (err: any) {
      setError("Erro ao conectar com GitHub");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Feminnita</h1>
          <p className="text-slate-400">Estratégia de Marketing Digital</p>
        </div>

        {/* Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">
              {mode === "login" ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Acesse sua conta de colaborador"
                : "Crie uma nova conta para começar"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-5 h-5 text-green-500 flex-shrink-0">✓</div>
                <p className="text-sm text-green-400">
                  {mode === "login" ? "Login realizado com sucesso!" : "Conta criada com sucesso!"}
                </p>
              </div>
            )}

            {/* GitHub Button */}
            <Button
              onClick={handleGithubLogin}
              disabled={loading}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 mr-2" />
                  Continuar com GitHub
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800/50 text-slate-400">Ou continue com email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
              {/* Name Field (Signup only) */}
              {mode === "signup" && (
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
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
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : mode === "login" ? (
                  "Entrar"
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center text-sm text-slate-400">
              {mode === "login" ? (
                <>
                  Não tem conta?{" "}
                  <button
                    onClick={() => {
                      setMode("signup");
                      setError("");
                      setSuccess(false);
                    }}
                    className="text-pink-500 hover:text-pink-400 font-medium"
                  >
                    Criar uma
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setSuccess(false);
                    }}
                    className="text-pink-500 hover:text-pink-400 font-medium"
                  >
                    Entrar
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          © 2026 Feminnita. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
