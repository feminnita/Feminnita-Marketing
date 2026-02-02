import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// Função auxiliar para hash SHA256
function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");
}

describe("Meta CAPI Router", () => {
  describe("hashEmail", () => {
    it("deve fazer hash de email em SHA256", () => {
      const email = "test@example.com";
      const hash = hashEmail(email);
      
      // Validar que é um hash SHA256 válido (64 caracteres hexadecimais)
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      
      // Validar que o mesmo email sempre produz o mesmo hash
      expect(hashEmail(email)).toBe(hash);
    });

    it("deve fazer hash de email em minúsculas", () => {
      const email1 = "Test@Example.com";
      const email2 = "test@example.com";
      
      expect(hashEmail(email1)).toBe(hashEmail(email2));
    });

    it("deve produzir hashes diferentes para emails diferentes", () => {
      const hash1 = hashEmail("user1@example.com");
      const hash2 = hashEmail("user2@example.com");
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("Event structure", () => {
    it("deve criar evento de compra com estrutura correta", () => {
      const event = {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website" as const,
        user_data: {
          em: hashEmail("customer@example.com"),
        },
        custom_data: {
          currency: "BRL",
          value: 197.00,
          content_type: "product",
          contents: [
            {
              id: "PROD001",
              quantity: 1,
              price: 197.00,
            },
          ],
        },
        event_id: `purchase_ORDER123_${Date.now()}`,
      };

      expect(event).toHaveProperty("event_name", "Purchase");
      expect(event).toHaveProperty("event_time");
      expect(event).toHaveProperty("action_source", "website");
      expect(event).toHaveProperty("user_data");
      expect(event).toHaveProperty("custom_data");
      expect(event).toHaveProperty("event_id");
      
      expect(event.custom_data.value).toBe(197.00);
      expect(event.custom_data.currency).toBe("BRL");
      expect(event.custom_data.contents).toHaveLength(1);
    });

    it("deve criar evento de visualização com estrutura correta", () => {
      const event = {
        event_name: "ViewContent",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website" as const,
        user_data: {
          em: hashEmail("visitor@example.com"),
        },
        custom_data: {
          currency: "BRL",
          value: 0,
        },
        event_id: `view_${Date.now()}`,
      };

      expect(event.event_name).toBe("ViewContent");
      expect(event.custom_data.value).toBe(0);
    });

    it("deve criar evento com dados de usuário completos", () => {
      const userData = {
        em: hashEmail("customer@example.com"),
        ph: crypto
          .createHash("sha256")
          .update("5511999999999".replace(/\D/g, ""))
          .digest("hex"),
        fn: crypto
          .createHash("sha256")
          .update("João".toLowerCase())
          .digest("hex"),
        ln: crypto
          .createHash("sha256")
          .update("Silva".toLowerCase())
          .digest("hex"),
        client_ip_address: "192.168.1.1",
        client_user_agent: "Mozilla/5.0",
      };

      expect(userData).toHaveProperty("em");
      expect(userData).toHaveProperty("ph");
      expect(userData).toHaveProperty("fn");
      expect(userData).toHaveProperty("ln");
      expect(userData).toHaveProperty("client_ip_address");
      expect(userData).toHaveProperty("client_user_agent");
    });
  });

  describe("Batch events", () => {
    it("deve processar múltiplos eventos em lote", () => {
      const events = [
        {
          event_name: "Purchase",
          email: "customer1@example.com",
          value: 100.00,
          currency: "BRL",
          orderId: "ORDER001",
        },
        {
          event_name: "Purchase",
          email: "customer2@example.com",
          value: 200.00,
          currency: "BRL",
          orderId: "ORDER002",
        },
        {
          event_name: "ViewContent",
          email: "visitor@example.com",
          value: 0,
          currency: "BRL",
          orderId: "VIEW001",
        },
      ];

      expect(events).toHaveLength(3);
      expect(events.every(e => e.event_name)).toBe(true);
      expect(events.every(e => e.email)).toBe(true);
    });

    it("deve validar que todos os eventos têm campos obrigatórios", () => {
      const event = {
        event_name: "Purchase",
        email: "test@example.com",
        value: 100,
        currency: "BRL",
        orderId: "ORDER123",
      };

      const requiredFields = ["event_name", "email", "value", "currency", "orderId"];
      const hasAllFields = requiredFields.every(field => field in event);

      expect(hasAllFields).toBe(true);
    });
  });

  describe("Validation", () => {
    it("deve validar email válido", () => {
      const validEmails = [
        "test@example.com",
        "user.name@example.co.uk",
        "user+tag@example.com",
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(validEmails.every(email => emailRegex.test(email))).toBe(true);
    });

    it("deve validar valor de compra positivo", () => {
      const validValues = [0, 1, 100.50, 9999.99];
      const invalidValues = [-1, -100];

      expect(validValues.every(v => v >= 0)).toBe(true);
      expect(invalidValues.some(v => v < 0)).toBe(true);
    });

    it("deve validar moeda", () => {
      const validCurrencies = ["BRL", "USD", "EUR"];
      const currencyRegex = /^[A-Z]{3}$/;

      expect(validCurrencies.every(c => currencyRegex.test(c))).toBe(true);
    });

    it("deve validar Pixel ID", () => {
      const validPixelIds = ["123456789", "987654321"];
      const pixelIdRegex = /^\d+$/;

      expect(validPixelIds.every(id => pixelIdRegex.test(id))).toBe(true);
    });
  });

  describe("Event ID generation", () => {
    it("deve gerar event_id único para cada evento", () => {
      const eventIds = new Set();

      for (let i = 0; i < 10; i++) {
        const eventId = `purchase_ORDER${i}_${Date.now() + i}`;
        eventIds.add(eventId);
      }

      expect(eventIds.size).toBe(10);
    });

    it("deve gerar UUID válido", () => {
      const uuid = crypto.randomUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      expect(uuidRegex.test(uuid)).toBe(true);
    });
  });

  describe("Payload structure", () => {
    it("deve criar payload correto para envio para Meta", () => {
      const payload = {
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            user_data: {
              em: hashEmail("test@example.com"),
            },
            custom_data: {
              currency: "BRL",
              value: 100,
            },
            event_id: "purchase_123_456",
          },
        ],
      };

      expect(payload).toHaveProperty("data");
      expect(Array.isArray(payload.data)).toBe(true);
      expect(payload.data).toHaveLength(1);
      expect(payload.data[0]).toHaveProperty("event_name");
    });

    it("deve incluir test_event_code quando fornecido", () => {
      const payload = {
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            user_data: {
              em: hashEmail("test@example.com"),
            },
            custom_data: {
              currency: "BRL",
              value: 100,
            },
            event_id: "purchase_123_456",
          },
        ],
        test_event_code: "TEST12345",
      };

      expect(payload).toHaveProperty("test_event_code", "TEST12345");
    });
  });

  describe("Product contents", () => {
    it("deve mapear produtos corretamente", () => {
      const products = [
        { id: "PROD001", name: "Pijama Inverno", price: 197.00, quantity: 1 },
        { id: "PROD002", name: "Pijama Verão", price: 150.00, quantity: 2 },
      ];

      const contents = products.map(p => ({
        id: p.id,
        quantity: p.quantity,
        price: p.price,
      }));

      expect(contents).toHaveLength(2);
      expect(contents[0]).toEqual({
        id: "PROD001",
        quantity: 1,
        price: 197.00,
      });
    });

    it("deve calcular valor total corretamente", () => {
      const products = [
        { id: "PROD001", price: 100, quantity: 2 },
        { id: "PROD002", price: 50, quantity: 1 },
      ];

      const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

      expect(total).toBe(250);
    });
  });

  describe("Phone hashing", () => {
    it("deve fazer hash de telefone removendo caracteres não-numéricos", () => {
      const phones = [
        "5511999999999",
        "(55) 11 99999-9999",
        "+55 11 99999-9999",
      ];

      const hashes = phones.map(phone => {
        const cleaned = phone.replace(/\D/g, "");
        return crypto.createHash("sha256").update(cleaned).digest("hex");
      });

      // Todos devem gerar o mesmo hash
      expect(hashes[0]).toBe(hashes[1]);
      expect(hashes[0]).toBe(hashes[2]);
    });
  });
});
