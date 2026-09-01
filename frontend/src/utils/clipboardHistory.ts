// 같은 클립보드 내용으로 포착 팝업이 반복해서 뜨는 것을 막기 위한 처리 이력 저장소.
// localStorage 에 최근에 팝업을 띄운 텍스트의 해시를 기록해 둔다.

const STORAGE_KEY = 'sobicut:clipboard-history';
const MAX_ENTRIES = 20;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7일

type HistoryEntry = { hash: string; ts: number };

// djb2 문자열 해시. 외부 라이브러리 없이 충돌만 실용적으로 낮추면 되므로 간단히 구현한다.
function djb2(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  // 부호 없는 32비트로 변환 후 36진수 문자열.
  return (hash >>> 0).toString(36);
}

function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is HistoryEntry =>
        entry != null && typeof entry.hash === 'string' && typeof entry.ts === 'number',
    );
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // 저장 불가(프라이빗 모드/용량 초과 등) → 조용히 무시.
  }
}

// 7일 경과 항목 제거 + 최대 20개 유지(오래된 것부터 삭제). 정리된 목록을 반환한다.
function pruneHistory(entries: HistoryEntry[]): HistoryEntry[] {
  const now = Date.now();
  const fresh = entries
    .filter((entry) => now - entry.ts <= MAX_AGE_MS)
    .sort((a, b) => a.ts - b.ts);
  return fresh.slice(Math.max(0, fresh.length - MAX_ENTRIES));
}

/** 이 텍스트로 이미 팝업을 띄운 적이 있으면 true. localStorage 접근 실패 시 false. */
export function isAlreadyHandled(text: string): boolean {
  try {
    const hash = djb2(text);
    const entries = pruneHistory(readHistory());
    return entries.some((entry) => entry.hash === hash);
  } catch {
    return false;
  }
}

/** 이 텍스트로 팝업을 띄우기로 결정한 시점에 호출. 이후 같은 내용은 다시 뜨지 않는다. */
export function markAsHandled(text: string): void {
  try {
    const hash = djb2(text);
    const entries = pruneHistory(readHistory()).filter((entry) => entry.hash !== hash);
    entries.push({ hash, ts: Date.now() });
    writeHistory(pruneHistory(entries));
  } catch {
    // no-op
  }
}
