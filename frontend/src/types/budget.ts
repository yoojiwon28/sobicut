export type BudgetDistribution = 'equal' | 'custom';

export type Budget = {
  total: number; // 이번 달 총 예산
  peerAverage: number; // 또래 평균 예산
  thisWeek: number; // 이번 주 예산
  distribution: BudgetDistribution;
  weeks: number[]; // 주차별 예산 (1~4주차)
};
