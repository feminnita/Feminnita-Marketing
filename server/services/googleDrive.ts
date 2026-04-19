/**
 * Google Drive Service — acesso server-side via OAuth2 refresh token
 *
 * Credenciais necessárias no .env:
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 *   GOOGLE_DRIVE_REFRESH_TOKEN  ← preenchido após OAuth em /api/google/callback
 */

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_DOWNLOAD = "https://www.googleapis.com/drive/v3/files";

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getDriveAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.value;
  }

  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) return null;

  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
      }),
    });
    const data = await res.json() as any;
    if (!data.access_token) return null;
    cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };
    return cachedToken.value;
  } catch {
    return null;
  }
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export async function listFolderFiles(folderId: string): Promise<DriveFile[]> {
  const token = await getDriveAccessToken();
  if (!token) return [];

  try {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id,name,mimeType,size,modifiedTime,webViewLink)",
      orderBy: "modifiedTime desc",
      pageSize: "50",
    });
    const res = await fetch(`${DRIVE_API}/files?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as any;
    return (data.files as DriveFile[]) || [];
  } catch {
    return [];
  }
}

export async function downloadFileAsBase64(fileId: string): Promise<{ base64: string; mimeType: string } | null> {
  const token = await getDriveAccessToken();
  if (!token) return null;

  try {
    // Get file metadata first to know mimeType
    const metaRes = await fetch(`${DRIVE_API}/files/${fileId}?fields=mimeType,name`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meta = await metaRes.json() as any;
    const mimeType: string = meta.mimeType || "image/jpeg";

    // Download content
    const res = await fetch(`${DRIVE_DOWNLOAD}/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return { base64, mimeType };
  } catch {
    return null;
  }
}

export function isDriveConfigured(): boolean {
  return !!(
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN &&
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
}

// Gera URL de autorização OAuth para o usuário conectar o Drive
export function getGoogleOAuthUrl(redirectUri: string): string {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.readonly",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

// Troca o código por refresh_token e salva no .env em memória
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<{ refreshToken: string; accessToken: string } | null> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";

  try {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const data = await res.json() as any;
    if (!data.refresh_token) return null;

    // Salva no processo (persiste até restart; usuário deve copiar para .env)
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN = data.refresh_token;
    cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 };

    return { refreshToken: data.refresh_token, accessToken: data.access_token };
  } catch {
    return null;
  }
}
