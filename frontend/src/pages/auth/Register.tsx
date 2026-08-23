import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import Logo from '../../components/Logo';
import eyeIcon from '../../assets/images/eye_icon.svg';
import closedEyeIcon from '../../assets/images/closed_eye_icon.svg';
import checkIcon from '../../assets/images/check_icon.svg';
import { checkEmail, validatePassword } from '../../api/auth';
import { ApiError } from '../../api/client';
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
  Spinner
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

const HelperText = styled.span<{ $tone: 'ok' | 'error' }>`
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: ${({ $tone }) => ($tone === 'ok' ? '#2ecc71' : '#e74c3c')};
`;

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeRequired, setAgreeRequired] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const [emailAvailable, setEmailAvailable] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  const [passwordServerMessage, setPasswordServerMessage] = useState('');

  const passwordMatches = passwordConfirm.length > 0 && password === passwordConfirm;
  const passwordValid = PASSWORD_REGEX.test(password);

  const canSubmit = emailAvailable && agreeRequired && passwordValid && passwordMatches;

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailAvailable(false); // 값 바뀌면 재확인 필요
    setEmailMessage('');
  };

  const handleCheckEmail = async () => {
    if (!email) return;
    setEmailChecking(true);
    setEmailMessage('');
    try {
      const { is_available } = await checkEmail(email);
      setEmailAvailable(is_available);
      setEmailMessage(is_available ? '사용 가능한 이메일이에요.' : '이미 사용 중인 이메일이에요.');
    } catch (err) {
      setEmailAvailable(false);
      setEmailMessage(err instanceof ApiError ? err.message : '이메일 확인에 실패했어요.');
    } finally {
      setEmailChecking(false);
    }
  };

  const handlePasswordBlur = async () => {
    setPasswordServerMessage('');
    if (!passwordValid) return;
    try {
      const { is_valid, message } = await validatePassword(password);
      if (!is_valid) setPasswordServerMessage(message);
    } catch {
      // 서버 2차 검증 실패는 조용히 무시 (1차 프론트 검증으로 충분)
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    navigate('/register-profile', { state: { email, password, nickname } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <BackButton to="/login" />
      <Logo />
      <AuthTitle>회원가입</AuthTitle>

      <Field>
        <Label htmlFor="email">이메일 (아이디)</Label>
        <InputRow>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={handleEmailChange}
          />
          <ButtonDark type="button" onClick={handleCheckEmail} disabled={!email || emailChecking}>
            {emailChecking ? <Spinner $size={16} $color="#fff" $trackColor="rgba(255,255,255,0.4)" /> : '중복 확인'}
          </ButtonDark>
        </InputRow>
        {emailMessage && <HelperText $tone={emailAvailable ? 'ok' : 'error'}>{emailMessage}</HelperText>}
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
            onBlur={handlePasswordBlur}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="비밀번호 표시 전환">
            <img src={showPassword ? eyeIcon : closedEyeIcon} alt="" width={20} height={20} />
          </button>
        </InputIconWrap>
        {password.length > 0 && (
          <HelperText $tone={passwordValid ? 'ok' : 'error'}>
            {passwordValid ? '사용가능한 비밀번호입니다.' : '사용 불가능한 비밀번호입니다.'}
          </HelperText>
        )}
        {passwordServerMessage && <HelperText $tone="error">{passwordServerMessage}</HelperText>}
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
        다음
      </ButtonPrimary>
    </form>
  );
}