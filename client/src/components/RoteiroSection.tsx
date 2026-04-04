import { AIContentBase } from "./_AIContentBase";

export default function RoteiroSection() {
  return (
    <AIContentBase config={{
      title: "Roteiros",
      description: "A IA cria roteiros completos de vídeo com hook, desenvolvimento e CTA na voz da influencer.",
      platform: "instagram",
      contentType: "video",
      styleHint: "roteiro completo com hook poderoso, 3 cenas e call-to-action claro",
      themePlaceholder: "Ex: lançamento pijama inverno, dica de look noturno...",
      themeSuggestions: ["Lançamento coleção inverno","5 razões para comprar Feminnita","Unboxing do pedido","Rotina noturna","Kit presente Dia das Mães","Por que uso pijama Feminnita"],
      resultLabel: "Roteiro gerado",
    }} />
  );
}
