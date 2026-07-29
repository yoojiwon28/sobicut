export type ParsedSpending = {
  amount?: number;
  merchant?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
};

// 카드사/은행 문자 형식이 제각각
// TODO: 실제 자주 쓰이는 문자 포맷 더 모아서 정교화 필요
export function parseSpendingText(text: string): ParsedSpending {
  const result: ParsedSpending = {};

  const amountMatch = text.match(/([\d,]{4,})\s*원/);
  if (amountMatch) {
    result.amount = Number(amountMatch[1].replace(/,/g, ''));
  }

  const dateTimeMatch = text.match(/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/);
  if (dateTimeMatch) {
    const [, month, day, hour, minute] = dateTimeMatch;
    const year = new Date().getFullYear();
    result.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    result.time = `${hour.padStart(2, '0')}:${minute}`;
  }

  const NOISE_WORDS = ['승인', '일시불', '카드', '결제', '누적', '체크', '거절', '취소'];

  const candidateLines = text
    .split(/\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith('[')) // [Web발신], [카카오뱅크] 같은 헤더 줄
    .filter((line) => !/\d{1,2}\/\d{1,2}/.test(line)) // 날짜 줄
    .filter((line) => !/원$/.test(line)) // 금액 줄
    .filter((line) => !line.includes('*')) // 유*원(4344) 같은 마스킹된 이름/계좌 줄
    .filter((line) => !NOISE_WORDS.some((word) => line.includes(word)));

  const merchantLine = candidateLines[candidateLines.length - 1];
  if (merchantLine) {
    result.merchant = merchantLine;
  }

  return result;
}