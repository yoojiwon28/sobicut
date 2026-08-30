import { useQuery } from '@tanstack/react-query';
import { getEmotions } from '../api/emotions';

// 감정/소비 태그 마스터 데이터. 거의 변하지 않으므로 오래 캐시한다.
const STALE_TIME = 60 * 60 * 1000; // 1시간

export function useEmotions() {
  return useQuery({
    queryKey: ['emotions'],
    queryFn: getEmotions,
    staleTime: STALE_TIME,
  });
}
