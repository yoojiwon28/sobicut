import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import Logo from '../../components/Logo';
import eyeIcon from '../../assets/images/eye_icon.svg';
import closedEyeIcon from '../../assets/images/closed_eye_icon.svg';
import { AuthTitle, Field, Label, Input, InputIconWrap, ButtonPrimary, Links } from '../../styles/auth.styles';
import { useAuth } from '../../contexts/AuthContext';
import { login as loginApi } from '../../api/auth';
import { ApiError } from '../../api/client';

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  text-align: center;
  margin: 8px 0 0;
`;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const { access_token } = await loginApi(email, password);
      login(access_token);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '로그인에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <BackButton to="/onboarding" />
      <Logo />
      <AuthTitle>LOGIN</AuthTitle>

      <Field>
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>

      <Field>
        <Label htmlFor="password">비밀번호</Label>
        <InputIconWrap>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="비밀번호 표시 전환">
            <img src={showPassword ? eyeIcon : closedEyeIcon} alt="" width={20} height={20} />
          </button>
        </InputIconWrap>
      </Field>

      {error && <ErrorText>{error}</ErrorText>}

      <ButtonPrimary type="submit" disabled={submitting}>
        {submitting ? '로그인 중...' : '로그인'}
      </ButtonPrimary>

      <Links>
        <Link to="/register">계정 만들기</Link>
        <span>|</span>
        <Link to="/find-password">비밀번호 찾기</Link>
      </Links>
    </form>
  );
}