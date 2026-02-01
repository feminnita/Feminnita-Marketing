/**
 * Helpers para Google Ads API
 * Documentação: https://developers.google.com/google-ads/api/docs
 */

const GOOGLE_ADS_API_URL = "https://googleads.googleapis.com/v15";

export class GoogleAdsAPIError extends Error {
  constructor(
    public statusCode: number,
    public googleError: any,
    message: string
  ) {
    super(message);
    this.name = "GoogleAdsAPIError";
  }
}

/**
 * Realiza uma requisição autenticada à Google Ads API
 */
export async function fazerRequisicaoGoogleAds(
  endpoint: string,
  accessToken: string,
  customerId: string,
  opcoes: RequestInit = {}
): Promise<any> {
  const url = `${GOOGLE_ADS_API_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
    "login-customer-id": customerId,
    ...opcoes.headers,
  };

  try {
    const response = await fetch(url, {
      ...opcoes,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new GoogleAdsAPIError(
        response.status,
        data.error,
        `Erro na Google Ads API: ${data.error?.message || response.statusText}`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof GoogleAdsAPIError) {
      throw error;
    }
    throw new Error(`Erro ao conectar com Google Ads: ${error}`);
  }
}

/**
 * Obtém campanhas de uma conta
 */
export async function obterCampanhasGoogleAds(
  accessToken: string,
  customerId: string
): Promise<any> {
  const body = {
    query: `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.start_date,
        campaign.end_date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros
      FROM campaign
      ORDER BY campaign.id
    `,
  };

  return fazerRequisicaoGoogleAds(
    `/customers/${customerId}/googleAds:search`,
    accessToken,
    customerId,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

/**
 * Obtém anúncios de uma campanha
 */
export async function obterAnunciosGoogleAds(
  accessToken: string,
  customerId: string,
  campaignId: string
): Promise<any> {
  const body = {
    query: `
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group_ad.ad.id,
        ad_group_ad.ad.type,
        ad_group_ad.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM ad_group_ad
      WHERE campaign.id = ${campaignId}
      ORDER BY ad_group.id
    `,
  };

  return fazerRequisicaoGoogleAds(
    `/customers/${customerId}/googleAds:search`,
    accessToken,
    customerId,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

/**
 * Obtém performance de uma campanha
 */
export async function obterPerformanceCampanha(
  accessToken: string,
  customerId: string,
  campaignId: string
): Promise<any> {
  const body = {
    query: `
      SELECT
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversion_value_micros,
        metrics.ctr,
        metrics.average_cpc_micros
      FROM campaign
      WHERE campaign.id = ${campaignId}
    `,
  };

  return fazerRequisicaoGoogleAds(
    `/customers/${customerId}/googleAds:search`,
    accessToken,
    customerId,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

/**
 * Cria uma nova campanha
 */
export async function criarCampanhaGoogleAds(
  accessToken: string,
  customerId: string,
  dados: {
    name: string;
    advertisingChannelType: string;
    status: string;
    budget: number;
  }
): Promise<any> {
  const body = {
    customerId,
    operation: {
      create: {
        name: dados.name,
        advertisingChannelType: dados.advertisingChannelType,
        status: dados.status,
        campaignBudget: {
          amountMicros: dados.budget * 1000000,
          deliveryMethod: "STANDARD",
        },
      },
    },
  };

  return fazerRequisicaoGoogleAds(
    `/customers/${customerId}/campaigns`,
    accessToken,
    customerId,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

/**
 * Pausa uma campanha
 */
export async function pausarCampanhaGoogleAds(
  accessToken: string,
  customerId: string,
  campaignId: string
): Promise<any> {
  const body = {
    customerId,
    operation: {
      update: {
        resourceName: `customers/${customerId}/campaigns/${campaignId}`,
        status: "PAUSED",
      },
      updateMask: "status",
    },
  };

  return fazerRequisicaoGoogleAds(
    `/customers/${customerId}/campaigns/${campaignId}`,
    accessToken,
    customerId,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
}

/**
 * Formata erro da Google Ads API para mensagem legível
 */
export function formatarErroGoogleAds(erro: GoogleAdsAPIError): string {
  const mensagens: Record<number, string> = {
    400: "Requisição inválida",
    401: "Não autorizado - Token inválido ou expirado",
    403: "Acesso proibido",
    404: "Recurso não encontrado",
    429: "Muitas requisições - Aguarde antes de tentar novamente",
    500: "Erro interno do servidor Google",
  };

  return mensagens[erro.statusCode] || `Erro ${erro.statusCode}: ${erro.message}`;
}
