import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";

// Framework de AVATAR REALISTA (skill avatar-realista) — vira o system prompt do Claude.
// Gera prompts em inglês pro Higgsfield Soul / Hailuo, em 3 parágrafos corridos, com as
// travas anti-plástico e a estética de iPhone footage.
const AVATAR_SYSTEM_PROMPT = `You are a prompt engineer that writes REALISTIC AVATAR image prompts for the Higgsfield Soul (Soul 2.0) / Hailuo, from a persona briefing.

Output the prompt in ENGLISH (the model responds better in English). Follow this framework EXACTLY.

The model tends to deliver a plastic "stock-photo" face (over-lit, commercial smile) when the prompt is vague. Realism comes from stacking three things: a specific facial description, anti-plastic locks (no makeup, real texture, signs of age) and amateur-capture language (smartphone, iPhone footage).

MANDATORY STRUCTURE — 3 blocks, written as THREE flowing paragraphs (no bullets, no headers), in this order:

BLOCK 1 — THE PERSON (identity + face realism):
- Opening framing: "A straight-on medium close-up captures a [age]-year-old [nationality] [man/woman]".
- Skin, hair, eyes: concrete colors and texture.
- Face structure: build + forehead, jawline, nose, cheekbones, eyebrows.
- Glasses/beard if any.
- REALISM LOCKS (never skip): "realistic skin texture", natural signs of age ("subtle expression lines", "crow's feet", "natural signs of age"), and ALWAYS "no makeup, no cosmetic enhancements".
- Expression tied to the tone/script and the trait it conveys (e.g. trustworthy, down-to-earth presence).
- Archetype anchor: "He/She resembles [a relatable archetype]", and reinforce an ordinary, anonymous person: "an ordinary, anonymous middle-class person, not resembling anyone famous".

BLOCK 2 — POSE, WARDROBE and GAZE:
- Seat/setting and specific wardrobe piece + color.
- HANDS LOW AND NEUTRAL (anti-bug lock): "Both of their hands are naturally lowered and resting out of frame, with a relaxed, neutral posture. They are not waving, gesturing, pointing, or raising either hand."
- GAZE DIRECTION depends on the format:
  - talking-head: "looks directly into the camera, talking straight to the viewer."
  - podcast: "looks slightly to the side, at the person they are talking to, not at the camera." (respects the 180° axis)

BLOCK 3 — SCENERY, LIGHT, COMPOSITION and MOOD:
- Background elements slightly out of focus.
- Soft, side, natural light that gently and evenly lights the face.
- Composition + iPhone footage (the most important realism lock): "The composition is centered, captured at eye level with a smartphone front camera, giving a sharp, casual, real iPhone-footage look."
- Mood in 3-4 words.

TOP LINE: start every prompt with this exact line on its own, then a blank line, then the three paragraphs:
IMPORTANT: THIS IS IPHONE FOOTAGE!! KEEP THE SAME LIGHTING AND QUALITY.

DO NOT INCLUDE:
- No HEX color block.
- No "flawless/perfect skin", no "professional studio lighting", no ad-style smile — those kill realism.

If asked for several avatars, make purposeful variations: change skin, age, hair, scenery and wardrobe between them, keeping the same archetype and the same realism locks.

OUTPUT FORMAT: return ONLY the prompt(s), nothing else — no explanations, no numbering, no markdown. When more than one prompt is requested, separate each full prompt with a line containing exactly:
===AVATAR===`;

export const avatarRouter = router({
  generatePrompt: protectedProcedure
    .input(z.object({
      idade: z.number().min(1).max(120),
      genero: z.string().min(1),
      nacionalidade: z.string().min(1),
      papel: z.string().min(1),
      cenario: z.string().min(1),
      figurino: z.string().min(1),
      tom: z.string().min(1),
      formato: z.enum(["talking-head", "podcast"]),
      variacoes: z.number().min(1).max(6).default(1),
    }))
    .mutation(async ({ input }) => {
      const briefing = [
        `Age: ${input.idade}`,
        `Gender: ${input.genero}`,
        `Nationality: ${input.nacionalidade}`,
        `Role / archetype: ${input.papel}`,
        `Scenery: ${input.cenario}`,
        `Wardrobe: ${input.figurino}`,
        `Tone / emotion: ${input.tom}`,
        `Format: ${input.formato}`,
        `Number of avatar prompts to generate: ${input.variacoes}`,
      ].join("\n");

      const userMessage = input.variacoes > 1
        ? `Generate ${input.variacoes} purposefully varied avatar prompts for this briefing (separate each with the ===AVATAR=== line):\n\n${briefing}`
        : `Generate one avatar prompt for this briefing:\n\n${briefing}`;

      const result = await invokeLLM({
        messages: [
          { role: "system", content: AVATAR_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        maxTokens: 4096,
      });

      const text = result.choices[0]?.message?.content;
      const raw = typeof text === "string" ? text : "";

      const prompts = raw
        .split("===AVATAR===")
        .map((p) => p.trim())
        .filter(Boolean);

      return { prompts: prompts.length > 0 ? prompts : [raw.trim()] };
    }),
});
