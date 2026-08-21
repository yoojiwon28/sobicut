import { apiFetch } from './client';

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