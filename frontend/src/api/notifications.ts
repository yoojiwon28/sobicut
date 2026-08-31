import { apiFetch } from './client';
import type { AppNotification } from '../types/notification';

export type VapidPublicKeyResponse = { public_key: string };
export function getVapidPublicKey() {
  return apiFetch<VapidPublicKeyResponse>('/notifications/vapid-public-key');
}

export type PushSubscribePayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  notification_type: string;
};
export function subscribePush(payload: PushSubscribePayload) {
  return apiFetch<{ message: string }>('/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type PushUnsubscribePayload = {
  endpoint: string;
  notification_type: string;
};
export function unsubscribePush(payload: PushUnsubscribePayload) {
  return apiFetch<{ message: string }>('/notifications/unsubscribe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getActiveSubscriptions() {
  return apiFetch<string[]>('/notifications/subscriptions');
}

export function getNotifications(type?: string) {
  const qs = type ? `?type=${encodeURIComponent(type)}` : '';
  return apiFetch<AppNotification[]>(`/notifications${qs}`);
}

export function markNotificationRead(id: number) {
  return apiFetch<{ message: string }>(`/notifications/${id}`, { method: 'PUT' });
}

export function markAllNotificationsRead() {
  return apiFetch<{ message: string }>('/notifications/read-all', { method: 'PUT' });
}