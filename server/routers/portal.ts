import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { router, publicProcedure, protectedProcedure, portalProtectedProcedure } from "../_core/trpc";
import { portalSdk, PORTAL_COOKIE_NAME } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
import { ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import { sendTextMessage, getActiveSessions } from "../_core/baileys-service";

async function notifyAdminPortalRequest(name: string, email: string, profileType: string, instagram?: string) {
  try {
    const sessions = getActiveSessions();
    if (sessions.length === 0) return;
    const session = sessions[0];
    if (!session.phoneNumber) return;
    const perfil = profileType === "revendedora" ? "Revendedora" : "Influencer";
    const ig = instagram ? `\nInstagram: ${instagram}` : "";
    const msg = `🔔 *Nova solicitação na Sala de Arquivos*\n\n👤 ${name}\n📧 ${email}\n🏷️ ${perfil}${ig}\n\nAcesse /gestao-portal para aprovar ou recusar.`;
    await sendTextMessage(session.userId, session.phoneNumber, msg);
  } catch {
    // notificação é best-effort, não bloqueia o cadastro
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  const hashBuf = Buffer.from(hash, "hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashBuf, derived);
}

const CATEGORIES = ["fotos", "videos", "banners", "copy", "lookbook", "calculadora", "links", "treinamento"] as const;
const AVAILABLE_TO = ["revendedora", "influencer", "ambos"] as const;
const PROFILE_TYPES = ["revendedora", "influencer"] as const;
const STATUSES = ["pending", "approved", "blocked"] as const;

export const portalRouter = router({
  me: publicProcedure.query(opts => opts.ctx.portalUser ?? null),

  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getPortalUserByEmail(input.email);
      if (!user || !user.passwordHash) throw new Error("Email ou senha inválidos");
      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) throw new Error("Email ou senha inválidos");
      if (user.status === "blocked") throw new Error("Sua conta está bloqueada. Entre em contato.");
      if (user.status === "pending") throw new Error("Sua solicitação ainda está pendente de aprovação.");
      const token = await portalSdk.signSession({ userId: user.id, email: user.email });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(PORTAL_COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      const { passwordHash: _, ...safeUser } = user;
      return { success: true as const, user: safeUser };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(PORTAL_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),

  solicitarAcesso: publicProcedure
    .input(z.object({
      name: z.string().min(2, "Nome obrigatório"),
      email: z.string().email("Email inválido"),
      password: z.string().min(6, "Senha mínima de 6 caracteres"),
      profileType: z.enum(PROFILE_TYPES),
      instagramHandle: z.string().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const existing = await db.getPortalUserByEmail(input.email);
      if (existing) throw new Error("Este email já está cadastrado");
      const passwordHash = await hashPassword(input.password);
      await db.createPortalUser({
        email: input.email,
        passwordHash,
        name: input.name,
        profileType: input.profileType,
        instagramHandle: input.instagramHandle,
        phone: input.phone,
      });
      notifyAdminPortalRequest(input.name, input.email, input.profileType, input.instagramHandle);
      return { success: true as const };
    }),

  materiais: portalProtectedProcedure.query(async ({ ctx }) => {
    return db.listPortalMaterials(ctx.portalUser.profileType);
  }),

  admin: router({
    listUsers: protectedProcedure.query(async () => {
      const users = await db.listPortalUsers();
      return users.map(u => {
        const { passwordHash: _, ...safe } = u;
        return safe;
      });
    }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(STATUSES),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updatePortalUserStatus(input.id, input.status, ctx.user.id);
        return { success: true };
      }),

    listMaterials: protectedProcedure.query(async () => {
      return db.listAllPortalMaterials();
    }),

    createMaterial: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(CATEGORIES),
        subcategory: z.string().optional(),
        url: z.string().url("URL inválida"),
        filename: z.string().optional(),
        availableTo: z.enum(AVAILABLE_TO),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createPortalMaterial({ ...input, uploadedBy: ctx.user.id });
        return { success: true };
      }),

    updateMaterial: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.enum(CATEGORIES).optional(),
        subcategory: z.string().optional(),
        url: z.string().url().optional(),
        filename: z.string().optional(),
        availableTo: z.enum(AVAILABLE_TO).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updatePortalMaterial(id, data);
        return { success: true };
      }),

    deleteMaterial: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deactivatePortalMaterial(input.id);
        return { success: true };
      }),
  }),
});
