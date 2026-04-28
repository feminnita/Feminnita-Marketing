import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Loader2, MessageCircle, Send, Users, X } from "lucide-react";

// ─── Push Notification helpers ────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function registerPushSubscription(vapidKey: string, subscribeFn: (sub: { endpoint: string; p256dh: string; auth: string }) => void) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const sub = existing ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
    const json = sub.toJSON();
    subscribeFn({
      endpoint: json.endpoint!,
      p256dh:   (json.keys as any)?.p256dh ?? "",
      auth:     (json.keys as any)?.auth    ?? "",
    });
  } catch (err) {
    console.warn("[Push] Falha ao registrar:", err);
  }
}

// ─── Contatos disponíveis ──────────────────────────────────────────────────────

type ContactKind = "group" | "agent";

interface Contact {
  kind: ContactKind;
  id: string;
  name: string;
  role: string;
  photo: string;
  color: string;
  agentName?: "fernanda" | "sofia" | "clara" | "mariana";
}

const CONTACTS: Contact[] = [
  { kind: "group",  id: "group",    name: "Equipe Feminnita", role: "Chat da equipe",         photo: "", color: "#6B1D28" },
  { kind: "agent",  id: "fernanda", name: "Fernanda",         role: "Meta Ads",               photo: "/agents/fernanda.jpg", color: "#1877F2", agentName: "fernanda" },
  { kind: "agent",  id: "sofia",    name: "Sofia",            role: "Instagram",               photo: "/agents/sofia.jpg",    color: "#E1306C", agentName: "sofia"    },
  { kind: "agent",  id: "clara",    name: "Clara",            role: "Análise de Mercado",      photo: "/agents/clara.jpg",    color: "#2563EB", agentName: "clara"    },
  { kind: "agent",  id: "mariana",  name: "Mariana",          role: "Vendas",                  photo: "/agents/mariana.jpg",  color: "#059669", agentName: "mariana"  },
];

// ─── Tipos de mensagem ─────────────────────────────────────────────────────────

interface GroupMsg {
  type: "message" | "system";
  id: string;
  name?: string;
  color?: string;
  text: string;
  ts: number;
}

interface AgentMsg {
  role: "user" | "assistant";
  text: string;
  ts: number;
}

interface OnlineUser {
  name: string;
  color: string;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const { user } = useAuth();

  // UI state
  const [open, setOpen]               = useState(false);
  const [contact, setContact]         = useState<Contact | null>(null);
  const [input, setInput]             = useState("");
  const [unread, setUnread]           = useState(0);

  // Group chat
  const [groupMsgs, setGroupMsgs]     = useState<GroupMsg[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [connected, setConnected]     = useState(false);
  const socketRef                     = useRef<Socket | null>(null);
  const joinedRef                     = useRef(false);

  // Agent chat
  const [agentMsgs, setAgentMsgs]         = useState<AgentMsg[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [agentLoading, setAgentLoading]   = useState(false);

  const openRef    = useRef(false);
  const bottomRef  = useRef<HTMLDivElement>(null);

  const chatMutation      = trpc.specialistChat.chat.useMutation();
  const vapidQuery        = trpc.pushSubscriptions.vapidPublicKey.useQuery(undefined, { staleTime: Infinity });
  const subscribeMutation = trpc.pushSubscriptions.subscribe.useMutation();

  useEffect(() => { openRef.current = open; }, [open]);

  // ── Socket.io ─────────────────────────────────────────────────────────────
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
    socket.on("chat:history", (h: GroupMsg[]) => setGroupMsgs(h));
    socket.on("chat:message", (msg: GroupMsg) => {
      setGroupMsgs((prev) => [...prev, msg]);
      const myName = (user as any).name || (user as any).email;
      if (!openRef.current && msg.type === "message" && msg.name !== myName) {
        setUnread((n) => n + 1);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(msg.name ?? "Chat", { body: msg.text, icon: "/favicon.ico" });
        }
      }
    });
    socket.on("chat:users", (u: OnlineUser[]) => setOnlineUsers(u));

    return () => { socket.disconnect(); joinedRef.current = false; };
  }, [user]);

  // ── Reset unread & registrar push ─────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setUnread(0);
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted" && vapidQuery.data?.key) {
            registerPushSubscription(vapidQuery.data.key, (sub) => subscribeMutation.mutate(sub));
          }
        });
      } else if (Notification.permission === "granted" && vapidQuery.data?.key) {
        registerPushSubscription(vapidQuery.data.key, (sub) => subscribeMutation.mutate(sub));
      }
    }
  }, [open, vapidQuery.data?.key]);

  // ── Scroll para baixo ─────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMsgs, agentMsgs]);

  // ── Ao selecionar contato ─────────────────────────────────────────────────
  function selectContact(c: Contact) {
    setContact(c);
    setInput("");
    if (c.kind === "agent") {
      setAgentMsgs([]);
      setConversationId(null);
    }
  }

  function goBack() {
    setContact(null);
    setInput("");
  }

  // ── Envio de mensagem ─────────────────────────────────────────────────────
  async function send() {
    const text = input.trim();
    if (!text || !contact) return;
    setInput("");

    if (contact.kind === "group") {
      if (!socketRef.current || !connected) return;
      socketRef.current.emit("chat:send", text);
      return;
    }

    // Agent chat
    const userMsg: AgentMsg = { role: "user", text, ts: Date.now() };
    setAgentMsgs((prev) => [...prev, userMsg]);
    setAgentLoading(true);
    try {
      const res = await chatMutation.mutateAsync({
        agentName: contact.agentName!,
        message: text,
        conversationId: conversationId ?? undefined,
      });
      if (res.conversationId) setConversationId(res.conversationId);
      setAgentMsgs((prev) => [...prev, { role: "assistant", text: res.message, ts: Date.now() }]);
    } catch (err: any) {
      setAgentMsgs((prev) => [...prev, { role: "assistant", text: `Erro: ${err.message}`, ts: Date.now() }]);
    } finally {
      setAgentLoading(false);
    }
  }

  if (!user) return null;

  const myName = (user as any).name || (user as any).email || "Usuário";

  // ── Estilos base ──────────────────────────────────────────────────────────
  const panelStyle: React.CSSProperties = {
    position: "absolute", bottom: 64, right: 0,
    width: 340, height: 520,
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: 12, display: "flex", flexDirection: "column",
    boxShadow: "0 8px 32px rgba(0,0,0,.6)", overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    padding: "10px 14px", borderBottom: "1px solid #334155",
    display: "flex", alignItems: "center", gap: 10,
    background: "#0f172a", flexShrink: 0,
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {open && (
        <div style={panelStyle}>

          {/* ── Lista de contatos ── */}
          {!contact && (
            <>
              <div style={headerStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Conversas</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "#22c55e" : "#ef4444", display: "inline-block" }} />
                    <Users size={10} />
                    {onlineUsers.length} online
                  </div>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4, display: "flex" }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
                {CONTACTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectContact(c)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 14px", background: "none", border: "none",
                      borderBottom: "1px solid #1e293b", cursor: "pointer",
                      textAlign: "left", transition: "background .15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#263344")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    {/* Avatar */}
                    {c.kind === "group" ? (
                      <div style={{
                        width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                        background: c.color, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Users size={20} color="white" />
                      </div>
                    ) : (
                      <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `2px solid ${c.color}` }}>
                        <img src={c.photo} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.3 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{c.role}</div>
                    </div>

                    {/* Badge unread (só grupo) */}
                    {c.kind === "group" && unread > 0 && (
                      <span style={{
                        minWidth: 18, height: 18, borderRadius: 9,
                        background: "#ef4444", color: "#fff",
                        fontSize: 10, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
                      }}>
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Chat ── */}
          {contact && (
            <>
              {/* Header do chat */}
              <div style={headerStyle}>
                <button onClick={goBack} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px 4px", display: "flex", marginLeft: -4 }}>
                  <ChevronLeft size={18} />
                </button>
                {contact.kind === "group" ? (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: contact.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Users size={16} color="white" />
                  </div>
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2px solid ${contact.color}` }}>
                    <img src={contact.photo} alt={contact.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{contact.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {contact.kind === "group"
                      ? `${onlineUsers.length} online`
                      : contact.role}
                  </div>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4, display: "flex" }}>
                  <X size={16} />
                </button>
              </div>

              {/* Mensagens */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 1, scrollbarWidth: "thin" }}>

                {/* GROUP */}
                {contact.kind === "group" && (
                  <>
                    {groupMsgs.length === 0 && (
                      <div style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 40 }}>
                        Nenhuma mensagem ainda.<br />Diga oi! 👋
                      </div>
                    )}
                    {groupMsgs.map((m, i) => {
                      if (m.type === "system") {
                        return (
                          <div key={m.id || i} style={{ textAlign: "center", fontSize: 11, color: "#64748b", padding: "5px 0", fontStyle: "italic" }}>
                            {m.text}
                          </div>
                        );
                      }
                      const showHeader = i === 0 || groupMsgs[i - 1]?.name !== m.name || groupMsgs[i - 1]?.type === "system";
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
                  </>
                )}

                {/* AGENT */}
                {contact.kind === "agent" && (
                  <>
                    {agentMsgs.length === 0 && !agentLoading && (
                      <div style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 40 }}>
                        Inicie a conversa com {contact.name} 💬
                      </div>
                    )}
                    {agentMsgs.map((m, i) => {
                      const isMe = m.role === "user";
                      return (
                        <div key={i} style={{
                          marginTop: 8,
                          display: "flex",
                          flexDirection: isMe ? "row-reverse" : "row",
                          alignItems: "flex-start",
                          gap: 6,
                        }}>
                          {!isMe && (
                            <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1.5px solid ${contact.color}` }}>
                              <img src={contact.photo} alt={contact.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                            </div>
                          )}
                          <div style={{
                            maxWidth: "78%",
                            background: isMe ? "#8B2635" : "#1a2f48",
                            borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                            padding: "8px 11px",
                          }}>
                            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "#e2e8f0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                              {m.text}
                            </div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                              {new Date(m.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {agentLoading && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `1.5px solid ${contact.color}` }}>
                          <img src={contact.photo} alt={contact.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                        </div>
                        <div style={{ background: "#1a2f48", borderRadius: "12px 12px 12px 2px", padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                          <Loader2 size={13} className="animate-spin" color="#94a3b8" />
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>digitando...</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "8px 10px", borderTop: "1px solid #334155", display: "flex", gap: 6, flexShrink: 0 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={
                    contact.kind === "group"
                      ? (connected ? "Mensagem... (Enter)" : "Conectando...")
                      : `Mensagem para ${contact.name}... (Enter)`
                  }
                  disabled={contact.kind === "group" ? !connected : agentLoading}
                  autoFocus
                  style={{ flex: 1, padding: "8px 10px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9", fontSize: 13, outline: "none" }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || agentLoading || (contact.kind === "group" && !connected)}
                  style={{ padding: "8px 12px", background: "#8B2635", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", opacity: (!input.trim() || agentLoading) ? 0.5 : 1 }}
                >
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Chat"
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
        {unread > 0 && !open && (
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
