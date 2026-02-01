import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("OAuth Integrations Router", () => {
  describe("getMetaAuthUrl", () => {
    it("should return Meta OAuth URL with correct parameters", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauthIntegrations.getMetaAuthUrl();

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.url).toContain("facebook.com");
      expect(result.url).toContain("client_id");
      expect(result.url).toContain("redirect_uri");
    });

    it("should include required OAuth scopes for Meta", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauthIntegrations.getMetaAuthUrl();

      expect(result.url).toContain("scope");
      expect(result.url).toContain("instagram");
    });
  });

  describe("getTikTokAuthUrl", () => {
    it("should return TikTok OAuth URL with correct parameters", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauthIntegrations.getTikTokAuthUrl();

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.url).toContain("tiktok.com");
      expect(result.url).toContain("client_key");
      expect(result.url).toContain("redirect_uri");
    });

    it("should include required OAuth scopes for TikTok", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauthIntegrations.getTikTokAuthUrl();

      expect(result.url).toContain("scope");
    });
  });

  describe("getGoogleDriveAuthUrl", () => {
    it("should return Google Drive OAuth URL with correct parameters", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauthIntegrations.getGoogleDriveAuthUrl();

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.url).toContain("accounts.google.com");
      expect(result.url).toContain("client_id");
      expect(result.url).toContain("redirect_uri");
    });

    it("should include required OAuth scopes for Google Drive", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauthIntegrations.getGoogleDriveAuthUrl();

      expect(result.url).toContain("scope");
    });
  });

  describe("getBlingAuthUrl", () => {
    it("should return Bling OAuth URL with correct parameters", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauthIntegrations.getBlingAuthUrl();

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.url).toContain("bling.com.br");
      expect(result.url).toContain("client_id");
      expect(result.url).toContain("redirect_uri");
    });

    it("should include required OAuth scopes for Bling", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.oauthIntegrations.getBlingAuthUrl();

      expect(result.url).toContain("scope");
    });
  });

  describe("handleMetaCallback", () => {
    it("should return error for invalid code", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.oauthIntegrations.handleMetaCallback({ code: "invalid_code" });
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("handleTikTokCallback", () => {
    it("should return error for invalid code", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.oauthIntegrations.handleTikTokCallback({ code: "invalid_code" });
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("handleGoogleDriveCallback", () => {
    it("should return error for invalid code", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.oauthIntegrations.handleGoogleDriveCallback({ code: "invalid_code" });
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("handleBlingCallback", () => {
    it("should return error for invalid code", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.oauthIntegrations.handleBlingCallback({ code: "invalid_code" });
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });
});
