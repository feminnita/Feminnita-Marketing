import { AIContentBase } from "./_AIContentBase";

export default function IdeiasImagensInstagramSection() {
  return (
    <AIContentBase config={{
      title: "Imagens Instagram",
      description: "Direção criativa para fotos: composição, cenário, cores, props e legenda pronta.",
      platform: "instagram",
      contentType: "image",
      styleHint: "direção criativa detalhada: cenário, iluminação, composição, props, paleta de cores, roupa, expressão, ângulo de câmera. Retorne como contentIdeas com cada elemento",
      themePlaceholder: "Ex: flat lay produto, lifestyle em casa, look de inverno...",
      themeSuggestions: ["Flat lay do produto","Lifestyle em casa aconchegante","Look completo inverno","Detalhes do tecido e textura","Manhã relaxante","Presente embalado"],
      resultLabel: "Direção criativa",
    }} />
  );
}
