import { useMemo, useState } from 'react';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { PageWrap } from '../../styles/auth.styles';
import { DUMMY_SATISFACTION_RECORDS, DUMMY_WEEKLY_SATISFACTION } from '../../mocks/satisfaction';
import { CATEGORY_ICONS } from '../../utils/category';
import { addMonths, formatMonthLabel, getMonthKey } from '../../utils/date';

const CHART_H = 140;

function formatMonthDayKorean(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function scoreColor(score: number) {
  const rounded = Math.round(score);
  if (rounded >= 4) return '#6A5CE6';
  if (rounded === 3) return '#FFA940';
  return '#FF6B6B';
}

export default function SatisfactionResult() {
  const [month, setMonth] = useState(() => new Date());

  const monthKey = getMonthKey(month);
  const records = useMemo(
    () =>
      DUMMY_SATISFACTION_RECORDS.filter((r) => r.date.startsWith(monthKey)).sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    [monthKey],
  );

  return (
    <PageWrap>
      <Content>
        <BackButton to="/" />
        <Title>소비 만족도</Title>

        <MonthHeader>
          <ArrowButton type="button" onClick={() => setMonth((m) => addMonths(m, -1))}>
            &lt;
          </ArrowButton>
          <MonthLabel>{formatMonthLabel(month)}</MonthLabel>
          <ArrowButton type="button" onClick={() => setMonth((m) => addMonths(m, 1))}>
            &gt;
          </ArrowButton>
        </MonthHeader>

        <MonthDivider />

        {records.length === 0 ? (
          <EmptyText>이번 달 만족도 기록이 없어요</EmptyText>
        ) : (
          <List>
            {records.map((r) => (
              <Card key={r.id}>
                <CardTop>
                  <MerchantInfo>
                    <img src={CATEGORY_ICONS[r.category]} alt="" width={24} height={24} />
                    <MerchantName>{r.merchant}</MerchantName>
                  </MerchantInfo>
                  <AmountInfo>
                    <CardAmount>{r.amount.toLocaleString()} 원</CardAmount>
                    <CardDate>{formatMonthDayKorean(r.date)}</CardDate>
                  </AmountInfo>
                </CardTop>

                <ScoreSection>
                  <Pill style={{ gridColumn: 1, gridRow: 1 }}>7일 후</Pill>
                  <Pill style={{ gridColumn: 3, gridRow: 1 }}>30일 후</Pill>
                  <ScoreValue style={{ gridColumn: 1, gridRow: 2 }} $color={scoreColor(r.score7)}>
                    {r.score7} / 5점
                  </ScoreValue>
                  <ArrowIcon style={{ gridColumn: 2, gridRow: 2 }}>▶</ArrowIcon>
                  <ScoreValue style={{ gridColumn: 3, gridRow: 2 }} $color={scoreColor(r.score30)}>
                    {r.score30} / 5점
                  </ScoreValue>
                </ScoreSection>
              </Card>
            ))}
          </List>
        )}

        <ChartTitle>주차별 평균 만족도</ChartTitle>
        <ChartWrap>
          <YAxis>
            {[5, 4, 3, 2, 1].map((v) => (
              <YTick key={v}>{v}</YTick>
            ))}
          </YAxis>
          <ChartArea>
            <Baseline />
            <Bars>
              {DUMMY_WEEKLY_SATISFACTION.map((w) => (
                <BarColumn key={w.week}>
                  <BarTrack>
                    <Bar
                      $color={scoreColor(w.average)}
                      style={{ height: `${Math.max(((w.average - 1) / 4) * 100, 0)}%` }}
                    />
                  </BarTrack>
                  <BarLabel>{w.week}</BarLabel>
                </BarColumn>
              ))}
            </Bars>
          </ChartArea>
        </ChartWrap>
      </Content>
    </PageWrap>
  );
}

const Content = styled.div`
  padding-bottom: 90px;
`;

const Title = styled.h1`
  font-size: 17px;
  font-weight: 700;
  text-align: center;
  margin: 4px 0 20px;
`;

const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const ArrowButton = styled.button`
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 700;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
`;

const MonthLabel = styled.div`
  font-size: 15px;
  font-weight: 700;
`;

const MonthDivider = styled.hr`
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 0 0 20px;
`;

const List = styled.div`
  > * + * {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }
`;

const Card = styled.div``;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const MerchantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const MerchantName = styled.div`
  font-size: 18px;
  font-weight: 700;
`;

const AmountInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
`;

const CardAmount = styled.div`
  font-size: 20px;
  font-weight: 700;
`;

const CardDate = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 2px;
`;

const ScoreSection = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  justify-items: center;
  column-gap: 16px;
  row-gap: 6px;
  width: fit-content;
  margin: 0 auto;
`;

const Pill = styled.span`
  display: inline-block;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 11px;
  color: #666;
`;

const ScoreValue = styled.div<{ $color: string }>`
  font-size: 26px;
  font-weight: 800;
  color: ${({ $color }) => $color};
`;

const ArrowIcon = styled.span`
  color: #ccc;
  font-size: 12px;
`;

const ChartTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  margin: 32px 0 16px;
`;

const ChartWrap = styled.div`
  display: flex;
  gap: 10px;
`;

const YAxis = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${CHART_H}px;
  padding-bottom: 27px;
`;

const YTick = styled.div`
  font-size: 10px;
  color: #999;
  transform: translateY(-50%);
`;

const ChartArea = styled.div`
  position: relative;
  flex: 1;
`;

const Baseline = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: ${CHART_H - 27}px;
  border-top: 1px solid #e0e0e0;
`;

const Bars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: ${CHART_H}px;
`;

const BarColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

const BarTrack = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const Bar = styled.div<{ $color: string }>`
  width: 48px;
  border-radius: 6px 6px 0 0;
  background: ${({ $color }) => $color};
`;

const BarLabel = styled.div`
  height: 27px;
  padding-top: 8px;
  font-size: 11px;
  color: #888;
  text-align: center;
`;

const EmptyText = styled.div`
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 40px 0;
`;
