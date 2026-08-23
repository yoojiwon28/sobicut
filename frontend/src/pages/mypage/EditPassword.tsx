import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { AuthTitle, Field, Label, Input, FormColumn, ButtonPrimary, Spinner } from '../../styles/auth.styles';
import { updatePassword } from '../../api/users';
import { ApiError } from '../../api/client';

export default function EditPassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const canSubmit =
    currentPassword.length > 0 && newPassword.length > 0 && newPassword === newPasswordConfirm;

  const mutation = useMutation({
    mutationFn: () => updatePassword(currentPassword, newPassword),
    onSuccess: () => {
      navigate('/mypage/edit');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to="/mypage/edit" />
          <AuthTitle $size={20}>비밀번호 변경</AuthTitle>

          <Field>
            <Label>안전한 변경을 위해 현재 비밀번호를 입력해주세요</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </Field>

          <Field>
            <Label>새 비밀번호를 입력해주세요</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Field>

          <Field>
            <Label>새 비밀번호를 한번 더 입력해주세요</Label>
            <Input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />
          </Field>

          {mutation.isError && (
            <ErrorText>
              {mutation.error instanceof ApiError ? mutation.error.message : '변경에 실패했어요. 다시 시도해주세요.'}
            </ErrorText>
          )}
        </div>

        <ButtonPrimary type="submit" disabled={!canSubmit || mutation.isPending}>
          {mutation.isPending ? <Spinner $size={18} $color="#fff" $trackColor="rgba(255,255,255,0.4)" /> : '변경하기'}
        </ButtonPrimary>
      </FormColumn>
    </form>
  );
}

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  text-align: center;
  margin: 8px 0 0;
`;