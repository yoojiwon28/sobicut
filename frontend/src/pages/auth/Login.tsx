import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import Logo from '../../components/Logo';
import eyeIcon from '../../assets/images/eye_icon.svg';
import closedEyeIcon from '../../assets/images/closed_eye_icon.svg';
import kakaoLogo from '../../assets/images/kakaologo.svg';
import { AuthTitle, Field, Label, Input, InputIconWrap, ButtonPrimary, Links, LoadingOverlay, Spinner } from '../../styles/auth.styles';
import { useAuth } from '../../contexts/AuthContext';
import { login as loginApi, loginWithKakao } from '../../api/auth';
import { getKakaoAccessToken } from '../../utils/kakao';
import { ApiError } from '../../api/client';

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  margin: 16px 0 0;
`;

const PasswordField = styled(Field)`
  margin-bottom: 10px;
`;


const KakaoButton = styled(ButtonPrimary)`
  background: #fee500;
  color: #191919;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [kakaoSubmitting, setKakaoSubmitting] = useState(false);
  const [kakaoError, setKakaoError] = useState('');

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

  const handleKakaoLogin = async () => {
    if (kakaoSubmitting) return;
    setKakaoSubmitting(true);
    setKakaoError('');

    let kakaoAccessToken = '';
    try {
      kakaoAccessToken = await getKakaoAccessToken();
    } catch {
      console.error('[Kakao] 로그인 실패', kakaoError);
      setKakaoError('카카오 로그인이 취소되었거나 실패했어요.');
      setKakaoSubmitting(false);
      return;
    }

    try {
      const { access_token } = await loginWithKakao({ access_token: kakaoAccessToken });
      login(access_token);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        // 신규 유저 → 프로필 입력 화면으로 (카카오 access_token은 다음 화면에서 다시 씀)
        navigate('/register-profile/kakao', { state: { kakaoAccessToken } });
        return;
      }
      setKakaoError(
        err instanceof ApiError ? err.message : '카카오 로그인에 실패했어요. 다시 시도해주세요.',
      );
    } finally {
      setKakaoSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <BackButton to="/onboarding" />
      <Logo />
      <AuthTitle>로그인</AuthTitle>

      <Field>
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>

      <PasswordField>
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
      </PasswordField>

      <ButtonPrimary type="submit" disabled={submitting}>
        로그인
      </ButtonPrimary>
      {error && <ErrorText>{error}</ErrorText>}

      <KakaoButton
        type="button"
        disabled={kakaoSubmitting}
        onClick={handleKakaoLogin}
      >
        <img src={kakaoLogo} alt="" width={20} height={20} />
        카카오계정 로그인
      </KakaoButton>
      {kakaoError && <ErrorText>{kakaoError}</ErrorText>}  


      {(submitting || kakaoSubmitting) && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}

      <Links>
        <Link to="/register">계정 만들기</Link>
        <span>|</span>
        <Link to="/find-password">비밀번호 찾기</Link>
      </Links>
    </form>
  );
}