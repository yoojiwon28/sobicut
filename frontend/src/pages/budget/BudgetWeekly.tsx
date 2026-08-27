import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import {
  AuthTitle,
  FormColumn,
  ButtonPrimary,
  Spinner,
  PageSpinnerWrap,
} from '../../styles/auth.styles';
import {
  BUDGET_QUERY_KEY,
  getBudget,
  updateBudget,
  resolveWeekly,
  toWeeklyBudgets,
  type Budget,
} from '../../api/budget';
import { ApiError } from '../../api/client';

const WEEK_STEP = 5000;

export default function BudgetWeekly() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { backTo?: string } | null;
  const backTo = state?.backTo ?? '/budget';
  const queryClient = useQueryClient();

  const { data: budget, isLoading, isError, error } = useQuery({
    queryKey: BUDGET_QUERY_KEY,
    queryFn: getBudget,
  });

  const [weeks, setWeeks] = useState<number[]>([]);

  useEffect(() => {
    if (budget) setWeeks(resolveWeekly(budget.weekly_budgets, budget.weekly_budget));
  }, [budget]);

  const mutation = useMutation({
    mutationFn: (payload: Budget) => updateBudget(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigate('/budget');
    },
  });

  const total = budget?.monthly_budget ?? 0;
  const allocated = weeks.reduce((sum, w) => sum + w, 0);
  const remaining = total - allocated;
  const canSave = weeks.length > 0 && remaining === 0;

  const updateWeek = (idx: number, value: number) => {
    setWeeks((prev) => prev.map((w, i) => (i === idx ? Math.max(0, value) : w)));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSave || !budget) return;
    mutation.mutate({
      ...budget,
      monthly_budget: budget.monthly_budget,
      weekly_budget: budget.weekly_budget,
      weekly_budgets: toWeeklyBudgets(weeks),
    });
  };

  if (isLoading) {
    return (
      <FormColumn>
        <PageSpinnerWrap>
          <Spinner />
        </PageSpinnerWrap>
      </FormColumn>
    );
  }

  if (isError || !budget) {
    return (
      <FormColumn>
        <div>
          <BackButton to={backTo} />
          <AuthTitle $size={20}>주차별 예산 직접 설정</AuthTitle>
          <ErrorText>
            {error instanceof ApiError ? error.message : '예산 정보를 불러오지 못했어요. 다시 시도해주세요.'}
          </ErrorText>
        </div>
      </FormColumn>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to={backTo} />
          <AuthTitle $size={20}>주차별 예산 직접 설정</AuthTitle>
          <TitleDivider />

          <RemainingBox>
            <RemainingLabel>남은 예산</RemainingLabel>
            <RemainingValue>
              {remaining.toLocaleString()}/ 총 {total.toLocaleString()} 원
            </RemainingValue>
            <RemainingHint>남은 금액을 모두 배분해야 저장이 가능해요</RemainingHint>
          </RemainingBox>

          {weeks.map((amount, idx) => (
            <WeekField key={idx}>
              <WeekLabel>{idx + 1}주차</WeekLabel>
              <WeekRow>
                <WeekValueRow>
                  <WeekBracket>[</WeekBracket>
                  <WeekInput
                    type="number"
                    step={WEEK_STEP}
                    value={amount}
                    onChange={(e) => updateWeek(idx, Number(e.target.value))}
                  />
                  <WeekBracket>]</WeekBracket>
                  <WeekUnit>원</WeekUnit>
                </WeekValueRow>
                <WeekSlider
                  type="range"
                  min={0}
                  max={total}
                  step={WEEK_STEP}
                  value={amount}
                  onChange={(e) => updateWeek(idx, Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #C0B8FF ${total > 0 ? (amount / total) * 100 : 0}%, #C0B8FF ${total > 0 ? (amount / total) * 100 : 0}%)`,
                  }}
                />
              </WeekRow>
            </WeekField>
          ))}

          {mutation.isError && (
            <ErrorText>
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : '저장에 실패했어요. 다시 시도해주세요.'}
            </ErrorText>
          )}
        </div>

        <ButtonPrimary type="submit" disabled={!canSave || mutation.isPending}>
          {mutation.isPending ? (
            <Spinner $size={18} $color="#fff" $trackColor="rgba(255,255,255,0.4)" />
          ) : (
            '저장하기'
          )}
        </ButtonPrimary>
      </FormColumn>
    </form>
  );
}

const TitleDivider = styled.div`
  border-bottom: 1px solid #edeafb;
  margin: 0 0 24px;
  padding-bottom: 14px;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  text-align: center;
  margin: 8px 0 0;
`;

const RemainingBox = styled.div`
  margin-bottom: 30px;
`;

const RemainingLabel = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #222;
  text-align: left;
`;

const RemainingValue = styled.div`
  font-size: 22px;
  font-weight: 800;
  text-align: right;
  margin-top: 8px;
`;

const RemainingHint = styled.div`
  font-size: 15px;
  color: #bbb;
  margin-top: 10px;
  text-align: left;
`;

const WeekField = styled.div`
  margin-bottom: 22px;
`;

const WeekLabel = styled.div`
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 6px;
`;

const WeekRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const WeekValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
`;

const WeekBracket = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #222;
`;

const WeekInput = styled.input`
  width: 110px;
  border: none;
  background: none;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
  padding: 4px 0;
  outline: none;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

const WeekUnit = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #222;
  flex-shrink: 0;
`;

const WeekSlider = styled.input`
  flex: 1;
  height: 14px;
  border-radius: 999px;
  border: none;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;

  &::-webkit-slider-runnable-track {
    height: 14px;
    border-radius: 999px;
    border: none;
  }

  &::-moz-range-track {
    height: 14px;
    border-radius: 999px;
    border: none;
    background: transparent;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    margin-top: -5px;
    border-radius: 50%;
    border: none;
    background: #6a5ce6;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background: #6a5ce6;
    cursor: pointer;
  }
`;
