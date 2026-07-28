import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import Logo from '../../components/Logo';
import eyeIcon from '../../assets/images/eye_icon.svg';
import closedEyeIcon from '../../assets/images/closed_eye_icon.svg';
import { AuthTitle, Field, Label, Input, InputIconWrap, ButtonPrimary, Links } from '../../styles/auth.styles';

export default function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 로그인 API 연동
  };

  return (
    <form onSubmit={handleSubmit}>
      <BackButton to="/" />
      <Logo />
      <AuthTitle>LOGIN</AuthTitle>

      <Field>
        <Label htmlFor="id">아이디</Label>
        <Input id="id" value={id} onChange={(e) => setId(e.target.value)} />
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

      <ButtonPrimary type="submit">로그인</ButtonPrimary>

      <Links>
        <Link to="/register">계정 만들기</Link>
        <span>|</span>
        <Link to="/find-password">비밀번호 찾기</Link>
      </Links>
    </form>
  );
}