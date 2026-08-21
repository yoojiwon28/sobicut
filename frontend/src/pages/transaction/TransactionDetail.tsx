import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import DateTimePickerField from '../../components/DateTimePickerField';
import { AuthTitle } from '../../styles/auth.styles';
import { FieldGroup, FieldLabel, OutlinedInput, OutlinedSelect, OutlinedTextarea } from '../../styles/field.styles';
import { DUMMY_ALL_TRANSACTIONS, DUMMY_TODAY_EXPENSES } from '../../mocks/transactions';
import { CATEGORY_ICONS, CATEGORY_OPTIONS } from '../../utils/category';
import incomeIcon from '../../assets/images/income_icon.svg';
import expenseIcon from '../../assets/images/expense_icon.svg';
import angleRightIcon from '../../assets/images/angle_right.svg';
import editIcon from '../../assets/images/edit_icon.svg';

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
    time !== (tx.transaction_time ?? '');

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
    </Page>
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
