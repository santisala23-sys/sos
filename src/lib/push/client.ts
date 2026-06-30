function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function getVapidPublicKey(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  }
  const keyRes = await fetch("/api/push/vapid-public-key");
  if (!keyRes.ok) return null;
  const { publicKey } = await keyRes.json();
  return publicKey ?? null;
}

export async function registerServiceWorker() {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  return reg;
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function subscribeBrowserPush(): Promise<PushSubscription | null> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const reg = await registerServiceWorker();
  const publicKey = await getVapidPublicKey();
  if (!publicKey) return null;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }
  return sub;
}

export async function hasActivePushSubscription(): Promise<boolean> {
  if (!isPushSupported()) return false;
  if (Notification.permission !== "granted") return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return Boolean(sub);
}
