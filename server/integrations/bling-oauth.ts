/**
 * Autenticação OAuth 2.0 com Bling
 * Documentação: https://developer.bling.com.br/bling-api
 */

import { ENV } from "../_core/env";

const BLING_OAUTH_URL = "https://www.bling.com.br/oauth/authorize";
const BLING_TOKEN_URL = "https://www.bling.com.br/oauth/token";

export interface BlingOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

/**
 * Gera a URL de autorização para o fluxo OAuth
 */
export function gerarUrlAutorizacao(state?: string): string {
  const clientId = process.env.BLING_CLIENT_ID;
  const redirectUri = process.env.BLING_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("BLING_CLIENT_ID e BLING_REDIRECT_URI não configurados");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "products:read products:write orders:read orders:write contacts:read contacts:write",
    state: state || "",
  });

  return `${BLING_OAUTH_URL}?${params.toString()}`;
}

/**
 * Troca o código de autorização por um access token
 */
export async function trocarCodigoPorToken(code: string): Promise<BlingOAuthToken> {
  const clientId = process.env.BLING_CLIENT_ID;
  const clientSecret = process.env.BLING_CLIENT_SECRET;
  const redirectUri = process.env.BLING_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Credenciais Bling não configuradas");
  }

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  try {
    const response = await fetch(BLING_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao trocar código por token: ${error.error_description || error.error}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(`Falha na autenticação Bling: ${error}`);
  }
}

/**
 * Renova um access token usando o refresh token
 */
export async function renovarAccessToken(refreshToken: string): Promise<BlingOAuthToken> {
  const clientId = process.env.BLING_CLIENT_ID;
  const clientSecret = process.env.BLING_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais Bling não configuradas");
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const response = await fetch(BLING_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao renovar token: ${error.error_description || error.error}`);
    }

    return response.json();
  } catch (error) {
    throw new Error(`Falha ao renovar token Bling: ${error}`);
  }
}

/**
 * Verifica se o token está expirado
 */
export function tokenExpirado(expiresAt: Date): boolean {
  const agora = new Date();
  const bufferSegundos = 60; // Renovar 1 minuto antes de expirar
  return agora.getTime() > expiresAt.getTime() - bufferSegundos * 1000;
}
