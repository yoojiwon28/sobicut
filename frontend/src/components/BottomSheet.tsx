import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import styled from 'styled-components';

type BottomSheetProps = {
  onClose: () => void;
  children: ReactNode;
};

const SHEET_TRANSITION_MS = 280;
const OVERLAY_TRANSITION_MS = 200;
const SHEET_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';
const SHEET_PANEL_CLASS = 'bottom-sheet-panel';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// BottomSheet 는 부모가 조건부 렌더링(예: `{open && <BottomSheet ... />}`)으로
// 마운트/언마운트를 제어한다. 부모를 건드리지 않고 닫힘 애니메이션을 재생하려면,
// 실제 언마운트(React 가 DOM 을 떼어내기 직전)를 useLayoutEffect 클린업에서 가로채
// 현재 모습 그대로 document.body 에 복제해두고, 그 복제본만 애니메이션 후 제거한다.
function animateExit(overlayNode: HTMLElement) {
  if (prefersReducedMotion()) return;

  const clone = overlayNode.cloneNode(true) as HTMLElement;
  clone.style.pointerEvents = 'none';
  document.body.appendChild(clone);

  const panel = clone.querySelector<HTMLElement>(`.${SHEET_PANEL_CLASS}`);
  const transitionTarget = panel ?? clone;

  // 복제 직후의 "열린" 상태를 브라우저가 한 번 커밋하도록 강제한 뒤 닫힘 값으로 전환한다.
  void clone.offsetHeight;

  clone.style.transition = `opacity ${OVERLAY_TRANSITION_MS}ms ease`;
  if (panel) {
    panel.style.transition = `transform ${SHEET_TRANSITION_MS}ms ${SHEET_EASING}`;
  }

  requestAnimationFrame(() => {
    clone.style.opacity = '0';
    if (panel) panel.style.transform = 'translateY(100%)';
  });

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    clone.remove();
  };
  transitionTarget.addEventListener('transitionend', finish, { once: true });
  setTimeout(finish, Math.max(SHEET_TRANSITION_MS, OVERLAY_TRANSITION_MS) + 60);
}

export default function BottomSheet({ onClose, children }: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useLayoutEffect(() => {
    return () => {
      const node = overlayRef.current;
      if (node) animateExit(node);
    };
  }, []);

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <Overlay ref={overlayRef} $visible={visible} onClick={onClose}>
      <Sheet className={SHEET_PANEL_CLASS} $visible={visible} onClick={stop}>
        {children}
      </Sheet>
    </Overlay>
  );
}

const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity ${OVERLAY_TRANSITION_MS}ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Sheet = styled.div<{ $visible: boolean }>`
  position: relative;
  width: 100%;
  max-width: 400px;
  max-height: 85vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px;
  box-shadow: 0 -12px 32px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
  transform: translateY(${({ $visible }) => ($visible ? '0' : '100%')});
  transition: transform ${SHEET_TRANSITION_MS}ms ${SHEET_EASING};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
