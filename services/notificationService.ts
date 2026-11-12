import { supabase } from '../supabaseClient';
import {
  AppNotification,
  NotificationAudience,
  NotificationCategory,
  NotificationPriority,
} from '../types';

const SYSTEM_NOTIFICATIONS_KEY = 'system_notifications';
const MAX_STORED_NOTIFICATIONS = 250;
const BROADCAST_CHANNEL_NAME = 'carelink_notifications_sync';

export type NotificationViewerRole = 'admin' | 'executive' | 'employee';

export interface EmitNotificationInput {
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  audiences: NotificationAudience[];
  target_employee_id?: string;
  actor_name: string;
  actor_role?: string;
  link_tab?: string;
}

function broadcastSyncSignal() {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      ch.postMessage({ type: 'notifications_updated', ts: Date.now() });
      ch.close();
    }
  } catch {
    // BroadcastChannel unavailable in restricted contexts
  }
}

export function matchesNotificationAudience(
  notification: AppNotification,
  viewerRole: NotificationViewerRole,
  employeeId?: string,
  viewerId?: string
): boolean {
  if (viewerId && Array.isArray(notification.dismissed_by) && notification.dismissed_by.includes(viewerId)) {
    return false;
  }

  if (viewerRole === 'employee') {
    const targetedToEmployee =
      Boolean(employeeId) && notification.target_employee_id === employeeId;
    const isGeneralEmployeeBroadcast =
      (notification.audiences.includes('employee') || notification.audiences.includes('all')) &&
      !notification.target_employee_id;
    return targetedToEmployee || isGeneralEmployeeBroadcast;
  }

  if (viewerRole === 'admin') {
    return notification.audiences.includes('admin') || notification.audiences.includes('all');
  }

  if (viewerRole === 'executive') {
    return notification.audiences.includes('executive') || notification.audiences.includes('all');
  }

  return false;
}

export async function fetchAllNotifications(): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', SYSTEM_NOTIFICATIONS_KEY)
      .maybeSingle();

    if (error || !data?.value) {
      return [];
    }

    const parsed = JSON.parse(data.value);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn('Error fetching system notifications:', err);
    return [];
  }
}

async function saveAllNotifications(notifications: AppNotification[]): Promise<void> {
  const trimmed = notifications.slice(0, MAX_STORED_NOTIFICATIONS);
  const { error } = await supabase.from('settings').upsert(
    {
      key: SYSTEM_NOTIFICATIONS_KEY,
      value: JSON.stringify(trimmed),
      category: 'notifications',
      description: 'Carelink Healthineers Unified Real-Time Notification Stream',
    },
    { onConflict: 'key' }
  );

  if (error) {
    throw new Error(`Failed to persist notifications: ${error.message}`);
  }
  broadcastSyncSignal();
}

export async function fetchNotificationsForViewer(
  viewerRole: NotificationViewerRole,
  employeeId?: string,
  viewerId?: string
): Promise<AppNotification[]> {
  const all = await fetchAllNotifications();
  return all.filter((item) =>
    matchesNotificationAudience(item, viewerRole, employeeId, viewerId)
  );
}

function triggerServerWebPush(input: EmitNotificationInput) {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
  fetch('/api/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Carelink: ${input.title}`,
      message: input.message,
      category: input.category,
      priority: input.priority || 'normal',
      audiences: input.audiences,
      target_employee_id: input.target_employee_id,
      link_tab: input.link_tab,
    }),
  }).catch(() => {
    // Non-blocking: ignore push dispatch error if offline
  });
}

export async function emitNotification(input: EmitNotificationInput): Promise<AppNotification | null> {
  try {
    const existing = await fetchAllNotifications();
    const entry: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: input.title.trim(),
      message: input.message.trim(),
      category: input.category,
      priority: input.priority || 'normal',
      audiences: input.audiences,
      target_employee_id: input.target_employee_id,
      actor_name: input.actor_name || 'System',
      actor_role: input.actor_role,
      link_tab: input.link_tab,
      read_by: [],
      dismissed_by: [],
      created_at: new Date().toISOString(),
    };

    const next = [entry, ...existing].slice(0, MAX_STORED_NOTIFICATIONS);
    await saveAllNotifications(next);
    triggerServerWebPush(input);
    return entry;
  } catch (err) {
    console.warn('Notification emit failed gracefully:', err);
    return null;
  }
}

export async function markNotificationRead(
  notificationId: string,
  viewerId: string
): Promise<void> {
  try {
    const all = await fetchAllNotifications();
    let changed = false;
    const updated = all.map((n) => {
      if (n.id === notificationId && !n.read_by.includes(viewerId)) {
        changed = true;
        return { ...n, read_by: [...n.read_by, viewerId] };
      }
      return n;
    });
    if (changed) {
      await saveAllNotifications(updated);
    }
  } catch (err) {
    console.warn('Failed to mark notification read:', err);
  }
}

export async function markAllNotificationsRead(
  viewerId: string,
  viewerRole: NotificationViewerRole,
  employeeId?: string
): Promise<void> {
  try {
    const all = await fetchAllNotifications();
    let changed = false;
    const updated = all.map((n) => {
      if (
        matchesNotificationAudience(n, viewerRole, employeeId, viewerId) &&
        !n.read_by.includes(viewerId)
      ) {
        changed = true;
        return { ...n, read_by: [...n.read_by, viewerId] };
      }
      return n;
    });
    if (changed) {
      await saveAllNotifications(updated);
    }
  } catch (err) {
    console.warn('Failed to mark all notifications read:', err);
  }
}

export async function dismissNotificationForViewer(
  notificationId: string,
  viewerId: string
): Promise<void> {
  try {
    const all = await fetchAllNotifications();
    const updated = all.map((n) => {
      if (n.id === notificationId) {
        const dismissed = Array.isArray(n.dismissed_by) ? n.dismissed_by : [];
        if (!dismissed.includes(viewerId)) {
          return {
            ...n,
            dismissed_by: [...dismissed, viewerId],
            read_by: n.read_by.includes(viewerId) ? n.read_by : [...n.read_by, viewerId],
          };
        }
      }
      return n;
    });
    await saveAllNotifications(updated);
  } catch (err) {
    console.warn('Failed to dismiss notification:', err);
  }
}

export async function clearAllNotificationsForViewer(
  viewerId: string,
  viewerRole: NotificationViewerRole,
  employeeId?: string
): Promise<void> {
  try {
    const all = await fetchAllNotifications();
    const updated = all.map((n) => {
      if (matchesNotificationAudience(n, viewerRole, employeeId, viewerId)) {
        const dismissed = Array.isArray(n.dismissed_by) ? n.dismissed_by : [];
        return {
          ...n,
          dismissed_by: dismissed.includes(viewerId) ? dismissed : [...dismissed, viewerId],
          read_by: n.read_by.includes(viewerId) ? n.read_by : [...n.read_by, viewerId],
        };
      }
      return n;
    });
    await saveAllNotifications(updated);
  } catch (err) {
    console.warn('Failed to clear notifications:', err);
  }
}

export function subscribeToNotifications(onChange: () => void): () => void {
  const channel = supabase
    .channel(`notifications-stream-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'settings',
        filter: `key=eq.${SYSTEM_NOTIFICATIONS_KEY}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  let bc: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.onmessage = () => onChange();
    }
  } catch {
    bc = null;
  }

  const pollInterval = window.setInterval(onChange, 10000);

  return () => {
    window.clearInterval(pollInterval);
    try {
      supabase.removeChannel(channel);
    } catch {
      // ignore cleanup errors
    }
    try {
      bc?.close();
    } catch {
      // ignore cleanup errors
    }
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function showPhoneBarNotification(
  title: string,
  body: string,
  options?: { tag?: string; url?: string; priority?: NotificationPriority }
): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    window.Notification.permission !== 'granted'
  ) {
    return false;
  }

  const notifOptions = {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: options?.tag || `carelink-${Date.now()}`,
    renotify: true,
    requireInteraction: options?.priority === 'urgent',
    data: { url: options?.url || window.location.pathname },
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notifOptions);
        return true;
      }
    }
  } catch {
    // fallback below
  }

  try {
    new window.Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      tag: notifOptions.tag,
    });
    return true;
  } catch {
    return false;
  }
}

export async function getDevicePushStatus(): Promise<{
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
  subscribed: boolean;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'unsupported', subscribed: false };
  }
  const permission = window.Notification.permission;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return {
      supported: true,
      permission,
      subscribed: permission === 'granted' && localStorage.getItem('carelink_desktop_alerts') !== 'off',
    };
  }

  try {
    const reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);
    if (reg) {
      const sub = await reg.pushManager.getSubscription();
      return { supported: true, permission, subscribed: Boolean(sub) && permission === 'granted' };
    }
  } catch {
    // ignore
  }

  return {
    supported: true,
    permission,
    subscribed: permission === 'granted' && localStorage.getItem('carelink_desktop_alerts') !== 'off',
  };
}

export async function enablePhonePushNotifications(
  viewerRole: NotificationViewerRole,
  viewerId: string,
  employeeId?: string
): Promise<{ ok: boolean; pushSubscribed: boolean; error?: string }> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { ok: false, pushSubscribed: false, error: 'Notifications are not supported in this browser.' };
  }

  let permission = window.Notification.permission;
  if (permission === 'default') {
    permission = await window.Notification.requestPermission();
  }

  if (permission !== 'granted') {
    return {
      ok: false,
      pushSubscribed: false,
      error: 'Notification permission was denied. Please enable notifications in browser settings.',
    };
  }

  localStorage.setItem('carelink_desktop_alerts', 'on');

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ]);
      if (reg) {
        const res = await fetch('/api/push/vapid-public-key');
        const { publicKey } = await res.json();
        if (publicKey) {
          let sub = await reg.pushManager.getSubscription();
          if (!sub) {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
          }

          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: sub.toJSON(),
              viewerRole,
              viewerId,
              employeeId,
            }),
          });

          return { ok: true, pushSubscribed: true };
        }
      }
    } catch (err: any) {
      console.warn('Web Push subscription fallback to local SW notifications:', err?.message);
    }
  }

  return { ok: true, pushSubscribed: false };
}

export async function disablePhonePushNotifications(): Promise<void> {
  localStorage.setItem('carelink_desktop_alerts', 'off');
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
    } catch {
      // ignore
    }
  }
}

export async function sendTestPhonePush(viewerId: string, actorName: string): Promise<boolean> {
  const localShown = await showPhoneBarNotification(
    'Carelink Phone Alerts Active',
    `Hello ${actorName}, TA/DA approvals, duty updates, and reports will now appear in your phone notification bar.`,
    { tag: 'carelink-test-alert', priority: 'high' }
  );

  try {
    await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Carelink Push Test',
        message: `Phone notification bar alerts verified for ${actorName}.`,
        category: 'system',
        priority: 'high',
        onlyViewerId: viewerId,
      }),
    });
  } catch {
    // ignore if offline
  }

  return localShown;
}
