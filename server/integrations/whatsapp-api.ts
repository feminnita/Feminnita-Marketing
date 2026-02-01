/**
 * Helpers para WhatsApp Business API
 * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WHATSAPP_API_URL = "https://graph.instagram.com/v18.0";

export class WhatsAppAPIError extends Error {
  constructor(
    public statusCode: number,
    public whatsappError: any,
    message: string
  ) {
    super(message);
    this.name = "WhatsAppAPIError";
  }
}

/**
 * Realiza uma requisição autenticada à WhatsApp Business API
 */
export async function fazerRequisicaoWhatsApp(
  endpoint: string,
  accessToken: string,
  opcoes: RequestInit = {}
): Promise<any> {
  const url = `${WHATSAPP_API_URL}${endpoint}`;

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

    if (!response.ok || data.error) {
      throw new WhatsAppAPIError(
        response.status,
        data.error,
        `Erro na WhatsApp API: ${data.error?.message || response.statusText}`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof WhatsAppAPIError) {
      throw error;
    }
    throw new Error(`Erro ao conectar com WhatsApp: ${error}`);
  }
}

/**
 * Envia uma mensagem de texto via WhatsApp
 */
export async function enviarMensagemWhatsApp(
  accessToken: string,
  phoneNumberId: string,
  destinatario: string,
  mensagem: string
): Promise<any> {
  const body = {
    messaging_product: "whatsapp",
    to: destinatario,
    type: "text",
    text: {
      preview_url: false,
      body: mensagem,
    },
  };

  return fazerRequisicaoWhatsApp(
    `/${phoneNumberId}/messages`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

/**
 * Envia uma mensagem com template
 */
export async function enviarTemplateWhatsApp(
  accessToken: string,
  phoneNumberId: string,
  destinatario: string,
  templateName: string,
  parametros?: Record<string, any>
): Promise<any> {
  const body = {
    messaging_product: "whatsapp",
    to: destinatario,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: "pt_BR",
      },
      ...(parametros && {
        components: [
          {
            type: "body",
            parameters: Object.values(parametros).map((valor) => ({
              type: "text",
              text: valor,
            })),
          },
        ],
      }),
    },
  };

  return fazerRequisicaoWhatsApp(
    `/${phoneNumberId}/messages`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

/**
 * Envia uma mensagem com mídia (imagem, vídeo, documento)
 */
export async function enviarMidiaWhatsApp(
  accessToken: string,
  phoneNumberId: string,
  destinatario: string,
  tipo: "image" | "video" | "document" | "audio",
  urlMidia: string,
  legenda?: string
): Promise<any> {
  const body: any = {
    messaging_product: "whatsapp",
    to: destinatario,
    type: tipo,
    [tipo]: {
      link: urlMidia,
    },
  };

  if (legenda && (tipo === "image" || tipo === "video")) {
    body[tipo].caption = legenda;
  }

  return fazerRequisicaoWhatsApp(
    `/${phoneNumberId}/messages`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

/**
 * Marca uma mensagem como lida
 */
export async function marcarMensagemComoLida(
  accessToken: string,
  phoneNumberId: string,
  messageId: string
): Promise<any> {
  const body = {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  };

  return fazerRequisicaoWhatsApp(
    `/${phoneNumberId}/messages`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

/**
 * Obtém informações sobre um contato
 */
export async function obterContatoWhatsApp(
  accessToken: string,
  phoneNumberId: string,
  numeroTelefone: string
): Promise<any> {
  return fazerRequisicaoWhatsApp(
    `/${phoneNumberId}/contacts?phone_number=${numeroTelefone}`,
    accessToken
  );
}

/**
 * Obtém histórico de mensagens
 */
export async function obterHistoricoMensagens(
  accessToken: string,
  phoneNumberId: string,
  limite: number = 100
): Promise<any> {
  return fazerRequisicaoWhatsApp(
    `/${phoneNumberId}/messages?limit=${limite}`,
    accessToken
  );
}

/**
 * Cria um template de mensagem
 */
export async function criarTemplateWhatsApp(
  accessToken: string,
  businessAccountId: string,
  dados: {
    name: string;
    category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
    language: string;
    body: string;
    footer?: string;
    buttons?: Array<{
      type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }
): Promise<any> {
  const body = {
    name: dados.name,
    category: dados.category,
    language: dados.language,
    components: [
      {
        type: "BODY",
        text: dados.body,
      },
      ...(dados.footer
        ? [
            {
              type: "FOOTER",
              text: dados.footer,
            },
          ]
        : []),
      ...(dados.buttons
        ? [
            {
              type: "BUTTONS",
              buttons: dados.buttons,
            },
          ]
        : []),
    ],
  };

  return fazerRequisicaoWhatsApp(
    `/${businessAccountId}/message_templates`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

/**
 * Formata erro da WhatsApp API para mensagem legível
 */
export function formatarErroWhatsApp(erro: WhatsAppAPIError): string {
  const mensagens: Record<number, string> = {
    400: "Requisição inválida",
    401: "Não autorizado - Token inválido ou expirado",
    403: "Acesso proibido",
    404: "Recurso não encontrado",
    429: "Muitas requisições - Aguarde antes de tentar novamente",
    500: "Erro interno do servidor WhatsApp",
  };

  return mensagens[erro.statusCode] || `Erro ${erro.statusCode}: ${erro.message}`;
}
