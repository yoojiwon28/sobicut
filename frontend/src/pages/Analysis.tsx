import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DUMMY_CALENDAR_TRANSACTIONS } from '../mocks/transactions';
import { DUMMY_BUDGET } from '../mocks/budget';
import { CATEGORY_COLORS } from '../utils/category';
import { getMonthKey, formatMonthLabel, addMonths, getWeekRange, toDateKey } from '../utils/date';
import editIcon from '../assets/images/edit_icon.svg';
import angleRightIcon from '../assets/images/angle_right.svg';
import angleLeftIcon from '../assets/images/angle_left.svg';

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

function sumExpense(items: typeof DUMMY_CALENDAR_TRANSACTIONS) {
  return items.reduce((sum, tx) => sum + tx.amount, 0);
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
    if (categoryBreakdown.length === 0) return '#ececec 0% 100%';
    let cumulative = 0;
    const stops = categoryBreakdown.map(({ category, percent }) => {
      const from = cumulative;
      cumulative += percent;
      return `${CATEGORY_COLORS[category] ?? '#ccc'} ${from}% ${cumulative}%`;
    });
    if (cumulative < 100) stops.push(`#ececec ${cumulative}% 100%`);
    return stops.join(', ');
  }, [categoryBreakdown]);

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
      <Title>MY SPENDING</Title>

      <DetailLinkRow
        type="button"
        onClick={() => {
          // TODO: 소비 상세 리포트 페이지 라우트 미정
        }}
      >
        나의 소비 상세 분석 보러가기
        <img src={angleRightIcon} alt="" width={18} height={18} />
      </DetailLinkRow>

      <StatRow>
        <StatCard>
          <StatLabel>지갑 온도</StatLabel>
          <StatIcon>💳</StatIcon>
          <StatValue>{DUMMY_SCORES.wallet_temperature}°C</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>충동 지수</StatLabel>
          <StatIcon>⚡</StatIcon>
          <StatValue>{DUMMY_SCORES.impulse_score}점</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>BPTI</StatLabel>
          <StatIcon>🛒</StatIcon>
          <StatValue>{DUMMY_SCORES.bpti}</StatValue>
        </StatCard>
      </StatRow>

      <SectionHeader>
        <SectionTitle>나의 예산 현황</SectionTitle>
        <EditButton type="button" onClick={() => navigate('/budget')} aria-label="예산 설정">
          <img src={editIcon} alt="" width={18} height={18} />
        </EditButton>
      </SectionHeader>

      <BudgetCard>
        <BudgetCardTitle>이번 주 나의 예산</BudgetCardTitle>
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
        <ProgressTrack>
          <ProgressFill style={{ width: `${weeklyPercent}%` }} />
          <ProgressPercent style={{ left: `calc(${Math.min(weeklyPercent, 85)}% + 6px)` }}>
            {weeklyPercent}%
          </ProgressPercent>
        </ProgressTrack>
        <BudgetRemainText>{remainText(weeklyRemain)}</BudgetRemainText>
      </BudgetCard>

      <BudgetCard>
        <BudgetCardHeader>
          <BudgetCardTitle>이번 달 나의 예산</BudgetCardTitle>
          <MonthNav>
            <NavButton type="button" onClick={() => setBudgetMonth((m) => addMonths(m, -1))} aria-label="이전 달">
              <img src={angleLeftIcon} alt="" width={14} height={14} />
            </NavButton>
            <MonthLabel>{formatMonthLabel(budgetMonth)}</MonthLabel>
            <NavButton type="button" onClick={() => setBudgetMonth((m) => addMonths(m, 1))} aria-label="다음 달">
              <img src={angleRightIcon} alt="" width={14} height={14} />
            </NavButton>
          </MonthNav>
        </BudgetCardHeader>
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
        <ProgressTrack>
          <ProgressFill style={{ width: `${monthlyPercent}%` }} />
          <ProgressPercent style={{ left: `calc(${Math.min(monthlyPercent, 85)}% + 6px)` }}>
            {monthlyPercent}%
          </ProgressPercent>
        </ProgressTrack>
        <BudgetRemainText>{remainText(monthlyRemain)}</BudgetRemainText>
      </BudgetCard>

      <DetailLinkCenter
        type="button"
        onClick={() => {
          // TODO: 지갑 및 예상 지출액 상세 페이지 라우트 미정
        }}
      >
        나의 지갑 및 예상 지출액 확인하러 가기
      </DetailLinkCenter>

      <SectionTitleStandalone>어디에 제일 많이 쓸까?</SectionTitleStandalone>
      <MonthNav $center>
        <NavButton type="button" onClick={() => setSpendMonth((m) => addMonths(m, -1))} aria-label="이전 달">
          <img src={angleLeftIcon} alt="" width={14} height={14} />
        </NavButton>
        <MonthLabel>{formatMonthLabel(spendMonth)}</MonthLabel>
        <NavButton type="button" onClick={() => setSpendMonth((m) => addMonths(m, 1))} aria-label="다음 달">
          <img src={angleRightIcon} alt="" width={14} height={14} />
        </NavButton>
      </MonthNav>

      <Donut $gradient={donutGradient} />

      {top3.length === 0 ? (
        <EmptyText>이 달의 소비 내역이 없어요.</EmptyText>
      ) : (
        <CategoryList>
          {top3.map(({ category, amount, percent }) => (
            <CategoryRow
              key={category}
              type="button"
              onClick={() => navigate(`/analysis/categories/${encodeURIComponent(category)}`)}
            >
              <CategoryDot style={{ background: CATEGORY_COLORS[category] ?? '#ccc' }} />
              <CategoryInfo>
                <CategoryName>{category}</CategoryName>
                <CategoryPercent>{percent}%</CategoryPercent>
              </CategoryInfo>
              <CategoryAmount>{amount.toLocaleString()}원</CategoryAmount>
            </CategoryRow>
          ))}
          {rest.length > 0 && (
            <CategoryRow type="button" onClick={() => navigate('/analysis/categories')}>
              <CategoryDot style={{ background: '#ececec' }} />
              <CategoryInfo>
                <CategoryName>그 외 {rest.length}개</CategoryName>
                <CategoryPercent>{restPercent}%</CategoryPercent>
              </CategoryInfo>
              <CategoryAmount>{restAmount.toLocaleString()}원</CategoryAmount>
            </CategoryRow>
          )}
        </CategoryList>
      )}

      <SectionTitleStandalone>언제 제일 많이 쓸까?</SectionTitleStandalone>
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
                      background: amount > 0 ? `rgba(106, 92, 230, ${0.15 + intensity * 0.75})` : '#ececec',
                    }}
                  />
                </HeatmapCellWrap>
              );
            })}
          </HeatmapRow>
        ))}
      </HeatmapWrap>

      {insightMessage && (
        <InsightBar>
          나의 소비 방지를 위한
          <br />
          <InsightHighlight>{insightMessage.highlight}</InsightHighlight>
          {insightMessage.suffix}
        </InsightBar>
      )}
    </Page>
  );
}

const Page = styled.div`
  padding: 20px 20px 32px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 1px;
  margin: 4px 0 16px;
`;

const DetailLinkRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  padding: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111;
  cursor: pointer;
  margin-bottom: 16px;
`;

const StatRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  flex: 1;
  background: #f8f6fe;
  border-radius: 14px;
  padding: 12px 8px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatIcon = styled.div`
  font-size: 18px;
  margin-bottom: 2px;
`;

const StatValue = styled.div`
  font-size: 15px;
  font-weight: 800;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
`;

const SectionTitleStandalone = styled(SectionTitle)`
  margin-top: 28px;
  margin-bottom: 4px;
`;

const EditButton = styled.button`
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
`;

const BudgetCard = styled.div`
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
`;

const BudgetCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BudgetCardTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
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
  height: 20px;
  border-radius: 999px;
  background: #ececec;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: #6a5ce6;
  transition: width 0.2s ease;
`;

const ProgressPercent = styled.span`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 700;
  color: #6a5ce6;
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
  padding: 12px 0 4px;
  cursor: pointer;
`;

const Donut = styled.div<{ $gradient: string }>`
  width: 160px;
  height: 160px;
  margin: 12px auto 20px;
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

const CategoryList = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  padding: 4px 16px;
  margin-bottom: 8px;

  > *:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

const CategoryRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
`;

const CategoryDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const CategoryPercent = styled.div`
  font-size: 11px;
  color: #888;
  margin-top: 2px;
`;

const CategoryAmount = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 24px 0;
`;

const HeatmapWrap = styled.div`
  padding: 4px 0 20px;
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
  font-size: 12px;
  color: #666;
`;

const HeatmapCellWrap = styled.div`
  display: flex;
  justify-content: center;
`;

const HeatmapCell = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 6px;
`;

const InsightBar = styled.div`
  background: #f4f2fc;
  border-left: 3px solid #6a5ce6;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #444;
`;

const InsightHighlight = styled.span`
  color: #6a5ce6;
  font-weight: 800;
`;
