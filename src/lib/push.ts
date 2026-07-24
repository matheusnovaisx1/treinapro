import webpush from 'web-push';

let configured = false;

// Configura o web-push com as chaves VAPID (lazy, uma vez por processo).
export function getWebPush() {
  if (!configured) {
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    if (!pub || !priv) throw new Error('VAPID keys ausentes (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)');
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contato@treinapro.app', pub, priv);
    configured = true;
  }
  return webpush;
}

export type PushPayload = { title: string; body: string; url?: string };
