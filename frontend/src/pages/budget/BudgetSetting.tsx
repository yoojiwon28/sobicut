import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import {
  AuthTitle,
  FormColumn,
  ButtonPrimary,
  Field,
  Label,
  Spinner,
  PageSpinnerWrap,
} from '../../styles/auth.styles';
import {
  BUDGET_QUERY_KEY,
  getBudget,
  updateBudget,
  calcEvenWeekly,
  toWeeklyArray,
  toWeeklyBudgets,
  isCustomWeekly,
  type Budget,
} from '../../api/budget';
import { ApiError } from '../../api/client';
import { formatWon } from '../../utils/currency';
import type { BudgetDistribution } from '../../types/budget';

const TOTAL_STEP = 10000;
const TOTAL_MAX = 2000000;
// 또래 평균 예산: 예산 API에 포함되지 않는 값이라 표시용 상수로 유지
const PEER_AVERAGE = 700000;

export default function BudgetSetting() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const fromParam = searchParams.get('from');
  const backTo = fromParam ? decodeURIComponent(fromParam) : '/mypage';

  const { data: budget, isLoading, isError, error } = useQuery({
    queryKey: BUDGET_QUERY_KEY,
    queryFn: getBudget,
  });

  const [total, setTotal] = useState(0);
  const [distribution, setDistribution] = useState<BudgetDistribution>('equal');

  // 조회 데이터 도착 시 1회만 초기화 (사용자가 직접 바꾼 선택은 덮어쓰지 않는다)
  const seededRef = useRef(false);
  useEffect(() => {
    if (!budget || seededRef.current) return;
    seededRef.current = true;
    setTotal(budget.monthly_budget);
    setDistribution(isCustomWeekly(budget.weekly_budgets) ? 'custom' : 'equal');
  }, [budget]);

  const mutation = useMutation({
    mutationFn: (payload: Budget) => updateBudget(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigate(backTo);
    },
  });

  const equalWeekAmount = calcEvenWeekly(total);
  const totalPercent = Math.min(100, Math.max(0, (total / TOTAL_MAX) * 100));

  const handleSelectCustom = () => {
    setDistribution('custom');
    navigate('/budget/weekly', { state: { backTo } });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (distribution === 'custom' || !budget) return;
    mutation.mutate({
      ...budget,
      monthly_budget: total,
      weekly_budget: calcEvenWeekly(total),
      weekly_budgets: toWeeklyBudgets(toWeeklyArray(budget.weekly_budgets).map(() => 0)),
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
          <AuthTitle $size={20}>예산 설정</AuthTitle>
          <ErrorText>
            {error instanceof ApiError ? error.message : '예산 정보를 불러오지 못했어요. 다시 시도해주세요.'}
          </ErrorText>
        </div>
      </FormColumn>
    );
  }

  const totalDigits = String(Math.round(total)).length;

  return (
    <Form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to={backTo} />
          <AuthTitle $size={20}>예산 설정</AuthTitle>
          <TitleDivider />

          <Field>
            <Label>나의 이번 달 총 예산</Label>
            <TotalDisplay $digits={totalDigits}>
              <TotalAmount>{formatWon(total)}</TotalAmount>
              <TotalUnit>원</TotalUnit>
            </TotalDisplay>
            <SliderWrap>
              <SliderValue $percent={totalPercent}>{formatWon(total)}원</SliderValue>
              <Slider
                type="range"
                min={0}
                max={TOTAL_MAX}
                step={TOTAL_STEP}
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #C0B8FF ${totalPercent}%, #E9E9E9 ${totalPercent}%)`,
                }}
              />
            </SliderWrap>
            <PeerText>나의 또래 친구들은 평균 {formatWon(PEER_AVERAGE)}원으로 설정했어요</PeerText>
          </Field>

          <Field>
            <Label>주차별 예산 설정</Label>
            <OptionCard type="button" $active={distribution === 'equal'} onClick={() => setDistribution('equal')}>
              <Radio $active={distribution === 'equal'} />
              <OptionText>
                <OptionTitle>4주 균등 배분</OptionTitle>
                <OptionSub>{formatWon(equalWeekAmount)}원씩 자동으로 설정돼요</OptionSub>
              </OptionText>
            </OptionCard>
            <OptionCard type="button" $active={distribution === 'custom'} onClick={handleSelectCustom}>
              <Radio $active={distribution === 'custom'} />
              <OptionText>
                <OptionTitle>직접 설정하기</OptionTitle>
              </OptionText>
            </OptionCard>
          </Field>

          {mutation.isError && (
            <ErrorText>
              {mutation.error instanceof ApiError
                ? mutation.error.message
                : '변경에 실패했어요. 다시 시도해주세요.'}
            </ErrorText>
          )}
        </div>

        <ButtonPrimary type="submit" disabled={distribution === 'custom' || mutation.isPending}>
          {mutation.isPending ? (
            <Spinner $size={18} $color="#fff" $trackColor="rgba(255,255,255,0.4)" />
          ) : (
            '변경하기'
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

const TotalDisplay = styled.div<{ $digits: number }>`
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8px;
  max-width: 100%;
  font-weight: 800;
  /* 자릿수가 늘어나면 잘리는 대신 한 단계씩 작아진다 */
  font-size: ${({ $digits }) => ($digits >= 11 ? 18 : $digits >= 9 ? 22 : 26)}px;
  background: #fff;
  border: 2px solid #6a5ce6;
  border-radius: 10px;
  padding: 16px 20px;
  word-break: keep-all;
`;

const TotalAmount = styled.span`
  overflow-wrap: anywhere;
`;

const TotalUnit = styled.span`
  flex-shrink: 0;
  font-size: 0.7em;
`;

const SliderWrap = styled.div`
  position: relative;
  /* 입력창 하단 → 값 라벨(16px) → 라벨 높이(14px) → 슬라이더(10px) = 40px */
  margin-top: 40px;
`;

const Slider = styled.input`
  display: block;
  width: 100%;
  height: 12px;
  margin: 0;
  border-radius: 999px;
  border: none;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;

  &::-webkit-slider-runnable-track {
    height: 12px;
    border-radius: 999px;
    border: none;
  }

  &::-moz-range-track {
    height: 12px;
    border-radius: 999px;
    border: none;
    background: transparent;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    margin-top: -6px;
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

const SliderValue = styled.div<{ $percent: number }>`
  position: absolute;
  /* 라벨 하단이 슬라이더 상단에서 10px 위 (라벨 높이 14px 포함) */
  top: -24px;
  /* 라벨의 왼쪽 끝(0%)~오른쪽 끝(100%)이 항상 슬라이더 폭 안에 머물게 한다 */
  left: ${({ $percent }) => $percent}%;
  transform: translateX(-${({ $percent }) => $percent}%);
  max-width: 100%;
  font-size: 14px;
  line-height: 1;
  font-weight: 800;
  color: #222;
  white-space: nowrap;
`;

const PeerText = styled.p`
  max-width: 100%;
  font-size: 13px;
  color: #888;
  margin: 10px 0 0;
  text-align: right;
  word-break: keep-all;
`;

const OptionCard = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid ${({ $active }) => ($active ? '#6a5ce6' : '#D9D5F5')};
  border-radius: 12px;
  background: #fff;
  padding: 18px 18px;
  cursor: pointer;
  text-align: left;

  & + & {
    margin-top: 10px;
  }
`;

const Radio = styled.span<{ $active: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid ${({ $active }) => ($active ? '#6a5ce6' : '#ccc')};
  position: relative;

  &::after {
    content: '';
    display: ${({ $active }) => ($active ? 'block' : 'none')};
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: #6a5ce6;
  }
`;

const OptionText = styled.div``;

const OptionTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const OptionSub = styled.div`
  font-size: 13px;
  color: #888;
  margin-top: 4px;
`;
