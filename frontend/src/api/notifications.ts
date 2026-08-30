import { apiFetch } from './client';

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