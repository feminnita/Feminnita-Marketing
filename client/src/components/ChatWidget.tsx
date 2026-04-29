import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ChatWidget() {
  const { user } = useAuth();
  const popupRef   = useRef<Window | null>(null);
  const socketRef  = useRef<Socket | null>(null);
  const [unread, setUnread] = useState(0);

  // Conexão socket "background" — ativa em toda página, não só no popup
  useEffect(() => {
    if (!user) return;

    const socket = io(window.location.origin, { path: "/socket.io" });
    socketRef.current = socket;

    // Sempre re-emite chat:join em qualquer conexão/reconexão
    socket.on("connect", () => {
      socket.emit("register-user", user.id);
      socket.emit("chat:join", {
        userId: user.id,
        name: (user as any).name || (user as any).email || "Usuário",
      });
    });

    // Conta mensagens não lidas quando popup está fechado
    socket.on("chat:message", (msg: any) => {
      if (msg.type !== "message") return;
      const myName = (user as any).name || (user as any).email;
      if (msg.name === myName) return;
      if (!popupRef.current || popupRef.current.closed) {
        setUnread(n => n + 1);
      }
    });

    socket.on("dm:receive", () => {
      if (!popupRef.current || popupRef.current.closed) {
        setUnread(n => n + 1);
      }
    });

    return () => {
      socket.disconnect();
      joinedRef.current = false;
    };
  }, [user]);

  if (!user) return null;

  function handleOpen() {
    setUnread(0);
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }
    const w = 390, h = 600;
    const left = Math.max(0, window.screen.width - w - 40);
    const top  = Math.max(0, window.screen.height - h - 80);
    popupRef.current = window.open(
      "/chat",
      "feminnita-chat",
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,toolbar=no,menubar=no,location=no,status=no`
    );
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      <button
        onClick={handleOpen}
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
  );
}
