import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";
import { MessageCircle, Send, X, Users } from "lucide-react";

interface ChatMsg {
  type: "message" | "system";
  id: string;
  name?: string;
  color?: string;
  text: string;
  ts: number;
}

interface OnlineUser {
  name: string;
  color: string;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const joinedRef = useRef(false);
  const openRef = useRef(false);

  useEffect(() => { openRef.current = open; }, [open]);

  useEffect(() => {
    if (!user) return;

    const socket = io(window.location.origin, { path: "/socket.io" });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("register-user", user.id);
      if (!joinedRef.current) {
        const name = (user as any).name || (user as any).email || "Usuário";
        socket.emit("chat:join", { userId: user.id, name });
        joinedRef.current = true;
      }
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("chat:history", (history: ChatMsg[]) => {
      setMessages(history);
    });

    socket.on("chat:message", (msg: ChatMsg) => {
      setMessages((prev) => [...prev, msg]);
      const myName = (user as any).name || (user as any).email;
      if (!openRef.current && msg.type === "message" && msg.name !== myName) {
        setUnread((n) => n + 1);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(msg.name ?? "Chat", { body: msg.text, icon: "/favicon.ico" });
        }
      }
    });

    socket.on("chat:users", (u: OnlineUser[]) => setUsers(u));

    return () => {
      socket.disconnect();
      joinedRef.current = false;
    };
  }, [user]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text || !socketRef.current || !connected) return;
    socketRef.current.emit("chat:send", text);
    setInput("");
  }

  if (!user) return null;

  const myName = (user as any).name || (user as any).email || "Usuário";

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Panel */}
      {open && (
        <div style={{
          position: "absolute", bottom: 64, right: 0,
          width: 340, height: 480,
          background: "#1e293b", border: "1px solid #334155",
          borderRadius: 12, display: "flex", flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,.6)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0f172a", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Chat Interno</div>
              <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "#22c55e" : "#ef4444", display: "inline-block" }} />
                <Users size={10} />
                {users.length} online
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 1, scrollbarWidth: "thin" }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 40 }}>
                Nenhuma mensagem ainda.<br />Diga oi para a equipe! 👋
              </div>
            )}
            {messages.map((m, i) => {
              if (m.type === "system") {
                return (
                  <div key={m.id || i} style={{ textAlign: "center", fontSize: 11, color: "#64748b", padding: "5px 0", fontStyle: "italic" }}>
                    {m.text}
                  </div>
                );
              }
              const showHeader = i === 0 || messages[i - 1]?.name !== m.name || messages[i - 1]?.type === "system";
              const isMe = m.name === myName;
              return (
                <div key={m.id || i} style={{ marginTop: showHeader ? 8 : 0 }}>
                  {showHeader && (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: isMe ? "#8B2635" : (m.color ?? "#94a3b8") }}>
                        {m.name}{isMe ? " (você)" : ""}
                      </span>
                      <span style={{ fontSize: 10, color: "#475569" }}>
                        {new Date(m.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: "#e2e8f0", wordBreak: "break-word" }}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "8px 10px", borderTop: "1px solid #334155", display: "flex", gap: 6, flexShrink: 0 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={connected ? "Mensagem... (Enter)" : "Conectando..."}
              disabled={!connected}
              autoFocus
              style={{ flex: 1, padding: "8px 10px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9", fontSize: 13, outline: "none" }}
            />
            <button
              onClick={send}
              disabled={!connected || !input.trim()}
              style={{ padding: "8px 12px", background: "#8B2635", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", opacity: (!connected || !input.trim()) ? 0.5 : 1 }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Chat Interno"
        style={{
          width: 52, height: 52, borderRadius: "50%",
          background: open ? "#334155" : "#8B2635",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,.5)",
          position: "relative", transition: "background .2s",
        }}
      >
        <MessageCircle size={22} color="white" />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -3, right: -3,
            minWidth: 20, height: 20, borderRadius: 10,
            background: "#ef4444", color: "#fff",
            fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
