// TODO: 주차별 설정 결과가 BudgetSetting/Analysis에 반영되지 않음
//       전역 예산 상태 또는 API 연동 후 해결 필요

import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { AuthTitle, FormColumn, ButtonPrimary } from '../../styles/auth.styles';
import { DUMMY_BUDGET } from '../../mocks/budget';

const WEEK_STEP = 5000;

export default function BudgetWeekly() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { total?: number; backTo?: string } | null;
  const total = state?.total ?? DUMMY_BUDGET.total;
  const backTo = state?.backTo ?? '/budget';

  const [weeks, setWeeks] = useState<number[]>(() => {
    const base = Math.floor(total / 4 / WEEK_STEP) * WEEK_STEP;
    const amounts = [base, base, base, base];
    amounts[3] += total - base * 4;
    return amounts;
  });

  const allocated = weeks.reduce((sum, w) => sum + w, 0);
  const remaining = total - allocated;
  const canSave = remaining === 0;

  const updateWeek = (idx: number, value: number) => {
    setWeeks((prev) => prev.map((w, i) => (i === idx ? Math.max(0, value) : w)));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    // TODO: PATCH /budget/weeks { total, weeks }
    console.log('PATCH /budget/weeks', { total, weeks });
    navigate('/budget');
  };

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
        </div>

        <ButtonPrimary type="submit" disabled={!canSave}>
          저장하기
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
