import type { MouseEvent, ReactNode } from 'react';
import styled from 'styled-components';

type ModalProps = {
  onClose?: () => void;
  children: ReactNode;
};

export default function Modal({ onClose, children }: ModalProps) {
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <Overlay onClick={onClose}>
      <Card onClick={stop}>
        {onClose && (
          <CloseButton type="button" onClick={onClose} aria-label="닫기">
            ×
          </CloseButton>
        )}
        {children}
      </Card>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 20px;
  padding: 28px 24px 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  border: none;
  background: none;
  font-size: 22px;
  line-height: 1;
  color: #999;
  cursor: pointer;
`;
