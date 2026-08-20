import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { AuthTitle, Field, Label, Input, FormColumn, ButtonPrimary } from '../../styles/auth.styles';
import { getSettings, updateIncomeLevel } from '../../api/users';
import { mapIncomeToLevel, levelToIncome } from '../../utils/income';
import { ApiError } from '../../api/client';

export default function EditIncome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['users', 'me', 'settings'],
    queryFn: getSettings,
  });

  const [income, setIncome] = useState(0);
  const [manualIncome, setManualIncome] = useState(false);

  useEffect(() => {
    if (settings) setIncome(levelToIncome(settings.income_level));
  }, [settings]);

  const mutation = useMutation({
    mutationFn: () => updateIncomeLevel(mapIncomeToLevel(income)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me', 'settings'] });
      navigate('/mypage/edit');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to="/mypage/edit" />
          <AuthTitle $size={20}>소득 구간 변경</AuthTitle>
          <Intro>바뀐 나의 소득을 입력해주세요</Intro>

          <Field>
            <Label>소득구간 (월별)</Label>
            {manualIncome ? (
              <Input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
            ) : (
              <>
                <IncomeSlider
                  type="range"
                  min={0}
                  max={200}
                  step={5}
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                />
                <IncomeSliderLabels>
                  <span>0</span>
                  <span>100만 원</span>
                  <span>200만 원</span>
                </IncomeSliderLabels>
              </>
            )}
            <IncomeRow>
              <IncomeManualLink type="button" onClick={() => setManualIncome((v) => !v)}>
                직접 입력
              </IncomeManualLink>
              <IncomeValue>{income}만 원</IncomeValue>
            </IncomeRow>
          </Field>

          {mutation.isError && (
            <ErrorText>
              {mutation.error instanceof ApiError ? mutation.error.message : '변경에 실패했어요. 다시 시도해주세요.'}
            </ErrorText>
          )}
        </div>

        <ButtonPrimary type="submit" disabled={mutation.isPending}>
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

const IncomeSlider = styled.input`
  width: 100%;
  accent-color: #6a5ce6;
  margin-top: 12px;
`;

const IncomeSliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
`;

const IncomeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const IncomeManualLink = styled.button`
  background: none;
  border: none;
  text-decoration: underline;
  color: #444;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
`;

const IncomeValue = styled.span`
  background: #6a5ce6;
  color: #fff;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  text-align: center;
  margin: 8px 0 0;
`;