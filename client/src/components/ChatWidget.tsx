import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Loader2, MessageCircle, Send, Users, X } from "lucide-react";

// ─── Push helpers ─────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function registerPush(vapidKey: string, subscribeFn: (s: { endpoint: string; p256dh: string; auth: string }) => void) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const sub = existing ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey) });
    const json = sub.toJSON();
    subscribeFn({ endpoint: json.endpoint!, p256dh: (json.keys as any)?.p256dh ?? "", auth: (json.keys as any)?.auth ?? "" });
  } catch (e) {
    console.warn("[Push] Falha:", e);
  }
}

function notify(title: string, body: string) {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ContactKind = "group" | "agent" | "human";

interface Contact {
  kind: ContactKind;
  id: string | number;
  name: string;
  role: string;
  photo: string;
  color: string;
  agentName?: "fernanda" | "sofia" | "clara" | "mariana";
}

interface GroupMsg  { type: "message" | "system"; id: string; name?: string; color?: string; text: string; ts: number; }
interface AgentMsg  { role: "user" | "assistant"; text: string; ts: number; }
interface DmMsg     { role: "sent" | "received"; text: string; ts: number; fromName?: string; }
interface OnlineUser { name: string; color: string; }

// Contexto persistente por agente (não perde ao trocar de aba)
interface AgentCtx { msgs: AgentMsg[]; convId: number | null; }

const STATIC_CONTACTS: Contact[] = [
  { kind: "group",  id: "group",    name: "Equipe Feminnita", role: "Chat da equipe",    photo: "", color: "#6B1D28" },
  { kind: "agent",  id: "fernanda", name: "Fernanda",         role: "Meta Ads",          photo: "/agents/fernanda.jpg", color: "#1877F2", agentName: "fernanda" },
  { kind: "agent",  id: "sofia",    name: "Sofia",            role: "Instagram",          photo: "/agents/sofia.jpg",    color: "#E1306C", agentName: "sofia"    },
  { kind: "agent",  id: "clara",    name: "Clara",            role: "Análise de Mercado", photo: "/agents/clara.jpg",    color: "#2563EB", agentName: "clara"    },
  { kind: "agent",  id: "mariana",  name: "Mariana",          role: "Vendas",             photo: "/agents/mariana.jpg",  color: "#059669", agentName: "mariana"  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const { user } = useAuth();

  const [open, setOpen]               = useState(false);
  const [contact, setContact]         = useState<Contact | null>(null);
  const [input, setInput]             = useState("");
  const [unread, setUnread]           = useState(0);

  const [groupMsgs, setGroupMsgs]     = useState<GroupMsg[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [connected, setConnected]     = useState(false);
  const socketRef                     = useRef<Socket | null>(null);
  const joinedRef                     = useRef(false);

  // Contexto persistente por agente — não reseta ao trocar de contato
  const [agentCtxs, setAgentCtxs]   = useState<Record<string, AgentCtx>>({});
  const [agentLoading, setAgentLoading] = useState<string | null>(null); // agentName em loading

  const [dmMsgs, setDmMsgs] = useState<Record<number, DmMsg[]>>({});

  const openRef    = useRef(false);
  const contactRef = useRef<Contact | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);

  const chatMutation      = trpc.specialistChat.chat.useMutation();
  const vapidQuery        = trpc.pushSubscriptions.vapidPublicKey.useQuery(undefined, { staleTime: Infinity });
  const subscribeMutation = trpc.pushSubscriptions.subscribe.useMutation();
  const teamQuery         = trpc.users.list.useQuery(undefined, { staleTime: 60_000 });

  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { contactRef.current = contact; }, [contact]);

  const contacts: Contact[] = [
    ...STATIC_CONTACTS,
    ...(teamQuery.data ?? []).map((u) => ({
      kind: "human" as ContactKind,
      id: u.id,
      name: u.name || u.email,
      role: "Equipe",
      photo: "",
      color: "#6B1D28",
    })),
  ];

  // ── Socket.io ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const socket = io(window.location.origin, { path: "/socket.io" });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("register-user", user.id);
      if (!joinedRef.current) {
        socket.emit("chat:join", { userId: user.id, name: (user as any).name || (user as any).email || "Usuário" });
        joinedRef.current = true;
      }
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("chat:history", (h: GroupMsg[]) => setGroupMsgs(h));
    socket.on("chat:message", (msg: GroupMsg) => {
      setGroupMsgs((prev) => [...prev, msg]);
      const myName = (user as any).name || (user as any).email;
      if (msg.type === "message" && msg.name !== myName) {
        const viewing = openRef.current && contactRef.current?.id === "group";
        if (!viewing) {
          setUnread((n) => n + 1);
          notify(msg.name ?? "Chat", msg.text);
        }
      }
    });
    socket.on("chat:users", (u: OnlineUser[]) => setOnlineUsers(u));

    socket.on("dm:receive", (msg: { id: string; fromUserId: number; fromName: string; text: string; ts: number }) => {
      setDmMsgs(prev => ({ ...prev, [msg.fromUserId]: [...(prev[msg.fromUserId] ?? []), { role: "received", text: msg.text, ts: msg.ts, fromName: msg.fromName }] }));
      const viewing = openRef.current && contactRef.current?.id === msg.fromUserId;
      if (!viewing) {
        setUnread(n => n + 1);
        notify(msg.fromName ?? "Mensagem", msg.text);
      }
    });

    return () => { socket.disconnect(); joinedRef.current = false; };
  }, [user]);

  useEffect(() => { if (open) setUnread(0); }, [open]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [groupMsgs, agentCtxs, dmMsgs, contact]);

  function selectContact(c: Contact) {
    setContact(c);
    setInput("");
  }

  function goBack() { setContact(null); setInput(""); }

  async function send() {
    const text = input.trim();
    if (!text || !contact) return;
    setInput("");

    if (contact.kind === "group") {
      if (!socketRef.current || !connected) return;
      socketRef.current.emit("chat:send", text);
      return;
    }

    if (contact.kind === "human") {
      if (!socketRef.current || !connected) return;
      const tid = contact.id as number;
      setDmMsgs(prev => ({ ...prev, [tid]: [...(prev[tid] ?? []), { role: "sent", text, ts: Date.now() }] }));
      socketRef.current.emit("dm:send", { toUserId: tid, text });
      return;
    }

    // Agent — mantém contexto mesmo que usuário troque de aba
    const agentName = contact.agentName!;
    const prev = agentCtxs[agentName] ?? { msgs: [], convId: null };
    const userMsg: AgentMsg = { role: "user", text, ts: Date.now() };
    setAgentCtxs(p => ({ ...p, [agentName]: { msgs: [...prev.msgs, userMsg], convId: prev.convId } }));
    setAgentLoading(agentName);

    try {
      const res = await chatMutation.mutateAsync({ agentName, message: text, conversationId: prev.convId ?? undefined });
      const assistantMsg: AgentMsg = { role: "assistant", text: res.message, ts: Date.now() };
      setAgentCtxs(p => ({
        ...p,
        [agentName]: { msgs: [...(p[agentName]?.msgs ?? []), assistantMsg], convId: res.conversationId ?? p[agentName]?.convId ?? null },
      }));
      // Notifica se usuário trocou de contato ou fechou o chat
      const stillWatching = openRef.current && contactRef.current?.agentName === agentName;
      if (!stillWatching) {
        setUnread(n => n + 1);
        notify(contact.name, res.message.slice(0, 100));
      }
    } catch (err: any) {
      const errMsg: AgentMsg = { role: "assistant", text: `Erro: ${err.message}`, ts: Date.now() };
      setAgentCtxs(p => ({ ...p, [agentName]: { msgs: [...(p[agentName]?.msgs ?? []), errMsg], convId: p[agentName]?.convId ?? null } }));
    } finally {
      setAgentLoading(null);
    }
  }

  function handleToggle() {
    const newOpen = !open;
    setOpen(newOpen);
    if (newOpen && typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().then(perm => {
        if (perm === "granted" && vapidQuery.data?.key) registerPush(vapidQuery.data.key, s => subscribeMutation.mutate(s));
      });
    } else if (newOpen && typeof Notification !== "undefined" && Notification.permission === "granted" && vapidQuery.data?.key) {
      registerPush(vapidQuery.data.key, s => subscribeMutation.mutate(s));
    }
  }

  if (!user) return null;

  const myName = (user as any).name || (user as any).email || "Usuário";

  const panelStyle: React.CSSProperties = {
    position: "absolute", bottom: 64, right: 0, width: 340, height: 520,
    background: "#1e293b", border: "1px solid #334155", borderRadius: 12,
    display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,.6)", overflow: "hidden",
  };
  const headerStyle: React.CSSProperties = {
    padding: "10px 14px", borderBottom: "1px solid #334155",
    display: "flex", alignItems: "center", gap: 10, background: "#0f172a", flexShrink: 0,
  };

  function Avatar({ c, size = 42 }: { c: Contact; size?: number }) {
    if (c.kind === "group") {
      return <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: c.color, display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={size * 0.46} color="white" /></div>;
    }
    if (c.kind === "human" || !c.photo) {
      const initials = (c.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      return <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: "#334155", border: `2px solid ${c.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 700, color: "white" }}>{initials}</div>;
    }
    return <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `2px solid ${c.color}` }}><img src={c.photo} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} /></div>;
  }

  const agentCtx = contact?.kind === "agent" ? (agentCtxs[contact.agentName!] ?? { msgs: [], convId: null }) : null;
  const isAgentLoading = contact?.kind === "agent" && agentLoading === contact.agentName;
  const currentDmMsgs = contact?.kind === "human" ? (dmMsgs[contact.id as number] ?? []) : [];

  // Badge de agente processando em background
  const busyAgents = Object.keys(agentCtxs).filter(a => agentLoading === a);

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
                    <Users size={10} /> {onlineUsers.length} online
                  </div>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4, display: "flex" }}><X size={16} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
                {contacts.map((c) => {
                  const isBusy = c.kind === "agent" && busyAgents.includes(c.agentName!);
                  return (
                    <button key={String(c.id)} onClick={() => selectContact(c)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "none", border: "none", borderBottom: "1px solid #1e293b", cursor: "pointer", textAlign: "left" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#263344")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      <div style={{ position: "relative" }}>
                        <Avatar c={c} />
                        {isBusy && <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: "#f59e0b", border: "2px solid #1e293b" }} title="Processando..." />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.3 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: isBusy ? "#f59e0b" : "#64748b", marginTop: 2 }}>{isBusy ? "processando..." : c.role}</div>
                      </div>
                      {c.kind === "group" && unread > 0 && (
                        <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unread > 9 ? "9+" : unread}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Chat ── */}
          {contact && (
            <>
              <div style={headerStyle}>
                <button onClick={goBack} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px 4px", display: "flex", marginLeft: -4 }}><ChevronLeft size={18} /></button>
                <Avatar c={contact} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{contact.name}</div>
                  <div style={{ fontSize: 11, color: isAgentLoading ? "#f59e0b" : "#94a3b8" }}>
                    {contact.kind === "group" ? `${onlineUsers.length} online` : isAgentLoading ? "processando..." : contact.role}
                  </div>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4, display: "flex" }}><X size={16} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 1, scrollbarWidth: "thin" }}>

                {/* GROUP */}
                {contact.kind === "group" && (
                  <>
                    {groupMsgs.length === 0 && <div style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 40 }}>Nenhuma mensagem ainda.<br />Diga oi! 👋</div>}
                    {groupMsgs.map((m, i) => {
                      if (m.type === "system") return <div key={m.id || i} style={{ textAlign: "center", fontSize: 11, color: "#64748b", padding: "5px 0", fontStyle: "italic" }}>{m.text}</div>;
                      const showHeader = i === 0 || groupMsgs[i - 1]?.name !== m.name || groupMsgs[i - 1]?.type === "system";
                      const isMe = m.name === myName;
                      return (
                        <div key={m.id || i} style={{ marginTop: showHeader ? 8 : 0 }}>
                          {showHeader && <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: isMe ? "#8B2635" : (m.color ?? "#94a3b8") }}>{m.name}{isMe ? " (você)" : ""}</span>
                            <span style={{ fontSize: 10, color: "#475569" }}>{new Date(m.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>}
                          <div style={{ fontSize: 13, lineHeight: 1.55, color: "#e2e8f0", wordBreak: "break-word" }}>{m.text}</div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* AGENT */}
                {contact.kind === "agent" && (
                  <>
                    {(agentCtx?.msgs.length ?? 0) === 0 && !isAgentLoading && (
                      <div style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 40 }}>Inicie a conversa com {contact.name} 💬</div>
                    )}
                    {(agentCtx?.msgs ?? []).map((m, i) => {
                      const isMe = m.role === "user";
                      return (
                        <div key={i} style={{ marginTop: 8, display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-start", gap: 6 }}>
                          {!isMe && <Avatar c={contact} size={26} />}
                          <div style={{ maxWidth: "78%", background: isMe ? "#8B2635" : "#1a2f48", borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "8px 11px" }}>
                            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "#e2e8f0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 4, textAlign: isMe ? "right" : "left" }}>{new Date(m.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                        </div>
                      );
                    })}
                    {isAgentLoading && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <Avatar c={contact} size={26} />
                        <div style={{ background: "#1a2f48", borderRadius: "12px 12px 12px 2px", padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                          <Loader2 size={13} className="animate-spin" color="#94a3b8" />
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>digitando...</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* HUMAN DM */}
                {contact.kind === "human" && (
                  <>
                    {currentDmMsgs.length === 0 && <div style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 40 }}>Inicie uma conversa com {contact.name} 💬</div>}
                    {currentDmMsgs.map((m, i) => {
                      const isMe = m.role === "sent";
                      return (
                        <div key={i} style={{ marginTop: 8, display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-start", gap: 6 }}>
                          {!isMe && <Avatar c={contact} size={26} />}
                          <div style={{ maxWidth: "78%", background: isMe ? "#8B2635" : "#1a2f48", borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "8px 11px" }}>
                            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "#e2e8f0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 4, textAlign: isMe ? "right" : "left" }}>{new Date(m.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "8px 10px", borderTop: "1px solid #334155", display: "flex", gap: 6, flexShrink: 0 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={
                    contact.kind === "group" || contact.kind === "human"
                      ? (connected ? `Mensagem... (Enter)` : "Conectando...")
                      : isAgentLoading ? "Aguardando resposta..." : `Mensagem para ${contact.name}...`
                  }
                  disabled={(contact.kind === "group" || contact.kind === "human") ? !connected : isAgentLoading}
                  autoFocus
                  style={{ flex: 1, padding: "8px 10px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9", fontSize: 13, outline: "none" }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || isAgentLoading || ((contact.kind === "group" || contact.kind === "human") && !connected)}
                  style={{ padding: "8px 12px", background: "#8B2635", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", opacity: (!input.trim() || isAgentLoading) ? 0.5 : 1 }}
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
        onClick={handleToggle}
        title="Chat"
        style={{ width: 52, height: 52, borderRadius: "50%", background: open ? "#334155" : "#8B2635", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,.5)", position: "relative", transition: "background .2s" }}
      >
        <MessageCircle size={22} color="white" />
        {unread > 0 && !open && (
          <span style={{ position: "absolute", top: -3, right: -3, minWidth: 20, height: 20, borderRadius: 10, background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
