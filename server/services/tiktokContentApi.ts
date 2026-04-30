/**
 * TikTok Content Posting API
 * Requer aprovação do app (video.publish scope) para postar direto no perfil.
 * video.upload scope: salva como rascunho para o criador publicar.
 */

const API_BASE = "https://open.tiktokapis.com/v2";

export async function publishVideoToTikTok(
  accessToken: string,
  videoUrl: string,
  videoSize: number,
  postInfo: {
    title: string;
    privacyLevel?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY";
  }
): Promise<{ publishId: string }> {
  const size = videoSize || 10_000_000;

  const resp = await fetch(`${API_BASE}/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: postInfo.title.slice(0, 2200),
        privacy_level: postInfo.privacyLevel || "PUBLIC_TO_EVERYONE",
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl,
        video_size: size,
        chunk_size: size,
        total_chunk_count: 1,
      },
    }),
  });

  const data = await resp.json() as any;
  console.log("[TikTokContentAPI] publish/init response:", JSON.stringify(data));

  if (data.error?.code && data.error.code !== "ok") {
    throw new Error(`TikTok API: ${data.error.message || data.error.code}`);
  }

  return { publishId: data.data?.publish_id };
}

export async function checkPublishStatus(
  accessToken: string,
  publishId: string
): Promise<{ status: string; failReason?: string; publicationId?: string }> {
  const resp = await fetch(`${API_BASE}/post/publish/status/fetch/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ publish_id: publishId }),
  });

  const data = await resp.json() as any;
  return {
    status: data.data?.status || "unknown",
    failReason: data.data?.fail_reason,
    publicationId: data.data?.publicaly_available_post_id?.[0],
  };
}

export async function refreshTiktokToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  const clientKey = process.env.TIKTOK_CLIENT_KEY || "";
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET || "";
  if (!clientKey || !clientSecret) return null;

  try {
    const resp = await fetch(`${API_BASE}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    });

    const data = await resp.json() as any;
    if (data.error) return null;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in || 86400,
    };
  } catch {
    return null;
  }
}
