import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { PageWrap } from '../styles/auth.styles';
import { DUMMY_CALENDAR_TRANSACTIONS } from '../mocks/transactions';
import { DUMMY_BUDGET } from '../mocks/budget';
import { getMonthKey, formatMonthLabel, addMonths, getWeekRange, toDateKey } from '../utils/date';
import editIcon from '../assets/images/edit_icon.svg';
import angleRightIcon from '../assets/images/angle_right.svg';
import angleLeftIcon from '../assets/images/angle_left.svg';
import walletIcon from '../assets/images/wallet.svg';
import impulseIcon from '../assets/images/impulse.svg';
import cartIcon from '../assets/images/cart.svg';

// GET /reports/scores 더미데이터
const DUMMY_SCORES = {
  wallet_temperature: 72,
  impulse_score: 67,
  bpti: 'FIRE',
};

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

const TIME_SLOTS: { label: string; test: (hour: number) => boolean }[] = [
  { label: '새벽', test: (h) => h >= 0 && h < 6 },
  { label: '아침', test: (h) => h >= 6 && h < 11 },
  { label: '점심', test: (h) => h >= 11 && h < 14 },
  { label: '저녁', test: (h) => h >= 14 && h < 19 },
  { label: '밤', test: (h) => h >= 19 && h < 24 },
];

// 푸시 알림 - 소비컷 화면에 정의된 컷 이름 (시간대/요일 기준)
const TIMESLOT_CUT: Partial<Record<string, string>> = {
  새벽: '새벽 감성 컷',
  저녁: '저녁 보상 컷',
  밤: '야간 야망 컷',
};

const WEEKDAY_CUT: Partial<Record<string, string>> = {
  월: '월요병 텅장 컷',
  금: '불금 입구 컷',
  토: '주말 플렉스 컷',
  일: '주말 플렉스 컷',
};

// 도넛/범례/히트맵에 쓰이는 순위별 보라 단색 스케일
const DONUT_COLORS = ['#221B75', '#4035B0', '#6A5CE6', '#E2DEFF'];

function sumExpense(items: typeof DUMMY_CALENDAR_TRANSACTIONS) {
  return items.reduce((sum, tx) => sum + tx.amount, 0);
}

function hexToRgb(hex: string) {
  const num = parseInt(hex.replace('#', ''), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function interpolateColor(from: string, to: string, t: number) {
  const c1 = hexToRgb(from);
  const c2 = hexToRgb(to);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

const PROGRESS_INSIDE_THRESHOLD = 10;

function BudgetProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const inside = clamped >= PROGRESS_INSIDE_THRESHOLD;

  return (
    <ProgressTrack>
      <ProgressFill style={{ width: `${clamped}%` }} />
      <ProgressPercent
        $inside={inside}
        style={inside ? { left: `${clamped / 2}%`, transform: 'translate(-50%, -50%)' } : { left: `calc(${clamped}% + 6px)` }}
      >
        {clamped}%
      </ProgressPercent>
    </ProgressTrack>
  );
}

const TODAY = new Date();

export default function Analysis() {
  const navigate = useNavigate();
  const [budgetMonth, setBudgetMonth] = useState(() => new Date());
  const [spendMonth, setSpendMonth] = useState(() => new Date());

  const { start: weekStart, end: weekEnd } = getWeekRange(TODAY);

  const weeklySpent = useMemo(() => {
    const startKey = toDateKey(weekStart);
    const endKey = toDateKey(weekEnd);
    return sumExpense(
      DUMMY_CALENDAR_TRANSACTIONS.filter(
        (tx) => tx.type === 'expense' && tx.transaction_date >= startKey && tx.transaction_date <= endKey,
      ),
    );
  }, [weekStart, weekEnd]);

  const budgetMonthKey = getMonthKey(budgetMonth);
  const monthlySpent = useMemo(
    () =>
      sumExpense(
        DUMMY_CALENDAR_TRANSACTIONS.filter(
          (tx) => tx.type === 'expense' && tx.transaction_date.startsWith(budgetMonthKey),
        ),
      ),
    [budgetMonthKey],
  );

  const weeklyPercent = DUMMY_BUDGET.thisWeek > 0 ? Math.min(100, Math.round((weeklySpent / DUMMY_BUDGET.thisWeek) * 100)) : 0;
  const monthlyPercent = DUMMY_BUDGET.total > 0 ? Math.min(100, Math.round((monthlySpent / DUMMY_BUDGET.total) * 100)) : 0;
  const weeklyRemain = DUMMY_BUDGET.thisWeek - weeklySpent;
  const monthlyRemain = DUMMY_BUDGET.total - monthlySpent;

  const spendMonthKey = getMonthKey(spendMonth);
  const monthExpenses = useMemo(
    () =>
      DUMMY_CALENDAR_TRANSACTIONS.filter(
        (tx) => tx.type === 'expense' && tx.transaction_date.startsWith(spendMonthKey),
      ),
    [spendMonthKey],
  );

  const totalSpend = sumExpense(monthExpenses);

  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const tx of monthExpenses) {
      totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount;
    }
    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthExpenses, totalSpend]);

  const top3 = categoryBreakdown.slice(0, 3);
  const rest = categoryBreakdown.slice(3);
  const restAmount = rest.reduce((sum, r) => sum + r.amount, 0);
  const restPercent = totalSpend > 0 ? Math.round((restAmount / totalSpend) * 100) : 0;

  const donutGradient = useMemo(() => {
    if (categoryBreakdown.length === 0) return `${DONUT_COLORS[3]} 0% 100%`;
    let cumulative = 0;
    const stops = top3.map(({ percent }, idx) => {
      const from = cumulative;
      cumulative += percent;
      return `${DONUT_COLORS[idx]} ${from}% ${cumulative}%`;
    });
    if (restPercent > 0) {
      const from = cumulative;
      cumulative += restPercent;
      stops.push(`${DONUT_COLORS[3]} ${from}% ${cumulative}%`);
    }
    if (cumulative < 100) stops.push(`${DONUT_COLORS[3]} ${cumulative}% 100%`);
    return stops.join(', ');
  }, [categoryBreakdown, top3, restPercent]);

  const heatmap = useMemo(() => {
    const grid = TIME_SLOTS.map(() => WEEKDAYS.map(() => 0));
    for (const tx of monthExpenses) {
      const d = new Date(tx.transaction_date);
      const weekdayIdx = (d.getDay() + 6) % 7; // 월=0 ... 일=6
      const hour = Number(tx.transaction_time.split(':')[0]);
      const slotIdx = TIME_SLOTS.findIndex((s) => s.test(hour));
      if (slotIdx === -1) continue;
      grid[slotIdx][weekdayIdx] += tx.amount;
    }
    return grid;
  }, [monthExpenses]);

  const maxCell = Math.max(1, ...heatmap.flat());

  const insightMessage = useMemo(() => {
    let peak = { slotIdx: -1, dayIdx: -1, amount: 0 };
    heatmap.forEach((row, slotIdx) => {
      row.forEach((amount, dayIdx) => {
        if (amount > peak.amount) peak = { slotIdx, dayIdx, amount };
      });
    });
    if (peak.amount === 0) return null;

    const cuts: string[] = [];
    const timeCut = TIMESLOT_CUT[TIME_SLOTS[peak.slotIdx]?.label ?? ''];
    if (timeCut) cuts.push(timeCut);
    const dayCut = WEEKDAY_CUT[WEEKDAYS[peak.dayIdx]];
    if (dayCut && !cuts.includes(dayCut)) cuts.push(dayCut);
    if (cuts.length === 0) cuts.push('루틴 소비 컷');

    return { highlight: cuts.join(' / '), suffix: '이 작동 중이에요' };
  }, [heatmap]);

  const remainText = (remain: number) =>
    remain >= 0 ? `예산이 ${remain.toLocaleString()}원 남았어요` : `예산을 ${Math.abs(remain).toLocaleString()}원 초과했어요`;

  return (
    <Page>
      <Title>내 소비</Title>

      <DetailBanner type="button" onClick={() => navigate('/analysis/report')}>
        <DetailBannerText>
          <DetailBannerSub>나의 소비 상세 분석</DetailBannerSub>
          <DetailBannerTitle>패턴 리포트 보러가기</DetailBannerTitle>
        </DetailBannerText>
        <DetailBannerArrow src={angleRightIcon} alt="" />
      </DetailBanner>

      <StatRow>
        <StatCard>
          <StatLabel>지갑 온도</StatLabel>
          <StatIcon src={walletIcon} alt="" width={33} height={26} />
          <StatValue $color="#FF4040">{DUMMY_SCORES.wallet_temperature}°C</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>충동 지수</StatLabel>
          <StatIcon src={impulseIcon} alt="" width={19} height={26} />
          <StatValue $color="#6A5CE6">{DUMMY_SCORES.impulse_score}점</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>BPTI</StatLabel>
          <StatIcon src={cartIcon} alt="" width={26} height={26} />
          <StatValue $color="#FF4040">{DUMMY_SCORES.bpti}</StatValue>
        </StatCard>
      </StatRow>

      <Card>
        <BudgetSectionHeader>
          <BudgetSectionTitle>나의 예산 현황</BudgetSectionTitle>
          <EditButton type="button" onClick={() => navigate('/budget')} aria-label="예산 설정">
            <img src={editIcon} alt="" width={18} height={18} />
          </EditButton>
        </BudgetSectionHeader>

        <BudgetBlock>
          <BudgetBlockTitle>이번 주 나의 예산</BudgetBlockTitle>
          <BudgetRow>
            <BudgetColumn>
              <BudgetColLabel>지출</BudgetColLabel>
              <BudgetColValue>{weeklySpent.toLocaleString()}원</BudgetColValue>
            </BudgetColumn>
            <BudgetColumn $align="right">
              <BudgetColLabel>예산</BudgetColLabel>
              <BudgetColValue>{DUMMY_BUDGET.thisWeek.toLocaleString()}원</BudgetColValue>
            </BudgetColumn>
          </BudgetRow>
          <BudgetProgressBar percent={weeklyPercent} />
          <BudgetRemainText>{remainText(weeklyRemain)}</BudgetRemainText>
        </BudgetBlock>

        <BudgetBlock>
          <BudgetBlockTitle>이번 달 나의 예산</BudgetBlockTitle>
          <MonthNav $center>
            <NavButton type="button" onClick={() => setBudgetMonth((m) => addMonths(m, -1))} aria-label="이전 달">
              <img src={angleLeftIcon} alt="" width={14} height={14} />
            </NavButton>
            <MonthLabel>{formatMonthLabel(budgetMonth)}</MonthLabel>
            <NavButton type="button" onClick={() => setBudgetMonth((m) => addMonths(m, 1))} aria-label="다음 달">
              <img src={angleRightIcon} alt="" width={14} height={14} />
            </NavButton>
          </MonthNav>
          <BudgetRow>
            <BudgetColumn>
              <BudgetColLabel>지출</BudgetColLabel>
              <BudgetColValue>{monthlySpent.toLocaleString()}원</BudgetColValue>
            </BudgetColumn>
            <BudgetColumn $align="right">
              <BudgetColLabel>예산</BudgetColLabel>
              <BudgetColValue>{DUMMY_BUDGET.total.toLocaleString()}원</BudgetColValue>
            </BudgetColumn>
          </BudgetRow>
          <BudgetProgressBar percent={monthlyPercent} />
          <BudgetRemainText>{remainText(monthlyRemain)}</BudgetRemainText>
        </BudgetBlock>

        <DetailLinkCenter type="button" onClick={() => navigate('/analysis/report#wallet')}>
          나의 지갑 및 예상 지출액 확인하러 가기
        </DetailLinkCenter>
      </Card>

      <Card>
        <CardTitle>어디에 제일 많이 쓸까?</CardTitle>
        <MonthNav $center>
          <NavButton type="button" onClick={() => setSpendMonth((m) => addMonths(m, -1))} aria-label="이전 달">
            <img src={angleLeftIcon} alt="" width={14} height={14} />
          </NavButton>
          <MonthLabel>{formatMonthLabel(spendMonth)}</MonthLabel>
          <NavButton type="button" onClick={() => setSpendMonth((m) => addMonths(m, 1))} aria-label="다음 달">
            <img src={angleRightIcon} alt="" width={14} height={14} />
          </NavButton>
        </MonthNav>

        <DonutRow>
          <Donut $gradient={donutGradient} />
          {top3.length === 0 ? (
            <EmptyText>이 달의 소비 내역이 없어요.</EmptyText>
          ) : (
            <LegendList>
              {top3.map(({ category, percent }, idx) => (
                <LegendRow
                  key={category}
                  type="button"
                  onClick={() => navigate(`/analysis/categories/${encodeURIComponent(category)}?month=${spendMonthKey}`)}
                >
                  <LegendDot style={{ background: DONUT_COLORS[idx] }} />
                  <LegendName>{category}</LegendName>
                  <LegendPercent>{percent}%</LegendPercent>
                </LegendRow>
              ))}
              {rest.length > 0 && (
                <LegendRow type="button" onClick={() => navigate(`/analysis/categories?month=${spendMonthKey}`)}>
                  <LegendDot style={{ background: DONUT_COLORS[3] }} />
                  <LegendName>그 외 {rest.length}개</LegendName>
                  <LegendPercent>{restPercent}%</LegendPercent>
                </LegendRow>
              )}
            </LegendList>
          )}
        </DonutRow>
      </Card>

      <Card>
        <CardTitle>언제 제일 많이 쓸까?</CardTitle>
        <MonthNav $center>
          <NavButton type="button" onClick={() => setSpendMonth((m) => addMonths(m, -1))} aria-label="이전 달">
            <img src={angleLeftIcon} alt="" width={14} height={14} />
          </NavButton>
          <MonthLabel>{formatMonthLabel(spendMonth)}</MonthLabel>
          <NavButton type="button" onClick={() => setSpendMonth((m) => addMonths(m, 1))} aria-label="다음 달">
            <img src={angleRightIcon} alt="" width={14} height={14} />
          </NavButton>
        </MonthNav>

        <HeatmapWrap>
          <HeatmapHeaderRow>
            <HeatmapCorner />
            {WEEKDAYS.map((d) => (
              <HeatmapHeaderCell key={d}>{d}</HeatmapHeaderCell>
            ))}
          </HeatmapHeaderRow>
          {TIME_SLOTS.map((slot, slotIdx) => (
            <HeatmapRow key={slot.label}>
              <HeatmapRowLabel>{slot.label}</HeatmapRowLabel>
              {WEEKDAYS.map((_, dayIdx) => {
                const amount = heatmap[slotIdx][dayIdx];
                const intensity = amount / maxCell;
                return (
                  <HeatmapCellWrap key={dayIdx}>
                    <HeatmapCell
                      style={{
                        background: interpolateColor(DONUT_COLORS[3], '#4035B0', intensity),
                      }}
                    />
                  </HeatmapCellWrap>
                );
              })}
            </HeatmapRow>
          ))}
        </HeatmapWrap>

        {insightMessage && (
          <InsightBubble>
            나의 소비 방지를 위한
            <br />
            <InsightHighlight>{insightMessage.highlight}</InsightHighlight>
            {insightMessage.suffix}
          </InsightBubble>
        )}
      </Card>
    </Page>
  );
}

const Page = styled(PageWrap)`
  padding-bottom: 32px;
`;

const Title = styled.h1`
  text-align: left;
  font-size: 22px;
  font-weight: 800;
  color: #000;
  margin: 4px 0 14px;
`;

const DetailBanner = styled.button`
  width: 100%;
  background: linear-gradient(90deg, #7669e8 0%, #b9b1fb 100%);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 18px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
`;

const DetailBannerText = styled.div``;

const DetailBannerSub = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2px;
`;

const DetailBannerTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #fff;
`;

const DetailBannerArrow = styled.img`
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
`;

const StatRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  flex: 1;
  background: #fff;
  border: 1px solid #efedf8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 14px;
  padding: 14px 8px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatIcon = styled.img`
  display: block;
  height: 26px;
  width: auto;
  margin: 0 auto 2px;
`;

const StatValue = styled.div<{ $color: string }>`
  font-size: 18px;
  font-weight: 800;
  color: ${({ $color }) => $color};
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  margin-bottom: 18px;
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  text-align: left;
`;

const BudgetSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const BudgetSectionTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  margin: 0;
`;

const EditButton = styled.button`
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
`;

const BudgetBlock = styled.div`
  & + & {
    margin-top: 24px;
  }
`;

const BudgetBlockTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
`;

const MonthNav = styled.div<{ $center?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: ${({ $center }) => ($center ? 'center' : 'flex-end')};
  margin: ${({ $center }) => ($center ? '4px 0 16px' : '0')};
`;

const NavButton = styled.button`
  border: none;
  background: none;
  padding: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const MonthLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #444;
`;

const BudgetRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const BudgetColumn = styled.div<{ $align?: 'left' | 'right' }>`
  text-align: ${({ $align }) => $align ?? 'left'};
`;

const BudgetColLabel = styled.div`
  font-size: 11px;
  color: #888;
`;

const BudgetColValue = styled.div`
  font-size: 15px;
  font-weight: 700;
`;

const ProgressTrack = styled.div`
  position: relative;
  width: 100%;
  height: 26px;
  border-radius: 999px;
  background: #f5f5f5;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: #e2deff;
  transition: width 0.2s ease;
`;

const ProgressPercent = styled.span<{ $inside: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
`;

const BudgetRemainText = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: #888;
  text-align: right;
`;

const DetailLinkCenter = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  text-decoration: underline;
  color: #444;
  font-size: 13px;
  text-align: center;
  padding: 0;
  margin-top: 20px;
  cursor: pointer;
`;

const DonutRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Donut = styled.div<{ $gradient: string }>`
  flex-shrink: 0;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: conic-gradient(${({ $gradient }) => $gradient});
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    width: 68%;
    height: 68%;
    border-radius: 50%;
    background: #fff;
  }
`;

const LegendList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const LegendRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
`;

const LegendDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const LegendName = styled.div`
  flex: 1;
  font-size: 15px;
  font-weight: 700;
`;

const LegendPercent = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #8b8578;
`;

const EmptyText = styled.div`
  flex: 1;
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 24px 0;
`;

const HeatmapWrap = styled.div`
  padding: 4px 0 0;
`;

const HeatmapHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 30px repeat(7, 1fr);
  margin-bottom: 10px;
`;

const HeatmapCorner = styled.div``;

const HeatmapHeaderCell = styled.div`
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #333;
`;

const HeatmapRow = styled.div`
  display: grid;
  grid-template-columns: 30px repeat(7, 1fr);
  align-items: center;
  margin-bottom: 12px;
`;

const HeatmapRowLabel = styled.div`
  font-size: 13px;
  color: #666;
`;

const HeatmapCellWrap = styled.div`
  display: flex;
  justify-content: center;
`;

const HeatmapCell = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 6px;
`;

const InsightBubble = styled.div`
  position: relative;
  background: #eae8fc;
  border-radius: 16px;
  padding: 16px 18px;
  margin-top: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #444;

  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 24px;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-bottom: 9px solid #eae8fc;
  }
`;

const InsightHighlight = styled.span`
  color: #6a5ce6;
  font-weight: 800;
`;
