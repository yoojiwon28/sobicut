import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import ChipSelect from '../components/ChipSelect';
import calendarIcon from '../assets/images/calendar_color.svg';
import { AuthTitle, FormColumn, ButtonPrimary } from '../styles/auth.styles';
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
} from '../styles/field.styles';

// TODO: 꼭 필요한 항목 위주로 임시 구성, 확정 필요
const INCOME_SOURCES = ['용돈', '아르바이트', '장학금/지원금', '환급/캐시백', '선물/축의금', '기타'];

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);
const toTimeValue = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export default function AddIncome() {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [time, setTime] = useState(toTimeValue(new Date()));
  const [source, setSource] = useState('');
  const [memo, setMemo] = useState('');

  const canSubmit = Number(amount) > 0 && source.length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // POST /transactions
    // TODO: 실제 API 연동. merchant는 수입에 해당 없어 빈 값으로 전송
    const payload = {
      amount: Number(amount),
      type: 'income' as const,
      category: source,
      merchant: '',
      description: memo,
      transaction_date: date,
      transaction_time: time,
    };
    console.log('POST /transactions', payload);

    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to="/" />
          <AuthTitle $size={20}>수입 추가</AuthTitle>

          <AmountBox>
            <AmountLabel>수입 금액</AmountLabel>
            <AmountRow>
              <AmountInput
                type="number"
                inputMode="numeric"
                step={5000}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <AmountUnit>원</AmountUnit>
            </AmountRow>
          </AmountBox>

          <FieldGroup>
            <FieldLabel>날짜</FieldLabel>
            <IconFieldWrap>
              <OutlinedInput
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button type="button" aria-label="날짜 선택" onClick={() => dateInputRef.current?.showPicker?.()}>
                <img src={calendarIcon} alt="" width={18} height={18} />
              </button>
            </IconFieldWrap>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>시간</FieldLabel>
            <OutlinedInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>출처</FieldLabel>
            <ChipSelect options={INCOME_SOURCES} value={source} onChange={setSource} />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>메모</FieldLabel>
            <OutlinedTextarea
              placeholder="메모를 작성해주세요"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </FieldGroup>
        </div>

        <ButtonPrimary type="submit" disabled={!canSubmit}>
          등록하기
        </ButtonPrimary>
      </FormColumn>
    </form>
  );
}