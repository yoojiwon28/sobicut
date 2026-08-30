import { useQuery } from '@tanstack/react-query';
import {
  getImpulseReport,
  getBptiReport,
  getWalletTemperature,
  getMonthlyForecast,
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
