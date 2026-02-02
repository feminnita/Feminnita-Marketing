import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { collaborators } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";

// Hash de senha com bcrypt (usando crypto nativo para simplicidade)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
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
      const db2 = await getDb();
      if (!db2) throw new Error("Database not available");
      await db2
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
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(collaborators)
        .set({
          githubId: input.githubId,
          githubUsername: input.githubUsername,
        })
        .where(eq(collaborators.id, input.collaboratorId));

      const result = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.id, input.collaboratorId))
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
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updates: any = {};
      if (input.name) updates.name = input.name;
      if (input.role) updates.role = input.role;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db
        .update(collaborators)
        .set(updates)
        .where(eq(collaborators.id, input.collaboratorId));

      const result = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.id, input.collaboratorId))
        .limit(1);

      return {
        success: true,
        collaborator: result[0],
      };
    }),

  // Deletar colaborador
  deleteCollaborator: protectedProcedure
    .input(z.object({ collaboratorId: z.number() }))
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(collaborators)
        .where(eq(collaborators.id, input.collaboratorId));

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
    .mutation(async ({ input }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const passwordHash = hashPassword(input.newPassword);

      await db
        .update(collaborators)
        .set({ passwordHash })
        .where(eq(collaborators.id, input.collaboratorId));

      const result = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.id, input.collaboratorId))
        .limit(1);

      return {
        success: true,
        collaborator: result[0],
      };
    }),
});
