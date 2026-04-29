import { useState } from "react";
import { MessageCircle, Copy, CheckCircle, Bot, Zap } from "lucide-react";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#0f172a", borderRadius: 8, padding: "10px 14px",
        fontFamily: "monospace", fontSize: 13, border: "1px solid #1e293b",
      }}>
        <span style={{ color: "#60a5fa", flex: 1, wordBreak: "break-all" }}>{value}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#22c55e" : "#64748b", flexShrink: 0 }}
        >
          {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  );
}

function EnvField({ envKey, example, label }: { envKey: string; example: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const text = `${envKey}=${example}`;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#0f172a", borderRadius: 6, padding: "8px 12px",
        fontFamily: "monospace", fontSize: 12, border: "1px solid #1e293b",
      }}>
        <span style={{ color: "#f472b6" }}>{envKey}</span>
        <span style={{ color: "#475569" }}>=</span>
        <span style={{ color: "#94a3b8", fontStyle: "italic", flex: 1 }}>{example}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#22c55e" : "#64748b" }}
        >
          {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

export default function WhatsAppFunnelPage() {
  const webhookUrl = `${window.location.origin}/api/whatsapp/funnel`;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <MessageCircle size={24} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>
            Ana — Atendente WhatsApp
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
            Funil de vendas automatizado com IA via Meta Cloud API
          </p>
        </div>
      </div>

      {/* Agent info */}
      <div style={{
        background: "#1e293b", borderRadius: 12, padding: "18px 20px",
        marginBottom: 20, border: "1px solid #334155",
        display: "flex", gap: 16, alignItems: "flex-start",
      }}>
        <Bot size={28} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
            O que a Ana faz
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", color: "#94a3b8", fontSize: 13, lineHeight: 1.8 }}>
            <li>Responde clientes automaticamente assim que chegam mensagens</li>
            <li>Apresenta o catálogo, preços, tamanhos e cores disponíveis</li>
            <li>Ajuda a escolher o tamanho pela tabela de medidas</li>
            <li>Direciona para o link de compra no Mercado Livre</li>
            <li>Mantém histórico da conversa para contexto contínuo</li>
          </ul>
        </div>
      </div>

      {/* Setup Steps */}
      <div style={{
        background: "#1e293b", borderRadius: 12, padding: "20px",
        border: "1px solid #334155", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <Zap size={16} color="#f59e0b" />
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>
            Configuração — Passo a Passo
          </h2>
        </div>

        <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16, lineHeight: 1.7 }}>
          <strong style={{ color: "#f1f5f9" }}>1.</strong> Acesse{" "}
          <span style={{ color: "#60a5fa", fontFamily: "monospace" }}>developers.facebook.com</span>
          {" "}→ seu app → <strong style={{ color: "#f1f5f9" }}>WhatsApp → Configuração</strong>
        </div>

        <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>
          <strong style={{ color: "#f1f5f9" }}>2.</strong> Em <strong style={{ color: "#f1f5f9" }}>Webhooks</strong>, clique em "Editar" e use os dados abaixo:
        </div>

        <div style={{ paddingLeft: 16, marginBottom: 16 }}>
          <CopyField label="URL do Webhook" value={webhookUrl} />
          <CopyField label="Token de Verificação" value="feminnita-funnel-2026" />
        </div>

        <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>
          <strong style={{ color: "#f1f5f9" }}>3.</strong> Em <strong style={{ color: "#f1f5f9" }}>Campos do Webhook</strong>, assine: <code style={{ background: "#0f172a", padding: "2px 6px", borderRadius: 4, color: "#a78bfa" }}>messages</code>
        </div>

        <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>
          <strong style={{ color: "#f1f5f9" }}>4.</strong> Adicione as variáveis de ambiente no servidor <code style={{ background: "#0f172a", padding: "2px 6px", borderRadius: 4, color: "#94a3b8" }}>/opt/marketing/.env</code>:
        </div>

        <div style={{ paddingLeft: 16 }}>
          <EnvField
            label="Token de acesso permanente (System User Token no Meta Business)"
            envKey="WHATSAPP_ACCESS_TOKEN"
            example="EAABxxxxxxxxxxxxxxxx"
          />
          <EnvField
            label="ID do número de telefone (WhatsApp → Configuração → ID do número)"
            envKey="WHATSAPP_PHONE_NUMBER_ID"
            example="123456789012345"
          />
          <EnvField
            label="Verify token do webhook (já configurado no código)"
            envKey="WHATSAPP_FUNNEL_VERIFY_TOKEN"
            example="feminnita-funnel-2026"
          />
        </div>

        <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 12 }}>
          <strong style={{ color: "#f1f5f9" }}>5.</strong> Reinicie o servidor:{" "}
          <code style={{ background: "#0f172a", padding: "2px 8px", borderRadius: 4, color: "#94a3b8", fontFamily: "monospace" }}>
            sudo systemctl restart marketing
          </code>
        </div>
      </div>

      {/* Test */}
      <div style={{
        background: "#1e293b", borderRadius: 12, padding: "18px 20px",
        border: "1px solid #334155",
      }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>
          Testando
        </h2>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>
          Após configurar, envie uma mensagem de texto para o número WhatsApp da Feminnita.
          A Ana deve responder em até 5 segundos. Se não responder, verifique os logs:{" "}
          <code style={{ background: "#0f172a", padding: "2px 8px", borderRadius: 4, color: "#94a3b8" }}>
            journalctl -u marketing -f | grep "WA Funnel"
          </code>
        </p>
      </div>
    </div>
  );
}
