import { and, eq, inArray, ne } from "drizzle-orm";
import { knowledgeBase } from "../../drizzle/schema";

// Escolhe O QUE a Lia enxerga da base de conhecimento a cada mensagem.
//
// Antes daqui, o agente fazia isto:
//
//   select * from knowledge_base where userId=? and isActive=1 limit 3
//
// Sem ordenacao e sem relacao com a pergunta: as MESMAS 3 primeiras linhas
// sempre, fosse a cliente perguntando de frete ou de pijama de inverno. A
// coluna `embedding` existe na tabela mas nenhum arquivo do projeto usa.
//
// Isso nao era problema enquanto a base tinha 8 linhas. Vira problema no
// momento em que o catalogo entrar: com 500 produtos, tres deles sairiam
// sorteados a cada mensagem e empurrariam para fora as politicas (pedido
// minimo, frete, pagamento) — que sao justamente as que ela responde certo
// hoje. A Lia PIORARIA ao ganhar o catalogo.
//
// Aqui a regra e outra:
//   1. politica e informacao geral entram SEMPRE. Sao poucas e sao o chao do
//      atendimento; nunca podem perder vaga para produto.
//   2. produto entra so quando a pergunta aponta para ele.
//   3. nao apontou para nenhum? nenhum produto entra. E melhor ela falar em
//      geral do que citar um pijama que ninguem perguntou.
//
// Busca por palavra e por codigo, de proposito — nao semantica. A semantica
// custa uma chamada de embedding por mensagem e ainda nao sabemos COMO as
// clientes perguntam. Vamos saber quando o historico do WhatsApp for extraido.
// A coluna `embedding` continua ali para esse dia.

const SEM_VALOR = new Set([
    "a", "o", "as", "os", "um", "uma", "de", "da", "do", "das", "dos", "e", "ou",
    "que", "qual", "quais", "quanto", "quanta", "como", "para", "pra", "por",
    "com", "sem", "em", "no", "na", "nos", "nas", "ao", "aos", "tem", "ter",
    "tenho", "voce", "voces", "eu", "me", "meu", "minha", "esse", "essa", "isso",
    "este", "esta", "aquele", "aquela", "ai", "la", "bom", "boa", "dia", "tarde",
    "noite", "ola", "oi", "obrigada", "obrigado", "favor", "queria",
    "quero", "gostaria", "vcs", "ver", "saber", "preco", "valor", "custa",
]);

// Marcas de acento do Unicode. Escrito como string para o arquivo nao depender
// de caracteres invisiveis: cliente escreve "pijama" e "pijamá", tem que casar.
const ACENTOS = new RegExp("[\\u0300-\\u036f]", "g");

function normalizar(texto: string): string {
    return texto.normalize("NFD").replace(ACENTOS, "").toLowerCase();
}

function palavrasUteis(mensagem: string): string[] {
    return normalizar(mensagem)
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((p) => p.length >= 3 && !SEM_VALOR.has(p));
}

// Os SKUs da Feminnita sao numericos (39740, 29800). Quando a cliente manda um,
// ela esta perguntando DAQUELE produto — vale mais que qualquer palavra solta.
function codigos(mensagem: string): string[] {
    return mensagem.match(/\b\d{4,7}\b/g) ?? [];
}

export type LinhaLeve = { id: number; title: string; category: string | null; tags: unknown };

function pontuar(linha: LinhaLeve, palavras: string[], cods: string[]): number {
    const alvo = normalizar(
        [linha.title, linha.category ?? "", JSON.stringify(linha.tags ?? "")].join(" "),
    );
    let pontos = 0;
    for (const c of cods) if (alvo.includes(c)) pontos += 10; // codigo e quase certeza
    for (const p of palavras) if (alvo.includes(p)) pontos += 1;
    return pontos;
}

/**
 * O MIOLO da decisao: quais produtos a pergunta esta pedindo, em ordem.
 * Separado do banco de proposito — e esta parte que precisa de teste, e testar
 * atraves de um banco de mentira so testaria o banco de mentira.
 * Devolve lista vazia quando nada casa: melhor nenhum produto do que um sorteado.
 */
export function escolherProdutos(
    leves: LinhaLeve[],
    mensagem: string,
    maxProdutos: number,
): number[] {
    const palavras = palavrasUteis(mensagem);
    const cods = codigos(mensagem);
    if (!palavras.length && !cods.length) return [];

    return leves
        .map((l) => ({ id: l.id, pontos: pontuar(l, palavras, cods) }))
        .filter((x) => x.pontos > 0)
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, maxProdutos)
        .map((x) => x.id);
}

/**
 * Devolve as linhas da base que valem entrar no prompt desta mensagem.
 * Sempre as politicas/informacoes gerais, mais os produtos que a pergunta pedir.
 */
export async function selecionarConhecimento(
    db: any,
    userId: number,
    mensagem: string,
    maxProdutos = 4,
) {
    const base = and(eq(knowledgeBase.userId, userId), eq(knowledgeBase.isActive, true));

    // 1. O chao do atendimento — entra sempre.
    const fixas = await db
        .select()
        .from(knowledgeBase)
        .where(and(base, ne(knowledgeBase.contentType, "product")));

    // 2. So o necessario para pontuar. A `description` e longtext: carregar a de
    //    500 produtos a cada mensagem seria desperdicio de banco e de memoria.
    const leves: LinhaLeve[] = await db
        .select({
            id: knowledgeBase.id,
            title: knowledgeBase.title,
            category: knowledgeBase.category,
            tags: knowledgeBase.tags,
        })
        .from(knowledgeBase)
        .where(and(base, eq(knowledgeBase.contentType, "product")));

    const escolhidos = escolherProdutos(leves, mensagem, maxProdutos);
    if (!escolhidos.length) return fixas;

    // 3. Agora sim, as linhas inteiras dos vencedores.
    const produtos = await db
        .select()
        .from(knowledgeBase)
        .where(and(base, inArray(knowledgeBase.id, escolhidos)));

    // Ordena como a pontuacao decidiu: o primeiro do prompt e o mais provavel.
    const ordem = new Map(escolhidos.map((id, i) => [id, i]));
    produtos.sort((a: any, b: any) => (ordem.get(a.id) ?? 0) - (ordem.get(b.id) ?? 0));

    return [...fixas, ...produtos];
}
