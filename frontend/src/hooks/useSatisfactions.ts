import { useQuery } from '@tanstack/react-query';
import { getPendingSatisfactions, getSatisfactions } from '../api/satisfactions';

const STALE_TIME = 60 * 1000; // 1분

export function usePendingSatisfactions() {
  return useQuery({
    queryKey: ['satisfactions', 'pending'],
    queryFn: getPendingSatisfactions,
    staleTime: STALE_TIME,
  });
}

export function useSatisfactions(params?: { year?: number; month?: number }) {
  return useQuery({
    queryKey: ['satisfactions', params?.year ?? null, params?.month ?? null],
    queryFn: () => getSatisfactions(params),
    staleTime: STALE_TIME,
  });
}
