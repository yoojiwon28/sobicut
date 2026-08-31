// 지출 카테고리 이름 목록.
// 백엔드는 숫자 ID가 아니라 아래 문자열을 그대로 주고받는다. (GET /categories 엔드포인트 없음)
export const CATEGORY_NAMES = [
  '식비',
  '고정지출',
  '교통',
  '생활',
  '쇼핑/패션',
  '자기계발',
  '문화/여가',
  '모임/기타',
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];
