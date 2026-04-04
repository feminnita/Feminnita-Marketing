import { AIContentBase } from "./_AIContentBase";

export default function RoteiroTikTokSection() {
  return (
    <AIContentBase config={{
      title: "TikTok",
      description: "Roteiros para TikTok com ganchos virais, trends e linguagem da plataforma.",
      platform: "tiktok",
      contentType: "video",
      styleHint: "TikTok viral, linguagem jovem, trend atual, hook nos 2 primeiros segundos, duração ideal 15-60s",
      themePlaceholder: "Ex: GRWM pijama, trend dança, POV, stitch com moda...",
      themeSuggestions: ["GRWM — minha rotina noturna","POV: você recebeu seu pedido","Duet com look de pijama","Trend de moda com Feminnita","Transição look dia x noite","5 pijamas para o inverno"],
      resultLabel: "Roteiro TikTok",
    }} />
  );
}
