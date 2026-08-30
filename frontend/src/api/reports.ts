import { apiFetch } from './client';
import type {
  ImpulseReport,
  BptiReport,
  WalletTemperature,
  MonthlyForecast,
  Scores,
  BudgetStatus,
  CategoryReport,
  HeatmapReport,
} from '../types/report';

export type DailyReportItem = {
  date: string; // 'YYYY-MM-DD'
  income: number;
  expense: number;
};

export function getDailyReport(params: { year: number; month: number }) {
  const query = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
  });
  return apiFetch<DailyReportItem[]>(`/reports/daily?${query.toString()}`);
}

// 충동 지수 리포트
export function getImpulseReport() {
  return apiFetch<ImpulseReport>('/reports/impulse');
}

// 소비성격유형(BPTI) 리포트
export function getBptiReport() {
  return apiFetch<BptiReport>('/reports/bpti');
}

// 지갑 온도 리포트
export function getWalletTemperature() {
  return apiFetch<WalletTemperature>('/reports/wallet-temperature');
}

// 이번 달 예상 지출 리포트
export function getMonthlyForecast() {
  return apiFetch<MonthlyForecast>('/reports/monthly-forecast');
}

// 상단 종합 점수 (지갑 온도 / 충동 지수 / BPTI)
export function getScores() {
  return apiFetch<Scores>('/reports/scores');
}

// 예산 현황 (주간 / 월간) — year/month 미지정 시 이번 달
export function getBudgetStatus(params?: { year?: number; month?: number }) {
  const query = new URLSearchParams();
  if (params?.year != null) query.set('year', String(params.year));
  if (params?.month != null) query.set('month', String(params.month));
  const qs = query.toString();
  return apiFetch<BudgetStatus>(`/reports/budget-status${qs ? `?${qs}` : ''}`);
}

// 소비 카테고리 집계 — year/month 미지정 시 이번 달
export function getCategoryReport(params?: { year?: number; month?: number }) {
  const query = new URLSearchParams();
  if (params?.year != null) query.set('year', String(params.year));
  if (params?.month != null) query.set('month', String(params.month));
  const qs = query.toString();
  return apiFetch<CategoryReport>(`/reports/category${qs ? `?${qs}` : ''}`);
}

// 요일 × 시간대 소비 히트맵 — year/month 미지정 시 이번 달
export function getHeatmapReport(params?: { year?: number; month?: number }) {
  const query = new URLSearchParams();
  if (params?.year != null) query.set('year', String(params.year));
  if (params?.month != null) query.set('month', String(params.month));
  const qs = query.toString();
  return apiFetch<HeatmapReport>(`/reports/heatmap${qs ? `?${qs}` : ''}`);
}