import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
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
import { caretPosAfterFormat, formatWon, parseWon } from '../../utils/currency';

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

  // 콤마를 다시 채워 넣은 뒤 커서가 끝으로 튀지 않도록 위치를 복원한다.
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const caretRef = useRef<{ idx: number; digits: number } | null>(null);

  useLayoutEffect(() => {
    const pending = caretRef.current;
    if (!pending) return;
    caretRef.current = null;
    const el = inputsRef.current[pending.idx];
    if (!el) return;
    const pos = caretPosAfterFormat(el.value, pending.digits);
    el.setSelectionRange(pos, pos);
  });

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

  const handleWeekInput = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const caret = el.selectionStart ?? el.value.length;
    const digits = el.value.slice(0, caret).replace(/[^0-9]/g, '').length;
    caretRef.current = { idx, digits };
    updateWeek(idx, parseWon(el.value));
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
    <Form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to={backTo} />
          <AuthTitle $size={20}>주차별 예산 직접 설정</AuthTitle>
          <TitleDivider />

          <RemainingBox>
            <RemainingLabel>남은 예산</RemainingLabel>
            <RemainingValue>
              {formatWon(remaining)} / 총 {formatWon(total)} 원
            </RemainingValue>
            <RemainingHint>남은 금액을 모두 배분해야 저장이 가능해요</RemainingHint>
          </RemainingBox>

          {weeks.map((amount, idx) => (
            <WeekField key={idx}>
              <WeekLabel>{idx + 1}주차</WeekLabel>
              <WeekRow>
                <WeekAmountField>
                  <WeekInput
                    ref={(el) => {
                      inputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    value={amount === 0 ? '' : formatWon(amount)}
                    placeholder="0"
                    onChange={(e) => handleWeekInput(idx, e)}
                  />
                  <WeekUnit>원</WeekUnit>
                </WeekAmountField>
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
    </Form>
  );
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

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
  max-width: 100%;
  /* 자리수가 길어져도 끝의 '원'까지 잘리지 않도록 폭에 맞춰 축소 */
  font-size: clamp(16px, 5.4vw, 22px);
  font-weight: 800;
  text-align: right;
  margin-top: 8px;
  word-break: keep-all;
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
  /* 금액 텍스트 ~ 슬라이더 가로 간격 */
  gap: 12px;
`;

const WeekAmountField = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
`;

const WeekInput = styled.input`
  width: 96px;
  border: none;
  background: none;
  font-size: 18px;
  font-weight: 800;
  text-align: right;
  padding: 0;
  outline: none;
`;

const WeekUnit = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: #222;
  flex-shrink: 0;
`;

const WeekSlider = styled.input`
  flex: 1;
  height: 14px;
  /* UA 기본 margin(2px) 제거해 금액 텍스트와의 간격을 정확히 12px로 */
  margin: 0;
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
