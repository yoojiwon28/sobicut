import { useMemo, useState } from 'react';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { PageWrap } from '../../styles/auth.styles';
import { useSatisfactions } from '../../hooks/useSatisfactions';
import type { SatisfactionRecordItem } from '../../types/satisfaction';
import { CATEGORY_ICONS } from '../../utils/category';
import { addMonths, formatMonthLabel, getWeekRange } from '../../utils/date';
import angleLeftIcon from '../../assets/images/angle_left.svg';
import angleRightIcon from '../../assets/images/angle_right.svg';

const CHART_H = 170;
const MISSING_SCORE_COLOR = '#BBB';
const WEEK_LABELS = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째'];
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function weekLabel(index: number) {
  return `${WEEK_LABELS[index] ?? `${index + 1}째`} 주`;
}

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

  const { data, isPending, isError } = useSatisfactions({
    year: month.getFullYear(),
    month: month.getMonth() + 1,
  });

  // 서버가 이미 월(응답 제출 시각 기준) 필터를 적용하므로 클라이언트 필터는 하지 않는다.
  const records = useMemo(
    () =>
      [...(data ?? [])].sort((a, b) => b.transaction_date.localeCompare(a.transaction_date)),
    [data],
  );

  // 서버가 주차별 평균을 주지 않아 프론트에서 집계한다.
  // 선택된 달의 1일이 속한 주를 '첫째 주'로 잡고, 응답 제출 시각(submitted_at)으로 주차를 판정한다.
  const weekly = useMemo(() => {
    if (records.length === 0) return [];
    const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const firstMonday = getWeekRange(firstOfMonth).start;
    const lastMonday = getWeekRange(lastOfMonth).start;
    const weekCount =
      Math.round((lastMonday.getTime() - firstMonday.getTime()) / MS_PER_WEEK) + 1;

    const sums = new Array<number>(weekCount).fill(0);
    const counts = new Array<number>(weekCount).fill(0);
    for (const rec of records) {
      for (const s of rec.satisfactions) {
        const submittedMonday = getWeekRange(new Date(s.submitted_at)).start;
        const idx = Math.round(
          (submittedMonday.getTime() - firstMonday.getTime()) / MS_PER_WEEK,
        );
        if (idx < 0 || idx >= weekCount) continue;
        sums[idx] += s.score;
        counts[idx] += 1;
      }
    }
    return sums.map((sum, i) => ({
      week: weekLabel(i),
      average: counts[i] > 0 ? sum / counts[i] : 0,
    }));
  }, [records, month]);

  return (
    <PageWrap>
      <Content>
        <BackButton to="/" />
        <Title>소비 만족도</Title>

        <MonthHeader>
          <ArrowButton type="button" onClick={() => setMonth((m) => addMonths(m, -1))}>
            <img src={angleLeftIcon} alt="이전 달" width={20} height={20} />
          </ArrowButton>
          <MonthLabel>{formatMonthLabel(month)}</MonthLabel>
          <ArrowButton type="button" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <img src={angleRightIcon} alt="다음 달" width={20} height={20} />
          </ArrowButton>
        </MonthHeader>

        <MonthDivider />

        <ResultBody>
          {isPending ? (
            <EmptyText>—</EmptyText>
          ) : isError ? (
            <EmptyText>불러오지 못했어요</EmptyText>
          ) : records.length === 0 ? (
            <EmptyText>이번 달 만족도 기록이 없어요</EmptyText>
          ) : (
            <List>
              {records.map((r) => {
                const s7 = r.satisfactions.find((s) => s.day_type === '7일');
                const s30 = r.satisfactions.find((s) => s.day_type === '30일');
                // 서버 응답에 category 필드가 아직 없어 아이콘 자리만 유지한다.
                // 백엔드에 category 추가 시 아래 캐스팅을 제거하고 값만 연결하면 된다.
                const category = (r as SatisfactionRecordItem & { category?: string }).category;
                const categoryIcon = category ? CATEGORY_ICONS[category] : undefined;
                return (
                  <Card key={r.transaction_id}>
                    <CardTop>
                      <MerchantInfo>
                        {categoryIcon ? (
                          <CategoryIcon src={categoryIcon} alt="" width={26} height={26} />
                        ) : (
                          <CategoryIconSlot aria-hidden />
                        )}
                        <MerchantName>{r.merchant}</MerchantName>
                      </MerchantInfo>
                      <AmountInfo>
                        <CardAmount>{r.amount.toLocaleString()} 원</CardAmount>
                        <CardDate>{formatMonthDayKorean(r.transaction_date)}</CardDate>
                      </AmountInfo>
                    </CardTop>

                    <ScoreSection>
                      <Pill style={{ gridColumn: 1, gridRow: 1 }}>7일 후</Pill>
                      <Pill style={{ gridColumn: 3, gridRow: 1 }}>30일 후</Pill>
                      <ScoreValue
                        style={{ gridColumn: 1, gridRow: 2 }}
                        $color={s7 ? scoreColor(s7.score) : MISSING_SCORE_COLOR}
                      >
                        {s7 ? `${s7.score} / 5점` : '—'}
                      </ScoreValue>
                      <ArrowIcon style={{ gridColumn: 2, gridRow: 2 }}>▶</ArrowIcon>
                      <ScoreValue
                        style={{ gridColumn: 3, gridRow: 2 }}
                        $color={s30 ? scoreColor(s30.score) : MISSING_SCORE_COLOR}
                      >
                        {s30 ? `${s30.score} / 5점` : '—'}
                      </ScoreValue>
                    </ScoreSection>
                  </Card>
                );
              })}
            </List>
          )}

          <ChartWrap>
          <YAxis>
            {[5, 4, 3, 2, 1].map((v) => (
              <YTick key={v}>
                {v}
                <YTickLine />
              </YTick>
            ))}
          </YAxis>
          <ChartArea>
            <Baseline />
            <Bars>
              {weekly.map((w) => (
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
        </ResultBody>
      </Content>
    </PageWrap>
  );
}

const Content = styled.div`
  padding-bottom: 90px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  text-align: center;
  margin: 12px 0 22px;
`;

const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
`;

const ArrowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0.6;
`;

const MonthLabel = styled.div`
  font-size: 18px;
  font-weight: 800;
`;

const MonthDivider = styled.hr`
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 0 0 28px;
`;

const ResultBody = styled.div`
  margin: 0 16px;
`;

const List = styled.div`
  > * + * {
    margin-top: 22px;
    padding-top: 22px;
    border-top: 1px solid #e8e8e8;
  }
`;

const Card = styled.div``;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const MerchantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const CategoryIcon = styled.img`
  filter: grayscale(1) opacity(0.85);
`;

const CategoryIconSlot = styled.span`
  display: inline-block;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
`;

const MerchantName = styled.div`
  font-size: 22px;
  font-weight: 800;
`;

const AmountInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
`;

const CardAmount = styled.div`
  font-size: 22px;
  font-weight: 800;
`;

const CardDate = styled.div`
  font-size: 14px;
  color: #999;
  margin-top: 4px;
`;

const ScoreSection = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  justify-items: center;
  column-gap: 24px;
  row-gap: 10px;
  width: 100%;
`;

const Pill = styled.span`
  display: inline-block;
  background: #fff;
  border: 1.5px solid #cfcfcf;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 15px;
  font-weight: 500;
  color: #222;
`;

const ScoreValue = styled.div<{ $color: string }>`
  font-size: 30px;
  font-weight: 800;
  color: ${({ $color }) => $color};
`;

const ArrowIcon = styled.span`
  color: #bbb;
  font-size: 16px;
`;

const ChartWrap = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 32px;
`;

const YAxis = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${CHART_H}px;
  padding-bottom: 27px;
`;

const YTick = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #888;
  transform: translateY(-50%);
`;

const YTickLine = styled.span`
  width: 8px;
  border-top: 1px solid #ddd;
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
  gap: 14px;
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
  width: 42px;
  border-radius: 6px 6px 0 0;
  background: ${({ $color }) => $color};
`;

const BarLabel = styled.div`
  height: 27px;
  padding-top: 8px;
  font-size: 13px;
  color: #666;
  text-align: center;
`;

const EmptyText = styled.div`
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 40px 0;
`;
