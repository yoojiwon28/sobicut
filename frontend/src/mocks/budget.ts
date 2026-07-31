import type { Budget } from '../types/budget';

// GET /budget 더미데이터
export const DUMMY_BUDGET: Budget = {
  total: 800000,
  peerAverage: 700000,
  thisWeek: 100000,
  distribution: 'equal',
  weeks: [200000, 200000, 200000, 200000],
};
