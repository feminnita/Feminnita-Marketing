import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  validateToken,
  validateMultipleTokens,
  getConnectedPlatforms,
  checkTokenExpiringSoon,
  getTokenExpiryInfo,
} from "./token-validation";

// Mock the database functions
vi.mock("../db", () => ({
  getOAuthToken: vi.fn(),
  updateOAuthTokenLastUsed: vi.fn(),
}));

import * as db from "../db";

describe("Token Validation Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateToken", () => {
    it("should validate a valid token", async () => {
      const mockToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "valid_token",
        refreshToken: null,
        expiresAt: new Date(Date.now() + 86400000), // Tomorrow
        scope: null,
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getOAuthToken).mockResolvedValue(mockToken);

      const result = await validateToken(1, "bling");

      expect(result.valid).toBe(true);
      expect(result.token).toBe("valid_token");
      expect(result.error).toBeUndefined();
      expect(db.updateOAuthTokenLastUsed).toHaveBeenCalledWith(1, "bling");
    });

    it("should reject an expired token", async () => {
      const mockToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "expired_token",
        refreshToken: null,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        scope: null,
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getOAuthToken).mockResolvedValue(mockToken);

      const result = await validateToken(1, "bling");

      expect(result.valid).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.error).toContain("expirou");
    });

    it("should return error when token does not exist", async () => {
      vi.mocked(db.getOAuthToken).mockResolvedValue(undefined);

      const result = await validateToken(1, "meta");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("não está conectado");
    });

    it("should handle database errors", async () => {
      vi.mocked(db.getOAuthToken).mockRejectedValue(new Error("DB Error"));

      const result = await validateToken(1, "bling");

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Erro ao validar token");
    });
  });

  describe("validateMultipleTokens", () => {
    it("should validate multiple tokens", async () => {
      const mockBlingToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "bling_token",
        refreshToken: null,
        expiresAt: new Date(Date.now() + 86400000),
        scope: null,
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getOAuthToken).mockImplementation(async (userId, platform) => {
        if (platform === "bling") return mockBlingToken;
        return undefined;
      });

      const result = await validateMultipleTokens(1, ["bling", "meta", "tiktok"]);

      expect(result.bling.valid).toBe(true);
      expect(result.meta.valid).toBe(false);
      expect(result.tiktok.valid).toBe(false);
    });
  });

  describe("getConnectedPlatforms", () => {
    it("should return all connected platforms", async () => {
      const mockBlingToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "bling_token",
        refreshToken: null,
        expiresAt: new Date(Date.now() + 86400000),
        scope: null,
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMetaToken = {
        id: 2,
        userId: 1,
        plataforma: "meta" as const,
        accessToken: "meta_token",
        refreshToken: null,
        expiresAt: new Date(Date.now() + 86400000),
        scope: null,
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getOAuthToken).mockImplementation(async (userId, platform) => {
        if (platform === "bling") return mockBlingToken;
        if (platform === "meta") return mockMetaToken;
        return undefined;
      });

      const result = await getConnectedPlatforms(1);

      expect(result).toContain("bling");
      expect(result).toContain("meta");
      expect(result).not.toContain("tiktok");
      expect(result).not.toContain("google_drive");
    });
  });

  describe("checkTokenExpiringSoon", () => {
    it("should detect tokens expiring within 24 hours", async () => {
      const mockToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "token",
        refreshToken: null,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        scope: null,
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getOAuthToken).mockResolvedValue(mockToken);

      const result = await checkTokenExpiringSoon(1, "bling", 24);

      expect(result).toBe(true);
    });

    it("should not flag tokens expiring after threshold", async () => {
      const mockToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "token",
        refreshToken: null,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        scope: null,
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getOAuthToken).mockResolvedValue(mockToken);

      const result = await checkTokenExpiringSoon(1, "bling", 24);

      expect(result).toBe(false);
    });
  });

  describe("getTokenExpiryInfo", () => {
    it("should return expiry information for valid token", async () => {
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
      const mockToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "token",
        refreshToken: null,
        expiresAt,
        scope: null,
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getOAuthToken).mockResolvedValue(mockToken);

      const result = await getTokenExpiryInfo(1, "bling");

      expect(result.isExpired).toBe(false);
      expect(result.expiringsSoon).toBe(true);
      expect(result.expiresAt).toEqual(expiresAt);
      expect(result.expiresIn).toBeGreaterThan(0);
    });

    it("should detect expired tokens", async () => {
      const mockToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "token",
        refreshToken: null,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        scope: null,
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getOAuthToken).mockResolvedValue(mockToken);

      const result = await getTokenExpiryInfo(1, "bling");

      expect(result.isExpired).toBe(true);
      expect(result.expiringsSoon).toBe(false);
    });
  });
});
