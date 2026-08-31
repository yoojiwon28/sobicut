import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled, { keyframes } from 'styled-components';
import Logo2 from '../components/Logo2';
import ExpenseList from '../components/ExpenseList';
import ExpenseCaptureModal from '../components/ExpenseCaptureModal';
import { ButtonPrimary } from '../styles/auth.styles';
import { getSettings } from '../api/users';
import { getTransactions } from '../api/transactions';
import { toDateKey } from '../utils/date';
import { DUMMY_CAPTURED_SMS } from '../mocks/pendingCapture';
import notificationIcon from '../assets/images/notification_icon.svg';
import {
  WALLET_IMAGES,
  WALLET_STATUS_TEXT,
  WALLET_GAUGE_COLORS,
  WALLET_BADGE_COLORS,
  getWalletLevelIndex,
} from '../utils/wallet';
import { useScores } from '../hooks/useReports';
import { getNotifications } from '../api/notifications';

// TODO: 실제로는 새 결제 문자 감지 시 서버에서 파싱+LLM 분류된 값을 내려받아 모달로 표시
const hasPendingCapture = true;


export default function Home() {
  const navigate = useNavigate();
  const [showCaptureModal, setShowCaptureModal] = useState(hasPendingCapture);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });
  const hasNotification = notifications.some((n) => !n.is_read);

  const { data: settings } = useQuery({
    queryKey: ['users', 'me', 'settings'],
    queryFn: getSettings,
  });

  const { data: scores } = useScores();
  const impulseScore = scores?.impulse_score ?? 0;
  const myTemp = scores?.wallet_temperature.my_temp ?? 0;
  const walletLevel = scores?.wallet_temperature.level ?? '';

  const today = toDateKey(new Date());
  const { data: todayExpenses = [] } = useQuery({
    queryKey: ['transactions', { date: today, type: 'expense' }],
    queryFn: () => getTransactions({ date: today, type: 'expense' }),
  });

  const levelIndex = getWalletLevelIndex(walletLevel);
  const walletImage = WALLET_IMAGES[levelIndex];
  const walletStatusText = WALLET_STATUS_TEXT[levelIndex];
  const gaugeColor = WALLET_GAUGE_COLORS[levelIndex];
  const badgeColor = WALLET_BADGE_COLORS[levelIndex];

  const ARC_LENGTH = 130 * (Math.PI / 2); // 반지름 130, 90° 부채꼴 호 길이 ≈ 204.2

  const MIN_VISIBLE_PERCENT = 8;
  const tempPercent = myTemp > 0
    ? Math.max(MIN_VISIBLE_PERCENT, Math.min(100, myTemp))
    : 0;
  const impulsePercent = Math.min(100, Math.max(0, impulseScore));

  const tempDashOn = (tempPercent / 100) * ARC_LENGTH;
  const impulseDashOn = (impulsePercent / 100) * ARC_LENGTH;

  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const todayTotal = todayExpenses.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Page>
      <HeaderZone>
        <HeaderRow>
          <Logo2 width={110} />
          <NotificationLink to="/notification" aria-label="알림">
            <img src={notificationIcon} alt="" width={24} height={24} />
            {hasNotification && <Badge />}
          </NotificationLink>
        </HeaderRow>

        <Greeting> <strong>{settings?.nickname ?? '회원'}</strong> 님! 오늘도 절약해 봅시다</Greeting>
      </HeaderZone>

      <GaugeZone $tint={gaugeColor} $strength={levelIndex === 0 ? '66' : '33'}>
        <ScoreHeaders>
          <ScoreHeaderItem>
            <ScoreLabel>🌡️ 지갑 온도</ScoreLabel>
            <ScoreValue>{myTemp}°C</ScoreValue>
          </ScoreHeaderItem>
          <ScoreHeaderItem $align="right">
            <ScoreLabel>⚡ 충동 지수</ScoreLabel>
            <ScoreValue>{impulseScore}점</ScoreValue>
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

            <path
              d="M 30 160 A 130 130 0 0 1 160 30 A 130 130 0 0 1 290 160"
              stroke="#ececec"
              strokeWidth="26"
              strokeLinecap="round"
              fill="none"
            />

            {/* 지갑 온도*/}
            <TempPath
              d="M 30 160 A 130 130 0 0 1 160 30"
              stroke={gaugeColor}
              strokeWidth="26"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${animated ? tempDashOn : 0} ${ARC_LENGTH}`}
            />

            {/* 충동 지수 */}
            <ImpulsePath
              d="M 290 160 A 130 130 0 0 0 160 30"
              stroke="url(#impulseGradient)"
              strokeWidth="26"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${animated ? impulseDashOn : 0} ${ARC_LENGTH}`}
            />
            
          </GaugeSvg>
          <CharacterImg src={walletImage} alt={walletStatusText} />
        </GaugeWrap>

        <StatusBadgeWrap>
          <StatusBadge style={{ background: badgeColor.bg, color: badgeColor.text }}>
            상태: {walletStatusText}
          </StatusBadge>
        </StatusBadgeWrap>
      </GaugeZone>

      <BottomSection $tint={gaugeColor}>
        <ExpenseSection>
          <ExpenseSectionHeader>
            <span>오늘의 지출 - {todayTotal.toLocaleString()}원</span>
            <MoreLink to="/expenses/today">+ 더보기</MoreLink>
          </ExpenseSectionHeader>
          <ExpenseList items={todayExpenses.slice(0, 3)} />
        </ExpenseSection>

        <AddButton type="button" onClick={() => navigate('/expenses/add')}>
          + 지출 추가
        </AddButton>
      </BottomSection>

      {showCaptureModal && (
        <ExpenseCaptureModal rawText={DUMMY_CAPTURED_SMS} onClose={() => setShowCaptureModal(false)} />
      )}
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const HeaderZone = styled.div`
  padding: 20px 20px 4px;
`;

const GaugeZone = styled.div<{ $tint: string; $strength?: string }>`
  padding: 4px 20px 56px;
  background: radial-gradient(
    150% 70% at 50% 100%,
    ${({ $tint, $strength }) => `${$tint}${$strength ?? '33'}`} 0%,
    ${({ $tint }) => $tint}00 55%
  );
`;

const BottomSection = styled.div<{ $tint: string }>`
  position: relative;
  z-index: 1;
  margin-top: -28px;
  flex: 1;
  background: #fff;
  border-radius: 28px 28px 0 0;
  padding: 24px 20px 20px;
 
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
  margin: 0 0 8px;
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

const TempPath = styled.path`
  transition: stroke-dasharray 0.9s cubic-bezier(0.22, 1, 0.36, 1);
`;

const ImpulsePath = styled.path`
  transition: stroke-dasharray 0.9s cubic-bezier(0.22, 1, 0.36, 1);
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
  margin: 20px 0 0;
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
  margin-bottom: 20px;
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
  margin-top: 4px;
`;