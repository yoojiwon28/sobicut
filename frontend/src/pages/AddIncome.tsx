import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import ChipSelect from '../components/ChipSelect';
import DateTimePickerField from '../components/DateTimePickerField';
import { AuthTitle, FormColumn, ButtonPrimary, Spinner } from '../styles/auth.styles';
import { createTransaction } from '../api/transactions';
import { ApiError } from '../api/client';
import styled from 'styled-components';
import {
  FieldGroup,
  FieldLabel,
  OutlinedTextarea,
  AmountBox,
  AmountLabel,
  AmountRow,
  AmountInput,
  AmountUnit,
  StepButton,
} from '../styles/field.styles';
import { useQueryClient } from '@tanstack/react-query';
import { INCOME_SOURCES } from '../constants/income';

const AMOUNT_STEP = 5000;

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);
const toTimeValue = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export default function AddIncome() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [time, setTime] = useState(toTimeValue(new Date()));
  const [source, setSource] = useState('');
  const [memo, setMemo] = useState('');

  const canSubmit = Number(amount) > 0 && source.length > 0;

  const adjustAmount = (delta: number) => {
    setAmount((prev) => String(Math.max(0, Number(prev || 0) + delta)));
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError('');
    try {
        await createTransaction({
        amount: Number(amount),
        type: 'income',
        category: source,
        description: memo,
        transaction_date: date,
        transaction_time: time,
        });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['reports'] });
        navigate('/');
    } catch (err) {
        setError(err instanceof ApiError ? err.message : '등록에 실패했어요. 다시 시도해주세요.');
    } finally {
        setSubmitting(false);
    }
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

          <FieldGroup>
            <FieldLabel>수입일시</FieldLabel>
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
          {error && <ErrorText>{error}</ErrorText>}
        </div>

        <ButtonPrimary type="submit" disabled={!canSubmit || submitting}>
          {submitting ? <Spinner $size={18} $color="#fff" $trackColor="rgba(255,255,255,0.4)" /> : '등록하기'}
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