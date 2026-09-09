// 리포트 API 응답 타입 (Swagger 확인 완료)

// GET /reports/impulse
export type ImpulseReport = {
  impulse_score: number;
  threshold: number;
  is_warning: boolean;
  breakdown: {
    time_abnormal: number;
    amount_burden: number;
    repeat_consumption: number;
    peer_comparison: number;
    regret_score: number;
  };
  emotion_breakdown: Record<string, number>;
  // 이번 달 전체 지출 거래 수 대비 "해당 태그가 붙은 거래" 비율(0~1). 태그별 독립 계산이라 합이 1을 넘을 수 있다.
  emotion_expense_ratio: Record<string, number>;
  peer_avg_impulse_score: number | null;
  week_over_week: { this_week: number; last_week: number; diff: number };
  top_impulse_transactions: {
    id: number;
    merchant: string;
    amount: number;
    transaction_date: string;
    impulse_score: number;
  }[];
};

// GET /reports/bpti
export type BptiReport = {
  type: string;
  label: string;
  definition: string;
  message: string;
  // 심리특성 5개: 스트레스/즉흥성/비교회피/충분한숙고/장기적가치
  emotion_radar: Record<string, number>;
};

// GET /reports/wallet-temperature
export type WalletTemperature = {
  my_temp: number;
  peer_avg_temp: number;
  diff: number;
  level: string;
  emoji: string;
  message: string;
  my_spent: number;
  my_budget: number;
  peer_group: {
    residence_type: string;
    income_level: string;
    avg_usage_rate: number | null;
  };
  temperature_levels: {
    min: number;
    max: number | null;
    emoji: string;
    label: string;
    status: string;
    message: string;
  }[];
};

// GET /reports/monthly-forecast
export type MonthlyForecast = {
  current_spent: number;
  predicted_total: number;
  budget: number;
  predicted_remaining: number;
  is_over_budget: boolean;
  confidence: string;
  history: { year: number; month: number; spent: number }[];
  monthly_average: number;
};

// GET /reports/scores (상단 3개 카드: 지갑 온도 / 충동 지수 / BPTI)
export type Scores = {
  impulse_score: number;
  wallet_temperature: {
    my_temp: number;
    peer_avg_temp: number;
    diff: number;
    level: string;
    emoji: string;
    message: string;
  };
  bpti: {
    type: string;
    label: string;
    definition: string;
    message: string;
  };
};

// GET /reports/category (소비 카테고리 집계 — year/month optional, 없으면 이번 달)
// 주의: 금액 0인 카테고리도 8개 전부 내려온다.
export type CategoryReport = {
  total_spent: number;
  categories: {
    category: string;
    amount: number;
    ratio: number;
  }[];
};

// GET /reports/heatmap (요일 × 시간대 소비 집계 — year/month optional, 없으면 이번 달)
// 주의: 값이 있는 셀만 내려온다. day는 "월"~"일", time_slot은 "새벽"/"아침"/"점심"/"저녁"/"밤".
// peak는 peak_day(요일 피크 + 안내 문구)와 peak_time_slot(시간대 피크 + 알림 라벨)으로 분리됨.
export type HeatmapReport = {
  heatmap: {
    day: string;
    time_slot: string;
    amount: number;
    count: number;
  }[];
  peak_day: { day: string; message: string } | null;
  peak_time_slot: { time_slot: string; label: string } | null;
};

// GET /reports/prescription (week_start optional, YYYY-MM-DD 월요일 — 생략 시 서버가 지난주 월요일 사용)
// 주의: prescription 은 배치 미수행 / 해당 주 거래 없음이면 null (에러 아님).
//       negative_factors / positive_factors 는 빈 배열일 수 있고, prescription 과 독립적이다.
export type PrescriptionReport = {
  period_start: string; // 'YYYY-MM-DD'
  period_end: string; // 'YYYY-MM-DD'
  negative_factors: string[];
  positive_factors: string[];
  prescription: string[] | null;
  generated_at: string | null;
};

// GET /reports/budget-status (year/month optional — 없으면 이번 달)
export type BudgetStatus = {
  monthly: {
    budget: number;
    spent: number;
    remaining: number;
    usage_rate: number;
  };
  weekly: {
    current_week: number;
    budget: number;
    spent: number;
    remaining: number;
    usage_rate: number;
  };
  weekly_breakdown: {
    week: number;
    budget: number;
    spent: number;
    usage_rate: number;
  }[];
};
