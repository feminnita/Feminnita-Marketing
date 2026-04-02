import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { collaborators } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, and } from "drizzle-orm";
import * as crypto from "crypto";

// Rate limiter simples em memória para login
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || record.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + windowMs });
    return true; // permitido
  }
  if (record.count >= maxAttempts) return false; // bloqueado
  record.count++;
  return true; // permitido
}

// Hash seguro com scrypt (Node.js nativo) + salt aleatório
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  // Suporte a formato legado (SHA-256 sem salt) e novo formato (scrypt com salt)
  if (stored.includes(":")) {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const derived = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), derived);
  }
  // Legado SHA-256
  const legacy = crypto.createHash("sha256").update(password).digest("hex");
  return legacy === stored;
}

export const collaboratorsRouter = router({
  // Criar novo colaborador com senha
  createCollaborator: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["admin", "editor", "viewer"]).default("viewer"),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se email já existe
      const existing = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Email já cadastrado");
      }

      const passwordHash = hashPassword(input.password);

      await db.insert(collaborators).values({
        userId: ctx.user.id,
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        isActive: true,
      });

      const result = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.email, input.email))
        .limit(1);

      return {
        success: true,
        collaborator: result[0],
      };
    }),

  // Login com email e senha
  loginCollaborator: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (!checkRateLimit(input.email)) {
        throw new Error("Muitas tentativas de login. Tente novamente em 15 minutos.");
      }

      const result = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.email, input.email))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Colaborador não encontrado");
      }

      const collaborator = result[0];

      if (!verifyPassword(input.password, collaborator.passwordHash)) {
        throw new Error("Senha incorreta");
      }

      if (!collaborator.isActive) {
        throw new Error("Colaborador inativo");
      }

      // Atualizar lastLogin
      await db
        .update(collaborators)
        .set({ lastLogin: new Date() })
        .where(eq(collaborators.id, collaborator.id));

      return {
        success: true,
        collaborator: {
          id: collaborator.id,
          name: collaborator.name,
          email: collaborator.email,
          role: collaborator.role,
        },
      };
    }),

  // Conectar GitHub
  connectGitHub: protectedProcedure
    .input(
      z.object({
        collaboratorId: z.number(),
        githubId: z.string(),
        githubUsername: z.string(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(collaborators)
        .set({
          githubId: input.githubId,
          githubUsername: input.githubUsername,
        })
        .where(and(eq(collaborators.id, input.collaboratorId), eq(collaborators.userId, ctx.user.id)));

      const result = await db
        .select()
        .from(collaborators)
        .where(and(eq(collaborators.id, input.collaboratorId), eq(collaborators.userId, ctx.user.id)))
        .limit(1);

      return {
        success: true,
        collaborator: result[0],
      };
    }),

  // Listar colaboradores
  listCollaborators: protectedProcedure.query(async ({ ctx }: any) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.userId, ctx.user.id));

    return result.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role,
      githubUsername: c.githubUsername,
      isActive: c.isActive,
      lastLogin: c.lastLogin,
      createdAt: c.createdAt,
    }));
  }),

  // Atualizar colaborador
  updateCollaborator: protectedProcedure
    .input(
      z.object({
        collaboratorId: z.number(),
        name: z.string().optional(),
        role: z.enum(["admin", "editor", "viewer"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updates: any = {};
      if (input.name) updates.name = input.name;
      if (input.role) updates.role = input.role;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db
        .update(collaborators)
        .set(updates)
        .where(and(eq(collaborators.id, input.collaboratorId), eq(collaborators.userId, ctx.user.id)));

      const result = await db
        .select()
        .from(collaborators)
        .where(and(eq(collaborators.id, input.collaboratorId), eq(collaborators.userId, ctx.user.id)))
        .limit(1);

      return {
        success: true,
        collaborator: result[0],
      };
    }),

  // Deletar colaborador
  deleteCollaborator: protectedProcedure
    .input(z.object({ collaboratorId: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(collaborators)
        .where(and(eq(collaborators.id, input.collaboratorId), eq(collaborators.userId, ctx.user.id)));

      return { success: true };
    }),

  // Resetar senha
  resetPassword: protectedProcedure
    .input(
      z.object({
        collaboratorId: z.number(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const passwordHash = hashPassword(input.newPassword);

      await db
        .update(collaborators)
        .set({ passwordHash })
        .where(and(eq(collaborators.id, input.collaboratorId), eq(collaborators.userId, ctx.user.id)));

      const result = await db
        .select()
        .from(collaborators)
        .where(and(eq(collaborators.id, input.collaboratorId), eq(collaborators.userId, ctx.user.id)))
        .limit(1);

      return {
        success: true,
        collaborator: result[0],
      };
    }),
});
