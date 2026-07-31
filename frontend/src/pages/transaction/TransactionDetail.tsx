import { useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import DateTimePickerField from '../../components/DateTimePickerField';
import { AuthTitle } from '../../styles/auth.styles';
import { FieldGroup, FieldLabel, OutlinedInput, OutlinedSelect, OutlinedTextarea, IconFieldWrap } from '../../styles/field.styles';
import { DUMMY_ALL_TRANSACTIONS, DUMMY_TODAY_EXPENSES } from '../../mocks/transactions';
import { CATEGORY_ICONS, CATEGORY_OPTIONS } from '../../utils/category';
import editIcon from '../../assets/images/edit_icon.svg';
import checkIcon from '../../assets/images/check_icon.svg';
import incomeIcon from '../../assets/images/income_icon.svg';
import expenseIcon from '../../assets/images/expense_icon.svg';
import angleRightIcon from '../../assets/images/angle_right.svg';

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tx = DUMMY_ALL_TRANSACTIONS.find((t) => String(t.id) === id);

  const [merchant, setMerchant] = useState(tx?.merchant ?? '');
  const [category, setCategory] = useState(tx?.category ?? '');
  const [memo, setMemo] = useState(tx?.description ?? '');
  const [date, setDate] = useState(tx?.transaction_date ?? '');
  const [time, setTime] = useState(tx?.transaction_time ?? '');

  const [isEditingMerchant, setIsEditingMerchant] = useState(false);
  const merchantInputRef = useRef<HTMLInputElement>(null);

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

  // TODO: PATCH /transactions/:id 로 교체
  const handleMerchantIconClick = () => {
    if (isEditingMerchant) {
      console.log(`PATCH /transactions/${tx.id}`, { merchant });
      setIsEditingMerchant(false);
    } else {
      setIsEditingMerchant(true);
      requestAnimationFrame(() => merchantInputRef.current?.focus());
    }
  };
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    console.log(`PATCH /transactions/${tx.id}`, { category: value });
  };
  const handleMemoBlur = () => {
    console.log(`PATCH /transactions/${tx.id}`, { description: memo });
  };
  const handleDateConfirm = () => {
    console.log(`PATCH /transactions/${tx.id}`, { transaction_date: date, transaction_time: time });
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
        <img
          src={CATEGORY_ICONS[tx.category] ?? (isExpense ? expenseIcon : incomeIcon)}
          alt=""
          width={26}
          height={26}
        />
      </DetailAmountRow>

      <FieldGroup>
        <FieldLabel>결제처</FieldLabel>
        <IconFieldWrap>
          <OutlinedInput
            ref={merchantInputRef}
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            readOnly={!isEditingMerchant}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleMerchantIconClick();
            }}
          />
          <button
            type="button"
            aria-label={isEditingMerchant ? '결제처 저장' : '결제처 수정'}
            onClick={handleMerchantIconClick}
          >
            <img src={isEditingMerchant ? checkIcon : editIcon} alt="" width={18} height={18} />
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
          onConfirm={handleDateConfirm}
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>카테고리</FieldLabel>
        <SelectFieldWrap>
          <OutlinedSelect value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </OutlinedSelect>
          <ChevronIcon src={angleRightIcon} alt="" width={16} height={16} />
        </SelectFieldWrap>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>메모</FieldLabel>
        <OutlinedTextarea
          placeholder="메모를 작성해주세요"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onBlur={handleMemoBlur}
        />
      </FieldGroup>
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
  background: #efeafc;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 24px;
`;

const Amount = styled.span`
  font-size: 24px;
  font-weight: 700;
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

const EmptyText = styled.p`
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 40px 0;
`;
