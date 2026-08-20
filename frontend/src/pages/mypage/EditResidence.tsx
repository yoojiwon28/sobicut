import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { AuthTitle, Field, Select, FormColumn, ButtonPrimary } from '../../styles/auth.styles';
import { getSettings, updateResidenceType } from '../../api/users';
import { ApiError } from '../../api/client';

const LIVING_OPTIONS = ['자취', '기숙사', '통학'];

export default function EditResidence() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['users', 'me', 'settings'],
    queryFn: getSettings,
  });

  const [residenceType, setResidenceType] = useState('');

  useEffect(() => {
    if (settings) setResidenceType(settings.residence_type);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () => updateResidenceType(residenceType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me', 'settings'] });
      navigate('/mypage/edit');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!residenceType) return;
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to="/mypage/edit" />
          <AuthTitle $size={20}>거주 형태 변경</AuthTitle>
          <Intro>바뀐 거주 형태를 선택해주세요</Intro>

          <Field>
            <Select value={residenceType} onChange={(e) => setResidenceType(e.target.value)}>
              <option value="">거주 형태를 선택해주세요</option>
              {LIVING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>

          {mutation.isError && (
            <ErrorText>
              {mutation.error instanceof ApiError ? mutation.error.message : '변경에 실패했어요. 다시 시도해주세요.'}
            </ErrorText>
          )}
        </div>

        <ButtonPrimary type="submit" disabled={!residenceType || mutation.isPending}>
          {mutation.isPending ? '변경 중...' : '변경하기'}
        </ButtonPrimary>
      </FormColumn>
    </form>
  );
}

const Intro = styled.p`
  font-size: 14px;
  margin: -12px 0 20px;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  text-align: center;
  margin: 8px 0 0;
`;