// 클립보드 텍스트가 "결제 문자로 볼 수 있는지" 사전 판정하는 필터.
// 메인페이지에서 아무 텍스트에나 포착 팝업이 뜨는 것을 막기 위한 1차 게이트.
//
// 판정 기준을 추후 쉽게 확장할 수 있도록, 금액 정규식과 키워드 목록은
// 파일 최상단 상수로 분리한다.

// 금액 패턴: "12,345원" / "5000원" / "₩ 1000" 형태 중 하나라도 있으면 통과.
export const AMOUNT_PATTERN = /\d{1,3}(,\d{3})+\s*원|\d+\s*원|₩\s*\d/;

// 결제 맥락 키워드. 하나라도 포함되면 통과.
export const PAYMENT_KEYWORDS = [
  '승인',
  '결제',
  '출금',
  '입금',
  '사용',
  '일시불',
  '할부',
  '체크카드',
  '신용카드',
  '카드',
  '누적',
  '잔액',
  '취소',
  '매입',
  '이체',
];

const MIN_LENGTH = 1;
const MAX_LENGTH = 500; // 초과 시 문서 복사로 간주

/**
 * 클립보드 텍스트가 결제 문자로 볼 수 있는 신호를 담고 있으면 true.
 * 아래 조건을 모두 만족해야 한다.
 *   a) trim 후 길이가 1~500자
 *   b) 금액 패턴이 1개 이상 존재
 *   c) 결제 관련 키워드가 1개 이상 존재
 */
export function isPaymentLikeText(text: string): boolean {
  if (typeof text !== 'string') return false;

  const trimmed = text.trim();
  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) return false;

  // 대소문자/공백에 영향받지 않도록 정규화 후 검사.
  const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');

  if (!AMOUNT_PATTERN.test(normalized)) return false;
  if (!PAYMENT_KEYWORDS.some((keyword) => normalized.includes(keyword.toLowerCase()))) return false;

  return true;
}
