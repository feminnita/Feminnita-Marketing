import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { storagePut } from "../storage";
import { getDb } from "../db";
import { mediaFiles, contentItems } from "../../drizzle/schema";

export const mediaUploadRouter = router({
  /**
   * Upload de imagem para S3
   */
  uploadImage: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        contentType: z.string(),
        contentId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validar tamanho do arquivo (máx 5MB)
        const maxSize = 5 * 1024 * 1024;
        const buffer = Buffer.from(input.fileData, 'base64');
        
        if (buffer.length > maxSize) {
          throw new Error("Arquivo muito grande. Máximo 5MB.");
        }

        // Validar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(input.contentType)) {
          throw new Error("Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.");
        }

        // Gerar nome único
        const timestamp = Date.now();
        const random = (await import("crypto")).randomBytes(8).toString("hex");
        const fileKey = `media/${input.contentId}/${timestamp}-${random}-${input.fileName}`;

        // Upload para S3
        const { url } = await storagePut(fileKey, buffer, input.contentType);

        // Salvar no banco de dados
        const db = await getDb();
        if (db) {
          const result = await db.insert(mediaFiles).values({
            contentId: input.contentId,
            userId: ctx.user?.id || 0,
            fileName: input.fileName,
            fileType: "image",
            mimeType: input.contentType,
            fileSize: buffer.length,
            s3Key: fileKey,
            s3Url: url,
            uploadedAt: new Date(),
          });
        }

        return {
          success: true,
          url,
          fileKey,
          fileName: input.fileName,
          fileSize: buffer.length,
        };
      } catch (error) {
        console.error('[Media Upload] Erro ao fazer upload:', error);
        throw error;
      }
    }),

  /**
   * Listar imagens de um conteúdo
   */
  listImages: protectedProcedure
    .input(
      z.object({
        contentId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const images = await db
          .select()
          .from(mediaFiles)
          .where(and(eq(mediaFiles.contentId, input.contentId), eq(mediaFiles.userId, ctx.user.id)));

        return images;
      } catch (error) {
        console.error('[Media Upload] Erro ao listar imagens:', error);
        return [];
      }
    }),

  /**
   * Deletar imagem
   */
  deleteImage: protectedProcedure
    .input(
      z.object({
        fileId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.delete(mediaFiles).where(and(eq(mediaFiles.id, input.fileId), eq(mediaFiles.userId, ctx.user.id)));

        return { success: true };
      } catch (error) {
        console.error('[Media Upload] Erro ao deletar imagem:', error);
        throw error;
      }
    }),

  /**
   * Redimensionar imagem (retorna URL da imagem redimensionada)
   */
  resizeImage: protectedProcedure
    .input(
      z.object({
        fileUrl: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Usar serviço de resize de imagem (ex: Cloudinary, ImageMagick)
        // Por enquanto, retornar URL original com parâmetros de resize
        const resizedUrl = `${input.fileUrl}?w=${input.width || 800}&h=${input.height || 600}&fit=cover`;
        
        return {
          success: true,
          url: resizedUrl,
        };
      } catch (error) {
        console.error('[Media Upload] Erro ao redimensionar imagem:', error);
        throw error;
      }
    }),
});
