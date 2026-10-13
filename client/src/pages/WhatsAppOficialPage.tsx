import { useState } from "react";
import { trpc } from "@/lib/trpc";

// WhatsApp Oficial (Cloud API) da Lia: credenciais coladas aqui (nunca no chat),
// ligar/desligar, envio de teste e criacao de modelo para a analise da Meta.
const ROTULO: Record<string, string> = {
  phoneNumberId: "Phone number ID",
  wabaId: "WhatsApp Business Account ID",
  accessToken: "Token de acesso",
  appSecret: "App Secret",
  verifyToken: "Verify token (você inventa)",
};
type Campo = "phoneNumberId" | "accessToken" | "appSecret" | "verifyToken" | "wabaId";

export default function WhatsAppOficialPage() {
  const info = trpc.waOficial.info.useQuery();
  const salvar = trpc.waOficial.salvar.useMutation({ onSuccess: () => info.refetch() });
  const ligar = trpc.waOficial.ligar.useMutation({ onSuccess: () => info.refetch() });
  const enviar = trpc.waOficial.enviarTeste.useMutation();
  const modelo = trpc.waOficial.criarModelo.useMutation();
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [para, setPara] = useState("");
  const [texto, setTexto] = useState("Olá! Esta é uma mensagem de teste da Armmís.");
  const [nomeModelo, setNomeModelo] = useState("pedido_postado_armmis");
  const [textoModelo, setTextoModelo] = useState("Olá {{1}}, seu pedido {{2}} foi postado. Acompanhe pelo site da Armmís.");

  if (info.error) return <div className="p-6 text-red-600">{info.error.message}</div>;
  const d = info.data;
  if (!d) return <div className="p-6">Carregando…</div>;

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">WhatsApp Oficial</h1>
        <p className="text-sm">
          Modo: <b>{d.modo === "producao" ? "produção (todas as clientes)" : "teste (só números autorizados)"}</b> · Lia: <b>{d.ativo ? "ligada" : "desligada"}</b>
          <button className="ml-3 rounded border px-2 py-0.5" onClick={() => ligar.mutate({ ativo: !d.ativo })}>
            {d.ativo ? "Desligar" : "Ligar"}
          </button>
        </p>
        <p className="text-sm">Callback URL para a Meta: <code className="select-all">{d.callbackUrl}</code></p>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">Credenciais da Meta</h2>
        {(Object.keys(ROTULO) as Campo[]).map((k) => (
          <div key={k} className="flex flex-wrap items-center gap-2">
            <label className="w-64 text-sm" htmlFor={`wa-${k}`}>{ROTULO[k]}</label>
            <input id={`wa-${k}`} className="flex-1 rounded border px-2 py-1" placeholder={(d as any)[k] || "vazio"}
              value={campos[k] ?? ""} onChange={(e) => setCampos({ ...campos, [k]: e.target.value })} />
            <button className="rounded border px-2 py-1" disabled={!campos[k]}
              onClick={() => salvar.mutate({ campo: k, valor: campos[k] }, { onSuccess: () => setCampos({ ...campos, [k]: "" }) })}>
              Salvar
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Enviar mensagem de teste</h2>
        <input id="wa-para" className="w-full rounded border px-2 py-1" placeholder="Número com DDI, só dígitos (5522...)" value={para} onChange={(e) => setPara(e.target.value)} />
        <textarea id="wa-texto" className="w-full rounded border px-2 py-1" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <button className="rounded border px-3 py-1" disabled={enviar.isPending} onClick={() => enviar.mutate({ para, texto })}>Enviar</button>
        {enviar.error && <p className="text-sm text-red-600">{enviar.error.message}</p>}
        {enviar.data && <p className="text-sm">{enviar.data.ok ? "Enviado ✅" : `Erro: ${enviar.data.erro}`}</p>}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Criar modelo de mensagem</h2>
        <input id="wa-modelo-nome" className="w-full rounded border px-2 py-1" value={nomeModelo} onChange={(e) => setNomeModelo(e.target.value)} />
        <textarea id="wa-modelo-texto" className="w-full rounded border px-2 py-1" value={textoModelo} onChange={(e) => setTextoModelo(e.target.value)} />
        <button className="rounded border px-3 py-1" disabled={modelo.isPending} onClick={() => modelo.mutate({ nome: nomeModelo, texto: textoModelo })}>Criar modelo</button>
        {modelo.error && <p className="text-sm text-red-600">{modelo.error.message}</p>}
        {modelo.data && <p className="text-sm">{modelo.data.ok ? `Modelo criado ✅ (${modelo.data.id})` : `Erro: ${modelo.data.erro}`}</p>}
      </section>
    </div>
  );
}
