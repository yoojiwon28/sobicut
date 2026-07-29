import styled from 'styled-components';

export const FieldGroup = styled.div`
  margin-bottom: 18px;
`;

export const FieldLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
`;

export const OutlinedInput = styled.input`
  width: 100%;
  height: 48px;
  border: 2px solid #6a5ce6;
  border-radius: 10px;
  background: #fff;
  padding: 0 14px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;

  &[type='date']::-webkit-calendar-picker-indicator {
    opacity: 0;
  }
`;

export const OutlinedSelect = styled.select`
  width: 100%;
  height: 48px;
  border: 2px solid #6a5ce6;
  border-radius: 10px;
  background: #fff;
  padding: 0 14px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  appearance: none;
`;

export const OutlinedTextarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  border: 2px solid #6a5ce6;
  border-radius: 10px;
  background: #fff;
  padding: 12px 14px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  resize: none;
  font-family: inherit;
`;

export const IconFieldWrap = styled.div`
  position: relative;

  ${OutlinedInput} {
    padding-right: 44px;
  }

  button {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
  }
`;

export const AmountBox = styled.div`
  background: #efeafc;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 24px;
`;

export const AmountLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
`;

export const AmountRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
`;

export const AmountInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 26px;
  font-weight: 700;
  color: #9a94b5;
  padding: 0;

  &::placeholder {
    color: #b7b1cf;
  }
`;

export const AmountUnit = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #111;
  margin-left: 8px;
`;

export const LinkButton = styled.button`
  display: block;
  margin: 8px auto 0;
  background: none;
  border: none;
  color: #444;
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
`;