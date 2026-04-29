import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Minus } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";

const PANEL_KEY = "feminnita-chat-open";

export default function ChatWidget() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [unread, setUnread] = useState(0);

  // Abre automaticamente se foi o último estado salvo (ou primeira vez = aberto)
  const [isOpen, setIsOpen] = useState(() => {
    try { return localStorage.getItem(PANEL_KEY) !== "false"; } catch { return true; }
  });

  function openPanel() {
    setIsOpen(true);
    setUnread(0);
    try { localStorage.setItem(PANEL_KEY, "true"); } catch {}
  }

  function closePanel() {
    setIsOpen(false);
    try { localStorage.setItem(PANEL_KEY, "false"); } catch {}
  }

  // Conexão socket em background para contar não lidas quando painel fechado
  useEffect(() => {
    if (!user) return;
    const socket = io(window.location.origin, { path: "/socket.io" });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register-user", user.id);
      socket.emit("chat:join", {
        userId: user.id,
        name: (user as any).name || (user as any).email || "Usuário",
      });
    });

    socket.on("chat:message", (msg: any) => {
      if (msg.type !== "message") return;
      const myName = (user as any).name || (user as any).email;
      if (msg.name === myName) return;
      if (!isOpen) setUnread(n => n + 1);
    });

    socket.on("dm:receive", () => {
      if (!isOpen) setUnread(n => n + 1);
    });

    return () => { socket.disconnect(); };
  }, [user]);

  // Zera não lidas quando abre o painel
  useEffect(() => { if (isOpen) setUnread(0); }, [isOpen]);

  if (!user) return null;

  return (
    <>
      {/* Painel de chat embutido */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            right: 24,
            width: 390,
            height: 600,
            zIndex: 9998,
            borderRadius: "12px 12px 0 0",
            overflow: "hidden",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
          }}
        >
          {/* Barra superior */}
          <div
            style={{
              background: "#8B2635",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MessageCircle size={16} color="white" />
              <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Chat Interno</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={closePanel}
                title="Minimizar"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
              >
                <Minus size={16} color="rgba(255,255,255,0.8)" />
              </button>
              <button
                onClick={closePanel}
                title="Fechar"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
              >
                <X size={16} color="rgba(255,255,255,0.8)" />
              </button>
            </div>
          </div>

          {/* iframe com o ChatPage */}
          <iframe
            ref={iframeRef}
            src="/chat"
            style={{ flex: 1, border: "none", width: "100%" }}
            title="Chat Interno Feminnita"
          />
        </div>
      )}

      {/* Botão flutuante — só aparece quando painel está fechado */}
      {!isOpen && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
          <button
            onClick={openPanel}
            title="Abrir chat"
            style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#8B2635", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,.5)",
              transition: "background .2s",
              position: "relative",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#6B1D28")}
            onMouseLeave={e => (e.currentTarget.style.background = "#8B2635")}
          >
            <MessageCircle size={22} color="white" />
            {unread > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4,
                minWidth: 17, height: 17, borderRadius: 9,
                background: "#ef4444", color: "#fff",
                fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 3px", border: "2px solid white",
              }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
}
