// 금액 표시/입력 공용 헬퍼. 표시할 때만 콤마를 넣고, 저장 상태는 항상 number로 유지한다.

/** 숫자를 한국식 천 단위 콤마 문자열로 변환 (표시 전용). NaN/Infinity는 '0'으로 처리. */
export function formatWon(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Math.round(value).toLocaleString('ko-KR');
}

/** 입력 문자열에서 숫자 외 문자(콤마 포함)를 제거하고 정수로 변환. 빈 값이면 0. */
export function parseWon(input: string): number {
  const digits = input.replace(/[^0-9]/g, '');
  return digits === '' ? 0 : Number(digits);
}

/**
 * 콤마 삽입 후 커서 위치 보정.
 * 커서 왼쪽에 있던 숫자 개수(digitsBeforeCaret)를 기준으로, 포맷된 문자열에서 같은 위치를 찾는다.
 */
export function caretPosAfterFormat(formatted: string, digitsBeforeCaret: number): number {
  if (digitsBeforeCaret <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    const ch = formatted[i];
    if (ch >= '0' && ch <= '9') {
      seen += 1;
      if (seen === digitsBeforeCaret) return i + 1;
    }
  }
  return formatted.length;
}
