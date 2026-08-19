import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Logo from '../components/Logo';
import { ButtonPrimary, ButtonOutline } from '../styles/auth.styles';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <Wrap>
      <Center>
        <Logo size={120} />
        <Tagline>소비 분석으로 똑똑하게 소비해요</Tagline>
      </Center>

      <ButtonGroup>
        <ButtonPrimary type="button" onClick={() => navigate('/login')}>
          로그인
        </ButtonPrimary>
        <ButtonOutline type="button" onClick={() => navigate('/register')}>
          회원가입
        </ButtonOutline>
      </ButtonGroup>
    </Wrap>
  );
}

const Wrap = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 60px 24px 40px;
  box-sizing: border-box;
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const Tagline = styled.p`
  font-size: 14px;
  color: #666;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
`;