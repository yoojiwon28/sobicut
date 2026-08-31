export type EmotionTag = {
  id: number;
  name: string;
};

export type TransactionType = 'expense' | 'income';

export type Transaction = {
  id: number;
  amount: number;
  type: TransactionType;
  category: string;
  merchant: string | null;
  description: string | null;
  transaction_date: string; // 'YYYY-MM-DD'
  transaction_time: string; // 'HH:mm:ss'
  emotion_tags: EmotionTag[];
  created_at: string;
  // 소비 태그(계획성/소비특성). TagQuestions 에서 쓰는 한글 name 문자열.
  // TODO: 백엔드 emotion_tags 체계로 통합되면 emotion_tags 로 흡수 검토
  planTag?: string | null;
  contextTags?: string[];
};

// POST /transactions/parse 성공 응답. 카드 결제 문자에서 추출한 값.
export type ParseResult = {
  amount: number;
  merchant: string;
  transaction_date: string; // 'YYYY-MM-DD' (그대로 사용)
  transaction_time: string; // 'HH:mm' (저장 시 ':00' 을 붙여 'HH:mm:ss' 로 변환)
  card_company: string; // 화면 표시 전용. POST /transactions payload 에는 포함하지 않는다.
  category: string | null; // 분류 실패 시 null → 사용자가 직접 선택
};

// GET /transactions 쿼리 파라미터. 전부 optional이며, 값이 없는 필드는 쿼리스트링에서 제외한다.
export type TransactionListParams = {
  year?: number;
  month?: number;
  week?: number; // ISO 주차
  date?: string; // 'YYYY-MM-DD'
  type?: string;
  category?: string;
};