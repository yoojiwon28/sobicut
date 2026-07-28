const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function formatKoreanDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}