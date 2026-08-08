export type SatisfactionRecord = {
  id: number;
  merchant: string;
  category: string;
  amount: number;
  date: string; // 'YYYY-MM-DD'
  score7: number;
  score30: number;
};

// TODO: GET /satisfaction/records?month=YYYY-MM 로 교체
export const DUMMY_SATISFACTION_RECORDS: SatisfactionRecord[] = [
  { id: 1, merchant: '무신사 스탠다드', category: '쇼핑/패션', amount: 45000, date: '2026-08-01', score7: 4, score30: 5 },
  { id: 2, merchant: 'CGV', category: '문화/여가', amount: 14000, date: '2026-08-02', score7: 5, score30: 5 },
  { id: 3, merchant: '올리브영 숙명점', category: '쇼핑/패션', amount: 32000, date: '2026-08-03', score7: 3, score30: 2 },
  { id: 4, merchant: '넷플릭스', category: '고정지출', amount: 17000, date: '2026-08-04', score7: 4, score30: 4 },
  { id: 5, merchant: '카카오T 택시', category: '교통', amount: 9200, date: '2026-08-05', score7: 2, score30: 2 },
  { id: 6, merchant: '스터디카페', category: '자기계발', amount: 22000, date: '2026-07-18', score7: 5, score30: 4 },
  { id: 7, merchant: '교보문고', category: '문화/여가', amount: 18000, date: '2026-07-24', score7: 3, score30: 3 },
  { id: 8, merchant: '다이소 숙명점', category: '생활', amount: 12000, date: '2026-07-15', score7: 1, score30: 2 },
];

export type WeeklySatisfaction = {
  week: string;
  average: number;
};

// TODO: GET /satisfaction/weekly?month=YYYY-MM 로 교체
export const DUMMY_WEEKLY_SATISFACTION: WeeklySatisfaction[] = [
  { week: '첫째 주', average: 4.2 },
  { week: '둘째 주', average: 3.1 },
  { week: '셋째 주', average: 2.4 },
  { week: '넷째 주', average: 4.6 },
];
