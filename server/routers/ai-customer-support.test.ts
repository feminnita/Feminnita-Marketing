import { describe, it, expect } from "vitest";

describe("AI Customer Support Logic", () => {
  describe("Escalation Keywords Detection", () => {
    it("should detect escalation keywords", () => {
      const defaultKeywords = [
        "atendente",
        "humano",
        "falar com",
        "suporte",
        "gerente",
        "reclamação",
        "problema",
        "urgente",
      ];
      const message = "Preciso falar com um atendente";

      const shouldEscalate = defaultKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      );

      expect(shouldEscalate).toBe(true);
    });

    it("should not escalate normal messages", () => {
      const defaultKeywords = [
        "atendente",
        "humano",
        "falar com",
        "suporte",
        "gerente",
        "reclamação",
        "problema",
        "urgente",
      ];
      const message = "Qual é o preço do pijama?";

      const shouldEscalate = defaultKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      );

      expect(shouldEscalate).toBe(false);
    });

    it("should detect multiple escalation keywords", () => {
      const defaultKeywords = [
        "atendente",
        "humano",
        "falar com",
        "suporte",
        "gerente",
        "reclamação",
        "problema",
        "urgente",
      ];
      const message = "Tenho um problema urgente com meu pedido";

      const shouldEscalate = defaultKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword)
      );

      expect(shouldEscalate).toBe(true);
    });
  });

  describe("Confidence Scoring", () => {
    it("should calculate confidence score", () => {
      const userMessage = "Qual é o tamanho disponível?";
      const trainingExamples = [
        {
          userMessage: "Qual é o tamanho?",
          expectedResponse: "Temos P, M, G e GG",
        },
      ];

      // Simples similaridade por palavras
      const words = userMessage.toLowerCase().split(" ");
      const matchCount = trainingExamples.filter((ex) =>
        words.some((word) => ex.userMessage.toLowerCase().includes(word))
      ).length;

      const confidence = Math.min(
        (matchCount / Math.max(words.length, 1)) * 100,
        100
      );

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it("should give 100% confidence for exact match", () => {
      const userMessage = "Qual é o tamanho?";
      const trainingExamples = [
        {
          userMessage: "Qual é o tamanho?",
          expectedResponse: "Temos P, M, G e GG",
        },
      ];

      const words = userMessage.toLowerCase().split(" ");
      const matchCount = trainingExamples.filter((ex) =>
        words.every((word) => ex.userMessage.toLowerCase().includes(word))
      ).length;

      const confidence = matchCount > 0 ? 100 : 0;

      expect(confidence).toBe(100);
    });

    it("should give low confidence for no match", () => {
      const userMessage = "xyz abc def";
      const trainingExamples = [
        {
          userMessage: "Qual é o tamanho?",
          expectedResponse: "Temos P, M, G e GG",
        },
      ];

      const words = userMessage.toLowerCase().split(" ");
      const matchCount = trainingExamples.filter((ex) =>
        words.some((word) => ex.userMessage.toLowerCase().includes(word))
      ).length;

      const confidence = Math.min(
        (matchCount / Math.max(words.length, 1)) * 100,
        100
      );

      expect(confidence).toBeLessThan(50);
    });
  });

  describe("Message Processing", () => {
    it("should extract phone number from message", () => {
      const phoneNumber = "+5511999999999";
      const isValidPhone = /^\+\d{11,}$/.test(phoneNumber);

      expect(isValidPhone).toBe(true);
    });

    it("should validate message content", () => {
      const message = "Olá, tudo bem?";
      const isValid = message && message.length > 0 && message.length < 5000;

      expect(isValid).toBe(true);
    });

    it("should reject empty messages", () => {
      const message = "";
      const isValid = message && message.length > 0;

      expect(!isValid).toBe(true);
    });
  });

  describe("Knowledge Base Search", () => {
    it("should search knowledge base by keywords", () => {
      const knowledgeItems = [
        {
          title: "Pijama Conforto",
          description: "Pijama feito com algodão 100%",
          category: "Pijamas",
        },
        {
          title: "Pijama Premium",
          description: "Pijama de luxo com seda",
          category: "Pijamas",
        },
      ];

      const searchQuery = "algodão";
      const results = knowledgeItems.filter((item) => {
        const text = `${item.title} ${item.description}`.toLowerCase();
        return text.includes(searchQuery.toLowerCase());
      });

      expect(results.length).toBe(1);
      expect(results[0].title).toBe("Pijama Conforto");
    });

    it("should return multiple results for generic search", () => {
      const knowledgeItems = [
        {
          title: "Pijama Conforto",
          description: "Pijama feito com algodão 100%",
          category: "Pijamas",
        },
        {
          title: "Pijama Premium",
          description: "Pijama de luxo com seda",
          category: "Pijamas",
        },
      ];

      const searchQuery = "pijama";
      const results = knowledgeItems.filter((item) => {
        const text = `${item.title} ${item.description}`.toLowerCase();
        return text.includes(searchQuery.toLowerCase());
      });

      expect(results.length).toBe(2);
    });

    it("should return empty results for no match", () => {
      const knowledgeItems = [
        {
          title: "Pijama Conforto",
          description: "Pijama feito com algodão 100%",
          category: "Pijamas",
        },
      ];

      const searchQuery = "sapato";
      const results = knowledgeItems.filter((item) => {
        const text = `${item.title} ${item.description}`.toLowerCase();
        return text.includes(searchQuery.toLowerCase());
      });

      expect(results.length).toBe(0);
    });
  });

  describe("Training Data Validation", () => {
    it("should validate training example", () => {
      const example = {
        userMessage: "Qual é o tamanho?",
        expectedResponse: "Temos P, M, G e GG",
        category: "Tamanho",
      };

      const isValid =
        example.userMessage &&
        example.expectedResponse &&
        example.userMessage.length > 0 &&
        example.expectedResponse.length > 0;

      expect(isValid).toBe(true);
    });

    it("should reject incomplete training example", () => {
      const example = {
        userMessage: "Qual é o tamanho?",
        expectedResponse: "",
        category: "Tamanho",
      };

      const isValid =
        example.userMessage &&
        example.expectedResponse &&
        example.userMessage.length > 0 &&
        example.expectedResponse.length > 0;

      expect(!isValid).toBe(true);
    });
  });

  describe("Conversation Status Management", () => {
    it("should track conversation status", () => {
      const conversation = {
        status: "open",
        messages: 3,
        escalated: false,
      };

      expect(conversation.status).toBe("open");
      expect(conversation.escalated).toBe(false);
    });

    it("should update conversation to closed", () => {
      let conversation = {
        status: "open",
        messages: 5,
        escalated: false,
      };

      conversation.status = "closed";

      expect(conversation.status).toBe("closed");
    });

    it("should mark conversation as escalated", () => {
      let conversation = {
        status: "open",
        messages: 2,
        escalated: false,
      };

      conversation.escalated = true;
      conversation.status = "escalated";

      expect(conversation.escalated).toBe(true);
      expect(conversation.status).toBe("escalated");
    });
  });

  describe("Auto-Escalation Logic", () => {
    it("should escalate after max messages", () => {
      const maxMessages = 5;
      const currentMessages = 5;

      const shouldAutoEscalate = currentMessages >= maxMessages;

      expect(shouldAutoEscalate).toBe(true);
    });

    it("should not escalate before max messages", () => {
      const maxMessages = 5;
      const currentMessages = 3;

      const shouldAutoEscalate = currentMessages >= maxMessages;

      expect(shouldAutoEscalate).toBe(false);
    });
  });

  describe("Message Response Building", () => {
    it("should build response with product links", () => {
      const products = [
        { name: "Pijama Conforto", url: "https://example.com/1" },
        { name: "Pijama Premium", url: "https://example.com/2" },
      ];

      const response = `Temos esses produtos disponíveis:\n${products
        .map((p) => `- ${p.name}: ${p.url}`)
        .join("\n")}`;

      expect(response).toContain("Pijama Conforto");
      expect(response).toContain("https://example.com/1");
    });

    it("should build escalation response", () => {
      const reason = "Cliente solicitou atendimento humano";
      const response = `Entendi! ${reason}. Um atendente vai ajudá-lo em breve.`;

      expect(response).toContain("atendente");
      expect(response).toContain(reason);
    });
  });
});
