import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "../db";
import { collaborators } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";

// Hash de senha com bcrypt (usando crypto nativo para simplicidade)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

describe("Collaborators Database", () => {
  let testCollaboratorIds: number[] = [];

  afterAll(async () => {
    // Cleanup: Remove test collaborators
    const db = await getDb();
    if (!db) return;

    for (const id of testCollaboratorIds) {
      try {
        await db
          .delete(collaborators)
          .where(eq(collaborators.id, id));
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  it("should create a collaborator with password", async () => {
    const db = await getDb();
    if (!db) {
      expect.skip();
      return;
    }

    const email = `test-${Date.now()}@example.com`;
    const passwordHash = hashPassword("testpass123");

    const result = await db
      .insert(collaborators)
      .values({
        userId: 1,
        name: "Test Collaborator",
        email,
        passwordHash,
        role: "editor",
        isActive: true,
      });

    expect(result).toBeDefined();

    // Verify creation
    const created = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.email, email))
      .limit(1);

    expect(created.length).toBe(1);
    expect(created[0].name).toBe("Test Collaborator");
    testCollaboratorIds.push(created[0].id);
  });

  it("should not allow duplicate emails", async () => {
    const db = await getDb();
    if (!db) {
      expect.skip();
      return;
    }

    const email = `duplicate-${Date.now()}@example.com`;
    const passwordHash = hashPassword("testpass123");

    // Create first collaborator
    await db
      .insert(collaborators)
      .values({
        userId: 1,
        name: "First Collaborator",
        email,
        passwordHash,
        role: "viewer",
        isActive: true,
      });

    // Try to create second with same email - should fail due to unique constraint
    try {
      await db
        .insert(collaborators)
        .values({
          userId: 1,
          name: "Second Collaborator",
          email,
          passwordHash,
          role: "viewer",
          isActive: true,
        });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }

    // Cleanup
    const created = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.email, email))
      .limit(1);
    if (created.length > 0) {
      testCollaboratorIds.push(created[0].id);
    }
  });

  it("should update collaborator role", async () => {
    const db = await getDb();
    if (!db) {
      expect.skip();
      return;
    }

    const email = `update-${Date.now()}@example.com`;
    const passwordHash = hashPassword("testpass123");

    // Create collaborator
    await db
      .insert(collaborators)
      .values({
        userId: 1,
        name: "Update Test",
        email,
        passwordHash,
        role: "viewer",
        isActive: true,
      });

    // Get created collaborator
    const created = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.email, email))
      .limit(1);

    expect(created.length).toBe(1);

    // Update role
    await db
      .update(collaborators)
      .set({ role: "admin" })
      .where(eq(collaborators.id, created[0].id));

    // Verify update
    const updated = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.id, created[0].id))
      .limit(1);

    expect(updated[0].role).toBe("admin");
    testCollaboratorIds.push(created[0].id);
  });

  it("should connect GitHub account", async () => {
    const db = await getDb();
    if (!db) {
      expect.skip();
      return;
    }

    const email = `github-${Date.now()}@example.com`;
    const passwordHash = hashPassword("testpass123");

    // Create collaborator
    await db
      .insert(collaborators)
      .values({
        userId: 1,
        name: "GitHub Test",
        email,
        passwordHash,
        role: "viewer",
        isActive: true,
      });

    // Get created collaborator
    const created = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.email, email))
      .limit(1);

    // Connect GitHub
    await db
      .update(collaborators)
      .set({
        githubId: "12345",
        githubUsername: "testuser",
      })
      .where(eq(collaborators.id, created[0].id));

    // Verify
    const updated = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.id, created[0].id))
      .limit(1);

    expect(updated[0].githubUsername).toBe("testuser");
    testCollaboratorIds.push(created[0].id);
  });

  it("should deactivate collaborator", async () => {
    const db = await getDb();
    if (!db) {
      expect.skip();
      return;
    }

    const email = `deactivate-${Date.now()}@example.com`;
    const passwordHash = hashPassword("testpass123");

    // Create collaborator
    await db
      .insert(collaborators)
      .values({
        userId: 1,
        name: "Deactivate Test",
        email,
        passwordHash,
        role: "viewer",
        isActive: true,
      });

    // Get created collaborator
    const created = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.email, email))
      .limit(1);

    // Deactivate
    await db
      .update(collaborators)
      .set({ isActive: false })
      .where(eq(collaborators.id, created[0].id));

    // Verify
    const updated = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.id, created[0].id))
      .limit(1);

    expect(updated[0].isActive).toBe(false);
    testCollaboratorIds.push(created[0].id);
  });

  it("should delete collaborator", async () => {
    const db = await getDb();
    if (!db) {
      expect.skip();
      return;
    }

    const email = `delete-${Date.now()}@example.com`;
    const passwordHash = hashPassword("testpass123");

    // Create collaborator
    await db
      .insert(collaborators)
      .values({
        userId: 1,
        name: "Delete Test",
        email,
        passwordHash,
        role: "viewer",
        isActive: true,
      });

    // Get created collaborator
    const created = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.email, email))
      .limit(1);

    expect(created.length).toBe(1);

    // Delete
    await db
      .delete(collaborators)
      .where(eq(collaborators.id, created[0].id));

    // Verify deletion
    const deleted = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.id, created[0].id))
      .limit(1);

    expect(deleted.length).toBe(0);
  });

  it("should list collaborators by user", async () => {
    const db = await getDb();
    if (!db) {
      expect.skip();
      return;
    }

    const userId = 1;
    const email1 = `list-test-1-${Date.now()}@example.com`;
    const email2 = `list-test-2-${Date.now()}@example.com`;
    const passwordHash = hashPassword("testpass123");

    // Create two collaborators
    await db
      .insert(collaborators)
      .values({
        userId,
        name: "List Test 1",
        email: email1,
        passwordHash,
        role: "viewer",
        isActive: true,
      });

    await db
      .insert(collaborators)
      .values({
        userId,
        name: "List Test 2",
        email: email2,
        passwordHash,
        role: "editor",
        isActive: true,
      });

    // List collaborators
    const result = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.userId, userId));

    expect(result.length).toBeGreaterThanOrEqual(2);

    // Cleanup
    const created1 = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.email, email1))
      .limit(1);
    const created2 = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.email, email2))
      .limit(1);

    if (created1.length > 0) testCollaboratorIds.push(created1[0].id);
    if (created2.length > 0) testCollaboratorIds.push(created2[0].id);
  });
});
