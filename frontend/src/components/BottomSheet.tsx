import type { MouseEvent, ReactNode } from 'react';
import styled from 'styled-components';

type BottomSheetProps = {
  onClose: () => void;
  children: ReactNode;
};

export default function BottomSheet({ onClose, children }: BottomSheetProps) {
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={stop}>{children}</Sheet>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
`;

const Sheet = styled.div`
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
`;
