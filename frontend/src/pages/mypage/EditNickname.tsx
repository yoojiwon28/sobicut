import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { AuthTitle, Field, Label, Input, FormColumn, ButtonPrimary, Spinner } from '../../styles/auth.styles';
import { getSettings, updateNickname } from '../../api/users';
import { ApiError } from '../../api/client';

export default function EditNickname() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['users', 'me', 'settings'],
    queryFn: getSettings,
  });

  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (settings) setNickname(settings.nickname);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () => updateNickname(nickname),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me', 'settings'] });
      navigate('/mypage/edit');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to="/mypage/edit" />
          <AuthTitle $size={20}>닉네임 변경</AuthTitle>

          <Field>
            <Label>새로운 닉네임을 입력해주세요</Label>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </Field>

          {mutation.isError && (
            <ErrorText>
              {mutation.error instanceof ApiError ? mutation.error.message : '변경에 실패했어요. 다시 시도해주세요.'}
            </ErrorText>
          )}
        </div>

        <ButtonPrimary type="submit" disabled={!nickname.trim() || mutation.isPending}>
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