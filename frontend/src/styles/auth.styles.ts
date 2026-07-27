import styled from 'styled-components';

export const AuthWrapper = styled.div`
  max-width: 480px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 32px 20px;
  background: #fff;
  box-sizing: border-box;
`;

export const AuthTitle = styled.h1<{ $align?: 'center' | 'left'; $size?: number }>`
  text-align: ${({ $align }) => $align ?? 'center'};
  font-size: ${({ $size }) => $size ?? 26}px;
  font-weight: 800;
  margin: 8px 0 32px;
`;

export const Field = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  width: 100%;
  height: 48px;
  border: 2px solid transparent;
  border-radius: 10px;
  background: #ececec;
  padding: 0 14px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: #6a5ce6;
  }
`;

export const Select = styled.select`
  width: 100%;
  height: 48px;
  border: 2px solid transparent;
  border-radius: 10px;
  background: #ececec;
  padding: 0 14px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: #6a5ce6;
  }
`;

export const InputRow = styled.div`
  display: flex;
  gap: 8px;

  ${Input} {
    flex: 1;
  }
`;

export const ButtonDark = styled.button`
  height: 48px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: #3a3a3a;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
`;

export const ButtonPrimary = styled.button`
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 12px;
  background: #6A5CE6; 
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Links = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 13px;
  color: #444;

  a {
    color: #444;
    text-decoration: underline;
  }
`;

export const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;

  input[type='checkbox'] {
    accent-color: #6a5ce6;
  }
`;

export const InputIconWrap = styled.div`
  position: relative;

  ${Input} {
    padding-right: 40px;
  }

  button {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: none;
    cursor: pointer;
    font-size: 16px;
  }
`;