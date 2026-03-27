/**
 * Feature 8: Web Push Notifications helper
 *
 * This module handles requesting Notification permission and subscribing to
 * push via the browser Notification API (local scheduling). A full Web Push
 * implementation (VAPID server) is documented below but not required for the
 * local-notification flow — the local approach works without a backend.
 */

const NOTIF_HOUR_KEY = 'pushReminderHour';
const NOTIF_ENABLED_KEY = 'pushNotificationsEnabled';

export interface NotificationConfig {
  enabled: boolean;
  hour: number; // 0-23 — hour of day to show reminder
}

export function loadNotificationConfig(): NotificationConfig {
  return {
    enabled: localStorage.getItem(NOTIF_ENABLED_KEY) === 'true',
    hour: parseInt(localStorage.getItem(NOTIF_HOUR_KEY) ?? '20', 10),
  };
}

export function saveNotificationConfig(cfg: NotificationConfig) {
  localStorage.setItem(NOTIF_ENABLED_KEY, String(cfg.enabled));
  localStorage.setItem(NOTIF_HOUR_KEY, String(cfg.hour));
}

/** Request notification permission and return final permission state */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

/** Show a test notification immediately */
export function showTestNotification() {
  if (Notification.permission !== 'granted') return;
  new Notification('🌟 Mind Garden', {
    body: "Time to check in! How are you feeling right now?",
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'mind-garden-reminder',
  });
}

/**
 * Schedules a daily local reminder using setTimeout.
 * The timer is best-effort (won't fire if tab is closed) — for persistent reminders
 * use a Service Worker + Push API with a VAPID server.
 */
export function scheduleLocalReminder(hour: number): () => void {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1); // Next day if past

  const msUntil = target.getTime() - now.getTime();

  const timerId = setTimeout(() => {
    showTestNotification();
    // Reschedule for tomorrow
    scheduleLocalReminder(hour);
  }, msUntil);

  return () => clearTimeout(timerId); // Returns cleanup
}
