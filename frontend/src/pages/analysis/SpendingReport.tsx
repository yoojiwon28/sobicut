import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import ScoreBar from '../../components/ScoreBar';
import RadarChart from '../../components/RadarChart';
import { PageWrap } from '../../styles/auth.styles';
import { WALLET_IMAGES, WALLET_GAUGE_COLORS, getWalletLevelIndex } from '../../utils/wallet';
import { getImpulseGaugeColor } from '../../utils/impulse';
import {
  useImpulseReport,
  useBptiReport,
  useWalletTemperature,
  useMonthlyForecast,
} from '../../hooks/useReports';

// API 값이 0~100 스케일이므로 max 는 100
const BPTI_TAG_MAX = 100;

const CHART_H = 190;
const VALUE_H = 34;
const LABEL_H = 27;
const TRACK_H = CHART_H - VALUE_H - LABEL_H;

export default function SpendingReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const walletSectionRef = useRef<HTMLDivElement>(null);

  const impulseQuery = useImpulseReport();
  const bptiQuery = useBptiReport();
  const walletQuery = useWalletTemperature();
  const forecastQuery = useMonthlyForecast();

  useEffect(() => {
    if (location.hash === '#wallet') {
      walletSectionRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [location.hash]);

  const impulse = impulseQuery.data;
  const bpti = bptiQuery.data;
  const wallet = walletQuery.data;
  const forecast = forecastQuery.data;

  const impulseScore = impulse?.impulse_score;
  const impulseGaugeColor = getImpulseGaugeColor(impulse?.is_warning);
  const weekOverWeek = impulse?.week_over_week;
  const impulseDiff = weekOverWeek?.diff ?? 0;

  const myTemp = wallet?.my_temp;
  const peerAvgTemp = wallet?.peer_avg_temp;
  const walletDiff = myTemp != null && peerAvgTemp != null ? myTemp - peerAvgTemp : 0;
  const walletLevelIndex = getWalletLevelIndex(wallet?.level ?? '');
  const walletGaugeColor = WALLET_GAUGE_COLORS[walletLevelIndex];
  const walletBudget = wallet?.my_budget ?? 0;
  const walletSpent = wallet?.my_spent ?? 0;
  const walletRemain = walletBudget - walletSpent;

  const bptiAxes = bpti
    ? Object.entries(bpti.emotion_radar).map(([label, value]) => ({ label, value }))
    : [];

  const predictedTotal = forecast?.predicted_total ?? 0;
  // budgetLine 은 차트 점선이 아니라 forecastOverBudget(예산 초과 예상) 판정 전용으로만 사용
  const budgetLine = forecast?.budget ?? 0;
  const forecastOverBudget = forecast ? predictedTotal > budgetLine : false;
  // 차트 점선 기준값: 직전 달(이번 달 바로 앞) 지출액.
  // 배열 순서에 의존하지 않도록 이번 달 기준 직전 달의 year/month 를 직접 계산해서 탐색한다.
  // (1월이면 전년 12월로 롤오버) 일치 항목이 없으면 undefined → 점선 미표시
  const now = new Date();
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthYear = prevMonthDate.getFullYear();
  const prevMonthNum = prevMonthDate.getMonth() + 1;
  const prevMonthSpent = forecast?.history?.find(
    (h) => h.year === prevMonthYear && h.month === prevMonthNum,
  )?.spent;
  // 이번 달 예측 지출이 전월 지출을 초과할 때만 점선 표시
  const showPrevMonthLine =
    prevMonthSpent !== undefined && prevMonthSpent > 0 && predictedTotal > prevMonthSpent;
  const forecastHistory = (forecast?.history ?? []).map((h) => ({
    label: `${h.month}월`,
    amount: h.spent,
  }));
  const monthlyAverage = forecast?.monthly_average ?? 0;
  const lastMonth = forecastHistory[forecastHistory.length - 1];
  const lastMonthLabel = lastMonth?.label ?? '—';
  const lastMonthAmount = lastMonth?.amount ?? 0;
  const chartBars = [...forecastHistory, { label: '이번 달', amount: predictedTotal, isForecast: true }];
  const maxSpending = Math.max(0, ...chartBars.map((b) => b.amount));
  // 점선이 표시되는 경우 predictedTotal > prevMonthSpent 가 보장되므로 전월 지출선은 항상 최대 막대보다 아래.
  // clamp(0~100)는 방어용으로 유지
  const prevMonthLinePercent =
    prevMonthSpent !== undefined && maxSpending > 0
      ? Math.min(100, Math.max(0, (prevMonthSpent / maxSpending) * 100))
      : 0;

  return (
    <PageWrap>
      <BackButton to="/analysis" />

      <Card>
        {impulseQuery.isError ? (
          <CardError>불러오지 못했어요</CardError>
        ) : (
          <>
            <CardTop>
              <Headline>
                나의 충동 지수는
                <br />
                <ImpulseStrong>{impulseScore ?? '—'}점</ImpulseStrong>이에요
              </Headline>
              <DiffBadge>
                {weekOverWeek != null ? (
                  <>
                    {impulseDiff >= 0 ? '▲' : '▼'} 지난주보다 {Math.abs(impulseDiff)}점
                  </>
                ) : (
                  '지난주보다 —점'
                )}
              </DiffBadge>
            </CardTop>

            <ImpulseTrack>
              <ImpulseFill
                $color={impulseGaugeColor}
                style={{ width: `${Math.min(100, Math.max(0, impulseScore ?? 0))}%` }}
              />
            </ImpulseTrack>

            <ReasonButton type="button" onClick={() => navigate('/analysis/report/impulse')}>
              내 점수 이유 확인하기→
            </ReasonButton>
          </>
        )}
      </Card>

      <Card>
        {bptiQuery.isError ? (
          <CardError>불러오지 못했어요</CardError>
        ) : (
          <>
            <BptiTitle>나의 소비성격유형 BPTI는</BptiTitle>
            <BptiType>[ {bpti?.type ?? '—'} - {bpti?.label ?? '—'} ]</BptiType>
            <BptiDefinition>{bpti?.definition ?? '—'}</BptiDefinition>

            <RadarChart axes={bptiAxes} max={BPTI_TAG_MAX} />

            <BptiMessage>{bpti?.message ?? '—'}</BptiMessage>
          </>
        )}
      </Card>

      <Card ref={walletSectionRef}>
        {walletQuery.isError ? (
          <CardError>불러오지 못했어요</CardError>
        ) : (
          <>
            <Headline>
              나의 지갑 온도는
              <br />
              <WalletTempStrong $color={walletGaugeColor}>{myTemp ?? '—'}°C</WalletTempStrong> !
            </Headline>
            <SubText>
              {myTemp != null && peerAvgTemp != null ? (
                <>
                  나와 비슷한 친구들 평균({peerAvgTemp}°C)보다 {Math.abs(walletDiff)}°C 더{' '}
                  {walletDiff >= 0 ? '뜨거워요!' : '차가워요!'}
                  <br />
                  친구들보다 {walletDiff >= 0 ? '빠르게' : '느리게'} 예산을 소비하고 있어요
                </>
              ) : (
                <>
                  나와 비슷한 친구들 평균(—°C)보다 —°C 더 뜨거워요!
                  <br />
                  친구들보다 빠르게 예산을 소비하고 있어요
                </>
              )}
            </SubText>

            <WalletIconBox>
              <img src={WALLET_IMAGES[walletLevelIndex]} alt={wallet?.level ?? ''} width={110} height={110} />
            </WalletIconBox>

            <BarWrap>
              <ScoreBar
                value={myTemp ?? 0}
                max={120}
                markerValue={peerAvgTemp ?? 0}
                markerLabel="또래 평균 온도"
                markerValueLabel={`${peerAvgTemp ?? '—'}°C`}
                color={walletGaugeColor}
              />
            </BarWrap>

            <WalletLevelRow>
              {WALLET_IMAGES.map((img, i) => (
                <WalletLevelImg key={i} src={img} alt="" $active={i === walletLevelIndex} />
              ))}
            </WalletLevelRow>
          </>
        )}
      </Card>

      <Card>
        {walletQuery.isError ? (
          <CardError>불러오지 못했어요</CardError>
        ) : (
          <WalletStatusCard>
            <WalletStatusTitle>이번 달 지갑 현황</WalletStatusTitle>
            <WalletStatusRow>
              <span>수입</span>
              <strong>{wallet ? `${walletBudget.toLocaleString()}원` : '—'}</strong>
            </WalletStatusRow>
            <WalletStatusRow>
              <span>소비</span>
              <strong>{wallet ? `${walletSpent.toLocaleString()}원` : '—'}</strong>
            </WalletStatusRow>
            <WalletStatusDivider />
            <WalletStatusRow>
              <span>남은 금액</span>
              <strong>{wallet ? `${walletRemain.toLocaleString()}원` : '—'}</strong>
            </WalletStatusRow>
          </WalletStatusCard>
        )}
      </Card>

      <Card>
        {forecastQuery.isError ? (
          <CardError>불러오지 못했어요</CardError>
        ) : (
          <>
            <ForecastHeadline>
              이번 달 예상 지출액은 {forecast ? `${predictedTotal.toLocaleString()}원` : '—'}
            </ForecastHeadline>
            <ForecastSubText>
              나의 한달 평균 지출액은 {Math.round(monthlyAverage / 10000)}만원
              <br />
              {lastMonthLabel}에는 {Math.round(lastMonthAmount / 10000)}만원 썼어요
            </ForecastSubText>

            {forecastOverBudget && <WarningText>예산 초과 예상: 과소비에 주의하세요!</WarningText>}

            <ChartWrap>
              {showPrevMonthLine && (
                <PrevMonthLine style={{ bottom: `${LABEL_H + (TRACK_H * prevMonthLinePercent) / 100}px` }}>
                  <PrevMonthLineScissors>✂</PrevMonthLineScissors>
                </PrevMonthLine>
              )}
              <ChartBars>
                {chartBars.map((bar) => (
                  <ChartBarColumn key={bar.label}>
                    <ChartBarTrack>
                      <ChartBarBarWrap style={{ height: `${maxSpending > 0 ? (bar.amount / maxSpending) * 100 : 0}%` }}>
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
          </>
        )}
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

const CardError = styled.div`
  font-size: 14px;
  color: #999;
  text-align: center;
  padding: 20px 0;
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

const WalletTempStrong = styled.strong<{ $color: string }>`
  font-size: 32px;
  font-weight: 800;
  color: ${({ $color }) => $color};
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

const ImpulseFill = styled.div<{ $color: string }>`
  height: 100%;
  border-radius: 999px;
  background: ${({ $color }) => $color};
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

const PrevMonthLine = styled.div`
  position: absolute;
  left: 83%;
  right: 0;
  border-top: 1px dashed #999;
  z-index: 1;
`;

const PrevMonthLineScissors = styled.span`
  position: absolute;
  right: -4px;
  top: -9px;
  font-size: 12px;
  transform: rotate(90deg);
`;
