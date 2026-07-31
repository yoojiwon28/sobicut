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
  const total = (location.state as { total?: number } | null)?.total ?? DUMMY_BUDGET.total;

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
          <BackButton to="/budget" />
          <AuthTitle $size={20}>주차별 예산 직접 설정</AuthTitle>

          <RemainingBox>
            <RemainingLabel>남은 예산</RemainingLabel>
            <RemainingValue>
              {remaining.toLocaleString()}/ 총 {total.toLocaleString()}원
            </RemainingValue>
            <RemainingHint>남은 금액을 모두 배분해야 저장이 가능해요</RemainingHint>
          </RemainingBox>

          {weeks.map((amount, idx) => (
            <WeekField key={idx}>
              <WeekLabel>{idx + 1}주차</WeekLabel>
              <WeekValueRow>
                <WeekInput
                  type="number"
                  step={WEEK_STEP}
                  value={amount}
                  onChange={(e) => updateWeek(idx, Number(e.target.value))}
                />
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
                  background: `linear-gradient(to right, #6a5ce6 ${total > 0 ? (amount / total) * 100 : 0}%, #ececec ${total > 0 ? (amount / total) * 100 : 0}%)`,
                }}
              />
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

const RemainingBox = styled.div`
  background: #f4f2fc;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 24px;
`;

const RemainingLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #555;
`;

const RemainingValue = styled.div`
  font-size: 20px;
  font-weight: 800;
  margin-top: 6px;
`;

const RemainingHint = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 6px;
`;

const WeekField = styled.div`
  margin-bottom: 20px;
`;

const WeekLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
`;

const WeekValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 6px;
`;

const WeekInput = styled.input`
  width: 100%;
  border: none;
  border-bottom: 2px solid #ececec;
  background: none;
  font-size: 18px;
  font-weight: 700;
  padding: 4px 0;
  outline: none;

  &:focus {
    border-color: #6a5ce6;
  }
`;

const WeekUnit = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #444;
  flex-shrink: 0;
`;

const WeekSlider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 999px;
  border: none;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;

  &::-webkit-slider-runnable-track {
    height: 8px;
    border-radius: 999px;
    border: none;
  }

  &::-moz-range-track {
    height: 8px;
    border-radius: 999px;
    border: none;
    background: transparent;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    margin-top: -5px;
    border-radius: 50%;
    border: none;
    background: #6a5ce6;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: none;
    background: #6a5ce6;
    cursor: pointer;
  }
`;
