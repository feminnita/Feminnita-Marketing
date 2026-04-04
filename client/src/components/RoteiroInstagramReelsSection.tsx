import { AIContentBase } from "./_AIContentBase";

export default function RoteiroInstagramReelsSection() {
  return (
    <AIContentBase config={{
      title: "Reels",
      description: "Roteiros curtos e virais para Reels do Instagram. Hooks que param o scroll.",
      platform: "instagram",
      contentType: "video",
      styleHint: "reel curto 15-30s, hook nos primeiros 3 segundos, ritmo rápido, trend atual",
      themePlaceholder: "Ex: transformação look, antes e depois, trend musical...",
      themeSuggestions: ["Antes e depois do look","Trend musical com pijama","3 looks com o mesmo pijama","POV: acordei com estilo","Unboxing satisfatório","Montagem de look rápida"],
      resultLabel: "Roteiro de Reel",
    }} />
  );
}
