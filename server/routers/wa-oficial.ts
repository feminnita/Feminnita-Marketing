import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { waOficialConfig } from "../../drizzle/schema";
import { enviarTexto, criarModelo } from "../_core/wa-cloud";

// Tela "WhatsApp Oficial": configurar a Cloud API da Lia, ligar/desligar,
// enviar mensagem de teste e criar modelo (os dois videos da analise da Meta).
// So a dona da conta (userId 1). Token e App Secret nunca voltam inteiros.
const USER_ID = 1;
const mascarar = (v?: string | null) => (v ? `••••${v.slice(-4)}` : "");
const CAMPOS = ["phoneNumberId", "accessToken", "appSecret", "verifyToken", "wabaId"] as const;

const donoProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.id !== USER_ID) throw new TRPCError({ code: "FORBIDDEN", message: "Só a dona da conta configura o WhatsApp oficial" });
  return next();
});

async function linha() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });
  const [c] = await db.select().from(waOficialConfig).where(eq(waOficialConfig.userId, USER_ID)).limit(1);
  if (c) return { db, c };
  await db.insert(waOficialConfig).values({ userId: USER_ID });
  const [novo] = await db.select().from(waOficialConfig).where(eq(waOficialConfig.userId, USER_ID)).limit(1);
  return { db, c: novo };
}

export const waOficialRouter = router({
  info: donoProcedure.query(async () => {
    const { c } = await linha();
    return {
      phoneNumberId: c.phoneNumberId ?? "", wabaId: c.wabaId ?? "", verifyToken: c.verifyToken ?? "",
      accessToken: mascarar(c.accessToken), appSecret: mascarar(c.appSecret), ativo: !!c.ativo,
      callbackUrl: "https://marketing.feminnita.com.br/api/webhooks/whatsapp-oficial",
      modo: process.env.WA_MODO || "teste",
    };
  }),
  salvar: donoProcedure.input(z.object({ campo: z.enum(CAMPOS), valor: z.string().trim().min(1) })).mutation(async ({ input }) => {
    const { db } = await linha();
    await db.update(waOficialConfig).set({ [input.campo]: input.valor }).where(eq(waOficialConfig.userId, USER_ID));
    return { ok: true };
  }),
  ligar: donoProcedure.input(z.object({ ativo: z.boolean() })).mutation(async ({ input }) => {
    const { db } = await linha();
    await db.update(waOficialConfig).set({ ativo: input.ativo }).where(eq(waOficialConfig.userId, USER_ID));
    return { ok: true };
  }),
  enviarTeste: donoProcedure.input(z.object({ para: z.string().regex(/^\d{10,15}$/), texto: z.string().min(1).max(1000) })).mutation(async ({ input }) => {
    const { c } = await linha();
    if (!c.phoneNumberId || !c.accessToken) return { ok: false, erro: "Configure o Phone number ID e o token" };
    return enviarTexto(c.phoneNumberId, c.accessToken, input.para, input.texto);
  }),
  criarModelo: donoProcedure.input(z.object({ nome: z.string().regex(/^[a-z0-9_]{3,60}$/), texto: z.string().min(5).max(1000) })).mutation(async ({ input }) => {
    const { c } = await linha();
    if (!c.wabaId || !c.accessToken) return { ok: false, erro: "Configure o WhatsApp Business Account ID e o token" };
    return criarModelo(c.wabaId, c.accessToken, input.nome, input.texto);
  }),
});
