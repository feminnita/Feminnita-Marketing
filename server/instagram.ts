/**
 * Funções para integração com Instagram Graph API
 * Busca posts reais da Feminnita para usar como referência
 */

interface InstagramPost {
  id: string;
  caption: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

/**
 * Busca os últimos posts do Instagram da Feminnita
 */
export async function fetchInstagramPosts(
  instagramAccountId: string,
  accessToken: string,
  limit: number = 15
): Promise<InstagramPost[]> {
  try {
    const url = `https://graph.instagram.com/v18.0/${instagramAccountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Instagram API Error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch Instagram posts:", error);
    throw error;
  }
}

/**
 * Publica um post no Instagram
 */
export async function publishInstagramPost(
  instagramAccountId: string,
  accessToken: string,
  caption: string,
  imageUrl: string,
  scheduledPublishTime?: string
) {
  try {
    // Primeiro, criar um container de mídia
    const containerUrl = `https://graph.instagram.com/v18.0/${instagramAccountId}/media`;

    const containerPayload = {
      image_url: imageUrl,
      caption: caption,
      access_token: accessToken,
      ...(scheduledPublishTime && { scheduled_publish_time: scheduledPublishTime }),
    };

    const containerResponse = await fetch(containerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(containerPayload),
    });

    if (!containerResponse.ok) {
      const error = await containerResponse.json();
      throw new Error(`Failed to create media container: ${JSON.stringify(error)}`);
    }

    const containerData = await containerResponse.json();

    // Se não for agendado, publicar imediatamente
    if (!scheduledPublishTime) {
      const publishUrl = `https://graph.instagram.com/v18.0/${instagramAccountId}/media_publish`;

      const publishPayload = {
        creation_id: containerData.id,
        access_token: accessToken,
      };

      const publishResponse = await fetch(publishUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(publishPayload),
      });

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        throw new Error(`Failed to publish post: ${JSON.stringify(error)}`);
      }

      return await publishResponse.json();
    }

    return containerData;
  } catch (error) {
    console.error("Failed to publish Instagram post:", error);
    throw error;
  }
}

/**
 * Publica um post no Facebook
 */
export async function publishFacebookPost(
  pageId: string,
  accessToken: string,
  caption: string,
  imageUrl: string,
  scheduledPublishTime?: string
) {
  try {
    const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;

    const payload: any = {
      message: caption,
      link: imageUrl,
      access_token: accessToken,
    };

    if (scheduledPublishTime) {
      payload.scheduled_publish_time = Math.floor(new Date(scheduledPublishTime).getTime() / 1000);
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to publish Facebook post:", error);
    throw error;
  }
}
