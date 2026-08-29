import { apiFetch } from './client';
import type { PendingSatisfaction, SatisfactionCreatePayload } from '../types/satisfaction';

// 응답 대기 중인(아직 응답하지 않은) 만족도 설문 목록
export function getPendingSatisfactions() {
  return apiFetch<PendingSatisfaction[]>('/satisfactions/pending');
}

// 만족도 응답 저장
export function createSatisfaction(body: SatisfactionCreatePayload) {
  return apiFetch<void>('/satisfactions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
