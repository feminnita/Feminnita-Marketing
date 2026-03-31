import { getDb } from "../db";
import { publicationQueueJobs, influencerPosts, instagramAccounts } from "../../drizzle/schema";
import { eq, and, or, lte } from "drizzle-orm";

const MAX_JOBS_PER_CYCLE = 5;

async function publishToInstagram(
  instagramId: string,
  accessToken: string,
  caption: string,
  mediaUrls: string[]
): Promise<string> {
  if (mediaUrls.length === 0) {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${instagramId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, media_type: "IMAGE", access_token: accessToken }),
      }
    );
    if (!res.ok) throw new Error(`Instagram media error: ${res.status} ${await res.text()}`);
    const data = await res.json() as { id: string };

    const publishRes = await fetch(
      `https://graph.facebook.com/v18.0/${instagramId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: data.id, access_token: accessToken }),
      }
    );
    if (!publishRes.ok) throw new Error(`Instagram publish error: ${publishRes.status} ${await publishRes.text()}`);
    const publishData = await publishRes.json() as { id: string };
    return publishData.id;
  }

  const mediaRes = await fetch(
    `https://graph.facebook.com/v18.0/${instagramId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: mediaUrls[0], caption, access_token: accessToken }),
    }
  );
  if (!mediaRes.ok) throw new Error(`Instagram media error: ${mediaRes.status} ${await mediaRes.text()}`);
  const mediaData = await mediaRes.json() as { id: string };

  const publishRes = await fetch(
    `https://graph.facebook.com/v18.0/${instagramId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: mediaData.id, access_token: accessToken }),
    }
  );
  if (!publishRes.ok) throw new Error(`Instagram publish error: ${publishRes.status} ${await publishRes.text()}`);
  const publishData = await publishRes.json() as { id: string };
  return publishData.id;
}

async function processJobs() {
  const db = await getDb();
  if (!db) {
    console.log("[PublicationWorker] DB indisponível, pulando ciclo.");
    return;
  }

  const now = new Date();

  let jobs: typeof publicationQueueJobs.$inferSelect[] = [];
  try {
    jobs = await db
      .select()
      .from(publicationQueueJobs)
      .where(
        or(
          eq(publicationQueueJobs.status, "ready"),
          and(
            eq(publicationQueueJobs.status, "waiting"),
            lte(publicationQueueJobs.nextRetryTime, now)
          )
        )
      )
      .limit(MAX_JOBS_PER_CYCLE);
  } catch (err) {
    console.error("[PublicationWorker] Erro ao buscar jobs:", err);
    return;
  }

  if (jobs.length === 0) return;

  console.log(`[PublicationWorker] Processando ${jobs.length} job(s)...`);

  for (const job of jobs) {
    try {
      await db
        .update(publicationQueueJobs)
        .set({ status: "processing" })
        .where(eq(publicationQueueJobs.id, job.id));

      const [post] = await db
        .select()
        .from(influencerPosts)
        .where(eq(influencerPosts.id, job.postId))
        .limit(1);

      if (!post) throw new Error(`Post id=${job.postId} não encontrado.`);

      const [account] = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.id, job.accountId))
        .limit(1);

      if (!account) throw new Error(`InstagramAccount id=${job.accountId} não encontrada.`);

      const caption = post.caption ?? post.content ?? "";
      const mediaUrls: string[] = Array.isArray(post.mediaUrls) ? post.mediaUrls : [];

      const igPostId = await publishToInstagram(
        account.instagramId,
        account.accessToken,
        caption,
        mediaUrls
      );

      await db
        .update(publicationQueueJobs)
        .set({ status: "done" })
        .where(eq(publicationQueueJobs.id, job.id));

      await db
        .update(influencerPosts)
        .set({ status: "published", publishedAt: now, postId: igPostId })
        .where(eq(influencerPosts.id, job.postId));

      console.log(`[PublicationWorker] Job ${job.id} publicado. IG postId=${igPostId}`);
    } catch (err) {
      console.error(`[PublicationWorker] Erro no job ${job.id}:`, err);

      const newRetryCount = job.retryCount + 1;

      if (newRetryCount >= job.maxRetries) {
        await db
          .update(publicationQueueJobs)
          .set({ status: "failed", retryCount: newRetryCount, lastError: String(err) })
          .where(eq(publicationQueueJobs.id, job.id));
        console.log(`[PublicationWorker] Job ${job.id} marcado como failed após ${newRetryCount} tentativas.`);
      } else {
        const backoffMs = Math.pow(newRetryCount, 2) * 5 * 60 * 1000;
        const nextRetryTime = new Date(Date.now() + backoffMs);
        await db
          .update(publicationQueueJobs)
          .set({ status: "waiting", retryCount: newRetryCount, lastError: String(err), nextRetryTime })
          .where(eq(publicationQueueJobs.id, job.id));
        console.log(`[PublicationWorker] Job ${job.id} reagendado para ${nextRetryTime.toISOString()} (tentativa ${newRetryCount}).`);
      }
    }
  }
}

export function startPublicationWorker(): () => void {
  console.log("[PublicationWorker] Worker iniciado. Verificando a cada 2 minutos.");

  const interval = setInterval(async () => {
    await processJobs();
  }, 2 * 60 * 1000);

  return () => {
    clearInterval(interval);
    console.log("[PublicationWorker] Worker encerrado.");
  };
}
