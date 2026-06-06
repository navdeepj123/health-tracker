import axios from '../api/axios';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
};

// Register the service worker once at app startup (called in main.tsx).
// The SW runs in the background and handles push events from the backend —
// without it, notifications can never appear on screen.
export const registerServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) return;
  try {
    const existing = await navigator.serviceWorker.getRegistration('/');
    if (existing?.active) return; // already registered, nothing to do
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch (err) {
    console.error('[SW] Registration failed:', err);
  }
};

// Reads from localStorage so the button stays correct across navigations.
// React state resets on every navigation — localStorage does not.
export const isPushEnabled = (): boolean =>
  localStorage.getItem('pushEnabled') === 'true' &&
  Notification.permission === 'granted';

// Full subscribe flow:
// 1. Ensure the SW is registered and active
// 2. Subscribe via the browser's PushManager with our VAPID key
// 3. Send the subscription to the backend to store in MongoDB
export const subscribeToPush = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try {
    let reg = await navigator.serviceWorker.getRegistration('/');
    if (!reg) reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

    // Wait for the SW to become active before subscribing
    if (!reg.active) {
      await new Promise<void>((resolve) => {
        const sw = reg!.installing || reg!.waiting;
        if (!sw) { resolve(); return; }
        sw.addEventListener('statechange', function handler() {
          if (this.state === 'activated') {
            sw.removeEventListener('statechange', handler);
            resolve();
          }
        });
        setTimeout(resolve, 3000);
      });
    }

    const keyRes = await axios.get('/push/vapid-public-key');
    const sub = await reg!.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyRes.data.publicKey),
    });

    await axios.post('/push/subscribe', sub.toJSON());
    localStorage.setItem('pushEnabled', 'true');
    return true;
  } catch (err) {
    console.error('[Push] Subscribe failed:', err);
    localStorage.removeItem('pushEnabled');
    return false;
  }
};

export const disablePush = (): void => {
  localStorage.removeItem('pushEnabled');
};
