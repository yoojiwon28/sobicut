import { apiFetch } from './client';

// 예산은 유저당 1개이며 월별로 나뉘지 않는다. (month 파라미터 없음)
export const BUDGET_QUERY_KEY = ['budget'] as const;

// 주차 배분 금액을 1,000원 단위로 내림
const WEEK_ROUND = 1000;
// 균등 배분 기준 주차 수 (서버 스키마는 현재 4주 고정)
const EVEN_WEEK_COUNT = 4;

export type WeeklyBudgets = {
  week_1: number;
  week_2: number;
  week_3: number;
  week_4: number;
};

export type Budget = {
  monthly_budget: number;
  weekly_budget: number;
  weekly_budgets: WeeklyBudgets;
};

export function getBudget() {
  return apiFetch<Budget>('/budget');
}

// PUT은 부분 수정이 아니라 전체 교체다. 항상 전체 필드를 담아서 보낸다.
export function updateBudget(payload: Budget) {
  return apiFetch<Budget>('/budget', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// { week_1, week_2, ... } → [n, n, ...] (주차 번호 오름차순)
export function toWeeklyArray(weeklyBudgets: WeeklyBudgets): number[] {
  return Object.keys(weeklyBudgets)
    .filter((key) => /^week_\d+$/.test(key))
    .sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)))
    .map((key) => weeklyBudgets[key as keyof WeeklyBudgets] ?? 0);
}

// [n, n, ...] → { week_1, week_2, ... }
export function toWeeklyBudgets(weeks: number[]): WeeklyBudgets {
  const result = {} as WeeklyBudgets;
  weeks.forEach((amount, idx) => {
    result[`week_${idx + 1}` as keyof WeeklyBudgets] = amount;
  });
  return result;
}

// 주차 값이 0이면 weekly_budget으로 폴백해서 표시용 배열을 만든다.
export function resolveWeekly(weeklyBudgets: WeeklyBudgets, weeklyBudget: number): number[] {
  return toWeeklyArray(weeklyBudgets).map((amount) => (amount > 0 ? amount : weeklyBudget));
}

/** weekly_budgets에 0이 아닌 값이 하나라도 있으면 직접 설정 모드 */
export function isCustomWeekly(weekly_budgets: WeeklyBudgets): boolean {
  return toWeeklyArray(weekly_budgets).some((v) => v > 0);
}

// 월 예산을 4주 균등 배분했을 때 한 주당 금액
export function calcEvenWeekly(monthlyBudget: number): number {
  return Math.floor(monthlyBudget / EVEN_WEEK_COUNT / WEEK_ROUND) * WEEK_ROUND;
}
