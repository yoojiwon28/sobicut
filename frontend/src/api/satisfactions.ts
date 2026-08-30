import { apiFetch } from './client';
import type {
  PendingSatisfaction,
  SatisfactionCreatePayload,
  SatisfactionRecordItem,
} from '../types/satisfaction';

// 응답 대기 중인(아직 응답하지 않은) 만족도 설문 목록
export function getPendingSatisfactions() {
  return apiFetch<PendingSatisfaction[]>('/satisfactions/pending');
}

// 거래별 만족도 응답 목록 — year/month 는 거래일이 아니라 응답 제출 시각 기준 필터
export function getSatisfactions(params?: { year?: number; month?: number }) {
  const query = new URLSearchParams();
  if (params?.year != null) query.set('year', String(params.year));
  if (params?.month != null) query.set('month', String(params.month));
  const qs = query.toString();
  return apiFetch<SatisfactionRecordItem[]>(`/satisfactions${qs ? `?${qs}` : ''}`);
}

// 만족도 응답 저장
export function createSatisfaction(body: SatisfactionCreatePayload) {
  return apiFetch<void>('/satisfactions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
