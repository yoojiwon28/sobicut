import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StyledCalendar } from '../styles/calendar.styles';
import styled from 'styled-components';
import Logo2 from '../components/Logo2';
import { CATEGORY_ICONS } from '../utils/category';
import { getTransactions } from '../api/transactions';
import { getDailyReport } from '../api/reports';
import incomeIcon from '../assets/images/income_icon.svg';
import expenseIcon from '../assets/images/expense_icon.svg';

const toKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function CalendarPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const today = new Date();

  const year = activeStartDate.getFullYear();
  const month = activeStartDate.getMonth() + 1;
  const selectedKey = toKey(selectedDate);

  // 캘린더 날짜별 합계
  const { data: dailyReport = [] } = useQuery({
    queryKey: ['reports', 'daily', { year, month }],
    queryFn: () => getDailyReport({ year, month }),
  });

  const dailyMap = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    for (const row of dailyReport) {
      map[row.date] = { income: row.income, expense: row.expense };
    }
    return map;
  }, [dailyReport]);

  // 선택된 날짜 패널용: 그날 개별 내역
  const { data: dayItems = [] } = useQuery({
    queryKey: ['transactions', { date: selectedKey }],
    queryFn: () => getTransactions({ date: selectedKey }),
  });

  const selectedTotals = dailyMap[selectedKey];

  const monthlyExpenseTotal = useMemo(
    () => dailyReport.reduce((sum, row) => sum + row.expense, 0),
    [dailyReport],
  );

  return (
    <Page>
      <Header>
        <Logo2 width={112} />
        <AddButton type="button" onClick={() => setShowAddModal(true)} aria-label="내역 추가">
          +
        </AddButton>
      </Header>

      <MonthSummary>
        <MonthSummaryLabel>
          {month}월 총 지출 - {monthlyExpenseTotal.toLocaleString()}원
        </MonthSummaryLabel>
      </MonthSummary>

      <CalendarCard>
        <StyledCalendar
          value={selectedDate}
          onClickDay={(date) => setSelectedDate(date)}
          onActiveStartDateChange={({ activeStartDate: next }) => {
            if (next) setActiveStartDate(next);
          }}
          locale="ko-KR"
          calendarType="gregory"
          formatDay={(_, date) => String(date.getDate())}
          minDetail="year"
          next2Label={null}
          prev2Label={null}
          showNeighboringMonth={false}
          tileClassName={({ date, view }) => {
            if (view !== 'month') return '';
            if (isSameDay(date, selectedDate)) return 'is-selected';
            if (isSameDay(date, today)) return 'is-today';
            return '';
          }}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;
            const totals = dailyMap[toKey(date)];
            if (!totals) return null;
            const selected = isSameDay(date, selectedDate);
            return (
              <DayAmounts>
                {totals.expense > 0 && (
                  <ExpenseAmount $selected={selected}>-{totals.expense.toLocaleString()}</ExpenseAmount>
                )}
                {totals.income > 0 && (
                  <IncomeAmount $selected={selected}>+{totals.income.toLocaleString()}</IncomeAmount>
                )}
              </DayAmounts>
            );
          }}
        />
      </CalendarCard>

      <ExpensePanel>
        <ExpensePanelHeader>
          <span>
            {selectedDate.getMonth() + 1}/{selectedDate.getDate()} 지출 - {(selectedTotals?.expense ?? 0).toLocaleString()}원
          </span>
          {dayItems.length > 0 && (
            <MoreLink type="button" onClick={() => navigate(`/day/${selectedKey}`)}>
              + 더보기
            </MoreLink>
          )}
        </ExpensePanelHeader>

        {dayItems.length > 0 ? (
          dayItems.map((tx) => (
            <ExpenseRow key={tx.id}>
              <ItemIcon>
                {tx.type === 'income' ? (
                  <img src={incomeIcon} alt="수입" width={22} height={22} />
                ) : (
                  CATEGORY_ICONS[tx.category] && (
                    <img src={CATEGORY_ICONS[tx.category]} alt={tx.category} width={22} height={22} />
                  )
                )}
              </ItemIcon>
              <ItemInfo>
                <ItemName>{tx.merchant || tx.category}</ItemName>
                <ItemMeta>
                  {tx.transaction_time.slice(0, 5)} · {tx.category}
                </ItemMeta>
              </ItemInfo>
              <ItemAmount $type={tx.type}>
                {tx.type === 'expense' ? '-' : '+'}
                {tx.amount.toLocaleString()}원
              </ItemAmount>
            </ExpenseRow>
          ))
        ) : (
          <EmptyText>이 날짜에는 지출 내역이 없어요.</EmptyText>
        )}
      </ExpensePanel>

      {showAddModal && (
        <ModalOverlay onClick={() => setShowAddModal(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>내역 추가</ModalTitle>
            <ModalButton type="button" onClick={() => navigate('/income/add')}>
              <img src={incomeIcon} alt="" width={22} height={22} />
              수입 추가
            </ModalButton>
            <ModalButton type="button" onClick={() => navigate('/expenses/add')}>
              <img src={expenseIcon} alt="" width={22} height={22} />
              지출 추가
            </ModalButton>
          </ModalCard>
        </ModalOverlay>
      )}
    </Page>
  );
}

const Page = styled.div`
  padding: 20px 16px 32px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 4px 22px;
`;

const AddButton = styled.button`
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 14px;
  background: #6a5ce6;
  color: #fff;
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(106, 92, 230, 0.32);
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.94);
  }
`;

const MonthSummary = styled.div`
  padding: 2px 6px 14px;
`;

const MonthSummaryLabel = styled.span`
  font-size: 15px;
  font-weight: 700;
`;

const CalendarCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 18px 14px 10px;
  box-shadow: 0 4px 20px rgba(17, 17, 17, 0.05);
`;

const DayAmounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  margin-top: 1px;
`;

const ExpenseAmount = styled.span<{ $selected?: boolean }>`
  font-size: 8px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.2px;
  color: ${({ $selected }) => ($selected ? '#fff' : '#ff7d7d')};
`;

const IncomeAmount = styled.span<{ $selected?: boolean }>`
  font-size: 8px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.2px;
  color: ${({ $selected }) => ($selected ? '#fff' : '#6a5ce6')};
`;

const ExpensePanel = styled.div`
  margin-top: 16px;
  background: #fff;
  border-radius: 24px;
  padding: 20px 18px;
  box-shadow: 0 4px 20px rgba(17, 17, 17, 0.05);
`;

const ExpensePanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const MoreLink = styled.button`
  display: inline-block;
  background: #f4f2fc;
  color: #6a5ce6;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
`;

const ExpenseRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;

  & + & {
    border-top: 1px solid #f2f0fa;
  }
`;

const ItemIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #f4f2fc;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-size: 14.5px;
  font-weight: 700;
  color: #222;
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 3px;
`;

const ItemAmount = styled.div<{ $type?: 'income' | 'expense' }>`
  font-size: 14.5px;
  font-weight: 800;
  color: ${({ $type }) => ($type === 'income' ? '#6a5ce6' : '#ff7d7d')};
  flex-shrink: 0;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 28px 0;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ModalCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 24px 20px;
  width: 100%;
  max-width: 340px;
  margin: 0 20px;
`;

const ModalTitle = styled.h2`
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px;
`;

const ModalButton = styled.button`
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border: 1.5px solid #6a5ce6;
  border-radius: 12px;
  background: #fff;
  color: #6a5ce6;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;

  & + & {
    margin-top: 12px;
  }
`;