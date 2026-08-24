import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../components/BackButton';
import ChipSelect from '../components/ChipSelect';
import DateTimePickerField from '../components/DateTimePickerField';
import BottomSheet from '../components/BottomSheet';
import TagQuestions, { TAG_LABEL, CONTEXT_TAG_NAMES } from '../components/TagQuestions';
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
import { parseCardMessage, createTransaction, tagTransactionEmotions } from '../api/transactions';
import { getEmotions } from '../api/emotions';
import { ApiError } from '../api/client';
import editIcon from '../assets/images/edit_icon.svg';

// Q1 버튼 전용 카피(질문-답변 프레이밍). 태그 표현과 무관한 UI 문구라 TAG_LABEL과 분리한다.
const PLAN_OPTION_COPY: Record<string, string> = {
  즉흥성: '아니요, 바로 샀어요',
  충분한숙고: '네, 고민하고 샀어요',
};

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
  const [planTag, setPlanTag] = useState<string | null>(null);
  const [contextTags, setContextTags] = useState<string[]>([]);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const [showMemo, setShowMemo] = useState(false);
  const [memo, setMemo] = useState('');

  const { data: emotions = [] } = useQuery({
    queryKey: ['emotions'],
    queryFn: getEmotions,
  });

  const emotionIdByName = useMemo(
    () => Object.fromEntries(emotions.map((tag) => [tag.name, tag.id])),
    [emotions],
  );

  const canSubmit = Number(amount) > 0 && merchant.trim().length > 0 && category.length > 0;

  const adjustAmount = (delta: number) => {
    setAmount((prev) => String(Math.max(0, Number(prev || 0) + delta)));
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

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const { id } = await createTransaction({
        amount: Number(amount),
        type: 'expense',
        category,
        merchant,
        description: memo,
        transaction_date: date,
        transaction_time: time,
      });

      const tagNames = [planTag, ...contextTags].filter((name): name is string => name !== null);
      const emotionTagIds = tagNames
        .map((name) => emotionIdByName[name])
        .filter((id): id is number => id !== undefined);

      if (emotionTagIds.length > 0) {
        await tagTransactionEmotions(id, emotionTagIds);
      }

      navigate('/');
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : '등록에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
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
          {importError && <ErrorText>{importError}</ErrorText>}

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
            <FieldLabel>소비 태그</FieldLabel>
            {planTag ? (
              <TagBox type="button" onClick={() => setTagSheetOpen(true)}>
                <TagChipList>
                  <TagChip>{TAG_LABEL[planTag]}</TagChip>
                  {CONTEXT_TAG_NAMES.filter((name) => contextTags.includes(name)).map((name) => (
                    <TagChip key={name}>{TAG_LABEL[name]}</TagChip>
                  ))}
                </TagChipList>
                <TagEditIcon src={editIcon} alt="" />
              </TagBox>
            ) : (
              <TagEmptyBox type="button" onClick={() => setTagSheetOpen(true)}>
                <TagEmptyText>이 소비, 어떤 소비였나요?</TagEmptyText>
                <PlusIcon viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </PlusIcon>
              </TagEmptyBox>
            )}
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

          {submitError && <ErrorText>{submitError}</ErrorText>}
        </div>

        <ButtonPrimary type="submit" disabled={!canSubmit || submitting}>
          {submitting ? <Spinner $size={18} $color="#fff" $trackColor="rgba(255,255,255,0.4)" /> : '등록하기'}
        </ButtonPrimary>
      </FormColumn>

      {tagSheetOpen && (
        <TagEditSheet
          initialPlanTag={planTag}
          initialContextTags={contextTags}
          onClose={() => setTagSheetOpen(false)}
          onSave={(nextPlanTag, nextContextTags) => {
            setPlanTag(nextPlanTag);
            setContextTags(nextContextTags);
            setTagSheetOpen(false);
          }}
        />
      )}
    </form>
  );
}

type TagEditSheetProps = {
  initialPlanTag: string | null;
  initialContextTags: string[];
  onClose: () => void;
  onSave: (planTag: string | null, contextTags: string[]) => void;
};

function TagEditSheet({ initialPlanTag, initialContextTags, onClose, onSave }: TagEditSheetProps) {
  const [planTag, setPlanTag] = useState(initialPlanTag);
  const [contextTags, setContextTags] = useState(initialContextTags);

  const toggleContextTag = (tag: string) => {
    setContextTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <BottomSheet onClose={onClose}>
      <TagQuestions
        title="이 소비, 어떤 소비였나요?"
        planTag={planTag}
        contextTags={contextTags}
        planOptionCopy={PLAN_OPTION_COPY}
        onChangePlanTag={setPlanTag}
        onToggleContextTag={toggleContextTag}
      />
      <TagSaveButton type="button" disabled={planTag === null} onClick={() => onSave(planTag, contextTags)}>
        저장
      </TagSaveButton>
    </BottomSheet>
  );
}

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 12px;
  text-align: center;
  margin: 8px 0 16px;
`;

const TagBox = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  background: #fff;
  border: 2px solid #6a5ce6;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
`;

const TagChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  background: #e2deff;
  color: #3c3489;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
`;

const TagEditIcon = styled.img.attrs({ width: 18, height: 18 })`
  flex-shrink: 0;
`;

const TagEmptyBox = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  height: 48px;
  background: #fff;
  border: 1.5px dashed #c7c1f5;
  border-radius: 10px;
  padding: 0 14px;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
`;

const TagEmptyText = styled.span`
  font-size: 14px;
  color: #6a5ce6;
`;

const PlusIcon = styled.svg`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #6a5ce6;
`;

const TagSaveButton = styled.button`
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #6a5ce6;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    background: #f0f0f0;
    color: #bdbdbd;
    cursor: not-allowed;
  }
`;