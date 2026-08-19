import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { Field, Label, Input, ButtonPrimary } from '../styles/auth.styles';
import { withdraw } from '../api/auth';
import { ApiError } from '../api/client';

type WithdrawModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function WithdrawModal({ onClose, onSuccess }: WithdrawModalProps) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      await withdraw(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '탈퇴 처리에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal>
      <form onSubmit={handleSubmit}>
        <Title>정말 탈퇴하시겠어요?</Title>
        <WarningText>
          탈퇴 버튼 선택 시, 계정은
          <br />
          삭제되며 복구되지 않습니다.
        </WarningText>

        <Field>
          <Label>본인 확인을 위해 비밀번호를 입력해주세요</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </Field>

        {error && <ErrorText>{error}</ErrorText>}

        <ButtonRow>
          <CancelButton type="button" onClick={onClose}>
            취소
          </CancelButton>
          <ButtonPrimary type="submit" disabled={!password || submitting}>
            {submitting ? '처리 중...' : '탈퇴하기'}
          </ButtonPrimary>
        </ButtonRow>
      </form>
    </Modal>
  );
}

const Title = styled.h2`
  font-size: 19px;
  font-weight: 800;
  text-align: center;
  margin: 4px 0 10px;
`;

const WarningText = styled.p`
  font-size: 13px;
  font-weight: 500;
  color: #888;
  line-height: 1.5;
  text-align: center;
  margin: 0 0 24px;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  text-align: center;
  margin: 8px 0 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;

  ${ButtonPrimary} {
    flex: 1;
    width: auto;
    margin-top: 0;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  height: 52px;
  border: none;
  border-radius: 12px;
  background: #f0f0f0;
  color: #444;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;