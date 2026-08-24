import { apiFetch } from './client';

export type EmotionTag = { id: number; name: string; type: string };

export function getEmotions() {
  return apiFetch<EmotionTag[]>('/emotions');
}