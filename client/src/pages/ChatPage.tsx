/**
 * ChatPage — página standalone de chat (abre como popup).
 * Mesma lógica do ChatWidget mas sem o botão flutuante.
 */
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Clock, FileText, Loader2, MessageCircle, Paperclip, Send, Users, X } from "lucide-react";
import LoginSignup from "@/pages/LoginSignup";

// ─── Push helpers ──────────────────────────────────────────────────────────────

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

// ─── Tipos ─────────────────────────────────────────────────────────────────────

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
interface AgentCtx { msgs: AgentMsg[]; convId: number | null; }

const STATIC_CONTACTS: Contact[] = [
  { kind: "group",  id: "group",    name: "Equipe Feminnita", role: "Chat da equipe",    photo: "", color: "#6B1D28" },
  { kind: "agent",  id: "fernanda", name: "Fernanda",         role: "Meta Ads",          photo: "/agents/fernanda.jpg", color: "#1877F2", agentName: "fernanda" },
  { kind: "agent",  id: "sofia",    name: "Sofia",            role: "Instagram",          photo: "/agents/sofia.jpg",    color: "#E1306C", agentName: "sofia"    },
  { kind: "agent",  id: "clara",    name: "Clara",            role: "Análise de Mercado", photo: "/agents/clara.jpg",    color: "#2563EB", agentName: "clara"    },
  { kind: "agent",  id: "mariana",  name: "Mariana",          role: "Vendas",             photo: "/agents/mariana.jpg",  color: "#059669", agentName: "mariana"  },
];

// ─── Componente principal ──────────────────────────────────────────────────────

export default function ChatPage() {
  const { user, isLoading } = useAuth();

  const [contact, setContact]         = useState<Contact | null>(null);
  const [input, setInput]             = useState("");
  const [unread, setUnread]           = useState(0);

  const [groupMsgs, setGroupMsgs]     = useState<GroupMsg[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [connected, setConnected]     = useState(false);
  const socketRef                     = useRef<Socket | null>(null);

  const [agentCtxs, setAgentCtxs]     = useState<Record<string, AgentCtx>>({});
  const [agentLoading, setAgentLoading] = useState<string | null>(null);

  const [dmMsgs, setDmMsgs] = useState<Record<number, DmMsg[]>>({});

  const contactRef = useRef<Contact | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const chatMutation      = trpc.specialistChat.chat.useMutation();
  const taskMutation      = trpc.agentTasks.submit.useMutation();
  const uploadMutation    = trpc.chatUpload.upload.useMutation();
  const vapidQuery        = trpc.pushSubscriptions.vapidPublicKey.useQuery(undefined, { staleTime: Infinity });
  const subscribeMutation = trpc.pushSubscriptions.subscribe.useMutation();
  const teamQuery         = trpc.users.list.useQuery(undefined, { staleTime: 60_000 });

  const dmWithUserId = contact?.kind === "human" ? (contact.id as number) : null;
  const dmHistoryQuery = trpc.dm.history.useQuery(
    { withUserId: dmWithUserId ?? 0 },
    { enabled: dmWithUserId !== null, staleTime: 0 }
  );

  // Carrega histórico de DMs do banco quando abre conversa com alguém
  useEffect(() => {
    if (!dmHistoryQuery.data || dmWithUserId === null) return;
    const loaded: DmMsg[] = dmHistoryQuery.data.map((m: any) => ({
      role: m.fromUserId === user?.id ? "sent" : "received",
      text: m.text,
      ts: new Date(m.createdAt).getTime(),
      fromName: m.fromName,
    }));
    setDmMsgs(prev => ({ ...prev, [dmWithUserId]: loaded }));
  }, [dmHistoryQuery.data, dmWithUserId]);

  useEffect(() => { contactRef.current = contact; }, [contact]);

  const contacts: Contact[] = [
    ...STATIC_CONTACTS,
    ...(teamQuery.data ?? []).map((u) => ({
      kind: "human" as ContactKind,
      id: u.id,
      name: u.name || u.email,
      role: u.email,
      photo: "",
      color: "#6B1D28",
    })),
  ];

  // ── Push permission ao abrir ────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !vapidQuery.data?.key) return;
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().then(perm => {
        if (perm === "granted" && vapidQuery.data?.key) registerPush(vapidQuery.data.key, s => subscribeMutation.mutate(s));
      });
    } else if (typeof Notification !== "undefined" && Notification.permission === "granted" && vapidQuery.data?.key) {
      registerPush(vapidQuery.data.key, s => subscribeMutation.mutate(s));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, vapidQuery.data?.key]);

  // ── Socket.io ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const socket = io(window.location.origin, { path: "/socket.io" });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("register-user", user.id);
      // Sempre re-emite chat:join em qualquer conexão/reconexão para garantir registro no servidor
      socket.emit("chat:join", { userId: user.id, name: (user as any).name || (user as any).email || "Usuário" });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("chat:history", (h: GroupMsg[]) => setGroupMsgs(h));
    socket.on("chat:message", (msg: GroupMsg) => {
      setGroupMsgs((prev) => [...prev, msg]);
      const myName = (user as any).name || (user as any).email;
      if (msg.type === "message" && msg.name !== myName) {
        const viewing = contactRef.current?.id === "group";
        if (!viewing) {
          setUnread((n) => { const next = n + 1; window.parent?.postMessage({ type: "chat:unread", count: next }, "*"); return next; });
          notify(msg.name ?? "Chat", msg.text);
        }
      }
    });
    socket.on("chat:users", (u: OnlineUser[]) => setOnlineUsers(u));

    socket.on("agent:task:done", (payload: { taskId: number; agentName: string; agentDisplay: string; message: string; originalMessage: string; ts: number }) => {
      const taskMsg: AgentMsg = { role: "assistant", text: payload.message, ts: payload.ts };
      setAgentCtxs(p => ({
        ...p,
        [payload.agentName]: { msgs: [...(p[payload.agentName]?.msgs ?? []), taskMsg], convId: p[payload.agentName]?.convId ?? null },
      }));
      const viewing = contactRef.current?.agentName === payload.agentName;
      if (!viewing) { setUnread(n => n + 1); notify(`${payload.agentDisplay} concluiu`, payload.message.slice(0, 100)); }
    });

    socket.on("dm:receive", (msg: { id: string; fromUserId: number; fromName: string; text: string; ts: number }) => {
      setDmMsgs(prev => ({ ...prev, [msg.fromUserId]: [...(prev[msg.fromUserId] ?? []), { role: "received", text: msg.text, ts: msg.ts, fromName: msg.fromName }] }));
      const viewing = contactRef.current?.id === msg.fromUserId;
      if (!viewing) {
        setUnread(n => { const next = n + 1; window.parent?.postMessage({ type: "chat:unread", count: next }, "*"); return next; });
        notify(msg.fromName ?? "Mensagem", msg.text);
      }
    });

    return () => { socket.disconnect(); };
  }, [user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [groupMsgs, agentCtxs, dmMsgs, contact]);

  function selectContact(c: Contact) { setContact(c); setInput(""); }
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
      const stillWatching = contactRef.current?.agentName === agentName;
      if (!stillWatching) { setUnread(n => n + 1); notify(contact.name, res.message.slice(0, 100)); }
    } catch (err: any) {
      const errMsg: AgentMsg = { role: "assistant", text: `Erro: ${err.message}`, ts: Date.now() };
      setAgentCtxs(p => ({ ...p, [agentName]: { msgs: [...(p[agentName]?.msgs ?? []), errMsg], convId: p[agentName]?.convId ?? null } }));
    } finally {
      setAgentLoading(null);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !contact) return;
    if (file.size > 10 * 1024 * 1024) { alert("Arquivo muito grande (máx 10MB)"); return; }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res((reader.result as string).split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const result = await uploadMutation.mutateAsync({ fileName: file.name, mimeType: file.type, fileData: base64 });
      const fileMsg = JSON.stringify({ _type: "file", url: result.url, name: result.fileName, mime: result.mimeType });
      if (contact.kind === "group" && socketRef.current && connected) {
        socketRef.current.emit("chat:send", fileMsg);
      } else if (contact.kind === "human" && socketRef.current && connected) {
        const tid = contact.id as number;
        setDmMsgs(prev => ({ ...prev, [tid]: [...(prev[tid] ?? []), { role: "sent", text: fileMsg, ts: Date.now() }] }));
        socketRef.current.emit("dm:send", { toUserId: tid, text: fileMsg });
      }
    } catch { alert("Erro ao enviar arquivo"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  function renderMsgText(text: string) {
    try {
      const p = JSON.parse(text);
      if (p._type === "file") {
        const isImg = p.mime?.startsWith("image/");
        if (isImg) return <img src={p.url} alt={p.name} style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 6, marginTop: 4, display: "block" }} />;
        return (
          <a href={p.url} target="_blank" rel="noreferrer" download={p.name}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#93c5fd", fontSize: 12, marginTop: 4 }}>
            <FileText size={14} /> {p.name}
          </a>
        );
      }
    } catch {}
    return text;
  }

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <Loader2 size={28} color="#8B2635" className="animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginSignup />;

  const myName = (user as any).name || (user as any).email || "Usuário";
  const agentCtx = contact?.kind === "agent" ? (agentCtxs[contact.agentName!] ?? { msgs: [], convId: null }) : null;
  const isAgentLoading = contact?.kind === "agent" && agentLoading === contact.agentName;
  const currentDmMsgs = contact?.kind === "human" ? (dmMsgs[contact.id as number] ?? []) : [];
  const busyAgents = Object.keys(agentCtxs).filter(a => agentLoading === a);

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

  const hdr: React.CSSProperties = {
    padding: "10px 14px", borderBottom: "1px solid #334155",
    display: "flex", alignItems: "center", gap: 10, background: "#0f172a", flexShrink: 0,
  };

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#1e293b", color: "#f1f5f9", fontFamily: "system-ui, sans-serif", overflow: "hidden" }}>

      {/* ── Lista de contatos ── */}
      {!contact && (
        <>
          <div style={hdr}>
            <MessageCircle size={18} color="#8B2635" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Conversas</div>
              <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: connected ? "#22c55e" : "#ef4444", display: "inline-block" }} />
                <Users size={10} /> {onlineUsers.length} online
                {unread > 0 && <span style={{ marginLeft: 6, background: "#ef4444", color: "#fff", borderRadius: 8, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>{unread} nova{unread > 1 ? "s" : ""}</span>}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
            {contacts.map((c) => {
              const isBusy = c.kind === "agent" && busyAgents.includes(c.agentName!);
              return (
                <button key={String(c.id)} onClick={() => selectContact(c)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "none", border: "none", borderBottom: "1px solid #263344", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#263344")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                  <div style={{ position: "relative" }}>
                    <Avatar c={c} />
                    {isBusy && <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: "#f59e0b", border: "2px solid #1e293b" }} />}
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
          <div style={hdr}>
            <button onClick={goBack} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "2px 4px", display: "flex", marginLeft: -4 }}><ChevronLeft size={18} /></button>
            <Avatar c={contact} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{contact.name}</div>
              <div style={{ fontSize: 11, color: isAgentLoading ? "#f59e0b" : "#94a3b8" }}>
                {contact.kind === "group" ? `${onlineUsers.length} online` : isAgentLoading ? "processando..." : contact.role}
              </div>
            </div>
            <button onClick={goBack} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4, display: "flex" }}><X size={15} /></button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 1, scrollbarWidth: "thin" }}>

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
                      <div style={{ fontSize: 13, lineHeight: 1.55, color: "#e2e8f0", wordBreak: "break-word" }}>{renderMsgText(m.text)}</div>
                    </div>
                  );
                })}
              </>
            )}

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
                      <div style={{ maxWidth: "82%", background: isMe ? "#8B2635" : "#1a2f48", borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "8px 11px" }}>
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

            {contact.kind === "human" && (
              <>
                {currentDmMsgs.length === 0 && <div style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 40 }}>Inicie uma conversa com {contact.name} 💬</div>}
                {currentDmMsgs.map((m, i) => {
                  const isMe = m.role === "sent";
                  return (
                    <div key={i} style={{ marginTop: 8, display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-start", gap: 6 }}>
                      {!isMe && <Avatar c={contact} size={26} />}
                      <div style={{ maxWidth: "82%", background: isMe ? "#8B2635" : "#1a2f48", borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "8px 11px" }}>
                        <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "#e2e8f0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{renderMsgText(m.text)}</div>
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
          <div style={{ padding: "8px 10px", borderTop: "1px solid #334155", display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" style={{ display: "none" }} onChange={handleFileSelect} />
            <div style={{ display: "flex", gap: 6 }}>
              {(contact.kind === "group" || contact.kind === "human") && (
                <button onClick={() => fileRef.current?.click()} disabled={uploading || !connected}
                  style={{ padding: "8px 10px", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", color: uploading ? "#f59e0b" : "#94a3b8", flexShrink: 0 }}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
                </button>
              )}
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={
                  contact.kind === "group" || contact.kind === "human"
                    ? (connected ? "Mensagem... (Enter)" : "Conectando...")
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
            {contact.kind === "agent" && (
              <button
                onClick={async () => {
                  const text = input.trim();
                  if (!text || !contact.agentName) return;
                  setInput("");
                  const taskMsg: AgentMsg = { role: "user", text: `⏳ Tarefa enviada: ${text}`, ts: Date.now() };
                  setAgentCtxs(p => ({ ...p, [contact.agentName!]: { msgs: [...(p[contact.agentName!]?.msgs ?? []), taskMsg], convId: p[contact.agentName!]?.convId ?? null } }));
                  await taskMutation.mutateAsync({ agentName: contact.agentName!, message: text });
                }}
                disabled={!input.trim() || taskMutation.isPending}
                style={{ width: "100%", padding: "5px", background: "#1e3a5f", color: "#93c5fd", border: "1px solid #2563eb", borderRadius: 6, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: !input.trim() ? 0.4 : 1 }}
              >
                <Clock size={11} />
                Enviar como tarefa (responde quando terminar)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
