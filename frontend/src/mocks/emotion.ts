import type { EmotionKey } from '../types/emotion';

// GET /reports/emotions 더미데이터 - 이번 달 감정 태그 분포
export const DUMMY_EMOTION_BASE_STATS: Record<EmotionKey, number> = {
  스트레스: 9,
  귀찮음: 4,
  행복함: 3,
  고마움: 2,
  성취감: 3,
  무의식: 5,
};
