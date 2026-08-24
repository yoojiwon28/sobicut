import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import DateTimePickerField from '../../components/DateTimePickerField';
import BottomSheet from '../../components/BottomSheet';
import TagQuestions, { TAG_LABEL, CONTEXT_TAG_NAMES } from '../../components/TagQuestions';
import { AuthTitle } from '../../styles/auth.styles';
import { FieldGroup, FieldLabel, OutlinedInput, OutlinedSelect, OutlinedTextarea } from '../../styles/field.styles';
import { DUMMY_ALL_TRANSACTIONS, DUMMY_TODAY_EXPENSES } from '../../mocks/transactions';
import { CATEGORY_ICONS, CATEGORY_OPTIONS } from '../../utils/category';
import incomeIcon from '../../assets/images/income_icon.svg';
import expenseIcon from '../../assets/images/expense_icon.svg';
import angleRightIcon from '../../assets/images/angle_right.svg';
import editIcon from '../../assets/images/edit_icon.svg';

// Q1 버튼 전용 카피(질문-답변 프레이밍). 태그 표현과 무관한 UI 문구라 TAG_LABEL과 분리한다.
const PLAN_OPTION_COPY: Record<string, string> = {
  즉흥성: '아니요, 바로 샀어요',
  충분한숙고: '네, 고민하고 샀어요',
};

// contextTags 는 배열이라 선택 순서가 달라도 구성이 같으면 변경 없음으로 취급한다.
const isSameTagSet = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((tag) => setB.has(tag));
};

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tx = DUMMY_ALL_TRANSACTIONS.find((t) => String(t.id) === id);

  const [merchant, setMerchant] = useState(tx?.merchant ?? '');
  const [category, setCategory] = useState(tx?.category ?? '');
  const [memo, setMemo] = useState(tx?.description ?? '');
  const [date, setDate] = useState(tx?.transaction_date ?? '');
  const [time, setTime] = useState(tx?.transaction_time ?? '');
  const [planTag, setPlanTag] = useState<string | null>(tx?.planTag ?? null);
  const [contextTags, setContextTags] = useState<string[]>(tx?.contextTags ?? []);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);

  if (!tx) {
    return (
      <Page>
        <BackButton to="/" />
        <EmptyText>내역을 찾을 수 없어요.</EmptyText>
      </Page>
    );
  }

  const isExpense = tx.type === 'expense';
  const fromParam = searchParams.get('from');
  const backTo = fromParam
    ? fromParam
    : DUMMY_TODAY_EXPENSES.some((t) => t.id === tx.id)
      ? '/expenses/today'
      : `/day/${tx.transaction_date}`;

  const isDirty =
    merchant !== (tx.merchant ?? '') ||
    category !== (tx.category ?? '') ||
    memo !== (tx.description ?? '') ||
    date !== (tx.transaction_date ?? '') ||
    time !== (tx.transaction_time ?? '') ||
    planTag !== (tx.planTag ?? null) ||
    !isSameTagSet(contextTags, tx.contextTags ?? []);

  const handleSubmit = () => {
    // TODO: updateTransaction API 연동
    console.log(`PATCH /transactions/${tx.id}`, {
      merchant,
      category,
      description: memo,
      transaction_date: date,
      transaction_time: time,
    });
    navigate(backTo);
  };

  return (
    <Page>
      <BackButton to={backTo} />
      <AuthTitle $size={20}>{isExpense ? '지출 상세 내역' : '수입 상세 내역'}</AuthTitle>

      <DetailAmountRow>
        <Amount>
          {isExpense ? '-' : '+'}
          {tx.amount.toLocaleString()} 원
        </Amount>
        <CategoryIcon
          src={CATEGORY_ICONS[tx.category] ?? (isExpense ? expenseIcon : incomeIcon)}
          alt=""
        />
      </DetailAmountRow>

      <StyledFieldGroup>
        <StyledFieldLabel>결제처</StyledFieldLabel>
        <MerchantInputWrap>
          <StyledInput value={merchant} onChange={(e) => setMerchant(e.target.value)} />
          <EditIcon src={editIcon} alt="" />
        </MerchantInputWrap>
      </StyledFieldGroup>

      <StyledFieldGroup>
        <StyledFieldLabel>결제일시</StyledFieldLabel>
        <DateFieldWrap>
          <DateTimePickerField
            date={date}
            time={time}
            onChange={(d, t) => {
              setDate(d);
              setTime(t);
            }}
          />
        </DateFieldWrap>
      </StyledFieldGroup>

      <StyledFieldGroup>
        <StyledFieldLabel>카테고리</StyledFieldLabel>
        <SelectFieldWrap>
          <StyledSelect value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </StyledSelect>
          <ChevronIcon src={angleRightIcon} alt="" width={16} height={16} />
        </SelectFieldWrap>
      </StyledFieldGroup>

      {isExpense && (
        <StyledFieldGroup>
          <StyledFieldLabel>소비 태그</StyledFieldLabel>
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
        </StyledFieldGroup>
      )}

      <StyledFieldGroup>
        <StyledFieldLabel>메모</StyledFieldLabel>
        <StyledTextarea
          placeholder="메모를 작성해주세요"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </StyledFieldGroup>

      <SubmitButton type="button" disabled={!isDirty} onClick={handleSubmit}>
        수정 완료
      </SubmitButton>

      {tagSheetOpen && (
        <TagEditSheet
          transactionId={tx.id}
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
    </Page>
  );
}

type TagEditSheetProps = {
  transactionId: number;
  initialPlanTag: string | null;
  initialContextTags: string[];
  onClose: () => void;
  onSave: (planTag: string | null, contextTags: string[]) => void;
};

function TagEditSheet({ transactionId, initialPlanTag, initialContextTags, onClose, onSave }: TagEditSheetProps) {
  const [planTag, setPlanTag] = useState(initialPlanTag);
  const [contextTags, setContextTags] = useState(initialContextTags);

  const toggleContextTag = (tag: string) => {
    setContextTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSave = () => {
    // TODO: PATCH /transactions/:id 연동, emotion_tag_ids 매핑 필요
    console.log(`PATCH /transactions/${transactionId} (tags)`, { planTag, contextTags });
    onSave(planTag, contextTags);
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
      <TagSaveButton type="button" disabled={planTag === null} onClick={handleSave}>
        저장
      </TagSaveButton>
    </BottomSheet>
  );
}

const Page = styled.div`
  padding: 20px;
`;

const DetailAmountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #E5E5E5;
  padding: 0 0 14px;
  margin-bottom: 22px;
`;

const Amount = styled.span`
  font-size: 34px;
  font-weight: 800;
`;

const CategoryIcon = styled.img.attrs({ width: 30, height: 30 })`
  filter: grayscale(1) opacity(0.85);
`;

const StyledFieldGroup = styled(FieldGroup)`
  margin-bottom: 20px;
`;

const StyledFieldLabel = styled(FieldLabel)`
  font-weight: 800;
  color: #222;
`;

const fieldFillStyles = `
  background: #F2F2F2;
  border: none;
  border-radius: 10px;
  padding: 16px 18px;
  font-size: 16px;
  font-family: inherit;
  color: #222;
`;

const StyledInput = styled(OutlinedInput)`
  ${fieldFillStyles}
  height: auto;

  &::placeholder {
    color: #9A9A9A;
  }

  &:focus {
    outline: none;
    background: #EAEAEA;
    border-color: transparent;
  }
`;

const StyledSelect = styled(OutlinedSelect)`
  ${fieldFillStyles}
  height: auto;

  &:focus {
    outline: none;
    background: #EAEAEA;
  }
`;

const StyledTextarea = styled(OutlinedTextarea)`
  background: #F2F2F2;
  border: none;
  border-radius: 10px;
  padding: 16px 18px;
  font-size: 16px;
  line-height: 1.5;
  font-family: inherit;
  color: #222;
  min-height: 90px;
  resize: none;

  &::placeholder {
    color: #9A9A9A;
  }

  &:focus {
    outline: none;
    background: #EAEAEA;
  }
`;

const MerchantInputWrap = styled.div`
  position: relative;
`;

const DateFieldWrap = styled.div`
  input[readonly] {
    background: #F2F2F2 !important;
    border: none !important;
    border-radius: 10px;
    padding: 16px 44px 16px 18px;
    font-size: 16px;
    color: #222;
  }

  input[readonly]:focus {
    outline: none !important;
    box-shadow: none !important;
    background: #EAEAEA !important;
  }

  button img {
    filter: grayscale(1) opacity(0.85);
  }
`;

const EditIcon = styled.img.attrs({ width: 18, height: 18 })`
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  filter: grayscale(1) opacity(0.85);
  pointer-events: none;
`;

const SelectFieldWrap = styled.div`
  position: relative;
`;

const ChevronIcon = styled.img`
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  filter: grayscale(1) opacity(0.85);
  pointer-events: none;
`;

const EmptyText = styled.p`
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 40px 0;
`;

const TagBox = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  background: #F2F2F2;
  border: none;
  border-radius: 10px;
  padding: 16px 18px;
  cursor: pointer;
  text-align: left;
`;

const TagChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

const TagChip = styled.span`
  display: inline-flex;
  align-items: center;
  background: #E2DEFF;
  color: #3C3489;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
`;

const TagEditIcon = styled.img.attrs({ width: 18, height: 18 })`
  flex-shrink: 0;
  filter: grayscale(1) opacity(0.85);
`;

const TagEmptyBox = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  background: #fff;
  border: 1px dashed #C7C1F5;
  border-radius: 10px;
  padding: 16px 18px;
  cursor: pointer;
  text-align: left;
`;

const TagEmptyText = styled.span`
  font-size: 14px;
  color: #6A5CE6;
`;

const PlusIcon = styled.svg`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #6A5CE6;
`;

const TagSaveButton = styled.button`
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #6A5CE6;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    background: #F0F0F0;
    color: #BDBDBD;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 30px;
  padding: 16px 0;
  border: none;
  border-radius: 12px;
  background: #6A5CE6;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }
`;
