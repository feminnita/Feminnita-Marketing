import { useState, useRef, useCallback } from "react";

type Segment = { id: number; start: number; end: number; text: string };
type TranscriptionResult = { text: string; language: string; duration: number; segments: Segment[] };

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function TranscricaoReuniaoPage() {
  const [tab, setTab] = useState<"transcricao" | "notas">("transcricao");
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [language, setLanguage] = useState("pt");
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setFileName(file.name);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("language", language);
      const res = await fetch("/api/transcricao/audio", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao transcrever");
      setResult(data);
      setTab("transcricao");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [language]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const copyText = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result.text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName?.replace(/\.[^.]+$/, "") || "transcricao"}.txt`;
    a.click();
  };

  const downloadSrt = () => {
    if (!result?.segments?.length) return;
    const srt = result.segments.map((s, i) => {
      const toSrtTime = (sec: number) => {
        const h = Math.floor(sec / 3600).toString().padStart(2, "0");
        const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
        const s2 = Math.floor(sec % 60).toString().padStart(2, "0");
        const ms = Math.round((sec % 1) * 1000).toString().padStart(3, "0");
        return `${h}:${m}:${s2},${ms}`;
      };
      return `${i + 1}\n${toSrtTime(s.start)} --> ${toSrtTime(s.end)}\n${s.text.trim()}\n`;
    }).join("\n");
    const blob = new Blob([srt], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName?.replace(/\.[^.]+$/, "") || "transcricao"}.srt`;
    a.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "Inter, sans-serif", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>🎙️</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>Transcrição de Reunião</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Whisper AI — áudio e vídeo até 100MB</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, color: "#94a3b8" }}>Idioma:</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{
              background: "#1e293b", border: "1px solid #334155", borderRadius: 6,
              color: "#e2e8f0", padding: "4px 8px", fontSize: 13, cursor: "pointer",
            }}
          >
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left panel */}
        <div>
          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? "#a855f7" : "#334155"}`,
              borderRadius: 14,
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: dragOver ? "#1e1b4b" : "#1e293b",
              transition: "all 0.2s",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>📁</div>
            <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>
              Solte o arquivo aqui
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
              ou clique para selecionar
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "#475569" }}>
              MP3, MP4, WAV, M4A, WEBM, OGG
            </p>
            <input ref={fileInputRef} type="file" accept="audio/*,video/*" onChange={handleFileChange} style={{ display: "none" }} />
          </div>

          {/* File info */}
          {fileName && (
            <div style={{
              background: "#1e293b", borderRadius: 10, padding: "12px 16px",
              marginBottom: 16, border: "1px solid #334155",
            }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Arquivo</div>
              <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500, wordBreak: "break-all" }}>{fileName}</div>
              {result && (
                <div style={{ marginTop: 8, display: "flex", gap: 12, fontSize: 12, color: "#64748b" }}>
                  <span>⏱ {formatTime(result.duration)}</span>
                  <span>🌐 {result.language.toUpperCase()}</span>
                  <span>📝 {result.segments?.length || 0} segmentos</span>
                </div>
              )}
            </div>
          )}

          {/* Status */}
          {loading && (
            <div style={{
              background: "#1e1b4b", border: "1px solid #4c1d95", borderRadius: 10,
              padding: "16px", marginBottom: 16, textAlign: "center",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "3px solid #7c3aed", borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite", margin: "0 auto 10px",
              }} />
              <p style={{ margin: 0, fontSize: 13, color: "#a78bfa" }}>Transcrevendo com Whisper AI...</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#6d28d9" }}>Isso pode levar alguns minutos</p>
            </div>
          )}

          {error && (
            <div style={{
              background: "#450a0a", border: "1px solid #991b1b", borderRadius: 10,
              padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#fca5a5",
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Export buttons */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={copyText} style={{
                background: copied ? "#166534" : "#1e293b",
                border: "1px solid #334155", borderRadius: 8,
                color: "#e2e8f0", padding: "10px 16px", fontSize: 13,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 500,
              }}>
                {copied ? "✅ Copiado!" : "📋 Copiar texto completo"}
              </button>
              <button onClick={downloadTxt} style={{
                background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
                color: "#e2e8f0", padding: "10px 16px", fontSize: 13,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 500,
              }}>
                ⬇️ Baixar como .TXT
              </button>
              {result.segments?.length > 0 && (
                <button onClick={downloadSrt} style={{
                  background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
                  color: "#e2e8f0", padding: "10px 16px", fontSize: 13,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 500,
                }}>
                  🎬 Baixar legendas .SRT
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{
          background: "#1e293b", borderRadius: 14, border: "1px solid #334155",
          minHeight: 520, display: "flex", flexDirection: "column",
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #334155", padding: "0 20px" }}>
            {(["transcricao", "notas"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: "none", border: "none", padding: "14px 16px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  color: tab === t ? "#a855f7" : "#64748b",
                  borderBottom: `2px solid ${tab === t ? "#a855f7" : "transparent"}`,
                  marginBottom: -1,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {t === "transcricao" ? "🎙️ TRANSCRIÇÃO" : "✏️ NOTAS"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: 20, overflowY: "auto", maxHeight: 600 }}>
            {tab === "transcricao" && (
              <>
                {!result && !loading && (
                  <div style={{
                    background: "#fefce8", borderRadius: 10, padding: "16px 20px",
                    color: "#713f12", fontSize: 13, fontWeight: 500,
                  }}>
                    📁 Selecione um arquivo de áudio ou vídeo da reunião para ver a transcrição aqui.
                  </div>
                )}

                {result && (
                  <div>
                    {result.segments?.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {result.segments.map(seg => (
                          <div key={seg.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <span style={{
                              fontSize: 11, color: "#7c3aed", fontWeight: 600, fontFamily: "monospace",
                              background: "#1e1b4b", padding: "2px 8px", borderRadius: 6,
                              flexShrink: 0, marginTop: 1,
                            }}>
                              {formatTime(seg.start)}
                            </span>
                            <p style={{ margin: 0, fontSize: 14, color: "#e2e8f0", lineHeight: 1.6 }}>
                              {seg.text.trim()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.7 }}>{result.text}</p>
                    )}
                  </div>
                )}
              </>
            )}

            {tab === "notas" && (
              <div style={{ height: "100%" }}>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Anote os pontos importantes da reunião aqui..."
                  style={{
                    width: "100%", minHeight: 400, background: "#0f172a",
                    border: "1px solid #334155", borderRadius: 8,
                    color: "#e2e8f0", padding: "12px 14px", fontSize: 14,
                    lineHeight: 1.7, resize: "vertical", fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                {notes && (
                  <button
                    onClick={() => {
                      const blob = new Blob([notes], { type: "text/plain" });
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = "notas-reuniao.txt";
                      a.click();
                    }}
                    style={{
                      marginTop: 10, background: "#1e293b", border: "1px solid #334155",
                      borderRadius: 8, color: "#e2e8f0", padding: "8px 16px",
                      fontSize: 13, cursor: "pointer",
                    }}
                  >
                    ⬇️ Baixar notas
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .transcricao-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
