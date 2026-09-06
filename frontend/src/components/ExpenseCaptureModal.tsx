import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Modal from './Modal';
import DateTimePickerField from './DateTimePickerField';
import TagQuestions, { TAG_LABEL, PLAN_TAG_NAMES, CONTEXT_TAG_NAMES } from './TagQuestions';
import { Spinner } from '../styles/auth.styles';
import { CATEGORY_NAMES } from '../constants/categories';
import { useCreateExpense, useParseCardMessage } from '../hooks/useTransactions';
import { useEmotions } from '../hooks/useEmotions';
import { ApiError } from '../api/client';
import { formatSlashDateTime } from '../utils/date';
import angleRightIcon from '../assets/images/angle_right.svg';
import { setTransactionTags } from '../api/transactions';

// Q1 버튼 전용 카피(질문-답변 프레이밍). 태그 표현과 무관한 UI 문구라 TAG_LABEL과 분리한다.
const PLAN_OPTION_COPY: Record<string, string> = {
  즉흥성: '아니요\n바로 샀어요',
  충분한숙고: '네\n고민하고 샀어요',
};

const MOCK_PATTERN: { planning: Record<string, number>; context: Record<string, number> } = {
  planning: { 즉흥성: 70, 충분한숙고: 30 },
  context: { 스트레스: 54, 비교회피: 40, 장기적가치: 11 },
};

type Step = 'confirm' | 'edit' | 'emotion' | 'result';

const pad2 = (n: number) => String(n).padStart(2, '0');
const todayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const nowTime = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

type ExpenseCaptureModalProps = {
  // 감지된 결제 문자 원문. 클립보드를 읽을 수 없을 때의 폴백으로만 쓴다.
  rawText?: string;
  onClose: () => void;
};

export default function ExpenseCaptureModal({ rawText, onClose }: ExpenseCaptureModalProps) {
  const navigate = useNavigate();

  const parseMutation = useParseCardMessage();
  const createMutation = useCreateExpense();
  const { data: emotions = [] } = useEmotions();
  const emotionIdByName = useMemo(
    () => Object.fromEntries(emotions.map((tag) => [tag.name, tag.id])),
    [emotions],
  );

  const [step, setStep] = useState<Step>('confirm');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(todayDate);
  const [time, setTime] = useState(nowTime);
  const [category, setCategory] = useState('');
  const [cardCompany, setCardCompany] = useState(''); // 화면 표시 전용. payload 에 넣지 않는다.
  const [parseError, setParseError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [planTag, setPlanTag] = useState<string | null>(null);
  const [contextTags, setContextTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);

  // 모달이 열릴 때 클립보드 문자를 읽어 파싱한다. 최초 1회만.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let text = '';
      if (rawText && rawText.trim()) {
        // 호출부가 파싱할 원문(클립보드에서 이미 검증된 텍스트)을 넘겨준 경우
        // 클립보드를 다시 읽지 않고 그 원문을 그대로 파싱 대상으로 쓴다.
        text = rawText;
      } else {
        try {
          text = await navigator.clipboard.readText();
        } catch {
          // 클립보드 권한 거부/미지원 → 폴백 원문 사용, 그래도 없으면 빈 폼으로 연다.
          text = rawText ?? '';
        }
      }
      if (!text.trim()) text = rawText ?? '';

      const messageText = text.trim();
      if (cancelled) return;
      if (!messageText) {
        setStep('edit');
        return;
      }

      parseMutation.mutate(messageText, {
        onSuccess: (data) => {
          if (cancelled) return;
          setAmount(String(data.amount));
          setMerchant(data.merchant);
          setDate(data.transaction_date); // 이미 'YYYY-MM-DD' → 변환하지 않는다.
          setTime(data.transaction_time); // 'HH:mm'
          setCardCompany(data.card_company);
          if (data.category) setCategory(data.category); // null 이면 사용자가 직접 선택
        },
        onError: (err) => {
          if (cancelled) return;
          // 파싱 실패(400): 자동 채우기 없이 빈 폼으로 두고 직접 입력하게 한다.
          setParseError(
            err instanceof ApiError ? err.message : '문자를 인식하지 못했어요. 직접 입력해주세요.',
          );
          setStep('edit');
        },
      });
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isParsing = parseMutation.isPending;
  const hasParsedData = parseMutation.isSuccess;
  const categoryMissing = category.trim().length === 0;

  const toggleContextTag = (tag: string) => {
    setContextTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const record = () => {
    if (categoryMissing || createMutation.isPending) return;
    setSubmitError('');

    const tagNames = [planTag, ...contextTags].filter((name): name is string => name !== null);
    const emotionTagIds = tagNames
      .map((name) => emotionIdByName[name])
      .filter((id): id is number => id !== undefined);

    createMutation.mutate(
      {
        payload: {
          amount: Number(amount),
          type: 'expense',
          category,
          merchant: merchant.trim() || undefined,
          transaction_date: date, // parse 응답이 이미 'YYYY-MM-DD'
          transaction_time: time, // 'HH:mm' → createTransaction 이 ':00' 을 붙여 전송
        },
        emotionTagIds,
      },
      {
        onSuccess: async (id) => {
          if (customTags.length > 0) {
            try {
              await setTransactionTags(id, customTags);
            } catch {
              // 커스텀 태그 저장 실패는 기록 자체를 막지 않는다(기록용 부가 정보).
            }
          }
          setStep('result');
        },
        onError: (err) =>
          setSubmitError(
            err instanceof ApiError ? err.message : '기록에 실패했어요. 다시 시도해주세요.',
          ),
      },
    );
  };

  if (step === 'result') {
    return (
      <Modal onClose={onClose}>
        <PatternTitle>이번 달 소비 패턴</PatternTitle>

        <PlanningSection>
          <PlanningDonut
            segments={[
              { percent: MOCK_PATTERN.planning[PLAN_TAG_NAMES[0]], color: '#6A5CE6' },
              { percent: MOCK_PATTERN.planning[PLAN_TAG_NAMES[1]], color: '#C7C1F5' },
            ]}
          />
          <PlanningLegend>
            <SectionLabel>계획성</SectionLabel>
            <LegendRows>
              {PLAN_TAG_NAMES.map((name, index) => (
                <LegendRow key={name}>
                  <LegendDot $color={index === 0 ? '#6A5CE6' : '#C7C1F5'} />
                  <LegendLabel>{TAG_LABEL[name]}</LegendLabel>
                  <LegendPercent>{MOCK_PATTERN.planning[name]}%</LegendPercent>
                </LegendRow>
              ))}
            </LegendRows>
          </PlanningLegend>
        </PlanningSection>

        <ContextSection>
          <ContextSectionLabelRow>
            <SectionLabel>소비 특성</SectionLabel>
            <ContextCaption>(중복 집계)</ContextCaption>
          </ContextSectionLabelRow>
          <BarList>
            {CONTEXT_TAG_NAMES.map((name) => (
              <BarItem key={name}>
                <BarHeader>
                  <BarLabel>{TAG_LABEL[name]}</BarLabel>
                  <BarPercent>{MOCK_PATTERN.context[name]}%</BarPercent>
                </BarHeader>
                <BarTrack>
                  <BarFill $percent={MOCK_PATTERN.context[name]} />
                </BarTrack>
              </BarItem>
            ))}
          </BarList>
        </ContextSection>

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
        <StepCard>
          <TagQuestions
            title="이 소비, 어떤 소비였나요?"
            planTag={planTag}
            contextTags={contextTags}
            customTags={customTags}
            planOptionCopy={PLAN_OPTION_COPY}
            onChangePlanTag={setPlanTag}
            onToggleContextTag={toggleContextTag}
            onChangeCustomTags={setCustomTags}
          />

          {submitError && <FeedbackText>{submitError}</FeedbackText>}

          <RecordButton
            type="button"
            disabled={planTag === null || createMutation.isPending}
            onClick={record}
          >
            {createMutation.isPending ? (
              <Spinner $size={14} $color="#fff" $trackColor="rgba(255,255,255,0.4)" />
            ) : (
              '기록 완료'
            )}
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

        {parseError && <FeedbackText>{parseError}</FeedbackText>}

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
              <option value="" disabled>
                카테고리를 선택해주세요
              </option>
              {CATEGORY_NAMES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </CategorySelect>
            <ChevronIcon src={angleRightIcon} alt="" width={16} height={16} />
          </SelectFieldWrap>
          {categoryMissing && <FeedbackText>카테고리를 선택해주세요</FeedbackText>}
        </CategoryField>

        <ButtonRow>
          <OutlineButton
            type="button"
            onClick={() => (hasParsedData ? setStep('confirm') : onClose())}
          >
            취소
          </OutlineButton>
          <PrimaryButton
            type="button"
            disabled={categoryMissing}
            onClick={() => setStep('emotion')}
          >
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

      {isParsing ? (
        <LoadingWrap>
          <Spinner $size={22} />
          <LoadingText>결제 문자를 분석하고 있어요…</LoadingText>
        </LoadingWrap>
      ) : (
        <>
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
            <InfoValue>{cardCompany || '-'}</InfoValue>
          </InfoRow>

          <CategoryBadgeWrap>
            {categoryMissing ? (
              <FeedbackText>카테고리를 못 찾았어요. '수정하기'에서 선택해주세요.</FeedbackText>
            ) : (
              <CategoryBadge>{category}로 자동 분류</CategoryBadge>
            )}
          </CategoryBadgeWrap>

          <ButtonRow>
            <OutlineButton type="button" onClick={() => setStep('edit')}>
              수정하기
            </OutlineButton>
            <PrimaryButton
              type="button"
              disabled={categoryMissing}
              onClick={() => setStep('emotion')}
            >
              맞아요
            </PrimaryButton>
          </ButtonRow>
        </>
      )}

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

const DONUT_SIZE = 88;
const DONUT_STROKE = 18;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE) / 2;
const DONUT_CENTER = DONUT_SIZE / 2;

type DonutSegment = { percent: number; color: string };

function PlanningDonut({ segments }: { segments: DonutSegment[] }) {
  let cumulative = 0;
  return (
    <DonutSvg viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} width={DONUT_SIZE} height={DONUT_SIZE}>
      <g transform={`rotate(-90 ${DONUT_CENTER} ${DONUT_CENTER})`}>
        {segments.map((segment, index) => {
          const dashOffset = -cumulative;
          cumulative += segment.percent;
          return (
            <circle
              key={index}
              cx={DONUT_CENTER}
              cy={DONUT_CENTER}
              r={DONUT_RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={DONUT_STROKE}
              pathLength={100}
              strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </g>
    </DonutSvg>
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

// 파싱/저장 실패 및 카테고리 미선택 안내. AddExpense 의 ErrorText 와 동일한 톤.
const FeedbackText = styled.p`
  color: #e74c3c;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  margin: 8px 0 12px;
`;

const LoadingWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 0;
`;

const LoadingText = styled.p`
  font-size: 13px;
  color: #888;
  margin: 0;
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

const PatternTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #6a5ce6;
  text-align: center;
  margin: 0 0 20px;
`;

const PlanningSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DonutSvg = styled.svg`
  flex-shrink: 0;
`;

const PlanningLegend = styled.div`
  flex: 1;
  min-width: 0;
`;

const SectionLabel = styled.div`
  font-size: 12px;
  color: #8e8e93;
`;

const LegendRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $color }) => $color};
`;

const LegendLabel = styled.span`
  flex: 1;
  font-size: 13px;
  color: #3c3c43;
`;

const LegendPercent = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #1c1c1e;
`;

const ContextSection = styled.div`
  margin-top: 24px;
`;

const ContextSectionLabelRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

const ContextCaption = styled.span`
  font-size: 11px;
  color: #b0b0b5;
`;

const BarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
`;

const BarItem = styled.div``;

const BarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const BarLabel = styled.span`
  font-size: 13px;
  color: #3c3c43;
`;

const BarPercent = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #1c1c1e;
`;

const BarTrack = styled.div`
  height: 10px;
  border-radius: 999px;
  background: #e5e5ea;
  overflow: hidden;
`;

const BarFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  border-radius: 999px;
  background: #6a5ce6;
`;

const ReportLink = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  text-decoration: underline;
  color: #6a5ce6;
  font-size: 13px;
  text-align: center;
  margin-top: 20px;
  cursor: pointer;
`;

