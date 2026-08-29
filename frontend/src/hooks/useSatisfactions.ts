import { useQuery } from '@tanstack/react-query';
import { getPendingSatisfactions } from '../api/satisfactions';

const STALE_TIME = 60 * 1000; // 1분

export function usePendingSatisfactions() {
  return useQuery({
    queryKey: ['satisfactions', 'pending'],
    queryFn: getPendingSatisfactions,
    staleTime: STALE_TIME,
  });
}
