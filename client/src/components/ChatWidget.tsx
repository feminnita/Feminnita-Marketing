import { useRef } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ChatWidget() {
  const { user } = useAuth();
  const popupRef = useRef<Window | null>(null);

  if (!user) return null;

  function handleOpen() {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }
    const w = 390, h = 580;
    const left = Math.max(0, window.screen.width - w - 40);
    const top  = Math.max(0, window.screen.height - h - 80);
    popupRef.current = window.open(
      "/chat",
      "feminnita-chat",
      `popup,width=${w},height=${h},left=${left},top=${top},resizable=yes`
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
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#6B1D28")}
        onMouseLeave={e => (e.currentTarget.style.background = "#8B2635")}
      >
        <MessageCircle size={22} color="white" />
      </button>
    </div>
  );
}
