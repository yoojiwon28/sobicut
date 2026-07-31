import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Logo2 from '../components/Logo2';
import ExpenseList from '../components/ExpenseList';
import { ButtonPrimary } from '../styles/auth.styles';
import { DUMMY_TODAY_EXPENSES } from '../mocks/transactions';
import notificationIcon from '../assets/images/notification_icon.svg';
import {
  WALLET_IMAGES,
  WALLET_STATUS_TEXT,
  WALLET_GAUGE_COLORS,
  WALLET_BADGE_COLORS,
  getWalletLevelIndex,
} from '../utils/wallet';

// TODO: 실제 프로필 API
const DUMMY_USER_NAME = '박영호';

// TODO: 알림 여부 실제 알림 API
const hasNotification = true;

// GET /reports/scores 더미데이터
const DUMMY_SCORES = {
  impulse_score: 30,
  wallet_temperature: {
    my_temp: 97,
    peer_avg_temp: 110,
    diff: 7,
    level: '임계',
    emoji: '😐',
    message: '지갑이 적당히 데워지고 있어요. 이 흐름을 유지해보세요',
  },
  bpti: {
    type: 'FIRE',
    label: '불지옥',
    definition: '홧김 비용의 지배자',
    message: '화가 날 때 지갑을 여는 타입! 스트레스 해소법을 돈 쓰기 말고 다른 걸로 찾아봐요.',
  },
};

export default function Home() {
  const navigate = useNavigate();

  const levelIndex = getWalletLevelIndex(DUMMY_SCORES.wallet_temperature.level);
  const walletImage = WALLET_IMAGES[levelIndex];
  const walletStatusText = WALLET_STATUS_TEXT[levelIndex];
  const gaugeColor = WALLET_GAUGE_COLORS[levelIndex];
  const badgeColor = WALLET_BADGE_COLORS[levelIndex];

  const tempPercent = Math.min(100, Math.max(0, DUMMY_SCORES.wallet_temperature.my_temp));
  const impulsePercent = Math.min(100, Math.max(0, DUMMY_SCORES.impulse_score));

  const todayTotal = DUMMY_TODAY_EXPENSES.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Page>
      <div>
        <HeaderRow>
          <Logo2 width={110} />
          <NotificationLink to="/notification" aria-label="알림">
            <img src={notificationIcon} alt="" width={24} height={24} />
            {hasNotification && <Badge />}
          </NotificationLink>
        </HeaderRow>

        <Greeting> <strong>{DUMMY_USER_NAME}</strong> 님! 오늘도 절약해 봅시다</Greeting>

        <ScoreHeaders>
          <ScoreHeaderItem>
            <ScoreLabel>🌡️ 지갑 온도</ScoreLabel>
            <ScoreValue>{DUMMY_SCORES.wallet_temperature.my_temp}°C</ScoreValue>
          </ScoreHeaderItem>
          <ScoreHeaderItem $align="right">
            <ScoreLabel>⚡ 충동 지수</ScoreLabel>
            <ScoreValue>{DUMMY_SCORES.impulse_score}점</ScoreValue>
          </ScoreHeaderItem>
        </ScoreHeaders>

        <GaugeWrap>
          <GaugeSvg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="impulseGradient" gradientUnits="userSpaceOnUse" x1="290" y1="160" x2="160" y2="30">
                <stop offset="0%" stopColor="#9589F0" />
                <stop offset="33%" stopColor="#6A5CE6" />
                <stop offset="66%" stopColor="#4035B0" />
                <stop offset="100%" stopColor="#221B75" />
              </linearGradient>
            </defs>

            
            <path d="M 30 160 A 130 130 0 0 1 160 30" stroke="#ececec" strokeWidth="26" strokeLinecap="round" fill="none" />
            <path d="M 160 30 A 130 130 0 0 1 290 160" stroke="#ececec" strokeWidth="26" strokeLinecap="round" fill="none" />

            {/* 지갑 온도*/}
            <path
              d="M 30 160 A 130 130 0 0 1 160 30"
              stroke={gaugeColor}
              strokeWidth="26"
              strokeLinecap="round"
              fill="none"
              pathLength={100}
              strokeDasharray={`${tempPercent} ${100 - tempPercent}`}
            />

            {/* 충동 지수 */}
            <path
              d="M 290 160 A 130 130 0 0 0 160 30"
              stroke="url(#impulseGradient)"
              strokeWidth="26"
              strokeLinecap="round"
              fill="none"
              pathLength={100}
              strokeDasharray={`${impulsePercent} ${100 - impulsePercent}`}
            />
          </GaugeSvg>
          <CharacterImg src={walletImage} alt={walletStatusText} />
        </GaugeWrap>

        <StatusBadgeWrap>
          <StatusBadge style={{ background: badgeColor.bg, color: badgeColor.text }}>
            상태: {walletStatusText}
          </StatusBadge>
        </StatusBadgeWrap>

        <ExpenseSection>
          <ExpenseSectionHeader>
            <span>오늘의 지출 - {todayTotal.toLocaleString()}원</span>
            <MoreLink to="/expenses/today">+ 더보기</MoreLink>
          </ExpenseSectionHeader>
          <ExpenseList items={DUMMY_TODAY_EXPENSES.slice(0, 3)} />
        </ExpenseSection>
      </div>

      <AddButton type="button" onClick={() => navigate('/expenses/add')}>
        + 지출 추가
      </AddButton>
    </Page>
  );
}

const Page = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const NotificationLink = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Badge = styled.span`
  position: absolute;
  top: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff7d7d;
  border: 1.5px solid #fff;
`;

const Greeting = styled.h1`
  font-size: 18px;
  font-weight: 400;
  margin: 0 0 24px;
`;

const ScoreHeaders = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ScoreHeaderItem = styled.div<{ $align?: 'left' | 'right' }>`
  text-align: ${({ $align }) => $align ?? 'left'};
`;

const ScoreLabel = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const ScoreValue = styled.div`
  font-size: 35px;
  font-weight: 700;
`;

const GaugeWrap = styled.div`
  position: relative;
  width: 100%;
  max-width: 320px;
  aspect-ratio: 320 / 180;
  margin: 0 auto;
`;

const GaugeSvg = styled.svg`
  width: 100%;
  height: 100%;
`;

const float = keyframes`
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-6px);
  }
`;

const CharacterImg = styled.img`
  position: absolute;
  bottom: 4px;
  left: 50%;
  width: 110px;
  height: auto;
  animation: ${float} 2.4s ease-in-out infinite;
`;

const StatusBadgeWrap = styled.div`
  text-align: center;
  margin: 20px 0 28px;
`;

const StatusBadge = styled.span`
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 999px;
  transition: background 0.2s ease, color 0.2s ease;
`;

const ExpenseSection = styled.div`
  margin-bottom: 28px;
`;

const ExpenseSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  margin-bottom: 4px;
`;

const MoreLink = styled(Link)`
  display: inline-block;
  background: #f4f2fc;
  color: #6a5ce6;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  text-decoration: none;
`;

const AddButton = styled(ButtonPrimary)`
  margin-top: 0;
`;