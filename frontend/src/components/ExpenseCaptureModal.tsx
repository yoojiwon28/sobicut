import { useMemo, useState } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import DateTimePickerField from './DateTimePickerField';
import { CATEGORY_OPTIONS } from '../utils/category';
import { classifyCategory } from '../utils/classifyCategory';
import { parseSpendingText } from '../utils/parseSpendingText';
import { formatSlashDateTime } from '../utils/date';
import angleRightIcon from '../assets/images/angle_right.svg';

type PlanTag = 'IMPULSIVE' | 'DELIBERATE';
type ContextTag = 'STRESS' | 'NO_COMPARE' | 'LONG_VALUE';

const PLAN_OPTIONS: { value: PlanTag; label: string }[] = [
  { value: 'IMPULSIVE', label: '아니요\n바로 샀어요' },
  { value: 'DELIBERATE', label: '네\n고민하고 샀어요' },
];

const CONTEXT_OPTIONS: { value: ContextTag; label: string }[] = [
  { value: 'STRESS', label: '스트레스 받아서' },
  { value: 'NO_COMPARE', label: '비교 안 하고' },
  { value: 'LONG_VALUE', label: '오래 쓸 소비' },
];

type Step = 'confirm' | 'edit' | 'emotion';

type ExpenseCaptureModalProps = {
  rawText: string;
  onClose: () => void;
};

export default function ExpenseCaptureModal({ rawText, onClose }: ExpenseCaptureModalProps) {
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
  const [planTag, setPlanTag] = useState<PlanTag | null>(null);
  const [contextTags, setContextTags] = useState<ContextTag[]>([]);

  const toggleContextTag = (tag: ContextTag) => {
    setContextTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const record = () => {
    // TODO: 실제 API 연동
    console.log({ planTag, contextTags });
    onClose();
  };

  if (step === 'emotion') {
    return (
      <Modal>
        <StepCard>
          <TagTitle>이 소비, 어떤 소비였나요?</TagTitle>

          <QuestionLabel>이 소비 미리 계획했나요?</QuestionLabel>
          <PlanGrid>
            {PLAN_OPTIONS.map((option) => (
              <PlanOption
                key={option.value}
                type="button"
                $active={planTag === option.value}
                onClick={() => setPlanTag(option.value)}
              >
                {option.label}
              </PlanOption>
            ))}
          </PlanGrid>

          <QuestionDivider>
            <QuestionLabelRow>
              <QuestionLabelText>이 소비는…</QuestionLabelText>
              <MultiSelectHint>복수 선택</MultiSelectHint>
            </QuestionLabelRow>
            <ContextChipList>
              {CONTEXT_OPTIONS.map((option) => {
                const active = contextTags.includes(option.value);
                return (
                  <ContextChip
                    key={option.value}
                    type="button"
                    $active={active}
                    onClick={() => toggleContextTag(option.value)}
                  >
                    {active && (
                      <CheckIcon viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M2.5 6.5L5 9L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </CheckIcon>
                    )}
                    {option.label}
                  </ContextChip>
                );
              })}
            </ContextChipList>
          </QuestionDivider>

          <RecordButton type="button" disabled={planTag === null} onClick={record}>
            기록 완료
          </RecordButton>
          <SkipButton type="button" onClick={onClose}>
            나중에 태그할게요
          </SkipButton>
        </StepCard>

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
  color: #a0a0a0;
  font-size: 11px;
  text-align: center;
  margin-top: 8px;
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
  margin-top: 20px;
  padding: 11px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  background: #6a5ce6;
  color: #fff;
  font-weight: 500;
  cursor: pointer;

  &:disabled {
    background: #f0f0f0;
    color: #bdbdbd;
    font-weight: 400;
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

const StepCard = styled.div`
  padding: 18px 16px 14px;
`;

const TagTitle = styled.h2`
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 16px;
`;

const QuestionLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const QuestionLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const QuestionLabelText = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

const MultiSelectHint = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: #a0a0a0;
`;

const QuestionDivider = styled.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
  margin-top: 16px;
`;

const PlanGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const PlanOption = styled.button<{ $active: boolean }>`
  padding: 10px 8px;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
  line-height: 1.4;
  white-space: pre-line;
  cursor: pointer;
  border: ${({ $active }) => ($active ? '1.5px solid #6A5CE6' : '1px solid #E5E5E5')};
  background: ${({ $active }) => ($active ? '#E2DEFF' : '#FFFFFF')};
  color: ${({ $active }) => ($active ? '#3C3489' : '#767676')};
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
`;

const ContextChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const ContextChip = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  border: ${({ $active }) => ($active ? '1.5px solid #6A5CE6' : '1px solid #E5E5E5')};
  background: ${({ $active }) => ($active ? '#E2DEFF' : '#FFFFFF')};
  color: ${({ $active }) => ($active ? '#3C3489' : '#767676')};
  font-weight: ${({ $active }) => ($active ? 500 : 400)};
`;

const CheckIcon = styled.svg`
  width: 12px;
  height: 12px;
  margin-right: 3px;
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

