import { useCallback, useEffect, useState } from 'react';
import { isPaymentLikeText } from '../utils/clipboardFilter';
import { isAlreadyHandled, markAsHandled } from '../utils/clipboardHistory';

type ClipboardCapture = {
  isOpen: boolean;
  clipboardText: string;
  closeCapture: () => void;
};

// 메인페이지 진입 시 클립보드를 읽어 "결제 포착 팝업"을 띄울지 결정한다.
// 판정만 담당하고, 실제 파싱/모달 UI 는 ExpenseCaptureModal 이 맡는다.
//
// 순서:
//   1. navigator.clipboard.readText() (실패 시 조용히 중단)
//   2. 빈 문자열이면 중단
//   3. 이미 처리한 내용이면 중단
//   4. 결제 신호가 없으면 중단 (팝업/토스트 없이 완전 무음)
//   5. 처리 이력에 기록
//   6. 팝업 오픈
export function useClipboardCapture(): ClipboardCapture {
  const [isOpen, setIsOpen] = useState(false);
  const [clipboardText, setClipboardText] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let text = '';
      try {
        text = await navigator.clipboard.readText();
      } catch {
        return; // 권한 거부/미지원 → 무음 종료
      }
      if (cancelled) return;

      const trimmed = text.trim();
      if (!trimmed) return;
      if (isAlreadyHandled(trimmed)) return;
      if (!isPaymentLikeText(trimmed)) return;

      markAsHandled(trimmed);
      if (cancelled) return;

      setClipboardText(trimmed);
      setIsOpen(true);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const closeCapture = useCallback(() => setIsOpen(false), []);

  return { isOpen, clipboardText, closeCapture };
}
