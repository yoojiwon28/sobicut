const INCOME_LABELS: Record<string, string> = {
  'under-30': '30만원 미만',
  '30-60': '30만원 - 60만원',
  '60-100': '60만원 - 100만원',
  'over-100': '100만원 이상',
};

export const formatIncomeLevel = (range: string) => INCOME_LABELS[range] ?? range;

// 슬라이더 숫자(만원) -> 백엔드 소득구간 enum
export function mapIncomeToLevel(income: number): string {
  if (income < 30) return 'under-30';
  if (income < 60) return '30-60';
  if (income < 100) return '60-100';
  return 'over-100';
}

// 백엔드 소득구간 enum -> 슬라이더 초기값(만원)
export function levelToIncome(level: string): number {
  switch (level) {
    case 'under-30':
      return 15;
    case '30-60':
      return 45;
    case '60-100':
      return 80;
    case 'over-100':
      return 150;
    default:
      return 0;
  }
}