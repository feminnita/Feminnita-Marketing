/**
 * Helpers para integração com Bling API v3
 * Documentação: https://developer.bling.com.br/bling-api
 */

import { BlingAccessToken, BlingError, BlingErrorResponse, BlingProdutoResponse, BlingPedidoResponse, BlingContatoResponse, BlingEstoqueResponse } from "@shared/types/bling";

const BLING_API_BASE_URL = "https://api.bling.com.br/Api/v3";

export class BlingAPIError extends Error {
  constructor(
    public statusCode: number,
    public errors: BlingError[] = [],
    message?: string
  ) {
    super(message || `Bling API Error: ${statusCode}`);
    this.name = "BlingAPIError";
  }
}

/**
 * Faz uma requisição autenticada para a Bling API
 */
export async function blingRequest<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BLING_API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as BlingErrorResponse;
      throw new BlingAPIError(
        response.status,
        errorData.erros || [],
        `Bling API Error: ${response.status}`
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof BlingAPIError) {
      throw error;
    }

    throw new BlingAPIError(500, [], `Bling API request failed: ${error}`);
  }
}

/**
 * Sincroniza produtos do Bling
 */
export async function sincronizarProdutos(
  accessToken: string,
  pagina: number = 1,
  limite: number = 100
): Promise<BlingProdutoResponse> {
  return blingRequest<BlingProdutoResponse>(
    `/produtos?pagina=${pagina}&limite=${limite}`,
    accessToken
  );
}

/**
 * Sincroniza pedidos do Bling
 */
export async function sincronizarPedidos(
  accessToken: string,
  pagina: number = 1,
  limite: number = 100,
  dataInicio?: string,
  dataFim?: string
): Promise<BlingPedidoResponse> {
  let endpoint = `/pedidos?pagina=${pagina}&limite=${limite}`;

  if (dataInicio) {
    endpoint += `&dataInicio=${dataInicio}`;
  }

  if (dataFim) {
    endpoint += `&dataFim=${dataFim}`;
  }

  return blingRequest<BlingPedidoResponse>(endpoint, accessToken);
}

/**
 * Sincroniza contatos do Bling
 */
export async function sincronizarContatos(
  accessToken: string,
  pagina: number = 1,
  limite: number = 100
): Promise<BlingContatoResponse> {
  return blingRequest<BlingContatoResponse>(
    `/contatos?pagina=${pagina}&limite=${limite}`,
    accessToken
  );
}

/**
 * Sincroniza estoque do Bling
 */
export async function sincronizarEstoque(
  accessToken: string,
  pagina: number = 1,
  limite: number = 100
): Promise<BlingEstoqueResponse> {
  return blingRequest<BlingEstoqueResponse>(
    `/estoque?pagina=${pagina}&limite=${limite}`,
    accessToken
  );
}

/**
 * Obtém um produto específico do Bling
 */
export async function obterProduto(
  accessToken: string,
  produtoId: number
): Promise<any> {
  return blingRequest(`/produtos/${produtoId}`, accessToken);
}

/**
 * Obtém um pedido específico do Bling
 */
export async function obterPedido(
  accessToken: string,
  pedidoId: number
): Promise<any> {
  return blingRequest(`/pedidos/${pedidoId}`, accessToken);
}

/**
 * Cria um novo contato no Bling
 */
export async function criarContato(
  accessToken: string,
  contato: any
): Promise<any> {
  return blingRequest("/contatos", accessToken, {
    method: "POST",
    body: JSON.stringify(contato),
  });
}

/**
 * Atualiza um contato no Bling
 */
export async function atualizarContato(
  accessToken: string,
  contatoId: number,
  contato: any
): Promise<any> {
  return blingRequest(`/contatos/${contatoId}`, accessToken, {
    method: "PUT",
    body: JSON.stringify(contato),
  });
}

/**
 * Sincroniza todos os dados do Bling (produtos, pedidos, contatos, estoque)
 */
export async function sincronizarTodosDados(accessToken: string): Promise<{
  produtos: BlingProdutoResponse;
  pedidos: BlingPedidoResponse;
  contatos: BlingContatoResponse;
  estoque: BlingEstoqueResponse;
}> {
  const [produtos, pedidos, contatos, estoque] = await Promise.all([
    sincronizarProdutos(accessToken),
    sincronizarPedidos(accessToken),
    sincronizarContatos(accessToken),
    sincronizarEstoque(accessToken),
  ]);

  return {
    produtos,
    pedidos,
    contatos,
    estoque,
  };
}

/**
 * Formata erro da Bling API para mensagem legível
 */
export function formatarErroBlng(error: BlingAPIError): string {
  if (error.errors.length === 0) {
    return `Erro ${error.statusCode}: ${error.message}`;
  }

  return error.errors
    .map((e) => `${e.codigo}: ${e.mensagem}`)
    .join("; ");
}
