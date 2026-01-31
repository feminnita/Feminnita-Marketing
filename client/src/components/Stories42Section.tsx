import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Calendar, Clock, Image, Type, Zap } from "lucide-react";

export default function Stories42Section() {
  const dias = [
    {
      dia: "Segunda",
      stories: [
        {
          numero: 1,
          horario: "9h",
          titulo: "Teaser Misterioso",
          visual: "Fundo preto/cinza escuro com pijama parcialmente visível no canto. Efeito de luz/brilho.",
          texto: "Algo ESPECIAL chegou! 🎁✨\nVocê está pronto para o melhor pijama do inverno?",
          elemento: "Contagem Regressiva: 'Lançamento em 24h!'",
          cta: "Vira para ver mais! 👉"
        },
        {
          numero: 2,
          horario: "9h30",
          titulo: "Enquete de Antecipação",
          visual: "Ambiente aconchego: cama com lençol, luz morna, xícara de chá. Cores quentes.",
          texto: "Você está esperando por um novo pijama de inverno?",
          elemento: "Enquete: SIM! Quero logo! / Talvez... depende do preço / Não, estou bem assim",
          cta: "Vote agora! 👆"
        },
        {
          numero: 3,
          horario: "13h",
          titulo: "Caixa de Perguntas",
          visual: "Pijama em destaque (mostrando detalhes). Fundo neutro. Cores vibrantes.",
          texto: "Você tem dúvidas sobre o novo pijama de inverno? Pergunte aqui! 👇",
          elemento: "Caixa de Perguntas: 'Qual é sua dúvida? Preço? Tamanho? Cores?'",
          cta: "Deixe sua pergunta! Vamos responder!"
        },
        {
          numero: 4,
          horario: "19h",
          titulo: "Votação de Cor Favorita",
          visual: "2 cores do pijama lado a lado (ex: azul marinho vs cinza). Bem iluminadas.",
          texto: "Qual cor você prefere? 🎨",
          elemento: "Votação: Azul Marinho / Cinza",
          cta: "Vote na sua favorita! 👆"
        }
      ]
    },
    {
      dia: "Terça",
      stories: [
        {
          numero: 5,
          horario: "9h",
          titulo: "Apresentação das 4 Cores",
          visual: "4 pijamas em cores diferentes (azul, cinza, vinho, preto) lado a lado. Bem iluminados.",
          texto: "Conhece nossas 4 cores exclusivas? 🎨✨\nAzul Marinho | Cinza | Vinho | Preto",
          elemento: "Nenhum (apenas apresentação)",
          cta: "Qual é sua favorita? Vira para votar! 👉"
        },
        {
          numero: 6,
          horario: "9h30",
          titulo: "Enquete 1: Qual Cor?",
          visual: "Pijama azul marinho em destaque. Ambiente aconchego ao fundo.",
          texto: "Qual é sua cor favorita?",
          elemento: "Enquete: Azul Marinho (elegante) / Cinza (versátil) / Vinho (sofisticado) / Preto (clássico)",
          cta: "Vote agora! 👆"
        },
        {
          numero: 7,
          horario: "13h",
          titulo: "Respondendo Perguntas",
          visual: "Pijama com detalhe de tecido. Fundo neutro.",
          texto: "Vocês perguntaram! Aqui estão as respostas! 👇\nP: Qual é o preço?\nR: A partir de R$ 49,90 no atacado! 💰",
          elemento: "Nenhum (apenas resposta)",
          cta: "Tem mais dúvidas? Deixe sua pergunta! 👉"
        },
        {
          numero: 8,
          horario: "13h30",
          titulo: "Enquete 2: Tamanho",
          visual: "Pijama em modelo, mostrando ajuste. Ambiente aconchego ao fundo.",
          texto: "Qual tamanho você usa?",
          elemento: "Enquete: P (Pequeno) / M (Médio) / G (Grande) / GG (Extra Grande)",
          cta: "Vote no seu tamanho! 👆"
        },
        {
          numero: 9,
          horario: "19h",
          titulo: "Caixa de Perguntas: Dúvidas",
          visual: "Pijama com close-up no tecido. Fundo neutro.",
          texto: "Mais dúvidas? Pergunte agora! 🤔\nVamos responder tudo para você!",
          elemento: "Caixa de Perguntas: 'Qual é sua dúvida? Tecido? Durabilidade? Frete?'",
          cta: "Deixe sua pergunta! 👇"
        },
        {
          numero: 10,
          horario: "19h30",
          titulo: "Votação: Qual Combo?",
          visual: "2 combos de pijamas lado a lado. Bem apresentados, cores vibrantes.",
          texto: "Se você fosse comprar hoje, qual combo escolheria? 🛍️",
          elemento: "Votação: 2 pijamas por R$ 89,90 / 3 pijamas por R$ 129,90",
          cta: "Vote no seu combo favorito! 👆"
        }
      ]
    },
    {
      dia: "Quarta",
      stories: [
        {
          numero: 11,
          horario: "9h",
          titulo: "Característica 1: Tecido Premium",
          visual: "Close-up no tecido com mão tocando. Luz morna para destacar qualidade.",
          texto: "100% Algodão Premium ✨\nToque aveludado e macio\nPerfeito para inverno",
          elemento: "Nenhum (apenas informação)",
          cta: "Vira para ver mais características! 👉"
        },
        {
          numero: 12,
          horario: "9h30",
          titulo: "Enquete: O que Importa Mais?",
          visual: "Pijama completo em modelo. Ambiente aconchego ao fundo.",
          texto: "O que é mais importante para você em um pijama?",
          elemento: "Enquete: Conforto / Qualidade do Tecido / Preço / Estilo/Cor",
          cta: "Vote agora! 👆"
        },
        {
          numero: 13,
          horario: "13h",
          titulo: "Característica 2: Peso Perfeito",
          visual: "Pijama em modelo, mostrando ajuste. Ambiente aconchego.",
          texto: "Peso Perfeito para Inverno 🌡️\nNem quente demais, nem frio demais\nConforto a noite toda",
          elemento: "Nenhum (apenas informação)",
          cta: "Vira para ver mais! 👉"
        },
        {
          numero: 14,
          horario: "13h30",
          titulo: "Caixa de Perguntas: Técnicas",
          visual: "Pijama mostrando etiqueta. Fundo neutro.",
          texto: "Dúvidas técnicas? Pergunte aqui! 🔍\nComposição? Cuidados? Durabilidade?",
          elemento: "Caixa de Perguntas: 'Qual é sua dúvida técnica?'",
          cta: "Deixe sua pergunta! 👇"
        },
        {
          numero: 15,
          horario: "19h",
          titulo: "Característica 3: Durabilidade",
          visual: "Pijama após múltiplas lavagens (mostrando qualidade mantida). Cores vibrantes.",
          texto: "Durável e Resistente 💪\nMantém qualidade após 100+ lavagens\nInvestimento que vale a pena",
          elemento: "Nenhum (apenas informação)",
          cta: "Vira para ver o preço! 👉"
        },
        {
          numero: 16,
          horario: "19h30",
          titulo: "Votação: Qual Característica?",
          visual: "Montagem das 3 características lado a lado. Bem apresentadas.",
          texto: "Qual característica mais te impressionou? 🌟",
          elemento: "Votação: Tecido Premium / Peso Perfeito / Durabilidade",
          cta: "Vote na sua favorita! 👆"
        }
      ]
    },
    {
      dia: "Quinta",
      stories: [
        {
          numero: 17,
          horario: "9h",
          titulo: "Depoimento 1: Cliente Satisfeita",
          visual: "Mulher usando pijama, sorrindo, relaxada. Ambiente aconchego.",
          texto: "'Melhor pijama que já tive! Tão macio e confortável!' - Maria, São Paulo ⭐⭐⭐⭐⭐",
          elemento: "Nenhum (apenas depoimento)",
          cta: "Vira para ver mais depoimentos! 👉"
        },
        {
          numero: 18,
          horario: "9h30",
          titulo: "Enquete: Confia em Depoimentos?",
          visual: "Montagem de 3 depoimentos (diferentes mulheres). Fundo neutro.",
          texto: "Depoimentos de clientes influenciam sua decisão de compra?",
          elemento: "Enquete: Sim, muito! / Um pouco / Não, prefiro testar",
          cta: "Vote agora! 👆"
        },
        {
          numero: 19,
          horario: "13h",
          titulo: "Depoimento 2: Cliente Lojista",
          visual: "Mulher em ambiente de loja com estoque. Profissional, confiante.",
          texto: "'Vendo muito! Meus clientes amam a qualidade!' - Ana, Lojista RJ ⭐⭐⭐⭐⭐",
          elemento: "Nenhum (apenas depoimento)",
          cta: "Vira para ver mais! 👉"
        },
        {
          numero: 20,
          horario: "13h30",
          titulo: "Caixa de Perguntas: Clientes",
          visual: "Montagem de clientes satisfeitas. Fundo neutro.",
          texto: "Quer fazer uma pergunta diretamente para nossos clientes? 💬\nPergunte aqui e eles podem responder!",
          elemento: "Caixa de Perguntas: 'Qual é sua dúvida para os clientes?'",
          cta: "Deixe sua pergunta! 👇"
        },
        {
          numero: 21,
          horario: "19h",
          titulo: "Depoimento 3: Renda Extra",
          visual: "Mulher mostrando pijamas, alegre e bem-sucedida. Ambiente de negócio.",
          texto: "'Já ganhei R$ 1.500 revendendo! Super recomendo!' - Carol, Empreendedora SP ⭐⭐⭐⭐⭐",
          elemento: "Nenhum (apenas depoimento)",
          cta: "Vira para saber como começar! 👉"
        },
        {
          numero: 22,
          horario: "19h30",
          titulo: "Votação: Qual Depoimento?",
          visual: "Montagem dos 3 depoimentos lado a lado. Bem apresentadas.",
          texto: "Qual depoimento mais te inspirou? 🌟",
          elemento: "Votação: Cliente Satisfeita / Lojista / Renda Extra",
          cta: "Vote no seu favorito! 👆"
        }
      ]
    },
    {
      dia: "Sexta",
      stories: [
        {
          numero: 23,
          horario: "9h",
          titulo: "Anúncio de Promoção",
          visual: "Pijama com badge 'PROMOÇÃO ESPECIAL'. Cores vibrantes, chamativo.",
          texto: "PROMOÇÃO ESPECIAL PARA VOCÊS! 🎉\nMas qual promoção vocês preferem?\nVocês decidem!",
          elemento: "Nenhum (apenas anúncio)",
          cta: "Vira para votar na promoção! 👉"
        },
        {
          numero: 24,
          horario: "9h30",
          titulo: "Votação: Qual Promoção?",
          visual: "Pijama com 2 opções de promoção lado a lado. Cores vibrantes.",
          texto: "Qual promoção você prefere?",
          elemento: "Votação: 40% OFF em 1 pijama / Compre 2, Leve 3 (50% OFF no 3º)",
          cta: "Vote na sua promoção favorita! 👆"
        },
        {
          numero: 25,
          horario: "13h",
          titulo: "Urgência: Contagem Regressiva",
          visual: "Pijama com 'ÚLTIMAS PEÇAS'. Fundo vermelho/laranja (urgência).",
          texto: "⏰ ATENÇÃO!\nPromoção válida apenas este fim de semana!\nQuantidade limitada!",
          elemento: "Contagem Regressiva: 'Promoção termina em 48h!'",
          cta: "Não perca! Compre agora! 🔥"
        },
        {
          numero: 26,
          horario: "13h30",
          titulo: "Caixa de Perguntas: Promoção",
          visual: "Pijama com badge de promoção. Fundo neutro.",
          texto: "Dúvidas sobre a promoção? Pergunte aqui! 🤔\nComo funciona? Como comprar?",
          elemento: "Caixa de Perguntas: 'Qual é sua dúvida sobre a promoção?'",
          cta: "Deixe sua pergunta! 👇"
        },
        {
          numero: 27,
          horario: "19h",
          titulo: "Resultado da Votação",
          visual: "Pijama com promoção vencedora em destaque. Cores vibrantes.",
          texto: "VOCÊS DECIDIRAM! 🎉\nA promoção vencedora é: [Promoção Mais Votada]\nVálida apenas este fim de semana!",
          elemento: "Nenhum (apenas anúncio)",
          cta: "Vira para saber como comprar! 👉"
        },
        {
          numero: 28,
          horario: "19h30",
          titulo: "CTA Final: Link para Compra",
          visual: "Pijama com promoção. Fundo vibrante, chamativo.",
          texto: "COMPRE AGORA! 🛍️\nLink na bio!\nOu envie mensagem no WhatsApp!",
          elemento: "Sticker de Link (site/WhatsApp) ou Localização",
          cta: "Clique no link! 👆 ou Envie mensagem! 💬"
        }
      ]
    },
    {
      dia: "Sábado",
      stories: [
        {
          numero: 29,
          horario: "9h",
          titulo: "Lifestyle 1: Acordar",
          visual: "Mulher acordando na cama, esticando, sorrindo. Pijama visível. Luz natural.",
          texto: "Acordar confortável é o melhor! ☀️\nCom nosso pijama de inverno, toda manhã é especial",
          elemento: "Nenhum (apenas inspiração)",
          cta: "Vira para mais inspiração! 👉"
        },
        {
          numero: 30,
          horario: "9h30",
          titulo: "Enquete: Ritual Matinal",
          visual: "Mulher em ambiente aconchego. Luz natural.",
          texto: "Qual é seu ritual matinal favorito?",
          elemento: "Enquete: Acordar devagar / Tomar café na cama / Meditar / Exercitar",
          cta: "Vote no seu! 👆"
        },
        {
          numero: 31,
          horario: "13h",
          titulo: "Lifestyle 2: Tarde",
          visual: "Mulher em sofá, lendo livro, tomando chá. Pijama visível. Luz quente.",
          texto: "Tarde de relaxamento? ☕\nPijama de inverno é perfeito para ficar em casa",
          elemento: "Nenhum (apenas inspiração)",
          cta: "Vira para ver mais! 👉"
        },
        {
          numero: 32,
          horario: "13h30",
          titulo: "Caixa de Perguntas: Momento",
          visual: "Montagem de diferentes momentos (acordar, tarde, noite). Fundo neutro.",
          texto: "Qual é seu momento favorito do dia para usar pijama confortável? 🌙",
          elemento: "Caixa de Perguntas: 'Qual é seu momento favorito?'",
          cta: "Deixe sua resposta! 👇"
        },
        {
          numero: 33,
          horario: "19h",
          titulo: "Lifestyle 3: Noite",
          visual: "Mulher deitada na cama, abraçando almofada. Pijama visível. Luz morna.",
          texto: "Noite aconchego é a melhor! 🌙\nPijama de inverno = sono perfeito",
          elemento: "Nenhum (apenas inspiração)",
          cta: "Vira para ver mais! 👉"
        },
        {
          numero: 34,
          horario: "19h30",
          titulo: "Votação: Qual Momento?",
          visual: "Montagem dos 3 momentos lado a lado. Bem apresentadas.",
          texto: "Qual momento você mais aprecia? 🌟",
          elemento: "Votação: Acordar Confortável / Tarde Relaxante / Noite Aconchego",
          cta: "Vote no seu favorito! 👆"
        }
      ]
    },
    {
      dia: "Domingo",
      stories: [
        {
          numero: 35,
          horario: "9h",
          titulo: "Resumo da Semana",
          visual: "Montagem de momentos da semana (cores, características, depoimentos). Colagem alegre.",
          texto: "QUE SEMANA INCRÍVEL! 🎉\nVocês votaram, perguntaram, compartilharam!\nObrigada pelo amor!",
          elemento: "Nenhum (apenas resumo)",
          cta: "Vira para ver o último chamado! 👉"
        },
        {
          numero: 36,
          horario: "9h30",
          titulo: "Enquete Final: Vai Comprar?",
          visual: "Pijama de inverno com promoção. Fundo vibrante.",
          texto: "Você vai aproveitar a promoção?",
          elemento: "Enquete: Sim! Já estou comprando! / Talvez, estou pensando / Não, não é para mim",
          cta: "Vote agora! 👆"
        },
        {
          numero: 37,
          horario: "13h",
          titulo: "Último Chamado",
          visual: "Pijama com 'ÚLTIMO DIA'. Fundo vermelho/laranja (urgência).",
          texto: "⏰ ATENÇÃO!\nPromoção termina HOJE!\nÚltimas peças em estoque!",
          elemento: "Contagem Regressiva: 'Promoção termina em 12h!'",
          cta: "Compre agora! 🔥"
        },
        {
          numero: 38,
          horario: "13h30",
          titulo: "Caixa de Perguntas: Últimas",
          visual: "Pijama com promoção. Fundo neutro.",
          texto: "Última chance de tirar dúvidas! 🤔\nPergunte agora!",
          elemento: "Caixa de Perguntas: 'Qual é sua última dúvida?'",
          cta: "Deixe sua pergunta! 👇"
        },
        {
          numero: 39,
          horario: "19h",
          titulo: "Agradecimento",
          visual: "Montagem de clientes satisfeitas. Fundo neutro.",
          texto: "OBRIGADA! 💖\nVocês foram INCRÍVEIS esta semana!\nSemana que vem tem MAIS NOVIDADES!",
          elemento: "Nenhum (apenas agradecimento)",
          cta: "Fique ligada! 👉"
        },
        {
          numero: 40,
          horario: "19h30",
          titulo: "Link Final",
          visual: "Pijama com promoção. Fundo vibrante.",
          texto: "ÚLTIMAS HORAS! 🔥\nLink na bio!\nWhatsApp também!",
          elemento: "Sticker de Link (site/WhatsApp) ou Localização",
          cta: "Clique agora! 👆 ou Envie mensagem! 💬"
        },
        {
          numero: 41,
          horario: "20h",
          titulo: "Bônus: Behind the Scenes",
          visual: "Behind the scenes da campanha (você/equipe preparando). Casual.",
          texto: "Nos bastidores da campanha! 📸\nMuito trabalho, muito amor!\nValeu a pena ver vocês felizes!",
          elemento: "Nenhum (apenas diversão)",
          cta: "Que acham? 👉"
        },
        {
          numero: 42,
          horario: "20h30",
          titulo: "Enquete Final: Satisfação",
          visual: "Pijama de inverno. Fundo neutro.",
          texto: "Qual foi sua experiência com a gente esta semana?",
          elemento: "Enquete: Amei! Vou comprar! / Gostei, mas vou pensar / Não era para mim / Adorei tudo!",
          cta: "Deixe seu feedback! 👆"
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">42 Stories Completos - Textos e Descrições Visuais</h2>
        <p className="text-slate-600">
          Textos exatos prontos para copiar e colar, com descrições visuais detalhadas para cada um dos 42 stories da campanha de uma semana.
        </p>
      </div>

      {/* Resumo Geral */}
      <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg">Resumo Geral dos 42 Stories</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total de Stories</p>
            <p className="text-slate-700 font-bold text-blue-600">42 stories</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Duração</p>
            <p className="text-slate-700 font-bold">7 dias (segunda a domingo)</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Média por Dia</p>
            <p className="text-slate-700 font-bold">6 stories + 2 bônus no domingo</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Elementos Interativos</p>
            <p className="text-slate-700 font-bold">31 elementos (enquetes, votações, caixas)</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Horários de Postagem</p>
            <p className="text-slate-700 font-bold">9h, 13h, 19h (+ 20h domingo)</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Resultado Esperado</p>
            <p className="text-slate-700 font-bold text-green-600">2K-3K respostas, 50-100 vendas</p>
          </div>
        </CardContent>
      </Card>

      {/* Stories por Dia */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Stories Dia a Dia</h3>
        
        <Tabs defaultValue="segunda" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6 bg-slate-100 p-1 overflow-x-auto">
            {dias.map((d, idx) => (
              <TabsTrigger key={idx} value={d.dia.toLowerCase()} className="text-xs sm:text-sm">
                {d.dia.slice(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {dias.map((dia, dayIdx) => (
            <TabsContent key={dayIdx} value={dia.dia.toLowerCase()} className="space-y-4">
              <div className="space-y-3">
                {dia.stories.map((story, idx) => (
                  <Card key={idx} className="border-l-4 border-l-blue-400">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Story {story.numero}</Badge>
                          <div>
                            <CardTitle className="text-base">{story.titulo}</CardTitle>
                            <CardDescription className="flex items-center gap-1 text-xs mt-1">
                              <Clock className="w-3 h-3" /> {story.horario}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-600 uppercase mb-2 flex items-center gap-1">
                          <Image className="w-3 h-3" /> Descrição Visual
                        </p>
                        <p className="text-sm text-blue-900">{story.visual}</p>
                      </div>

                      <div className="bg-purple-50 p-3 rounded border border-purple-200">
                        <p className="text-xs font-semibold text-purple-600 uppercase mb-2 flex items-center gap-1">
                          <Type className="w-3 h-3" /> Texto Exato
                        </p>
                        <p className="text-sm text-purple-900 whitespace-pre-line font-mono">{story.texto}</p>
                      </div>

                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="text-xs font-semibold text-green-600 uppercase mb-2 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Elemento Interativo
                        </p>
                        <p className="text-sm text-green-900">{story.elemento}</p>
                      </div>

                      <div className="bg-amber-50 p-3 rounded border border-amber-200">
                        <p className="text-xs font-semibold text-amber-600 uppercase mb-2">CTA</p>
                        <p className="text-sm text-amber-900 font-semibold">{story.cta}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Dicas de Produção */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg">8 Dicas Finais de Produção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { titulo: "Qualidade Visual", descricao: "Todas as fotos devem ser de qualidade profissional. Use boa iluminação, foco nítido e composição equilibrada." },
            { titulo: "Consistência de Estilo", descricao: "Mantenha paleta de cores consistente. Use cores quentes (rosa, laranja, ouro) para criar conexão emocional." },
            { titulo: "Texto Legível", descricao: "Todos os textos devem ser legíveis em celular pequeno. Use fontes grandes, contorno preto, cores contrastantes." },
            { titulo: "Elementos Interativos", descricao: "Coloque sempre o elemento interativo em local visível. Não esconda atrás de texto ou imagem." },
            { titulo: "CTAs Claros", descricao: "Sempre termine cada story com CTA claro. Diga exatamente o que você quer que o usuário faça." },
            { titulo: "Timing Estratégico", descricao: "Poste nos horários especificados (9h, 13h, 19h). Esses horários geralmente têm melhor engajamento." },
            { titulo: "Responda Rápido", descricao: "Quando receber respostas, responda rapidamente (nos primeiros 30 minutos). Isso aumenta engajamento." },
            { titulo: "Salve Dados", descricao: "Compile todas as respostas em spreadsheet. Cria FAQ, guia futuras campanhas, identifica tendências." }
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b border-amber-200 last:border-0">
              <div className="w-1 bg-amber-600 rounded-full flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">{tip.titulo}</p>
                <p className="text-xs text-slate-600">{tip.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Como Usar */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Como Usar Este Documento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "1. Prepare Conteúdo: Use as descrições visuais para preparar fotos/vídeos. Grave tudo no domingo anterior.",
            "2. Copie Textos: Copie os textos exatos diretamente para o Instagram. Não precisa reescrever.",
            "3. Configure Elementos: Siga as instruções de elemento interativo para configurar enquetes, votações, etc.",
            "4. Agende Stories: Use agendador do Instagram para agendar todos os stories nos horários especificados.",
            "5. Monitore Respostas: Durante a semana, acompanhe respostas e responda rapidamente.",
            "6. Compile Dados: No final da semana, compile todas as respostas em spreadsheet para análise."
          ].map((item, idx) => (
            <div key={idx} className="text-slate-700">{item}</div>
          ))}
        </CardContent>
      </Card>

      {/* Download Completo */}
      <Card className="border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg">Documento Completo Disponível</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-slate-700">
            Um documento completo com todos os 42 stories foi criado e está disponível para download. O arquivo contém:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Textos exatos para cada story (prontos para copiar e colar)</li>
            <li>Descrições visuais detalhadas para cada story</li>
            <li>Elementos interativos específicos</li>
            <li>CTAs claras</li>
            <li>Dicas de produção</li>
            <li>Checklist de execução</li>
            <li>Análise pós-campanha</li>
          </ul>
          <p className="text-slate-700 font-semibold mt-3">
            Arquivo: <code className="bg-slate-200 px-2 py-1 rounded">42_stories_campanha_completa.md</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
