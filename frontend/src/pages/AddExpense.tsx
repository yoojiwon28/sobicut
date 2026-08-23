import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../components/BackButton';
import ChipSelect from '../components/ChipSelect';
import DateTimePickerField from '../components/DateTimePickerField';
import { AuthTitle, FormColumn, ButtonPrimary, Spinner } from '../styles/auth.styles';
import {
  FieldGroup,
  FieldLabel,
  OutlinedInput,
  OutlinedTextarea,
  IconFieldWrap,
  AmountBox,
  AmountLabel,
  AmountRow,
  AmountInput,
  AmountUnit,
  StepButton,
  ImportButton,
  LinkButton,
} from '../styles/field.styles';
import { CATEGORY_OPTIONS, CATEGORY_ICONS } from '../utils/category';
import { parseCardMessage } from '../api/transactions';
import { ApiError } from '../api/client';
import editIcon from '../assets/images/edit_icon.svg';

type PlanTag = 'IMPULSIVE' | 'DELIBERATE';
type ContextTag = 'STRESS' | 'NO_COMPARE' | 'LONG_VALUE';

const PLAN_OPTIONS: { value: PlanTag; label: string }[] = [
  { value: 'IMPULSIVE', label: '아니요, 바로 샀어요' },
  { value: 'DELIBERATE', label: '네, 고민하고 샀어요' },
];

const CONTEXT_OPTIONS: { value: ContextTag; label: string }[] = [
  { value: 'STRESS', label: '스트레스 받아서' },
  { value: 'NO_COMPARE', label: '비교 안 하고' },
  { value: 'LONG_VALUE', label: '오래 쓸 소비' },
];

const AMOUNT_STEP = 5000;

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);
const toTimeValue = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export default function AddExpense() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [time, setTime] = useState(toTimeValue(new Date()));
  const [category, setCategory] = useState('');
  const [planTag, setPlanTag] = useState<PlanTag | null>(null);
  const [contextTags, setContextTags] = useState<ContextTag[]>([]);
  const [importError, setImportError] = useState('');
  const [showMemo, setShowMemo] = useState(false);
  const [memo, setMemo] = useState('');

  const canSubmit = Number(amount) > 0 && merchant.trim().length > 0 && category.length > 0;

  const adjustAmount = (delta: number) => {
    setAmount((prev) => String(Math.max(0, Number(prev || 0) + delta)));
  };

  const toggleContextTag = (tag: ContextTag) => {
    setContextTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImportError('');
    let text: string;
    try {
        text = await navigator.clipboard.readText();
    } catch {
        setImportError('클립보드를 읽어올 수 없어요. 문자 내용을 복사한 뒤 다시 시도해주세요.');
        return;
    }

    setImporting(true);
    try {
        const parsed = await parseCardMessage(text);
        setAmount(String(parsed.amount));
        setMerchant(parsed.merchant);
        setDate(parsed.transaction_date);
        setTime(parsed.transaction_time);
    } catch (err) {
        setImportError(
        err instanceof ApiError ? err.message : '문자 형식을 인식하지 못했어요. 직접 입력해주세요.',
        );
    } finally {
        setImporting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // POST /transactions
    // TODO: 실제 API 연동. planTag/contextTags → 백엔드 감정 태그 ID 매핑 필요
    const payload = {
      amount: Number(amount),
      type: 'expense' as const,
      category,
      merchant,
      description: memo,
      transaction_date: date,
      transaction_time: time,
      planTag,
      contextTags,
    };
    console.log('POST /transactions', payload);

    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to="/" />
          <AuthTitle $size={20}>지출 추가</AuthTitle>

          <AmountBox>
            <AmountLabel>지출 금액</AmountLabel>
            <AmountRow>
              <StepButton type="button" onClick={() => adjustAmount(-AMOUNT_STEP)} aria-label="5000원 감소">
                −
              </StepButton>
              <AmountInput
                type="number"
                inputMode="numeric"
                step={AMOUNT_STEP}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <StepButton type="button" onClick={() => adjustAmount(AMOUNT_STEP)} aria-label="5000원 증가">
                +
              </StepButton>
              <AmountUnit>원</AmountUnit>
            </AmountRow>
          </AmountBox>
          <ImportButton type="button" onClick={handleImport} disabled={importing}>
            {importing ? <Spinner $size={16} /> : '소비내역 가져오기'}
          </ImportButton>

          <FieldGroup>
            <FieldLabel>가맹점</FieldLabel>
            <IconFieldWrap>
              <OutlinedInput value={merchant} onChange={(e) => setMerchant(e.target.value)} />
              <button type="button" aria-label="가맹점 수정" tabIndex={-1}>
                <img src={editIcon} alt="" width={18} height={18} />
              </button>
            </IconFieldWrap>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>결제일시</FieldLabel>
            <DateTimePickerField
                date={date}
                time={time}
                onChange={(d, t) => {
                setDate(d);
                setTime(t);
                }}
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>카테고리</FieldLabel>
            <ChipSelect
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={setCategory}
              getIcon={(option) => CATEGORY_ICONS[option]}
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>이 소비 미리 계획했나요?</FieldLabel>
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
          </FieldGroup>

          <FieldGroup>
            <QuestionLabelRow>
              <FieldLabel>이 소비는…</FieldLabel>
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
          </FieldGroup>

          {showMemo ? (
            <FieldGroup>
              <FieldLabel>메모</FieldLabel>
              <OutlinedTextarea
                placeholder="메모를 작성해주세요"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </FieldGroup>
          ) : (
            <LinkButton type="button" onClick={() => setShowMemo(true)}>
              + 메모 추가
            </LinkButton>
          )}
        </div>

        <ButtonPrimary type="submit" disabled={!canSubmit}>
          등록하기
        </ButtonPrimary>
      </FormColumn>
    </form>
  );
}

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 12px;
  text-align: center;
  margin: 8px 0 16px;
`;

const QuestionLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MultiSelectHint = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #a0a0a0;
`;

const PlanGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const PlanOption = styled.button<{ $active: boolean }>`
  padding: 16px 12px;
  border-radius: 12px;
  font-size: 15px;
  text-align: center;
  line-height: 1.4;
  cursor: pointer;
  border: ${({ $active }) => ($active ? '2px solid #6A5CE6' : '1.5px solid #E5E5E5')};
  background: ${({ $active }) => ($active ? '#E2DEFF' : '#FFFFFF')};
  color: ${({ $active }) => ($active ? '#3C3489' : '#767676')};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
`;

const ContextChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const ContextChip = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  border: ${({ $active }) => ($active ? '2px solid #6A5CE6' : '1.5px solid #E5E5E5')};
  background: ${({ $active }) => ($active ? '#E2DEFF' : '#FFFFFF')};
  color: ${({ $active }) => ($active ? '#3C3489' : '#767676')};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
`;

const CheckIcon = styled.svg`
  width: 14px;
  height: 14px;
  margin-right: 4px;
`;