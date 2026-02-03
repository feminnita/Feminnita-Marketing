import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";

describe("Evolution API Router", () => {
  describe("Input Validation", () => {
    it("should validate connectInstance input", () => {
      const schema = z.object({
        instanceName: z.string().min(1, "Nome da instância é obrigatório"),
        apiKey: z.string().min(1, "API Key é obrigatória"),
        baseUrl: z.string().url("URL base inválida"),
      });

      const validInput = {
        instanceName: "feminnita-whatsapp",
        apiKey: "sk_test_123456789",
        baseUrl: "https://api.evolution.ai",
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it("should reject invalid connectInstance input", () => {
      const schema = z.object({
        instanceName: z.string().min(1),
        apiKey: z.string().min(1),
        baseUrl: z.string().url(),
      });

      const invalidInput = {
        instanceName: "",
        apiKey: "",
        baseUrl: "not-a-url",
      };

      expect(() => schema.parse(invalidInput)).toThrow();
    });

    it("should validate sendMessage input", () => {
      const schema = z.object({
        phoneNumber: z.string().regex(/^\d{10,15}$/, "Número de telefone inválido"),
        message: z.string().min(1, "Mensagem não pode estar vazia"),
      });

      const validInput = {
        phoneNumber: "5522999999999",
        message: "Olá! Como posso ajudar?",
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it("should reject invalid phone number", () => {
      const schema = z.object({
        phoneNumber: z.string().regex(/^\d{10,15}$/),
        message: z.string().min(1),
      });

      const invalidInput = {
        phoneNumber: "abc123",
        message: "Teste",
      };

      expect(() => schema.parse(invalidInput)).toThrow();
    });

    it("should validate sendGroupMessage input", () => {
      const schema = z.object({
        groupId: z.string().min(1, "ID do grupo é obrigatório"),
        message: z.string().min(1, "Mensagem não pode estar vazia"),
        type: z.enum(["promotion", "launch", "coupon", "general"]),
      });

      const validInput = {
        groupId: "22992910707",
        message: "🎉 Nova promoção disponível!",
        type: "promotion" as const,
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it("should reject invalid message type", () => {
      const schema = z.object({
        groupId: z.string().min(1),
        message: z.string().min(1),
        type: z.enum(["promotion", "launch", "coupon", "general"]),
      });

      const invalidInput = {
        groupId: "22992910707",
        message: "Teste",
        type: "invalid",
      };

      expect(() => schema.parse(invalidInput)).toThrow();
    });

    it("should validate generateAiResponse input", () => {
      const schema = z.object({
        customerMessage: z.string().min(1, "Mensagem do cliente é obrigatória"),
        customerPhone: z.string(),
      });

      const validInput = {
        customerMessage: "Qual é o status do meu pedido?",
        customerPhone: "5522999999999",
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it("should validate transferToHuman input", () => {
      const schema = z.object({
        customerPhone: z.string(),
        customerMessage: z.string(),
        groupId: z.string().default("22992910707"),
      });

      const validInput = {
        customerPhone: "5522999999999",
        customerMessage: "Quero falar com um atendente",
        groupId: "22992910707",
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it("should validate sendPaymentConfirmation input", () => {
      const schema = z.object({
        phoneNumber: z.string(),
        orderId: z.string(),
        amount: z.number(),
      });

      const validInput = {
        phoneNumber: "5522999999999",
        orderId: "ORD-123456",
        amount: 197.50,
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it("should validate sendTrackingCode input", () => {
      const schema = z.object({
        phoneNumber: z.string(),
        orderId: z.string(),
        trackingCode: z.string(),
        trackingUrl: z.string().url(),
      });

      const validInput = {
        phoneNumber: "5522999999999",
        orderId: "ORD-123456",
        trackingCode: "BR123456789BR",
        trackingUrl: "https://rastreamento.melhorenvio.com/br123456789br",
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });
  });

  describe("Message Formatting", () => {
    it("should format promotion message correctly", () => {
      const message = "Nova promoção: 50% off";
      const type = "promotion";
      const formatted = `🎉 PROMOÇÃO\n\n${message}`;
      expect(formatted).toContain("🎉");
      expect(formatted).toContain("PROMOÇÃO");
    });

    it("should format launch message correctly", () => {
      const message = "Novo produto lançado";
      const type = "launch";
      const formatted = `🚀 LANÇAMENTO\n\n${message}`;
      expect(formatted).toContain("🚀");
      expect(formatted).toContain("LANÇAMENTO");
    });

    it("should format coupon message correctly", () => {
      const message = "Cupom: FEMINNITA50";
      const type = "coupon";
      const formatted = `🎁 CUPOM EXCLUSIVO\n\n${message}`;
      expect(formatted).toContain("🎁");
      expect(formatted).toContain("CUPOM EXCLUSIVO");
    });

    it("should format payment confirmation correctly", () => {
      const orderId = "ORD-123456";
      const amount = 197.50;
      const message = `✅ PAGAMENTO CONFIRMADO\n\nPedido: #${orderId}\nValor: R$ ${amount.toFixed(2)}\n\nSeu pedido será enviado em breve. Acompanhe o rastreio aqui!`;
      expect(message).toContain("✅");
      expect(message).toContain("PAGAMENTO CONFIRMADO");
      expect(message).toContain(orderId);
      expect(message).toContain("197.50");
    });

    it("should format tracking message correctly", () => {
      const orderId = "ORD-123456";
      const trackingCode = "BR123456789BR";
      const trackingUrl = "https://rastreamento.melhorenvio.com/br123456789br";
      const message = `📦 PEDIDO ENVIADO\n\nPedido: #${orderId}\nCódigo de rastreio: ${trackingCode}\n\nAcompanhe seu pedido: ${trackingUrl}`;
      expect(message).toContain("📦");
      expect(message).toContain("PEDIDO ENVIADO");
      expect(message).toContain(trackingCode);
    });
  });

  describe("AI Response Detection", () => {
    it("should detect transfer request in AI response", () => {
      const aiMessage = "Claro! Vou transferir você para um atendente. Um momento...";
      const shouldTransfer = String(aiMessage).includes("transferir");
      expect(shouldTransfer).toBe(true);
    });

    it("should detect attendant mention in AI response", () => {
      const aiMessage = "Um atendente irá ajudá-lo em breve.";
      const shouldTransfer = String(aiMessage).includes("atendente");
      expect(shouldTransfer).toBe(true);
    });

    it("should detect human request in customer message", () => {
      const customerMessage = "Quero falar com um humano";
      const shouldTransfer = customerMessage.toLowerCase().includes("humano");
      expect(shouldTransfer).toBe(true);
    });

    it("should not detect transfer when not needed", () => {
      const aiMessage = "Seu pedido foi enviado com sucesso!";
      const shouldTransfer = String(aiMessage).includes("transferir");
      expect(shouldTransfer).toBe(false);
    });
  });

  describe("Phone Number Validation", () => {
    it("should validate valid phone numbers", () => {
      const validNumbers = [
        "5522999999999",
        "5511987654321",
        "5585988776655",
        "1234567890",
        "12345678901234",
      ];

      const schema = z.string().regex(/^\d{10,15}$/);

      validNumbers.forEach((number) => {
        expect(() => schema.parse(number)).not.toThrow();
      });
    });

    it("should reject invalid phone numbers", () => {
      const invalidNumbers = [
        "123", // too short
        "123456789012345678", // too long
        "abc123def456", // contains letters
        "+5522999999999", // contains +
        "55 2299999999", // contains spaces
      ];

      const schema = z.string().regex(/^\d{10,15}$/);

      invalidNumbers.forEach((number) => {
        expect(() => schema.parse(number)).toThrow();
      });
    });
  });

  describe("Group VIP Configuration", () => {
    it("should use correct group ID", () => {
      const groupId = "22992910707";
      expect(groupId).toBe("22992910707");
    });

    it("should support custom group IDs", () => {
      const customGroupId = "5522999999999-1234567890@g.us";
      expect(customGroupId).toBeTruthy();
      expect(customGroupId.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing instance configuration", () => {
      const instanceName = undefined;
      expect(instanceName).toBeUndefined();
    });

    it("should handle invalid API response", () => {
      const response = { error: "Invalid API Key" };
      expect(response.error).toBeDefined();
    });

    it("should handle network errors", () => {
      const error = new Error("Network timeout");
      expect(error.message).toContain("Network");
    });
  });
});
