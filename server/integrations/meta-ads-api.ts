/**
 * Helpers para Meta Ads API (Facebook Ads)
 * Documentação: https://developers.facebook.com/docs/marketing-api
 */

const META_API_URL = "https://graph.instagram.com/v18.0";
const META_GRAPH_URL = "https://graph.facebook.com/v18.0";

export class MetaAdsAPIError extends Error {
  constructor(
    public statusCode: number,
    public metaError: any,
    message: string
  ) {
    super(message);
    this.name = "MetaAdsAPIError";
  }
}

/**
 * Realiza uma requisição autenticada à Meta Ads API
 */
export async function fazerRequisicaoMetaAds(
  endpoint: string,
  accessToken: string,
  opcoes: RequestInit = {},
  useGraphAPI: boolean = true
): Promise<any> {
  const baseUrl = useGraphAPI ? META_GRAPH_URL : META_API_URL;
  const url = `${baseUrl}${endpoint}`;

  const params = new URLSearchParams();
  params.append("access_token", accessToken);

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      ...opcoes,
      headers: {
        "Content-Type": "application/json",
        ...opcoes.headers,
      },
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new MetaAdsAPIError(
        response.status,
        data.error,
        `Erro na Meta Ads API: ${data.error?.message || response.statusText}`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof MetaAdsAPIError) {
      throw error;
    }
    throw new Error(`Erro ao conectar com Meta Ads: ${error}`);
  }
}

/**
 * Obtém campanhas de um anúncio
 */
export async function obterCampanhasMetaAds(
  accessToken: string,
  accountId: string,
  campos: string[] = ["id", "name", "status", "objective", "created_time"]
): Promise<any> {
  const params = new URLSearchParams({
    fields: campos.join(","),
  });

  return fazerRequisicaoMetaAds(
    `/${accountId}/campaigns?${params.toString()}`,
    accessToken,
    {},
    true
  );
}

/**
 * Obtém insights (métricas) de uma campanha
 */
export async function obterInsightsCampanha(
  accessToken: string,
  campaignId: string,
  metricas: string[] = ["impressions", "clicks", "spend", "actions"]
): Promise<any> {
  const params = new URLSearchParams({
    fields: `insights{${metricas.join(",")}}`,
    date_preset: "last_30d",
  });

  return fazerRequisicaoMetaAds(
    `/${campaignId}?${params.toString()}`,
    accessToken,
    {},
    true
  );
}

/**
 * Cria uma nova campanha
 */
export async function criarCampanha(
  accessToken: string,
  accountId: string,
  dados: {
    name: string;
    objective: string;
    status: "PAUSED" | "ACTIVE";
    special_ad_categories?: string[];
  }
): Promise<any> {
  return fazerRequisicaoMetaAds(
    `/${accountId}/campaigns`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(dados),
    },
    true
  );
}

/**
 * Atualiza uma campanha
 */
export async function atualizarCampanha(
  accessToken: string,
  campaignId: string,
  dados: Partial<{
    name: string;
    status: "PAUSED" | "ACTIVE";
    daily_budget: number;
  }>
): Promise<any> {
  return fazerRequisicaoMetaAds(
    `/${campaignId}`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(dados),
    },
    true
  );
}

/**
 * Obtém anúncios de uma campanha
 */
export async function obterAnunciosCampanha(
  accessToken: string,
  campaignId: string,
  campos: string[] = ["id", "name", "status", "created_time"]
): Promise<any> {
  const params = new URLSearchParams({
    fields: campos.join(","),
  });

  return fazerRequisicaoMetaAds(
    `/${campaignId}/ads?${params.toString()}`,
    accessToken,
    {},
    true
  );
}

/**
 * Obtém performance de um anúncio
 */
export async function obterPerformanceAnuncio(
  accessToken: string,
  adId: string
): Promise<any> {
  const params = new URLSearchParams({
    fields: "insights{impressions,clicks,spend,cpc,ctr,actions,action_values}",
    date_preset: "last_30d",
  });

  return fazerRequisicaoMetaAds(
    `/${adId}?${params.toString()}`,
    accessToken,
    {},
    true
  );
}

/**
 * Formata erro da Meta Ads API para mensagem legível
 */
export function formatarErroMetaAds(erro: MetaAdsAPIError): string {
  const mensagens: Record<number, string> = {
    400: "Requisição inválida",
    401: "Não autorizado - Token inválido ou expirado",
    403: "Acesso proibido",
    404: "Recurso não encontrado",
    429: "Muitas requisições - Aguarde antes de tentar novamente",
    500: "Erro interno do servidor Meta",
  };

  return mensagens[erro.statusCode] || `Erro ${erro.statusCode}: ${erro.message}`;
}
