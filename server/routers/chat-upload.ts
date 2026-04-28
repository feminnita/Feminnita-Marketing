/**
 * Chat Upload — Upload de arquivos para o chat interno da equipe
 * Salva no disco do servidor e retorna URL pública.
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "dist", "public", "chat-files");
const MAX_SIZE_MB = 10;

function ensureDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const chatUploadRouter = router({
  upload: protectedProcedure
    .input(z.object({
      fileName: z.string().max(200),
      mimeType: z.string().max(100),
      fileData: z.string(), // base64
    }))
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      if (buffer.length > MAX_SIZE_MB * 1024 * 1024) {
        throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: `Arquivo muito grande (máx ${MAX_SIZE_MB}MB)` });
      }

      ensureDir();

      const ext = path.extname(input.fileName).toLowerCase() || "";
      const safeName = `${Date.now()}-${ctx.user.id}-${Math.random().toString(36).slice(2)}${ext}`;
      const filePath = path.join(UPLOAD_DIR, safeName);
      fs.writeFileSync(filePath, buffer);

      return { url: `/chat-files/${safeName}`, fileName: input.fileName, mimeType: input.mimeType };
    }),
});
