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
    { label: '귀찮음', value: 4 },
    { label: '행복', value: 3 },
    { label: '고마움', value: 2 },
    { label: '성취', value: 3 },
    { label: '무의식', value: 5 },
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

const CHART_H = 160;
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

      <Section>
        <Headline>
          나의 충동 지수는
          <br />
          <strong>{DUMMY_IMPULSE.score}점</strong>이에요
        </Headline>
        <SubText>
          지난 주보다 {Math.abs(impulseDiff)}점 {impulseDiff >= 0 ? '올랐어요!' : '낮아졌어요!'}
        </SubText>

        <BarWrap>
          <ScoreBar
            value={DUMMY_IMPULSE.score}
            max={100}
            markerValue={DUMMY_IMPULSE.peerAverage}
            markerLabel="또래 평균 점수"
          />
        </BarWrap>

        <ReasonButton type="button" onClick={() => navigate('/analysis/report/impulse')}>
          내 점수 이유 확인하기
        </ReasonButton>

        <BptiTitle>나의 소비성격유형 BPTI는</BptiTitle>
        <BptiType>[ {DUMMY_BPTI.type} - {DUMMY_BPTI.label} ]</BptiType>
        <BptiDefinition>{DUMMY_BPTI.definition}</BptiDefinition>

        <RadarChart axes={DUMMY_BPTI.tags} max={DUMMY_BPTI.tagMax} />

        <BptiMessage>{DUMMY_BPTI.message}</BptiMessage>
      </Section>

      <Section ref={walletSectionRef}>
        <Headline>
          나의 지갑 온도는
          <br />
          <strong>{DUMMY_WALLET.myTemp}°C</strong> !
        </Headline>
        <SubText>
          나와 비슷한 친구들 평균({DUMMY_WALLET.peerAvgTemp}°C)보다 {Math.abs(walletDiff)}°C 더{' '}
          {walletDiff >= 0 ? '뜨거워요!' : '차가워요!'}
          <br />
          친구들보다 {walletDiff >= 0 ? '빠르게' : '느리게'} 예산을 소비하고 있어요
        </SubText>

        <WalletIconBox>
          <img src={WALLET_IMAGES[walletLevelIndex]} alt={DUMMY_WALLET.level} width={72} height={72} />
        </WalletIconBox>

        <BarWrap>
          <ScoreBar
            value={DUMMY_WALLET.myTemp}
            max={120}
            markerValue={DUMMY_WALLET.peerAvgTemp}
            markerLabel="또래 평균 온도"
          />
        </BarWrap>

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
      </Section>

      <Section>
        <Headline>
          이번 달 예상 지출액은
          <br />
          <strong>{DUMMY_FORECAST.forecast.toLocaleString()}원</strong>
        </Headline>
        <SubText>
          나의 한달 평균 지출액은 {Math.round(DUMMY_FORECAST.monthlyAverage / 10000)}만원
          <br />
          {DUMMY_FORECAST.lastMonthLabel}에는 {Math.round(DUMMY_FORECAST.lastMonthAmount / 10000)}만원 썼어요
        </SubText>

        {forecastOverBudget && <WarningText>예산 초과 예상: 과소비에 주의하세요!</WarningText>}

        <ChartWrap>
          <BudgetLine style={{ bottom: `${LABEL_H + (TRACK_H * budgetLinePercent) / 100}px` }}>
            <BudgetLineScissors>✂</BudgetLineScissors>
          </BudgetLine>
          <ChartBars>
            {chartBars.map((bar) => (
              <ChartBarColumn key={bar.label}>
                <ChartBarValue $forecast={'isForecast' in bar && bar.isForecast}>
                  {Math.round(bar.amount / 10000)}
                  {'isForecast' in bar && bar.isForecast && <ForecastTag>예상</ForecastTag>}
                </ChartBarValue>
                <ChartBarTrack>
                  <ChartBar
                    $forecast={'isForecast' in bar && bar.isForecast}
                    style={{ height: `${(bar.amount / chartMax) * 100}%` }}
                  />
                </ChartBarTrack>
                <ChartBarLabel>{bar.label}</ChartBarLabel>
              </ChartBarColumn>
            ))}
          </ChartBars>
        </ChartWrap>

        <SatisfactionButtonWrap>
          <SatisfactionButton type="button" onClick={() => navigate('/satisfaction/result')}>
            내 소비 만족도 보러 가기 →
          </SatisfactionButton>
        </SatisfactionButtonWrap>
      </Section>
    </PageWrap>
  );
}

const Section = styled.div`
  padding: 8px 0 36px;

  & + & {
    border-top: 1px solid #eee;
  }
`;

const Headline = styled.h1`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  margin: 4px 0 6px;

  strong {
    font-size: 22px;
    font-weight: 800;
  }
`;

const SubText = styled.p`
  font-size: 13px;
  color: #888;
  line-height: 1.5;
  margin: 0 0 20px;
`;

const BarWrap = styled.div`
  margin-bottom: 28px;
`;

const ReasonButton = styled.button`
  display: block;
  margin: 0 0 32px;
  padding: 10px 16px;
  border: none;
  border-radius: 999px;
  background: #f0eefb;
  color: #6a5ce6;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

const BptiTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
`;

const BptiType = styled.div`
  font-size: 22px;
  font-weight: 800;
  text-align: center;
`;

const BptiDefinition = styled.div`
  font-size: 13px;
  color: #888;
  text-align: center;
  margin: 4px 0 20px;
`;

const BptiMessage = styled.p`
  font-size: 13px;
  color: #444;
  line-height: 1.6;
  text-align: center;
  margin: 16px 0 0;
`;

const WalletIconBox = styled.div`
  width: 100%;
  height: 140px;
  border-radius: 14px;
  background: #f6f6f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const WalletStatusCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  padding: 16px 18px;
`;

const WalletStatusTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const WalletStatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 14px;
  padding: 6px 0;

  span {
    color: #888;
  }

  strong {
    font-weight: 700;
  }
`;

const SatisfactionButtonWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const SatisfactionButton = styled.button`
  display: inline-block;
  padding: 8px 18px;
  border: none;
  border-radius: 999px;
  background: #efe9fe;
  color: #6c3ef4;
  font-size: 13px;
  font-weight: 600;
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

const WarningText = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #ff5c5c;
  text-align: center;
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
  height: ${VALUE_H}px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 4px;
  font-size: 11px;
  font-weight: ${({ $forecast }) => ($forecast ? 800 : 600)};
  color: ${({ $forecast }) => ($forecast ? '#111' : '#999')};
  text-align: center;
`;

const ForecastTag = styled.div`
  font-size: 9px;
  color: #ff7d7d;
  font-weight: 700;
`;

const ChartBarTrack = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const ChartBar = styled.div<{ $forecast?: boolean }>`
  width: 28px;
  border-radius: 6px 6px 0 0;
  background: ${({ $forecast }) => ($forecast ? '#9C93EA' : '#ececec')};
`;

const ChartBarLabel = styled.div`
  height: ${LABEL_H}px;
  padding-top: 8px;
  font-size: 11px;
  color: #888;
  text-align: center;
`;

const BudgetLine = styled.div`
  position: absolute;
  left: 0;
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
