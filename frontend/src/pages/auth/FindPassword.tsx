import { useState } from 'react';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import Logo from '../../components/Logo';
import { AuthTitle, Field, Label, Input, InputRow, InputIconWrap, ButtonDark, ButtonPrimary } from '../../styles/auth.styles';

const Timer = styled.span`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #e74c3c;
  font-size: 13px;
`;

export default function FindPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleSendCode = () => {
    // 인증번호 전송 API 연동
  };

  const handleVerify = () => {
    // 인증번호 확인 API 연동
  };

  const handleIssueTempPassword = () => {
    // 임시 비밀번호 발급 API 연동
  };

  return (
    <div>
      <BackButton to="/login" />
      <Logo />
      <AuthTitle>PW 찾기</AuthTitle>

      <Field>
        <Label>아이디/이메일 주소 입력</Label>
        <InputRow>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          <ButtonDark type="button" onClick={handleSendCode}>
            인증번호 전송
          </ButtonDark>
        </InputRow>
      </Field>

      <Field>
        <Label>인증번호</Label>
        <InputRow>
          <InputIconWrap style={{ flex: 1 }}>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
            <Timer>05:00</Timer>
          </InputIconWrap>
          <ButtonDark type="button" onClick={handleVerify}>
            인증
          </ButtonDark>
        </InputRow>
      </Field>

      <ButtonPrimary type="button" onClick={handleIssueTempPassword}>
        임시 비밀번호 발급
      </ButtonPrimary>
    </div>
  );
}