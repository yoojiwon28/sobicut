export const IMPULSE_GAUGE_COLOR_WARNING = '#FF7D7D';
export const IMPULSE_GAUGE_COLOR_NORMAL = '#6A5CE6';

// GET /reports/impulse 의 is_warning 으로 게이지 색 결정
// true → 경고색, false/undefined/null → 기본색
export function getImpulseGaugeColor(isWarning?: boolean | null): string {
  return isWarning ? IMPULSE_GAUGE_COLOR_WARNING : IMPULSE_GAUGE_COLOR_NORMAL;
}
