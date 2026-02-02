import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";

/**
 * Post Scheduler Router
 * Manages automatic posting on Tuesdays and Fridays with theme approval
 */

export const postSchedulerRouter = router({
  /**
   * Schedule posts for Tuesday and Friday
   */
  schedulePostingDays: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        platforms: z.array(z.enum(["instagram", "tiktok", "youtube", "blog"])),
        postTime: z.string(), // HH:mm format
        timezone: z.string().default("America/Sao_Paulo"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const schedule = {
          influencerId: input.influencerId,
          days: ["Tuesday", "Friday"],
          time: input.postTime,
          timezone: input.timezone,
          platforms: input.platforms,
          isActive: true,
          createdAt: new Date(),
        };

        console.log(`[Scheduler] Posts scheduled for ${input.influencerId} on Tuesdays and Fridays at ${input.postTime}`);

        await notifyOwner({
          title: "Agendamento de postagens configurado",
          content: `Terças e sextas às ${input.postTime} - Plataformas: ${input.platforms.join(", ")}`,
        });

        return {
          success: true,
          message: "Agendamento configurado com sucesso",
          schedule,
        };
      } catch (error) {
        console.error("Error scheduling posts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao agendar postagens",
        });
      }
    }),

  /**
   * Send theme approval reminder on Monday evening
   */
  sendThemeReminder: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        reminderTime: z.string().default("18:00"), // HH:mm format
      })
    )
    .mutation(async ({ input }) => {
      try {
        const reminder = {
          influencerId: input.influencerId,
          day: "Monday",
          time: input.reminderTime,
          message: `Lembrete: Prepare o tema e modelo para as postagens de ${input.influencerId} amanhã!`,
          sentAt: new Date(),
        };

        console.log(`[Reminder] Theme reminder sent for influencer ${input.influencerId}`);

        await notifyOwner({
          title: "Lembrete de tema de postagem",
          content: `Prepare o tema e modelo para as postagens de amanhã (terça-feira)`,
        });

        return {
          success: true,
          message: "Lembrete enviado com sucesso",
          reminder,
        };
      } catch (error) {
        console.error("Error sending reminder:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao enviar lembrete",
        });
      }
    }),

  /**
   * Request theme and model approval
   */
  requestThemeApproval: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        theme: z.string(),
        model: z.string(),
        description: z.string(),
        exampleImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const approvalRequest = {
          id: `approval_${Date.now()}`,
          influencerId: input.influencerId,
          theme: input.theme,
          model: input.model,
          description: input.description,
          exampleImageUrl: input.exampleImageUrl,
          status: "pending",
          requestedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 3600000), // 24 hours to approve
        };

        console.log(`[Approval] Theme approval requested for influencer ${input.influencerId}`);

        await notifyOwner({
          title: "Aprovação de tema solicitada",
          content: `Tema: ${input.theme} | Modelo: ${input.model}\n${input.description}`,
        });

        return {
          success: true,
          message: "Solicitação de aprovação enviada",
          approvalRequest,
        };
      } catch (error) {
        console.error("Error requesting approval:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao solicitar aprovação",
        });
      }
    }),

  /**
   * Approve theme and generate content
   */
  approveThemeAndGenerate: protectedProcedure
    .input(
      z.object({
        approvalId: z.string(),
        influencerId: z.number(),
        theme: z.string(),
        model: z.string(),
        platforms: z.array(z.enum(["instagram", "tiktok", "youtube", "blog"])),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Mock content generation
        const generatedContent = {
          approvalId: input.approvalId,
          influencerId: input.influencerId,
          theme: input.theme,
          model: input.model,
          platforms: input.platforms,
          status: "approved",
          generatedAt: new Date(),
          scheduledFor: getNextPostingDay(),
          content: {
            instagram: {
              caption: `🎨 ${input.theme} - ${input.model}`,
              hashtags: ["#feminnita", "#pijamas", "#moda", "#estilo"],
              mediaUrl: "https://example.com/content.jpg",
            },
            tiktok: {
              caption: `${input.theme} com ${input.model}! 🔥`,
              hashtags: ["#feminnita", "#tiktok", "#pijamas"],
              videoUrl: "https://example.com/video.mp4",
            },
            youtube: {
              title: `${input.theme} - Coleção ${input.model}`,
              description: `Confira nossa nova coleção de pijamas ${input.model}!`,
              thumbnailUrl: "https://example.com/thumbnail.jpg",
            },
            blog: {
              title: `${input.theme}: Conheça a coleção ${input.model}`,
              excerpt: `Descubra os novos designs da coleção ${input.model}`,
              content: `Conteúdo do blog sobre ${input.theme}...`,
            },
          },
        };

        console.log(`[Generation] Content generated for theme: ${input.theme}`);

        await notifyOwner({
          title: "Conteúdo gerado e aprovado",
          content: `Tema: ${input.theme} | Será publicado ${generatedContent.scheduledFor}`,
        });

        return {
          success: true,
          message: "Conteúdo gerado com sucesso",
          generatedContent,
        };
      } catch (error) {
        console.error("Error generating content:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar conteúdo",
        });
      }
    }),

  /**
   * Get scheduled posts
   */
  getScheduledPosts: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Mock scheduled posts
        const scheduledPosts = [
          {
            id: "post_1",
            influencerId: input.influencerId,
            theme: "Verão 2026",
            model: "Coleção Premium",
            platforms: ["instagram", "tiktok"],
            scheduledFor: new Date(Date.now() + 2 * 86400000), // 2 days from now
            status: "approved",
            content: "Post content here",
          },
          {
            id: "post_2",
            influencerId: input.influencerId,
            theme: "Conforto e Estilo",
            model: "Básico",
            platforms: ["youtube", "blog"],
            scheduledFor: new Date(Date.now() + 5 * 86400000), // 5 days from now
            status: "pending_approval",
            content: "Post content here",
          },
        ];

        return {
          success: true,
          posts: scheduledPosts,
          totalScheduled: scheduledPosts.length,
          nextPosting: getNextPostingDay(),
        };
      } catch (error) {
        console.error("Error getting scheduled posts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter posts agendados",
        });
      }
    }),

  /**
   * Get posting schedule
   */
  getPostingSchedule: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const schedule = {
          influencerId: input.influencerId,
          days: ["Tuesday", "Friday"],
          time: "14:00",
          timezone: "America/Sao_Paulo",
          reminderDay: "Monday",
          reminderTime: "18:00",
          isActive: true,
          nextPostingDays: getNextPostingDays(2),
        };

        return {
          success: true,
          schedule,
        };
      } catch (error) {
        console.error("Error getting schedule:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter agendamento",
        });
      }
    }),

  /**
   * Cancel scheduled post
   */
  cancelPost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[Cancel] Post ${input.postId} cancelled`);

        await notifyOwner({
          title: "Post cancelado",
          content: `Post ${input.postId} foi cancelado${input.reason ? `: ${input.reason}` : ""}`,
        });

        return {
          success: true,
          message: "Post cancelado com sucesso",
        };
      } catch (error) {
        console.error("Error cancelling post:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao cancelar post",
        });
      }
    }),
});

/**
 * Helper function to get next posting day (Tuesday or Friday)
 */
function getNextPostingDay(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();

  let daysUntilPosting = 0;

  if (dayOfWeek === 2) {
    // Tuesday
    daysUntilPosting = 0;
  } else if (dayOfWeek === 5) {
    // Friday
    daysUntilPosting = 0;
  } else if (dayOfWeek < 2) {
    // Monday or Sunday - next Tuesday
    daysUntilPosting = 2 - dayOfWeek;
  } else if (dayOfWeek < 5) {
    // Wednesday or Thursday - next Friday
    daysUntilPosting = 5 - dayOfWeek;
  } else {
    // Saturday - next Tuesday
    daysUntilPosting = 3;
  }

  const nextPosting = new Date(today);
  nextPosting.setDate(nextPosting.getDate() + daysUntilPosting);
  nextPosting.setHours(14, 0, 0, 0);

  return nextPosting;
}

/**
 * Helper function to get next N posting days
 */
function getNextPostingDays(count: number): Date[] {
  const days: Date[] = [];
  let current = getNextPostingDay();

  for (let i = 0; i < count; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 3); // 3 days to next posting day (Tue->Fri or Fri->Tue)
  }

  return days;
}
