/**
 * Carelink Healthineers — Mobile Phone Notification Helper
 * Delivers alerts directly into the phone's notification bar (Android status bar & iOS PWA)
 * using ServiceWorkerRegistration.showNotification().
 */

let swRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

export async function getOrRegisterServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  if (swRegistrationPromise) {
    return swRegistrationPromise;
  }

  swRegistrationPromise = (async () => {
    try {
      // First check if already registered
      const existing = await navigator.serviceWorker.getRegistration();
      if (existing) {
        return existing;
      }

      // Register /sw.js
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      return reg;
    } catch (err) {
      console.warn('Failed to register service worker for phone notifications:', err);
      return null;
    }
  })();

  return swRegistrationPromise;
}

export function isPhoneNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getPhoneNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return window.Notification.permission;
}

export function isPhoneStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export async function requestPhoneNotificationPermission(): Promise<{
  granted: boolean;
  status: NotificationPermission;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { granted: false, status: 'denied' };
  }

  try {
    const status = await window.Notification.requestPermission();
    const granted = status === 'granted';

    if (granted) {
      localStorage.setItem('carelink_phone_notifications_enabled', 'on');
      localStorage.setItem('carelink_desktop_alerts', 'on');

      // Make sure Service Worker is ready
      const reg = await getOrRegisterServiceWorker();

      // Fire a welcome test notification directly to the phone's notification bar
      if (reg) {
        await (reg as any).showNotification('Carelink Healthineers — নোটিফিকেশন চালু হয়েছে', {
          body: 'আপনার ফোনের নোটিফিকেশন বার কানেক্ট হয়েছে। TA/DA ও কাজের সকল নোটিফিকেশন সরাসরি পাবেন।',
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          vibrate: [250, 100, 250, 100, 250],
          tag: 'carelink_phone_welcome',
          renotify: true,
          data: { url: window.location.pathname },
        });
      }

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } else {
      localStorage.setItem('carelink_phone_notifications_enabled', 'off');
    }

    return { granted, status };
  } catch (err) {
    console.warn('Error requesting phone notification permission:', err);
    return { granted: false, status: 'denied' };
  }
}

export interface TriggerPhoneNotificationOptions {
  body?: string;
  tag?: string;
  url?: string;
  priority?: 'normal' | 'high' | 'urgent';
  category?: string;
}

export async function triggerPhoneNotification(
  title: string,
  options?: TriggerPhoneNotificationOptions
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  // Check if enabled or granted
  if (window.Notification.permission !== 'granted') {
    return false;
  }

  const enabledPref = localStorage.getItem('carelink_phone_notifications_enabled');
  if (enabledPref === 'off') {
    return false;
  }

  const vibratePattern =
    options?.priority === 'urgent'
      ? [300, 100, 300, 100, 300]
      : options?.priority === 'high'
      ? [200, 100, 200]
      : [150, 80, 150];

  const fullTitle = title.startsWith('Carelink') ? title : `Carelink: ${title}`;
  const notificationOptions: Record<string, any> = {
    body: options?.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: vibratePattern,
    tag: options?.tag || `carelink_${Date.now()}`,
    renotify: true,
    data: {
      url: options?.url || window.location.pathname,
      category: options?.category || 'system',
    },
  };

  // Mobile browsers (Chrome/Android, Samsung Internet, Edge) REQUIRE ServiceWorker showNotification
  try {
    const reg = await getOrRegisterServiceWorker();
    if (reg && 'showNotification' in reg) {
      await (reg as any).showNotification(fullTitle, notificationOptions);

      // Trigger hardware vibration on mobile if supported
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(vibratePattern);
        } catch {}
      }
      return true;
    }
  } catch (swErr) {
    console.warn('Service Worker showNotification attempt failed, falling back:', swErr);
  }

  // Desktop browser fallback
  try {
    new window.Notification(fullTitle, {
      body: options?.body || '',
      icon: '/pwa-192x192.png',
      tag: options?.tag,
    });
    return true;
  } catch (deskErr) {
    console.warn('Desktop Notification constructor error:', deskErr);
    return false;
  }
}

export async function sendTestPhoneNotification(actorName?: string): Promise<boolean> {
  const perm = getPhoneNotificationPermission();
  if (perm !== 'granted') {
    const result = await requestPhoneNotificationPermission();
    return result.granted;
  }

  const greeting = actorName ? `হ্যালো ${actorName}, ` : '';

  return triggerPhoneNotification('Carelink Healthineers — টেস্ট নোটিফিকেশন', {
    body: `${greeting}অভিনন্দন! আপনার ফোনের নোটিফিকেশন বারে সফলভাবে সতর্কবার্তা এসেছে।`,
    priority: 'high',
    tag: `carelink_test_${Date.now()}`,
    url: window.location.pathname,
  });
}
