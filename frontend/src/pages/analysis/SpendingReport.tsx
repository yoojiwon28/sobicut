import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import ScoreBar from '../../components/ScoreBar';
import RadarChart from '../../components/RadarChart';
import { PageWrap } from '../../styles/auth.styles';
import { WALLET_IMAGES, getWalletLevelIndex } from '../../utils/wallet';

// GET /reports/impulse 더미데이터
const DUMMY_IMPULSE = {
  score: 67,
  lastWeekScore: 60,
  peerAverage: 60,
};

// GET /reports/bpti 더미데이터
const DUMMY_BPTI = {
  type: 'FIRE',
  label: '불지옥',
  definition: '홧김 비용의 지배자',
  message: '화가 날 때 지갑을 여는 타입! 스트레스 해소법을 돈 쓰기 말고 다른 걸로 찾아봐요.',
  tags: [
    { label: '스트레스', value: 9 },
    { label: '무의식', value: 5 },
    { label: '귀찮음', value: 4 },
    { label: '성취', value: 3 },
    { label: '행복', value: 3 },
    { label: '고마움', value: 2 },
  ],
  tagMax: 10,
};

// GET /reports/wallet-temperature 더미데이터
const DUMMY_WALLET = {
  myTemp: 72,
  peerAvgTemp: 65,
  level: '임계',
  income: 900000,
  spending: 250000,
};

const CHART_H = 190;
const VALUE_H = 34;
const LABEL_H = 27;
const TRACK_H = CHART_H - VALUE_H - LABEL_H;

// GET /reports/forecast 더미데이터
const DUMMY_FORECAST = {
  forecast: 1554000,
  monthlyAverage: 1200000,
  lastMonthLabel: '2월',
  lastMonthAmount: 1300000,
  budgetLine: 1300000,
  history: [
    { label: '11월', amount: 1100000 },
    { label: '12월', amount: 1200000 },
    { label: '1월', amount: 1000000 },
    { label: '2월', amount: 1300000 },
  ],
};

export default function SpendingReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const walletSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.hash === '#wallet') {
      walletSectionRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [location.hash]);

  const impulseDiff = DUMMY_IMPULSE.score - DUMMY_IMPULSE.lastWeekScore;
  const walletDiff = DUMMY_WALLET.myTemp - DUMMY_WALLET.peerAvgTemp;
  const walletLevelIndex = getWalletLevelIndex(DUMMY_WALLET.level);
  const walletRemain = DUMMY_WALLET.income - DUMMY_WALLET.spending;

  const forecastOverBudget = DUMMY_FORECAST.forecast > DUMMY_FORECAST.budgetLine;
  const chartBars = [...DUMMY_FORECAST.history, { label: '이번 달', amount: DUMMY_FORECAST.forecast, isForecast: true }];
  const chartMax = Math.max(...chartBars.map((b) => b.amount));
  const budgetLinePercent = (DUMMY_FORECAST.budgetLine / chartMax) * 100;

  return (
    <PageWrap>
      <BackButton to="/analysis" />

      <Card>
        <CardTop>
          <Headline>
            나의 충동 지수는
            <br />
            <ImpulseStrong>{DUMMY_IMPULSE.score}점</ImpulseStrong>이에요
          </Headline>
          <DiffBadge>
            {impulseDiff >= 0 ? '▲' : '▼'} 지난주보다 {Math.abs(impulseDiff)}점
          </DiffBadge>
        </CardTop>

        <ImpulseTrack>
          <ImpulseFill style={{ width: `${Math.min(100, Math.max(0, DUMMY_IMPULSE.score))}%` }} />
        </ImpulseTrack>

        <ReasonButton type="button" onClick={() => navigate('/analysis/report/impulse')}>
          내 점수 이유 확인하기→
        </ReasonButton>
      </Card>

      <Card>
        <BptiTitle>나의 소비성격유형 BPTI는</BptiTitle>
        <BptiType>[ {DUMMY_BPTI.type} - {DUMMY_BPTI.label} ]</BptiType>
        <BptiDefinition>{DUMMY_BPTI.definition}</BptiDefinition>

        <RadarChart axes={DUMMY_BPTI.tags} max={DUMMY_BPTI.tagMax} />

        <BptiMessage>{DUMMY_BPTI.message}</BptiMessage>
      </Card>

      <Card ref={walletSectionRef}>
        <Headline>
          나의 지갑 온도는
          <br />
          <WalletTempStrong>{DUMMY_WALLET.myTemp}°C</WalletTempStrong> !
        </Headline>
        <SubText>
          나와 비슷한 친구들 평균({DUMMY_WALLET.peerAvgTemp}°C)보다 {Math.abs(walletDiff)}°C 더{' '}
          {walletDiff >= 0 ? '뜨거워요!' : '차가워요!'}
          <br />
          친구들보다 {walletDiff >= 0 ? '빠르게' : '느리게'} 예산을 소비하고 있어요
        </SubText>

        <WalletIconBox>
          <img src={WALLET_IMAGES[walletLevelIndex]} alt={DUMMY_WALLET.level} width={110} height={110} />
        </WalletIconBox>

        <BarWrap>
          <ScoreBar
            value={DUMMY_WALLET.myTemp}
            max={120}
            markerValue={DUMMY_WALLET.peerAvgTemp}
            markerLabel="또래 평균 온도"
            markerValueLabel={`${DUMMY_WALLET.peerAvgTemp}°C`}
          />
        </BarWrap>

        <WalletLevelRow>
          {WALLET_IMAGES.map((img, i) => (
            <WalletLevelImg key={i} src={img} alt="" $active={i === walletLevelIndex} />
          ))}
        </WalletLevelRow>
      </Card>

      <Card>
        <WalletStatusCard>
          <WalletStatusTitle>이번 달 지갑 현황</WalletStatusTitle>
          <WalletStatusRow>
            <span>수입</span>
            <strong>{DUMMY_WALLET.income.toLocaleString()}원</strong>
          </WalletStatusRow>
          <WalletStatusRow>
            <span>소비</span>
            <strong>{DUMMY_WALLET.spending.toLocaleString()}원</strong>
          </WalletStatusRow>
          <WalletStatusDivider />
          <WalletStatusRow>
            <span>남은 금액</span>
            <strong>{walletRemain.toLocaleString()}원</strong>
          </WalletStatusRow>
        </WalletStatusCard>
      </Card>

      <Card>
        <ForecastHeadline>이번 달 예상 지출액은 {DUMMY_FORECAST.forecast.toLocaleString()}원</ForecastHeadline>
        <ForecastSubText>
          나의 한달 평균 지출액은 {Math.round(DUMMY_FORECAST.monthlyAverage / 10000)}만원
          <br />
          {DUMMY_FORECAST.lastMonthLabel}에는 {Math.round(DUMMY_FORECAST.lastMonthAmount / 10000)}만원 썼어요
        </ForecastSubText>

        {forecastOverBudget && <WarningText>예산 초과 예상: 과소비에 주의하세요!</WarningText>}

        <ChartWrap>
          <BudgetLine style={{ bottom: `${LABEL_H + (TRACK_H * budgetLinePercent) / 100}px` }}>
            <BudgetLineScissors>✂</BudgetLineScissors>
          </BudgetLine>
          <ChartBars>
            {chartBars.map((bar) => (
              <ChartBarColumn key={bar.label}>
                <ChartBarTrack>
                  <ChartBarBarWrap style={{ height: `${(bar.amount / chartMax) * 100}%` }}>
                    <ChartBarValue $forecast={'isForecast' in bar && bar.isForecast}>
                      {Math.round(bar.amount / 10000)}
                      {'isForecast' in bar && bar.isForecast && <ForecastTag>예상</ForecastTag>}
                    </ChartBarValue>
                    <ChartBar $forecast={'isForecast' in bar && bar.isForecast} />
                  </ChartBarBarWrap>
                </ChartBarTrack>
                <ChartBarLabel>{bar.label}</ChartBarLabel>
              </ChartBarColumn>
            ))}
          </ChartBars>
        </ChartWrap>
      </Card>

      <SatisfactionButtonWrap>
        <SatisfactionButton type="button" onClick={() => navigate('/satisfaction/result')}>
          내 소비 만족도 보러 가기 →
        </SatisfactionButton>
      </SatisfactionButtonWrap>
    </PageWrap>
  );
}

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 20px 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

  & + & {
    margin-top: 14px;
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const DiffBadge = styled.div`
  background: #ffe8e8;
  color: #ff4040;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
`;

const Headline = styled.h1`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  margin: 4px 0 6px;
`;

const ImpulseStrong = styled.strong`
  font-size: 26px;
  font-weight: 800;
`;

const WalletTempStrong = styled.strong`
  font-size: 32px;
  font-weight: 800;
  color: #ff7d7d;
`;

const SubText = styled.p`
  font-size: 13px;
  color: #888;
  line-height: 1.5;
  margin: 0 0 20px;
`;

const ForecastSubText = styled(SubText)`
  color: #bbb;
  font-size: 15px;
`;

const BarWrap = styled.div`
  margin-bottom: 28px;
`;

const ImpulseTrack = styled.div`
  position: relative;
  width: 100%;
  height: 26px;
  border-radius: 999px;
  background: #f5f5f5;
  margin: 16px 0 0;
  overflow: hidden;
`;

const ImpulseFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: #6a5ce6;
  transition: width 0.2s ease;
`;

const ReasonButton = styled.button`
  display: block;
  margin: 18px auto 0;
  padding: 0;
  border: none;
  background: none;
  color: #6a5ce6;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
`;

const BptiTitle = styled.div`
  font-size: 15px;
  font-weight: 800;
  text-align: left;
  margin-bottom: 8px;
`;

const BptiType = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #6a5ce6;
  text-align: center;
`;

const BptiDefinition = styled.div`
  font-size: 15px;
  color: #999;
  text-align: center;
  margin: 4px 0 20px;
`;

const BptiMessage = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  text-align: center;
  margin: 16px 0 0;
`;

const WalletIconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0 20px;
`;

const WalletLevelRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 22px;
`;

const WalletLevelImg = styled.img<{ $active: boolean }>`
  width: 40px;
  opacity: ${({ $active }) => ($active ? 1 : 0.4)};
  transform: ${({ $active }) => ($active ? 'scale(1.15)' : 'none')};
`;

const WalletStatusCard = styled.div`
  padding: 0;
`;

const WalletStatusTitle = styled.div`
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 14px;
`;

const WalletStatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 16px;
  padding: 6px 0;

  span {
    color: #888;
  }

  strong {
    font-weight: 800;
  }
`;

const SatisfactionButtonWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-bottom: 8px;
`;

const SatisfactionButton = styled.button`
  display: inline-block;
  padding: 12px 22px;
  border: none;
  border-radius: 999px;
  background: #edeafb;
  color: #6a5ce6;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:active {
    opacity: 0.8;
  }
`;

const WalletStatusDivider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 4px 0;
`;

const ForecastHeadline = styled.h1`
  font-size: 18px;
  font-weight: 800;
  line-height: 1.4;
  margin: 4px 0 6px;
`;

const WarningText = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #ff4040;
  text-align: right;
  margin: -8px 0 20px;
`;

const ChartWrap = styled.div`
  position: relative;
  margin-top: 12px;
`;

const ChartBars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: ${CHART_H}px;
`;

const ChartBarColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

const ChartBarValue = styled.div<{ $forecast?: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 6px;
  width: max-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 13px;
  font-weight: ${({ $forecast }) => ($forecast ? 800 : 600)};
  color: ${({ $forecast }) => ($forecast ? '#333' : '#999')};
  text-align: center;
  white-space: nowrap;
`;

const ForecastTag = styled.div`
  font-size: 11px;
  color: #ff7d7d;
  font-weight: 700;
`;

const ChartBarTrack = styled.div`
  flex: 1;
  width: 100%;
  padding-top: ${VALUE_H}px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const ChartBarBarWrap = styled.div`
  position: relative;
  width: 44px;
`;

const ChartBar = styled.div<{ $forecast?: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background: ${({ $forecast }) => ($forecast ? '#FF7D7D' : '#F5F5F5')};
`;

const ChartBarLabel = styled.div`
  height: ${LABEL_H}px;
  padding-top: 8px;
  font-size: 13px;
  color: #333;
  text-align: center;
`;

const BudgetLine = styled.div`
  position: absolute;
  left: 83%;
  right: 0;
  border-top: 1px dashed #999;
  z-index: 1;
`;

const BudgetLineScissors = styled.span`
  position: absolute;
  right: -4px;
  top: -9px;
  font-size: 12px;
  transform: rotate(90deg);
`;
