import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Modal from './Modal';
import DateTimePickerField from './DateTimePickerField';
import EmotionDonutChart from './EmotionDonutChart';
import { CATEGORY_OPTIONS } from '../utils/category';
import { classifyCategory } from '../utils/classifyCategory';
import { parseSpendingText } from '../utils/parseSpendingText';
import { formatSlashDateTime } from '../utils/date';
import { EMOTION_ROWS, EMOTION_MESSAGES, POSITIVE_EMOTIONS, buildEmotionSegments } from '../utils/emotion';
import { DUMMY_EMOTION_BASE_STATS } from '../mocks/emotion';
import type { EmotionKey } from '../types/emotion';
import angleRightIcon from '../assets/images/angle_right.svg';

type Step = 'confirm' | 'edit' | 'emotion' | 'result';

type ExpenseCaptureModalProps = {
  rawText: string;
  onClose: () => void;
};

export default function ExpenseCaptureModal({ rawText, onClose }: ExpenseCaptureModalProps) {
  const navigate = useNavigate();
  const parsed = useMemo(() => parseSpendingText(rawText), [rawText]);
  const suggestedCategory = useMemo(
    () => (parsed.merchant ? classifyCategory(parsed.merchant) : CATEGORY_OPTIONS[0]),
    [parsed.merchant],
  );

  const [step, setStep] = useState<Step>('confirm');
  const [amount, setAmount] = useState(String(parsed.amount ?? ''));
  const [merchant, setMerchant] = useState(parsed.merchant ?? '');
  const [date, setDate] = useState(parsed.date ?? '');
  const [time, setTime] = useState(parsed.time ?? '');
  const [category, setCategory] = useState(suggestedCategory);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionKey | null>(null);

  const record = (emotion?: EmotionKey) => {
    // POST /transactions
    // TODO: 실제 API 연동
    console.log('POST /transactions', {
      amount: Number(amount),
      type: 'expense',
      category,
      merchant,
      transaction_date: date,
      transaction_time: time,
      emotion_tag: emotion,
    });
    setStep('result');
  };

  if (step === 'result' && selectedEmotion) {
    const segments = buildEmotionSegments({
      ...DUMMY_EMOTION_BASE_STATS,
      [selectedEmotion]: (DUMMY_EMOTION_BASE_STATS[selectedEmotion] ?? 0) + 1,
    });
    const dominant = segments[0]?.key ?? selectedEmotion;

    return (
      <Modal onClose={onClose}>
        <EmotionDonutChart segments={segments} />
        <ResultLabel>나는 요즘</ResultLabel>
        <ResultMessage>{EMOTION_MESSAGES[dominant]}</ResultMessage>
        <ReportLink
          type="button"
          onClick={() => {
            onClose();
            navigate('/analysis/report');
          }}
        >
          나의 소비 패턴 바로보기
        </ReportLink>
      </Modal>
    );
  }

  if (step === 'emotion') {
    return (
      <Modal>
        <Title>이 소비를 부른 감정을 골라봐요</Title>

        <EmotionGrid>
          {EMOTION_ROWS.map((row) => (
            <EmotionRow key={row.positive}>
              {[row.positive, row.negative].map((emotion) => (
                <EmotionButton
                  key={emotion}
                  type="button"
                  $positive={POSITIVE_EMOTIONS.has(emotion)}
                  $active={selectedEmotion === emotion}
                  onClick={() => setSelectedEmotion(emotion)}
                >
                  {emotion}
                </EmotionButton>
              ))}
            </EmotionRow>
          ))}
        </EmotionGrid>

        <RecordButton type="button" disabled={!selectedEmotion} onClick={() => record(selectedEmotion ?? undefined)}>
          기록 완료
        </RecordButton>
        <SkipButton type="button" onClick={() => record()}>
          나중에 태그할게요
        </SkipButton>

        <StepProgress step={2} />
      </Modal>
    );
  }

  if (step === 'edit') {
    return (
      <Modal>
        <Title>새로운 결제 포착!</Title>
        <Divider />

        <InlineFieldList>
          <InlineField>
            <InlineLabel>가맹점</InlineLabel>
            <InlineInput value={merchant} onChange={(e) => setMerchant(e.target.value)} />
          </InlineField>

          <InlineField>
            <InlineLabel>날짜</InlineLabel>
            <InlineDateWrap>
              <DateTimePickerField
                date={date}
                time={time}
                onChange={(d, t) => {
                  setDate(d);
                  setTime(t);
                }}
              />
            </InlineDateWrap>
          </InlineField>

          <InlineField>
            <InlineLabel>금액</InlineLabel>
            <InlineInput
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </InlineField>
        </InlineFieldList>

        <CategoryField>
          <CategoryLabel>카테고리</CategoryLabel>
          <SelectFieldWrap>
            <CategorySelect value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </CategorySelect>
            <ChevronIcon src={angleRightIcon} alt="" width={16} height={16} />
          </SelectFieldWrap>
        </CategoryField>

        <ButtonRow>
          <OutlineButton type="button" onClick={() => setStep('confirm')}>
            취소
          </OutlineButton>
          <PrimaryButton type="button" onClick={() => setStep('emotion')}>
            수정 완료
          </PrimaryButton>
        </ButtonRow>

        <StepProgress step={1} />
      </Modal>
    );
  }

  return (
    <Modal>
      <Title>새로운 결제 포착!</Title>
      <Divider />

      <Amount>{Number(amount || 0).toLocaleString()}원</Amount>

      <InfoRow>
        <InfoLabel>가맹점</InfoLabel>
        <InfoValue>{merchant || '-'}</InfoValue>
      </InfoRow>
      <InfoRow>
        <InfoLabel>날짜</InfoLabel>
        <InfoValue>{date && time ? formatSlashDateTime(date, time) : '-'}</InfoValue>
      </InfoRow>
      <InfoRow>
        <InfoLabel>카드</InfoLabel>
        <InfoValue>{parsed.card || '-'}</InfoValue>
      </InfoRow>

      <CategoryBadgeWrap>
        <CategoryBadge>{category}로 자동 분류</CategoryBadge>
      </CategoryBadgeWrap>

      <ButtonRow>
        <OutlineButton type="button" onClick={() => setStep('edit')}>
          수정하기
        </OutlineButton>
        <PrimaryButton type="button" onClick={() => setStep('emotion')}>
          맞아요
        </PrimaryButton>
      </ButtonRow>

      <StepProgress step={1} />
    </Modal>
  );
}

function StepProgress({ step }: { step: 1 | 2 }) {
  return (
    <ProgressWrap>
      <ProgressBar>
        <ProgressFill $percent={step === 1 ? 50 : 100} />
      </ProgressBar>
      <ProgressLabel>{step}/2</ProgressLabel>
    </ProgressWrap>
  );
}

const Title = styled.h2`
  font-size: 17px;
  font-weight: 700;
  text-align: center;
  color: #6a5ce6;
  margin: 4px 0 14px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 0 0 18px;
`;

const Amount = styled.div`
  font-size: 28px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 6px 0;
`;

const InfoLabel = styled.span`
  color: #888;
  font-weight: 600;
`;

const InfoValue = styled.span`
  font-weight: 700;
`;

const CategoryBadgeWrap = styled.div`
  text-align: center;
  margin: 18px 0 20px;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid #d8d3f5;
  color: #6a5ce6;
  font-size: 12px;
  font-weight: 700;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const PrimaryButton = styled.button`
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: #6a5ce6;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OutlineButton = styled.button`
  flex: 1;
  height: 48px;
  border: 2px solid #6a5ce6;
  border-radius: 12px;
  background: #fff;
  color: #6a5ce6;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
`;

const SkipButton = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  text-decoration: underline;
  color: #888;
  font-size: 13px;
  text-align: center;
  padding: 14px 0 0;
  cursor: pointer;
`;

const InlineFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
`;

const InlineField = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InlineLabel = styled.label`
  flex: 0 0 64px;
  width: 64px;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const InlineInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
`;

const InlineDateWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

const CategoryField = styled.div`
  margin-bottom: 18px;
`;

const CategoryLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const CategorySelect = styled.select`
  width: 100%;
  height: 36px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  padding: 0 10px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  appearance: none;
  `;
  
const RecordButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background: #fff;
  color: #6a5ce6;
  border: 2px solid #6a5ce6;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const SelectFieldWrap = styled.div`
  position: relative;
`;

const ChevronIcon = styled.img`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  pointer-events: none;
`;

const EmotionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const EmotionRow = styled.div`
  display: flex;
  gap: 10px;
`;

const EmotionButton = styled.button<{ $positive: boolean; $active: boolean }>`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  border: 2px solid transparent;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: ${({ $positive }) => ($positive ? '#E7E4FA' : '#FF8A80')};
  color: ${({ $positive }) => ($positive ? '#4B3FBF' : '#fff')};
  border-color: ${({ $active, $positive }) => ($active ? ($positive ? '#6A5CE6' : '#E64545') : 'transparent')};
  transition: border-color 0.15s ease;
`;

const ProgressWrap = styled.div`
  margin-top: 18px;
  text-align: center;
`;

const ProgressBar = styled.div`
  height: 6px;
  border-radius: 999px;
  background: #e5e1fb;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: #6a5ce6;
  border-radius: 999px;
  transition: width 0.2s ease;
`;

const ProgressLabel = styled.div`
  margin-top: 6px;
  font-size: 11px;
  color: #999;
`;

const ResultLabel = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #6a5ce6;
  margin: 24px 0 8px;
`;

const ResultMessage = styled.div`
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  border: 2px solid #e0ddf7;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
`;

const ReportLink = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  text-decoration: underline;
  color: #444;
  font-size: 13px;
  text-align: center;
  cursor: pointer;
`;
