const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function formatKoreanDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

export function formatShortDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDetailDateTime(dateStr: string, timeStr: string) {
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = Number(hourStr);
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${dateStr.replaceAll('-', '.')} ${String(hour12).padStart(2, '0')}:${minuteStr} ${period}`;
}