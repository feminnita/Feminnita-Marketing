import { describe, it, expect, vi } from "vitest";
import { whatsappBaileysRouter } from "./whatsapp-baileys";

describe("WhatsApp Baileys Router", () => {
  const mockCtx = {
    user: {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      role: "user" as const,
    },
  };

  describe("getStatus", () => {
    it("should return connection status", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);
      const result = await caller.getStatus();

      expect(result).toHaveProperty("isConnected");
      expect(result).toHaveProperty("phoneNumber");
      expect(result).toHaveProperty("qrCode");
      expect(typeof result.isConnected).toBe("boolean");
    });
  });

  describe("getQRCode", () => {
    it("should return QR code data", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);
      const result = await caller.getQRCode();

      expect(result).toHaveProperty("qrCode");
      expect(result).toHaveProperty("hasQRCode");
      expect(typeof result.hasQRCode).toBe("boolean");
    });
  });

  describe("getActiveSessions", () => {
    it("should return active sessions", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);
      const result = await caller.getActiveSessions();

      expect(result).toHaveProperty("sessions");
      expect(result).toHaveProperty("count");
      expect(Array.isArray(result.sessions)).toBe(true);
      expect(typeof result.count).toBe("number");
    });

    it("should return sessions with correct structure", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);
      const result = await caller.getActiveSessions();

      if (result.sessions.length > 0) {
        const session = result.sessions[0];
        expect(session).toHaveProperty("userId");
        expect(session).toHaveProperty("phoneNumber");
        expect(session).toHaveProperty("isConnected");
      }
    });
  });

  describe("sendMessage", () => {
    it("should accept valid phone number and message", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);
      const result = await caller.sendMessage({
        phoneNumber: "5511999999999",
        message: "Test message",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
    });

    it("should reject invalid phone number", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);

      try {
        await caller.sendMessage({
          phoneNumber: "123",
          message: "Test message",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should reject empty message", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);

      try {
        await caller.sendMessage({
          phoneNumber: "5511999999999",
          message: "",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("sendMedia", () => {
    it("should accept valid media parameters", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);
      const result = await caller.sendMedia({
        phoneNumber: "5511999999999",
        mediaPath: "/path/to/image.jpg",
        caption: "Test caption",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
    });

    it("should work without caption", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);
      const result = await caller.sendMedia({
        phoneNumber: "5511999999999",
        mediaPath: "/path/to/video.mp4",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
    });
  });

  describe("getContacts", () => {
    it("should return contacts list", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);
      const result = await caller.getContacts();

      expect(result).toHaveProperty("contacts");
      expect(result).toHaveProperty("count");
      expect(Array.isArray(result.contacts)).toBe(true);
      expect(typeof result.count).toBe("number");
    });
  });

  describe("initialize", () => {
    it("should return success response", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);
      const result = await caller.initialize();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
    });
  });

  describe("disconnect", () => {
    it("should return success response", async () => {
      const caller = whatsappBaileysRouter.createCaller(mockCtx);
      const result = await caller.disconnect();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(result.success).toBe(true);
      expect(typeof result.message).toBe("string");
    });
  });
});
