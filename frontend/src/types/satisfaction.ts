// 백엔드 만족도 설문은 거래 1건당 '7일'/'30일' 두 회차가 따로 존재한다.
// day_type 은 "7일" 또는 "30일" 한글 문자열이며 영문으로 변환하지 않는다.

export type PendingSatisfaction = {
  transaction_id: number;
  merchant: string;
  amount: number;
  day_type: string; // '7일' | '30일'
  due_date: string; // 'YYYY-MM-DD'
};

export type SatisfactionCreatePayload = {
  transaction_id: number;
  day_type: string; // '7일' | '30일'
  score: number;
};

// GET /satisfactions 응답 — 거래 1건당 여러 회차 응답이 묶여서 온다.
// satisfactions 배열에는 한 회차만 있을 수 있고, day_type 은 '1일' | '7일' | '30일'.
export type SatisfactionRecordItem = {
  transaction_id: number;
  merchant: string;
  amount: number;
  transaction_date: string; // 'YYYY-MM-DD'
  satisfactions: { day_type: string; score: number; submitted_at: string }[];
};
