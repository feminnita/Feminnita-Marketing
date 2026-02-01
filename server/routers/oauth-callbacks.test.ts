import { describe, it, expect, beforeEach, vi } from "vitest";
import { oauthCallbacksRouter } from "./oauth-callbacks";

// Mock the database functions
vi.mock("../db", () => ({
  saveOAuthToken: vi.fn(),
  getOAuthToken: vi.fn(),
  deleteOAuthToken: vi.fn(),
  updateOAuthTokenLastUsed: vi.fn(),
}));

import * as db from "../db";

describe("OAuth Callbacks Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveBlingToken", () => {
    it("should save Bling token successfully", async () => {
      const mockToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "test_token",
        refreshToken: "test_refresh",
        expiresAt: new Date(),
        scope: "read:products",
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.saveOAuthToken).mockResolvedValue(mockToken);

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.saveBlingToken({
        accessToken: "test_token",
        refreshToken: "test_refresh",
        expiresIn: 3600,
        scope: "read:products",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Bling");
      expect(db.saveOAuthToken).toHaveBeenCalledWith(1, "bling", expect.any(Object));
    });

    it("should handle errors when saving token", async () => {
      vi.mocked(db.saveOAuthToken).mockRejectedValue(new Error("DB Error"));

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.saveBlingToken({
        accessToken: "test_token",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Erro");
    });
  });

  describe("saveMetaToken", () => {
    it("should save Meta token successfully", async () => {
      const mockToken = {
        id: 2,
        userId: 1,
        plataforma: "meta" as const,
        accessToken: "meta_token",
        refreshToken: null,
        expiresAt: new Date(),
        scope: "pages_manage_metadata",
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.saveOAuthToken).mockResolvedValue(mockToken);

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.saveMetaToken({
        accessToken: "meta_token",
        expiresIn: 5184000,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Meta");
    });
  });

  describe("saveTikTokToken", () => {
    it("should save TikTok token successfully", async () => {
      const mockToken = {
        id: 3,
        userId: 1,
        plataforma: "tiktok" as const,
        accessToken: "tiktok_token",
        refreshToken: "tiktok_refresh",
        expiresAt: new Date(),
        scope: "user.info.basic",
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.saveOAuthToken).mockResolvedValue(mockToken);

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.saveTikTokToken({
        accessToken: "tiktok_token",
        refreshToken: "tiktok_refresh",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("TikTok");
    });
  });

  describe("saveGoogleDriveToken", () => {
    it("should save Google Drive token successfully", async () => {
      const mockToken = {
        id: 4,
        userId: 1,
        plataforma: "google_drive" as const,
        accessToken: "google_token",
        refreshToken: "google_refresh",
        expiresAt: new Date(),
        scope: "https://www.googleapis.com/auth/drive",
        accountInfo: null,
        isActive: true,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.saveOAuthToken).mockResolvedValue(mockToken);

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.saveGoogleDriveToken({
        accessToken: "google_token",
        refreshToken: "google_refresh",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Google Drive");
    });
  });

  describe("getTokenStatus", () => {
    it("should return connected status when token exists", async () => {
      const mockToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "test_token",
        refreshToken: null,
        expiresAt: new Date(Date.now() + 86400000), // Tomorrow
        scope: null,
        accountInfo: null,
        isActive: true,
        lastUsed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getOAuthToken).mockResolvedValue(mockToken);

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getTokenStatus({ platform: "bling" });

      expect(result.connected).toBe(true);
      expect(result.isExpired).toBe(false);
    });

    it("should return disconnected status when token does not exist", async () => {
      vi.mocked(db.getOAuthToken).mockResolvedValue(undefined);

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getTokenStatus({ platform: "meta" });

      expect(result.connected).toBe(false);
    });

    it("should detect expired tokens", async () => {
      const mockToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "test_token",
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

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getTokenStatus({ platform: "bling" });

      expect(result.connected).toBe(true);
      expect(result.isExpired).toBe(true);
    });
  });

  describe("disconnectPlatform", () => {
    it("should disconnect platform successfully", async () => {
      vi.mocked(db.deleteOAuthToken).mockResolvedValue(undefined);

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.disconnectPlatform({ platform: "bling" });

      expect(result.success).toBe(true);
      expect(result.message).toContain("desconectado");
      expect(db.deleteOAuthToken).toHaveBeenCalledWith(1, "bling");
    });

    it("should handle errors when disconnecting", async () => {
      vi.mocked(db.deleteOAuthToken).mockRejectedValue(new Error("DB Error"));

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.disconnectPlatform({ platform: "meta" });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Erro");
    });
  });

  describe("getConnectedPlatforms", () => {
    it("should return all connected platforms", async () => {
      const mockBlingToken = {
        id: 1,
        userId: 1,
        plataforma: "bling" as const,
        accessToken: "test",
        refreshToken: null,
        expiresAt: new Date(),
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

      const caller = oauthCallbacksRouter.createCaller({
        user: { id: 1, role: "user" },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getConnectedPlatforms();

      expect(result.platforms).toHaveLength(4);
      expect(result.count).toBe(1);
      expect(result.platforms.find((p) => p.platform === "bling")?.connected).toBe(true);
      expect(result.platforms.find((p) => p.platform === "meta")?.connected).toBe(false);
    });
  });
});
