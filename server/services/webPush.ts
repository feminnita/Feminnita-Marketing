import webpush from "web-push";

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails("mailto:feminnita@gmail.com", VAPID_PUBLIC, VAPID_PRIVATE);
}

export const vapidPublicKey = VAPID_PUBLIC;

export async function sendPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string }
): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err: any) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscrição expirada — quem chamou deve remover do banco
      throw Object.assign(err, { expired: true });
    }
    console.warn("[webPush] Erro ao enviar push:", err.message);
  }
}
