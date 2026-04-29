import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import crypto from "crypto";
import { getDb } from "../db";
import { eq, and } from "drizzle-orm";
import { oauthCredentials } from "../../drizzle/schema";
import { assertRateLimit } from "../_core/rateLimiter";

/**
 * Meta Conversions API (CAPI) Router
 * 
 * Envia eventos de conversão para Meta (Facebook Pixel)
 * Documentação: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

// Hash SHA256 para email (obrigatório pela Meta)
function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");
}

// Tipos para eventos da Meta
interface MetaUserData {
  em?: string; // Email hasheado
  ph?: string; // Telefone hasheado
  fn?: string; // Nome hasheado
  ln?: string; // Sobrenome hasheado
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string; // Facebook Click ID
  fbp?: string; // Facebook Pixel ID
}

interface MetaCustomData {
  currency?: string;
  value?: number;
  content_name?: string;
  content_type?: string;
  content_id?: string;
  contents?: Array<{
    id: string;
    quantity: number;
    price?: number;
  }>;
}

interface MetaEvent {
  event_name: string;
  event_time: number;
  action_source: "website" | "app" | "offline" | "phone_call";
  user_data: MetaUserData;
  custom_data?: MetaCustomData;
  event_id?: string;
}

export const metaCapiRouter = router({
  /**
   * Enviar evento único para Meta CAPI
   */
  sendEvent: protectedProcedure
    .input(
      z.object({
        event_name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        currency: z.string().default("BRL"),
        value: z.number().optional(),
        contentName: z.string().optional(),
        clientIpAddress: z.string().optional(),
        clientUserAgent: z.string().optional(),
        eventId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      assertRateLimit(`meta-capi:${ctx.user.id}`, 60); // 60 eventos/min por usuário
      try {
        // Obter credenciais do banco
        const dbInstance = await getDb();
        if (!dbInstance) {
          throw new Error("Database not available");
        }

        const credsResult = await dbInstance
          .select()
          .from(oauthCredentials)
          .where(
            and(
              eq(oauthCredentials.userId, ctx.user.id),
              eq(oauthCredentials.platform, "meta")
            )
          )
          .limit(1);

        if (!credsResult || credsResult.length === 0 || !credsResult[0].clientId || !credsResult[0].clientSecret) {
          throw new Error(
            "Credenciais Meta não configuradas. Configure Pixel ID e Access Token."
          );
        }

        const creds = credsResult[0];
        const pixelId = creds.clientId; // Pixel ID
        const accessToken = creds.clientSecret; // Access Token

        // Construir dados do usuário
        const userData: MetaUserData = {};

        if (input.email) {
          userData.em = hashEmail(input.email);
        }
        if (input.phone) {
          userData.ph = crypto
            .createHash("sha256")
            .update(input.phone.replace(/\D/g, ""))
            .digest("hex");
        }
        if (input.firstName) {
          userData.fn = crypto
            .createHash("sha256")
            .update(input.firstName.toLowerCase())
            .digest("hex");
        }
        if (input.lastName) {
          userData.ln = crypto
            .createHash("sha256")
            .update(input.lastName.toLowerCase())
            .digest("hex");
        }
        if (input.clientIpAddress) {
          userData.client_ip_address = input.clientIpAddress;
        }
        if (input.clientUserAgent) {
          userData.client_user_agent = input.clientUserAgent;
        }

        // Construir dados customizados
        const customData: MetaCustomData = {
          currency: input.currency ?? "BRL",
        };

        if (input.value !== undefined) {
          customData.value = input.value;
        }
        if (input.contentName) {
          customData.content_name = input.contentName;
        }

        // Construir evento
        const event: MetaEvent = {
          event_name: input.event_name,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: userData,
          custom_data: customData,
          event_id: input.eventId || crypto.randomUUID(),
        };

        // Enviar para Meta
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: [event],
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            `Meta API error: ${error.error?.message || response.statusText}`
          );
        }

        const result = await response.json();

        return {
          success: true,
          eventId: event.event_id,
          message: "Evento enviado para Meta com sucesso",
          result,
        };
      } catch (error) {
        console.error("Meta CAPI error:", error);
        throw error;
      }
    }),

  /**
   * Enviar múltiplos eventos em lote (batch)
   */
  sendBatchEvents: protectedProcedure
    .input(
      z.object({
        events: z.array(
          z.object({
            event_name: z.string(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            currency: z.string().default("BRL"),
            value: z.number().optional(),
            contentName: z.string().optional(),
            clientIpAddress: z.string().optional(),
            clientUserAgent: z.string().optional(),
            eventId: z.string().optional(),
          })
        ),
        testEventCode: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      assertRateLimit(`meta-capi:${ctx.user.id}`, 60);
      try {
        // Obter credenciais
        const dbInstance = await getDb();
        if (!dbInstance) {
          throw new Error("Database not available");
        }

        const credsResult = await dbInstance
          .select()
          .from(oauthCredentials)
          .where(
            and(
              eq(oauthCredentials.userId, ctx.user.id),
              eq(oauthCredentials.platform, "meta")
            )
          )
          .limit(1);

        if (!credsResult || credsResult.length === 0 || !credsResult[0].clientId || !credsResult[0].clientSecret) {
          throw new Error(
            "Credenciais Meta não configuradas. Configure Pixel ID e Access Token."
          );
        }

        const creds = credsResult[0];
        const pixelId = creds.clientId;
        const accessToken = creds.clientSecret;

        // Converter eventos
        const metaEvents: MetaEvent[] = input.events.map((evt) => {
          const userData: MetaUserData = {};

          if (evt.email) userData.em = hashEmail(evt.email);
          if (evt.phone) {
            userData.ph = crypto
              .createHash("sha256")
              .update(evt.phone.replace(/\D/g, ""))
              .digest("hex");
          }
          if (evt.firstName) {
            userData.fn = crypto
              .createHash("sha256")
              .update(evt.firstName.toLowerCase())
              .digest("hex");
          }
          if (evt.lastName) {
            userData.ln = crypto
              .createHash("sha256")
              .update(evt.lastName.toLowerCase())
              .digest("hex");
          }
          if (evt.clientIpAddress) {
            userData.client_ip_address = evt.clientIpAddress;
          }
          if (evt.clientUserAgent) {
            userData.client_user_agent = evt.clientUserAgent;
          }

          const customData: MetaCustomData = {
            currency: evt.currency ?? "BRL",
          };

          if (evt.value !== undefined) customData.value = evt.value;
          if (evt.contentName) customData.content_name = evt.contentName;

          return {
            event_name: evt.event_name,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website" as const,
            user_data: userData,
            custom_data: customData,
            event_id: evt.eventId || crypto.randomUUID(),
          };
        });

        // Preparar payload
        const payload: any = {
          data: metaEvents,
        };

        if (input.testEventCode) {
          payload.test_event_code = input.testEventCode;
        }

        // Enviar para Meta
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            `Meta API error: ${error.error?.message || response.statusText}`
          );
        }

        const result = await response.json();

        return {
          success: true,
          eventCount: metaEvents.length,
          message: `${metaEvents.length} eventos enviados para Meta com sucesso`,
          result,
        };
      } catch (error) {
        console.error("Meta CAPI batch error:", error);
        throw error;
      }
    }),

  /**
   * Enviar evento de compra (Purchase)
   * Caso de uso mais comum
   */
  sendPurchaseEvent: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        value: z.number().min(0),
        currency: z.string().default("BRL"),
        orderId: z.string(),
        products: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              price: z.number(),
              quantity: z.number(),
            })
          )
          .optional(),
        clientIpAddress: z.string().optional(),
        clientUserAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      assertRateLimit(`meta-capi:${ctx.user.id}`, 60);
      try {
        const dbInstance = await getDb();
        if (!dbInstance) {
          throw new Error("Database not available");
        }

        const credsResult = await dbInstance
          .select()
          .from(oauthCredentials)
          .where(
            and(
              eq(oauthCredentials.userId, ctx.user.id),
              eq(oauthCredentials.platform, "meta")
            )
          )
          .limit(1);

        if (!credsResult || credsResult.length === 0 || !credsResult[0].clientId || !credsResult[0].clientSecret) {
          throw new Error(
            "Credenciais Meta não configuradas. Configure Pixel ID e Access Token."
          );
        }

        const creds = credsResult[0];
        const pixelId = creds.clientId;
        const accessToken = creds.clientSecret;

        const userData: MetaUserData = {
          em: hashEmail(input.email),
        };

        if (input.clientIpAddress) {
          userData.client_ip_address = input.clientIpAddress;
        }
        if (input.clientUserAgent) {
          userData.client_user_agent = input.clientUserAgent;
        }

        const customData: MetaCustomData = {
          currency: input.currency,
          value: input.value,
          content_type: "product",
        };

        if (input.products && input.products.length > 0) {
          customData.contents = input.products.map((p) => ({
            id: p.id,
            quantity: p.quantity,
            price: p.price,
          }));
        }

        const event: MetaEvent = {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: userData,
          custom_data: customData,
          event_id: `purchase_${input.orderId}_${Date.now()}`,
        };

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: [event],
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            `Meta API error: ${error.error?.message || response.statusText}`
          );
        }

        const result = await response.json();

        return {
          success: true,
          orderId: input.orderId,
          message: "Evento de compra enviado para Meta com sucesso",
          result,
        };
      } catch (error) {
        console.error("Meta CAPI purchase error:", error);
        throw error;
      }
    }),

  /**
   * Testar conexão com Meta CAPI
   */
  testConnection: protectedProcedure
    .input(
      z.object({
        pixelId: z.string(),
        accessToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Tentar enviar um evento de teste
        const testEvent: MetaEvent = {
          event_name: "ViewContent",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: {
            em: hashEmail("test@example.com"),
          },
          custom_data: {
            currency: "BRL",
            value: 0,
          },
          event_id: `test_${Date.now()}`,
        };

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${input.pixelId}/events?access_token=${input.accessToken}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: [testEvent],
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(
            `Meta API error: ${error.error?.message || response.statusText}`
          );
        }

        return {
          success: true,
          message: "Conexão com Meta CAPI testada com sucesso!",
        };
      } catch (error) {
        console.error("Meta CAPI test error:", error);
        throw new Error(
          `Erro ao testar Meta CAPI: ${error instanceof Error ? error.message : "Erro desconhecido"}`
        );
      }
    }),

  /**
   * Obter credenciais Meta salvas
   */
  getCredentials: protectedProcedure.query(async ({ ctx }) => {
    try {
      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new Error("Database not available");
      }

      const credsResult = await dbInstance
        .select()
        .from(oauthCredentials)
        .where(
          and(
            eq(oauthCredentials.userId, ctx.user.id),
            eq(oauthCredentials.platform, "meta")
          )
        )
        .limit(1);

      if (!credsResult || credsResult.length === 0) {
        return {
          configured: false,
          message: "Credenciais Meta não configuradas",
        };
      }

      const creds = credsResult[0];
      return {
        configured: true,
        pixelId: creds.clientId,
        hasAccessToken: !!creds.clientSecret,
        createdAt: creds.createdAt,
      };
    } catch (error) {
      console.error("Error getting Meta credentials:", error);
      throw error;
    }
  }),
});
