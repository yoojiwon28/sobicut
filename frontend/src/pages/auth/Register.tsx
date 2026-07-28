import { useState, type FormEvent, type ChangeEvent } from 'react';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import Logo from '../../components/Logo';
import eyeIcon from '../../assets/images/eye_icon.svg';
import closedEyeIcon from '../../assets/images/closed_eye_icon.svg';
import checkIcon from '../../assets/images/check_icon.svg';
import {
  AuthTitle,
  Field,
  Label,
  Input,
  InputRow,
  InputIconWrap,
  ButtonDark,
  ButtonPrimary,
  CheckboxRow,
} from '../../styles/auth.styles';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,12}$/;

const CheckMark = styled.span`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
`;

export default function Register() {
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [idAvailable, setIdAvailable] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);

  const passwordMatches = passwordConfirm.length > 0 && password === passwordConfirm;
  const passwordValid = PASSWORD_REGEX.test(password);

  const canSubmit =
    idAvailable && emailAvailable && agreeRequired && passwordValid && passwordMatches;

  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
    setIdAvailable(false); // 값 바뀌면 재확인 필요
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailAvailable(false); // 값 바뀌면 재확인 필요
  };

  const handleCheckDuplicate = () => {
    // 아이디 중복 확인 API 연동 -> 사용 가능하면 setIdAvailable(true)
  };

  const handleCheckEmailDuplicate = () => {
    // 이메일 중복 확인 API 연동 -> 사용 가능하면 setEmailAvailable(true)
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 회원가입 API 연동 -> 성공 시 /register-profile 이동
  };

  return (
    <form onSubmit={handleSubmit}>
      <BackButton to="/login" />
      <Logo />
      <AuthTitle>REGISTER</AuthTitle>

      <Field>
        <Label htmlFor="id">아이디</Label>
        <InputRow>
          <Input id="id" placeholder="4~12자, 영문/숫자" value={id} onChange={handleIdChange} />
          <ButtonDark type="button" onClick={handleCheckDuplicate}>
            중복 확인
          </ButtonDark>
        </InputRow>
      </Field>

      <Field>
        <Label htmlFor="email">이메일</Label>
        <InputRow>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={handleEmailChange}
          />
          <ButtonDark type="button" onClick={handleCheckEmailDuplicate}>
            중복 확인
          </ButtonDark>
        </InputRow>
      </Field>

      <Field>
        <Label htmlFor="password">비밀번호</Label>
        <InputIconWrap>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="8~12자, 영문+숫자+특수문자 포함"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="비밀번호 표시 전환">
            <img src={showPassword ? eyeIcon : closedEyeIcon} alt="" width={20} height={20} />
          </button>
        </InputIconWrap>
        {password.length > 0 && (
          <span
            style={{
              display: 'block',
              marginTop: 6,
              fontSize: 12,
              color: passwordValid ? '#2ecc71' : '#e74c3c',
            }}
          >
            {passwordValid ? '사용가능한 비밀번호입니다.' : '사용 불가능한 비밀번호입니다.'}
          </span>
        )}
      </Field>

      <Field>
        <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
        <InputIconWrap>
          <Input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
          {passwordMatches && (
            <CheckMark>
              <img src={checkIcon} alt="" width={18} height={18} />
            </CheckMark>
          )}
        </InputIconWrap>
      </Field>

      <Field>
        <Label htmlFor="nickname">닉네임</Label>
        <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </Field>

      <CheckboxRow>
        <input type="checkbox" checked={agreeRequired} onChange={(e) => setAgreeRequired(e.target.checked)} />
        (필수) 이용 약관 및 개인 정보 수집 동의
      </CheckboxRow>
      <CheckboxRow>
        <input type="checkbox" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} />
        (선택) 마케팅 정보 수신 동의
      </CheckboxRow>

      <ButtonPrimary type="submit" disabled={!canSubmit}>
        가입하기
      </ButtonPrimary>
    </form>
  );
}