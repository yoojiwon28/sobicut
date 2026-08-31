/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const title = data.title ?? '소비컷';
  const options: NotificationOptions = {
    body: data.body ?? '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { type: data.type, transaction_id: data.transaction_id },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 종류별 클릭 시 이동 경로
const TYPE_ROUTES: Record<string, string> = {
  budget_weekly: '/analysis',
  budget_monthly: '/analysis',
  impulse_warning: '/analysis/report/impulse',
  heatmap_time: '/analysis',
  heatmap_day: '/analysis',
  no_transaction_reminder: '/expenses/add',
};

function resolveNotificationUrl(data: { type?: string; transaction_id?: number } | undefined): string {
  if (!data?.type) return '/notification';
  if (data.type === 'satisfaction_request' && data.transaction_id != null) {
    return `/satisfaction/${data.transaction_id}`;
  }
  return TYPE_ROUTES[data.type] ?? '/notification';
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetPath = resolveNotificationUrl(event.notification.data);
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => 'focus' in c);
      if (existing) {
        return existing.navigate(targetUrl).then(() => existing.focus());
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});