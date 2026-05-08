import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const B = "#8C2F39";
const BD = "#5C1A22";
const CREME = "#FAF6F2";
const CHAMPAGNE = "#D4A956";
const PRETO = "#1A1A1A";

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "0.375rem",
  padding: "0.625rem 0.875rem",
  border: "1.5px solid #e8ddd5",
  borderRadius: 8,
  fontSize: "0.9rem",
  fontFamily: "'Montserrat', sans-serif",
  color: PRETO,
  background: CREME,
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#666",
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
};

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

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Montserrat:wght@300;400;600;700&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const solicitar = trpc.portal.solicitarAcesso.useMutation({
    onSuccess: () => setSuccess(true),
    onError: (e) => toast.error(e.message),
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: CREME, fontFamily: "'Montserrat', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${CHAMPAGNE}20`, border: `2px solid ${CHAMPAGNE}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <CheckCircle style={{ width: 28, height: 28, color: CHAMPAGNE }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 600, color: B, marginBottom: "0.75rem" }}>
            Solicitação enviada!
          </h2>
          <div style={{ width: 40, height: 2, background: CHAMPAGNE, margin: "0 auto 1rem" }} />
          <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.6, marginBottom: "2rem" }}>
            Sua solicitação foi recebida. A equipe Feminnita irá analisar e liberar o acesso em breve.
          </p>
          <button
            onClick={() => setLocation("/portal/login")}
            style={{ padding: "0.75rem 1.5rem", background: "none", border: `1.5px solid ${B}`, borderRadius: 8, color: B, fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'Montserrat', sans-serif" }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = `${B}10`; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "none"; }}
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

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
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", border: `1.5px solid ${CHAMPAGNE}40`, borderRadius: 16, padding: "2rem", boxShadow: "0 2px 16px rgba(140,47,57,0.08)" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 600, color: PRETO, marginBottom: "1.5rem" }}>
          Solicitar acesso
        </h2>

        <form onSubmit={e => { e.preventDefault(); solicitar.mutate(form); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Nome completo</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              required
              placeholder="Seu nome completo"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = CHAMPAGNE}
              onBlur={e => e.target.style.borderColor = "#e8ddd5"}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              required
              placeholder="seu@email.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = CHAMPAGNE}
              onBlur={e => e.target.style.borderColor = "#e8ddd5"}
            />
          </div>

          <div>
            <label style={labelStyle}>Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = CHAMPAGNE}
              onBlur={e => e.target.style.borderColor = "#e8ddd5"}
            />
          </div>

          <div>
            <label style={labelStyle}>Perfil</label>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.375rem" }}>
              {(["revendedora", "influencer"] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, profileType: type }))}
                  style={{
                    flex: 1,
                    padding: "0.625rem",
                    border: `1.5px solid ${form.profileType === type ? B : "#e8ddd5"}`,
                    borderRadius: 8,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "capitalize",
                    cursor: "pointer",
                    fontFamily: "'Montserrat', sans-serif",
                    background: form.profileType === type ? B : "#fff",
                    color: form.profileType === type ? "#fff" : "#888",
                    transition: "all 0.2s",
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Instagram <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
            <input
              type="text"
              value={form.instagramHandle}
              onChange={set("instagramHandle")}
              placeholder="@seuinstagram"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = CHAMPAGNE}
              onBlur={e => e.target.style.borderColor = "#e8ddd5"}
            />
          </div>

          <div>
            <label style={labelStyle}>WhatsApp <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="(11) 99999-9999"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = CHAMPAGNE}
              onBlur={e => e.target.style.borderColor = "#e8ddd5"}
            />
          </div>

          <button
            type="submit"
            disabled={solicitar.isPending}
            style={{ marginTop: "0.5rem", padding: "0.75rem", background: solicitar.isPending ? "#b08080" : B, color: "#fff", border: "none", borderRadius: 8, fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: solicitar.isPending ? "not-allowed" : "pointer", fontFamily: "'Montserrat', sans-serif", transition: "background 0.2s" }}
            onMouseEnter={e => { if (!solicitar.isPending) (e.target as HTMLButtonElement).style.background = BD; }}
            onMouseLeave={e => { if (!solicitar.isPending) (e.target as HTMLButtonElement).style.background = B; }}
          >
            {solicitar.isPending ? "Enviando..." : "Solicitar acesso"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#888", textAlign: "center" }}>
        Já tem acesso?{" "}
        <button
          onClick={() => setLocation("/portal/login")}
          style={{ background: "none", border: "none", color: B, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", fontFamily: "'Montserrat', sans-serif", textDecoration: "underline" }}
        >
          Entrar
        </button>
      </p>
    </div>
  );
}
