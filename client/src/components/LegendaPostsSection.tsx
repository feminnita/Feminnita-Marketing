import { AIContentBase } from "./_AIContentBase";

export default function LegendaPostsSection() {
  return (
    <AIContentBase config={{
      title: "Legendas",
      description: "Legendas prontas para posts no Instagram, com a voz e o estilo de cada influencer.",
      platform: "instagram",
      contentType: "image",
      styleHint: "legenda envolvente para foto, com emojis e chamada para ação, máximo 150 palavras",
      themePlaceholder: "Ex: foto de look, produto novo, lifestyle...",
      themeSuggestions: ["Look de pijama do dia","Produto favorito da semana","Momento de autocuidado","Nova coleção chegou","Presente perfeito","Conforto em primeiro lugar"],
      resultLabel: "Legenda gerada",
    }} />
  );
}
