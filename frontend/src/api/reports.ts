import { apiFetch } from './client';
import type {
  ImpulseReport,
  BptiReport,
  WalletTemperature,
  MonthlyForecast,
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