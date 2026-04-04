import { describe, it, expect, beforeEach, vi } from "vitest";
import { whatsappBusinessRouter } from "./whatsapp-business";

vi.mock("../_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

const HAS_WHATSAPP = !!process.env.WHATSAPP_BUSINESS_TOKEN || !!process.env.WABA_TOKEN;

describe("WhatsApp Business Router", () => {
  describe("sendPaymentConfirmation", () => {
    it.skipIf(!HAS_WHATSAPP)("shouldsend payment confirmation message", async () => {
      const caller = whatsappBusinessRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.sendPaymentConfirmation({
        phoneNumber: "5547996233764",
        orderNumber: "PED-001",
        amount: 299.90,
        paymentMethod: "Cartão de Crédito",
        trackingUrl: "https://melhorenvio.com/track/123",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.message).toContain("sucesso");
    });
  });

  describe("sendTrackingInfo", () => {
    it.skipIf(!HAS_WHATSAPP)("shouldsend tracking information", async () => {
      const caller = whatsappBusinessRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.sendTrackingInfo({
        phoneNumber: "5547996233764",
        orderNumber: "PED-001",
        trackingCode: "BR123456789",
        carrier: "Correios",
        trackingUrl: "https://melhorenvio.com/track/123",
        estimatedDelivery: "05/02/2026",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe("sendPostForApproval", () => {
    it.skipIf(!HAS_WHATSAPP)("shouldsend post for approval", async () => {
      const caller = whatsappBusinessRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.sendPostForApproval({
        phoneNumber: "5547996233764",
        influencerName: "Carol",
        postContent: "Novo pijama chegou! 🎉 Confortável e lindo!",
        postType: "image",
        scheduledDate: "05/02/2026",
        approvalDeadline: "04/02/2026 18:00",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe("sendThemeReminder", () => {
    it.skipIf(!HAS_WHATSAPP)("shouldsend theme reminder", async () => {
      const caller = whatsappBusinessRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.sendThemeReminder({
        phoneNumber: "5547996233764",
        influencerName: "Renata",
        postingDays: ["terça", "sexta"],
        deadline: "04/02/2026 18:00",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe("routeToAgent", () => {
    it.skipIf(!HAS_WHATSAPP)("shouldroute conversation to agent", async () => {
      const caller = whatsappBusinessRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.routeToAgent({
        phoneNumber: "5547996233764",
        conversationId: "conv_123",
        reason: "Dúvida sobre tamanho",
        priority: "medium",
      });

      expect(result.success).toBe(true);
      expect(result.agentAssigned).toBe(true);
      expect(result.estimatedWaitTime).toBeDefined();
    });
  });

  describe("getConfiguration", () => {
    it.skipIf(!HAS_WHATSAPP)("shouldreturn WhatsApp configuration", async () => {
      const caller = whatsappBusinessRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getConfiguration();

      expect(result.mainNumber).toBe("(47) 99623-3764");
      expect(result.businessName).toBe("Feminnita Pijamas");
      expect(result.features).toContain("Confirmação de Pagamento");
      expect(result.features).toContain("Rastreio de Pedidos");
      expect(result.status).toBe("active");
    });
  });

  describe("createVIPGroup", () => {
    it.skipIf(!HAS_WHATSAPP)("shouldcreate VIP group", async () => {
      const caller = whatsappBusinessRouter.createCaller({
        user: { id: 1, name: "Test User", role: "user" as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.createVIPGroup({
        groupName: "VIP Feminnita",
        members: ["5547996233764", "5547999999999"],
        description: "Grupo VIP com ofertas exclusivas",
      });

      expect(result.success).toBe(true);
      expect(result.groupId).toBeDefined();
      expect(result.memberCount).toBe(2);
    });
  });
});
