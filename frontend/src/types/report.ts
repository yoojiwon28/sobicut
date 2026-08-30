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
};
