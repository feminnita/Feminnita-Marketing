/**
 * Helpers para requisições à API Bling v3
 * Documentação: https://developer.bling.com.br/bling-api
 */

const BLING_API_URL = "https://api.bling.com.br/Api/v3";

export class BlingAPIError extends Error {
  constructor(
    public statusCode: number,
    public blingError: any,
    message: string
  ) {
    super(message);
    this.name = "BlingAPIError";
  }
}

/**
 * Realiza uma requisição autenticada à API Bling
 */
export async function fazerRequisicaoBling(
  endpoint: string,
  accessToken: string,
  opcoes: RequestInit = {}
): Promise<any> {
  const url = `${BLING_API_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    ...opcoes.headers,
  };

  try {
    const response = await fetch(url, {
      ...opcoes,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new BlingAPIError(
        response.status,
        data,
        `Erro na API Bling: ${data.message || data.error || response.statusText}`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof BlingAPIError) {
      throw error;
    }
    throw new Error(`Erro ao conectar com Bling: ${error}`);
  }
}

/**
 * Sincroniza produtos do Bling
 */
export async function sincronizarProdutosBling(
  accessToken: string,
  pagina: number = 1,
  limite: number = 100
): Promise<any> {
  const params = new URLSearchParams({
    page: pagina.toString(),
    pageSize: limite.toString(),
  });

  return fazerRequisicaoBling(`/products?${params.toString()}`, accessToken);
}

/**
 * Sincroniza pedidos do Bling
 */
export async function sincronizarPedidosBling(
  accessToken: string,
  pagina: number = 1,
  limite: number = 100,
  dataInicio?: string,
  dataFim?: string
): Promise<any> {
  const params = new URLSearchParams({
    page: pagina.toString(),
    pageSize: limite.toString(),
  });

  if (dataInicio) params.append("createdSince", dataInicio);
  if (dataFim) params.append("createdUntil", dataFim);

  return fazerRequisicaoBling(`/orders?${params.toString()}`, accessToken);
}

/**
 * Sincroniza contatos do Bling
 */
export async function sincronizarContatosBling(
  accessToken: string,
  pagina: number = 1,
  limite: number = 100
): Promise<any> {
  const params = new URLSearchParams({
    page: pagina.toString(),
    pageSize: limite.toString(),
  });

  return fazerRequisicaoBling(`/contacts?${params.toString()}`, accessToken);
}

/**
 * Sincroniza estoque do Bling
 */
export async function sincronizarEstoqueBling(
  accessToken: string,
  pagina: number = 1,
  limite: number = 100
): Promise<any> {
  const params = new URLSearchParams({
    page: pagina.toString(),
    pageSize: limite.toString(),
  });

  return fazerRequisicaoBling(`/stocks?${params.toString()}`, accessToken);
}

/**
 * Obtém detalhes de um produto específico
 */
export async function obterProdutoBling(
  accessToken: string,
  produtoId: number
): Promise<any> {
  return fazerRequisicaoBling(`/products/${produtoId}`, accessToken);
}

/**
 * Obtém detalhes de um pedido específico
 */
export async function obterPedidoBling(
  accessToken: string,
  pedidoId: number
): Promise<any> {
  return fazerRequisicaoBling(`/orders/${pedidoId}`, accessToken);
}

/**
 * Atualiza estoque de um produto
 */
export async function atualizarEstoqueBling(
  accessToken: string,
  produtoId: number,
  quantidade: number
): Promise<any> {
  return fazerRequisicaoBling(
    `/products/${produtoId}/stocks`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({
        quantity: quantidade,
      }),
    }
  );
}

/**
 * Formata erro da API Bling para mensagem legível
 */
export function formatarErroBling(erro: BlingAPIError): string {
  const mensagens: Record<number, string> = {
    400: "Requisição inválida",
    401: "Não autorizado - Token inválido ou expirado",
    403: "Acesso proibido",
    404: "Recurso não encontrado",
    429: "Muitas requisições - Aguarde antes de tentar novamente",
    500: "Erro interno do servidor Bling",
  };

  return mensagens[erro.statusCode] || `Erro ${erro.statusCode}: ${erro.message}`;
}
