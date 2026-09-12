import { describe, expect, it } from "vitest";
import { escolherProdutos, type LinhaLeve } from "./busca-catalogo";

// Testa o MIOLO: dada a pergunta da cliente, quais produtos entram e em que
// ordem. O acesso ao banco fica de fora de proposito — um banco de mentira aqui
// so provaria que o banco de mentira funciona.
//
// O que estas regras impedem, na pratica: antes desta busca o agente pegava
// `limit 3` sem ordenacao, as mesmas 3 linhas para toda mensagem. Com o
// catalogo carregado isso viraria "3 pijamas sorteados" a cada pergunta.

const CATALOGO: LinhaLeve[] = [
    { id: 10, title: "Pijama Longo Inverno Soft", category: "pijama", tags: ["inverno", "39740"] },
    { id: 11, title: "Camisola Regata Verao", category: "camisola", tags: ["verao"] },
    { id: 12, title: "Cropped Regata Viscolycra", category: "cropped", tags: ["29800"] },
    { id: 13, title: "Pijama Curto Suede Estampado", category: "pijama", tags: ["verao"] },
];

describe("escolherProdutos", () => {
    it("pergunta generica nao traz produto nenhum", () => {
        expect(escolherProdutos(CATALOGO, "bom dia", 4)).toEqual([]);
        expect(escolherProdutos(CATALOGO, "oi, tudo bem?", 4)).toEqual([]);
    });

    it("pergunta so de politica nao traz produto", () => {
        // "frete" e "prazo" nao estao em nenhum titulo: a resposta vem das
        // politicas, que entram por outro caminho e sempre.
        expect(escolherProdutos(CATALOGO, "qual o prazo de entrega?", 4)).toEqual([]);
    });

    it("acha pelo nome da peca", () => {
        expect(escolherProdutos(CATALOGO, "voces tem camisola?", 4)).toEqual([11]);
    });

    it("codigo do SKU vem na frente de palavra solta", () => {
        // "regata" casa com 11 e 12; o codigo 29800 so com o 12. O codigo vale
        // 10 pontos justamente para ganhar essa disputa.
        const r = escolherProdutos(CATALOGO, "quanto custa a regata 29800?", 4);
        expect(r[0]).toBe(12);
    });

    it("ignora acento: 'pijama' com e sem acento acha os mesmos", () => {
        const comAcento = escolherProdutos(CATALOGO, "tem pijamá de inverno?", 4);
        const semAcento = escolherProdutos(CATALOGO, "tem pijama de inverno?", 4);
        expect(comAcento).toEqual(semAcento);
        expect(comAcento[0]).toBe(10); // "pijama" + "inverno" = 2 pontos
    });

    it("respeita o teto de produtos", () => {
        const r = escolherProdutos(CATALOGO, "pijama camisola cropped regata", 2);
        expect(r).toHaveLength(2);
    });

    it("catalogo vazio nao quebra", () => {
        expect(escolherProdutos([], "tem pijama?", 4)).toEqual([]);
    });

    it("palavra de duas letras nao conta — senao 'oi' casaria com meio catalogo", () => {
        expect(escolherProdutos(CATALOGO, "vc tem ai?", 4)).toEqual([]);
    });
});
