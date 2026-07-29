import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../components/BackButton';
import ChipSelect from '../components/ChipSelect';
import editIcon from '../assets/images/edit_icon.svg';
import calendarIcon from '../assets/images/calendar_color.svg';
import { AuthTitle, FormColumn, ButtonPrimary } from '../styles/auth.styles';
import {
  FieldGroup,
  FieldLabel,
  OutlinedInput,
  IconFieldWrap,
  AmountBox,
  AmountLabel,
  AmountRow,
  AmountInput,
  AmountUnit,
  LinkButton,
} from '../styles/field.styles';
import { CATEGORY_OPTIONS, CATEGORY_ICONS } from '../utils/category';
import { parseSpendingText } from '../utils/parseSpendingText';

// TODO: 감정 태그 목록 미확정, 임시 구성
const EMOTION_TAGS = ['스트레스', '기쁨', '우울', '충동', '보상심리', '무기력'];

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);
const toTimeValue = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export default function AddExpense() {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [time, setTime] = useState(toTimeValue(new Date()));
  const [category, setCategory] = useState('');
  const [emotionTag, setEmotionTag] = useState('');
  const [importError, setImportError] = useState('');

  const canSubmit = Number(amount) > 0 && merchant.trim().length > 0 && category.length > 0;

  const handleImport = async () => {
    setImportError('');
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parseSpendingText(text);

      if (!parsed.amount && !parsed.merchant) {
        setImportError('문자 형식을 인식하지 못했어요. 직접 입력해주세요.');
        return;
      }
      if (parsed.amount) setAmount(String(parsed.amount));
      if (parsed.merchant) setMerchant(parsed.merchant);
      if (parsed.date) setDate(parsed.date);
      if (parsed.time) setTime(parsed.time);
    } catch {
      setImportError('클립보드를 읽어올 수 없어요. 내용을 복사한 뒤 다시 시도해주세요.');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // POST /transactions
    // TODO: 실제 API 연동. description/감정태그 필드명 백엔드와 확정 필요
    const payload = {
      amount: Number(amount),
      type: 'expense' as const,
      category,
      merchant,
      description: '',
      transaction_date: date,
      transaction_time: time,
      emotion_tag: emotionTag || undefined,
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
            <FieldLabel>가맹점</FieldLabel>
            <IconFieldWrap>
                <OutlinedInput value={merchant} onChange={(e) => setMerchant(e.target.value)} />
                <button type="button" aria-label="가맹점 수정" tabIndex={-1}>
                    <img src={editIcon} alt="" width={18} height={18} />
                </button>
            </IconFieldWrap>
          </FieldGroup>

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
            <FieldLabel>카테고리</FieldLabel>
            <ChipSelect
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={setCategory}
              getIcon={(option) => CATEGORY_ICONS[option]}
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>감정 태그</FieldLabel>
            <ChipSelect options={EMOTION_TAGS} value={emotionTag} onChange={setEmotionTag} />
          </FieldGroup>

          <LinkButton type="button" onClick={handleImport}>
            소비내역 가져오기
          </LinkButton>
          {importError && <ErrorText>{importError}</ErrorText>}
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
  margin: 8px 0 0;
`;