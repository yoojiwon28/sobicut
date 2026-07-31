import type { EmotionKey } from '../types/emotion';

// 감정 태그 - 좌: 긍정, 우: 부정 (와이어프레임 기준 2열 3행 배치)
export const EMOTION_ROWS: { positive: EmotionKey; negative: EmotionKey }[] = [
  { positive: '성취감', negative: '스트레스' },
  { positive: '행복함', negative: '무의식' },
  { positive: '고마움', negative: '귀찮음' },
];

export const EMOTION_KEYS: EmotionKey[] = EMOTION_ROWS.flatMap((row) => [row.positive, row.negative]);

export const POSITIVE_EMOTIONS = new Set<EmotionKey>(['성취감', '행복함', '고마움']);

export const EMOTION_COLORS: Record<EmotionKey, string> = {
  성취감: '#8A7EE0',
  행복함: '#B9B4E8',
  고마움: '#DCD8F5',
  스트레스: '#FF7D7D',
  무의식: '#FFADAD',
  귀찮음: '#FFD1D1',
};

export const EMOTION_MESSAGES: Record<EmotionKey, string> = {
  성취감: '성취감을 위한 소비가 많아요',
  행복함: '행복을 위한 소비가 많아요',
  고마움: '고마움을 표현하는 소비가 많아요',
  스트레스: '스트레스성 소비가 많아요',
  무의식: '무의식적인 소비가 많아요',
  귀찮음: '귀찮음 때문에 하는 소비가 많아요',
};

export type EmotionSegment = {
  key: EmotionKey;
  percent: number;
  color: string;
};

export function buildEmotionSegments(stats: Partial<Record<EmotionKey, number>>): EmotionSegment[] {
  const total = Object.values(stats).reduce<number>((sum, v) => sum + (v ?? 0), 0);
  if (total === 0) return [];

  return (Object.entries(stats) as [EmotionKey, number][])
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ key, percent: (value / total) * 100, color: EMOTION_COLORS[key] }))
    .sort((a, b) => b.percent - a.percent);
}
