import { useQuery } from '@tanstack/react-query';
import {
  getImpulseReport,
  getBptiReport,
  getWalletTemperature,
  getMonthlyForecast,
  getScores,
  getBudgetStatus,
  getCategoryReport,
  getHeatmapReport,
} from '../api/reports';

const STALE_TIME = 60 * 1000; // 60초

export function useImpulseReport() {
  return useQuery({
    queryKey: ['reports', 'impulse'],
    queryFn: getImpulseReport,
    staleTime: STALE_TIME,
  });
}

export function useBptiReport() {
  return useQuery({
    queryKey: ['reports', 'bpti'],
    queryFn: getBptiReport,
    staleTime: STALE_TIME,
  });
}

export function useWalletTemperature() {
  return useQuery({
    queryKey: ['reports', 'wallet-temperature'],
    queryFn: getWalletTemperature,
    staleTime: STALE_TIME,
  });
}

export function useMonthlyForecast() {
  return useQuery({
    queryKey: ['reports', 'monthly-forecast'],
    queryFn: getMonthlyForecast,
    staleTime: STALE_TIME,
  });
}

export function useScores() {
  return useQuery({
    queryKey: ['reports', 'scores'],
    queryFn: getScores,
    staleTime: STALE_TIME,
  });
}

export function useBudgetStatus(params?: { year?: number; month?: number }) {
  return useQuery({
    queryKey: ['reports', 'budget-status', params?.year ?? null, params?.month ?? null],
    queryFn: () => getBudgetStatus(params),
    staleTime: STALE_TIME,
  });
}

export function useCategoryReport(params?: { year?: number; month?: number }) {
  return useQuery({
    queryKey: ['reports', 'category', params?.year ?? null, params?.month ?? null],
    queryFn: () => getCategoryReport(params),
    staleTime: STALE_TIME,
  });
}

export function useHeatmapReport(params?: { year?: number; month?: number }) {
  return useQuery({
    queryKey: ['reports', 'heatmap', params?.year ?? null, params?.month ?? null],
    queryFn: () => getHeatmapReport(params),
    staleTime: STALE_TIME,
  });
}
