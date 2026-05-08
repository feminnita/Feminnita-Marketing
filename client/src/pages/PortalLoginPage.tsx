import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const B = "#8C2F39";
const BD = "#5C1A22";
const CREME = "#FAF6F2";
const PESSEGO = "#F5E6D3";
const CHAMPAGNE = "#D4A956";
const PRETO = "#1A1A1A";

export default function PortalLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Montserrat:wght@300;400;600;700&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const login = trpc.portal.login.useMutation({
    onSuccess: () => setLocation("/portal/materiais"),
    onError: (e) => toast.error(e.message),
  });

  return (
    <div style={{ minHeight: "100vh", background: CREME, fontFamily: "'Montserrat', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 600, color: B, letterSpacing: "0.02em", lineHeight: 1 }}>
          Feminn<span style={{ color: CHAMPAGNE }}>ita</span>
        </h1>
        <div style={{ width: 48, height: 2, background: CHAMPAGNE, margin: "0.75rem auto" }} />
        <p style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "0.12em", color: B, textTransform: "uppercase" }}>
          Sala de Arquivos
        </p>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", border: `1.5px solid ${CHAMPAGNE}40`, borderRadius: 16, padding: "2rem", boxShadow: "0 2px 16px rgba(140,47,57,0.08)" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: PRETO, marginBottom: "1.5rem" }}>
          Entrar
        </h2>

        <form onSubmit={e => { e.preventDefault(); login.mutate({ email, password }); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.05em", textTransform: "uppercase" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              style={{ display: "block", width: "100%", marginTop: "0.375rem", padding: "0.625rem 0.875rem", border: `1.5px solid #e8ddd5`, borderRadius: 8, fontSize: "0.9rem", fontFamily: "'Montserrat', sans-serif", color: PRETO, background: CREME, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = CHAMPAGNE}
              onBlur={e => e.target.style.borderColor = "#e8ddd5"}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#666", letterSpacing: "0.05em", textTransform: "uppercase" }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ display: "block", width: "100%", marginTop: "0.375rem", padding: "0.625rem 0.875rem", border: `1.5px solid #e8ddd5`, borderRadius: 8, fontSize: "0.9rem", fontFamily: "'Montserrat', sans-serif", color: PRETO, background: CREME, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = CHAMPAGNE}
              onBlur={e => e.target.style.borderColor = "#e8ddd5"}
            />
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            style={{ marginTop: "0.5rem", padding: "0.75rem", background: login.isPending ? "#b08080" : B, color: "#fff", border: "none", borderRadius: 8, fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: login.isPending ? "not-allowed" : "pointer", fontFamily: "'Montserrat', sans-serif", transition: "background 0.2s" }}
            onMouseEnter={e => { if (!login.isPending) (e.target as HTMLButtonElement).style.background = BD; }}
            onMouseLeave={e => { if (!login.isPending) (e.target as HTMLButtonElement).style.background = B; }}
          >
            {login.isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#888", textAlign: "center" }}>
        Ainda não tem acesso?{" "}
        <button
          onClick={() => setLocation("/portal/solicitar-acesso")}
          style={{ background: "none", border: "none", color: B, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", fontFamily: "'Montserrat', sans-serif", textDecoration: "underline" }}
        >
          Solicitar acesso
        </button>
      </p>
    </div>
  );
}
