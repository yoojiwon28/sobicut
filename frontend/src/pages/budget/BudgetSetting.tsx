import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { AuthTitle, FormColumn, ButtonPrimary, Field, Label } from '../../styles/auth.styles';
import { DUMMY_BUDGET } from '../../mocks/budget';
import type { BudgetDistribution } from '../../types/budget';

const TOTAL_STEP = 10000;
const TOTAL_MAX = 2000000;
const WEEK_ROUND = 1000;

export default function BudgetSetting() {
  const navigate = useNavigate();
  const [total, setTotal] = useState(DUMMY_BUDGET.total);
  const [distribution, setDistribution] = useState<BudgetDistribution>(DUMMY_BUDGET.distribution);

  const equalWeekAmount = Math.floor(total / 4 / WEEK_ROUND) * WEEK_ROUND;
  const totalPercent = (total / TOTAL_MAX) * 100;

  const handleSelectCustom = () => {
    setDistribution('custom');
    navigate('/budget/weekly', { state: { total } });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (distribution === 'custom') return;
    // TODO: PATCH /budget { total, distribution: 'equal' }
    console.log('PATCH /budget', { total, distribution: 'equal' });
    navigate('/mypage');
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to="/mypage" />
          <AuthTitle $size={20}>예산 설정</AuthTitle>

          <Field>
            <Label>나의 이번 달 총 예산</Label>
            <TotalDisplay>{total.toLocaleString()}원</TotalDisplay>
            <Slider
              type="range"
              min={0}
              max={TOTAL_MAX}
              step={TOTAL_STEP}
              value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #6a5ce6 ${totalPercent}%, #ececec ${totalPercent}%)`,
              }}
            />
            <SliderValue>{total.toLocaleString()}원</SliderValue>
            <PeerText>나의 또래 친구들은 평균 {DUMMY_BUDGET.peerAverage.toLocaleString()}원으로 설정했어요</PeerText>
          </Field>

          <Field>
            <Label>주차별 예산 설정</Label>
            <OptionCard type="button" $active={distribution === 'equal'} onClick={() => setDistribution('equal')}>
              <Radio $active={distribution === 'equal'} />
              <OptionText>
                <OptionTitle>4주 균등 배분</OptionTitle>
                <OptionSub>{equalWeekAmount.toLocaleString()}원씩 자동으로 설정돼요</OptionSub>
              </OptionText>
            </OptionCard>
            <OptionCard type="button" $active={distribution === 'custom'} onClick={handleSelectCustom}>
              <Radio $active={distribution === 'custom'} />
              <OptionText>
                <OptionTitle>직접 설정하기</OptionTitle>
              </OptionText>
            </OptionCard>
          </Field>
        </div>

        <ButtonPrimary type="submit" disabled={distribution === 'custom'}>
          변경하기
        </ButtonPrimary>
      </FormColumn>
    </form>
  );
}

const TotalDisplay = styled.div`
  font-size: 24px;
  font-weight: 800;
  text-align: right;
  background: #f4f2fc;
  border-radius: 12px;
  padding: 14px 16px;
`;

const Slider = styled.input`
  width: 100%;
  margin-top: 12px;
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
    width: 20px;
    height: 20px;
    margin-top: -6px;
    border-radius: 50%;
    border: none;
    background: #6a5ce6;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: #6a5ce6;
    cursor: pointer;
  }
`;

const SliderValue = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 2px;
`;

const PeerText = styled.p`
  font-size: 12px;
  color: #888;
  margin: 12px 0 0;
`;

const OptionCard = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 2px solid ${({ $active }) => ($active ? '#6a5ce6' : '#ececec')};
  border-radius: 12px;
  background: #fff;
  padding: 14px 16px;
  cursor: pointer;
  text-align: left;

  & + & {
    margin-top: 10px;
  }
`;

const Radio = styled.span<{ $active: boolean }>`
  width: 18px;
  height: 18px;
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
  font-size: 14px;
  font-weight: 700;
`;

const OptionSub = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 4px;
`;
