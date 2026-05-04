import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

const MINIMAX_BASE = "https://api.minimax.io/v1";

export const hailuoImageRouter = router({
  generate: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1).max(1500),
      aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9"]).default("1:1"),
      n: z.number().min(1).max(4).default(1),
    }))
    .mutation(async ({ input }) => {
      const apiKey = process.env.MINIMAX_API_KEY;
      if (!apiKey) throw new Error("MINIMAX_API_KEY não configurado no servidor. Adicione a chave em Configurações → Integrações.");

      const res = await fetch(`${MINIMAX_BASE}/image_generation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "image-01",
          prompt: input.prompt,
          aspect_ratio: input.aspectRatio,
          response_format: "url",
          n: input.n,
          prompt_optimizer: true,
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Hailuo API erro ${res.status}: ${text.slice(0, 200)}`);
      }

      const data = await res.json() as any;

      if (data.base_resp?.status_code !== 0) {
        const msg = data.base_resp?.status_msg || "Erro desconhecido";
        if (data.base_resp?.status_code === 1008) throw new Error("Saldo insuficiente na conta Hailuo/MiniMax.");
        if (data.base_resp?.status_code === 1002) throw new Error("Rate limit atingido. Tente novamente em instantes.");
        throw new Error(`Hailuo: ${msg}`);
      }

      const images: string[] = (data.data || []).map((img: any) => img.url as string).filter(Boolean);
      return { images };
    }),

  checkKey: protectedProcedure.query(() => {
    return { configured: !!process.env.MINIMAX_API_KEY };
  }),
});
