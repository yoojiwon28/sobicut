import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StyledCalendar } from '../styles/calendar.styles';
import styled from 'styled-components';
import Logo2 from '../components/Logo2';
import type { Transaction } from '../types/transaction';
import { CATEGORY_ICONS } from '../utils/category';
import { DUMMY_CALENDAR_TRANSACTIONS } from '../mocks/transactions';
import incomeIcon from '../assets/images/income_icon.svg';
import expenseIcon from '../assets/images/expense_icon.svg';

type DayGroup = {
  expenseTotal: number;
  incomeTotal: number;
  items: Transaction[];
};

const toKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function CalendarPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const today = new Date();

  // 날짜별로 묶어서 지출/수입 합계 계산
  const groupedByDate = useMemo(() => {
    const map: Record<string, DayGroup> = {};
    for (const tx of DUMMY_CALENDAR_TRANSACTIONS) {
      const key = tx.transaction_date;
      if (!map[key]) {
        map[key] = { expenseTotal: 0, incomeTotal: 0, items: [] };
      }
      if (tx.type === 'expense') {
        map[key].expenseTotal += tx.amount;
      } else {
        map[key].incomeTotal += tx.amount;
      }
      map[key].items.push(tx);
    }
    return map;
  }, []);

  const selectedKey = toKey(selectedDate);
  const selectedGroup = groupedByDate[selectedKey];

  return (
    <Page>
      <Header>
        <Logo2 width={120} />
        <AddButton type="button" onClick={() => setShowAddModal(true)}>
          +
        </AddButton>
      </Header>

      <StyledCalendar
        value={selectedDate}
        onClickDay={(date) => setSelectedDate(date)}
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
          const group = groupedByDate[toKey(date)];
          if (!group) return null;
          const selected = isSameDay(date, selectedDate);
          return (
            <DayAmounts>
              {group.expenseTotal > 0 && (
                <ExpenseAmount $selected={selected}>-{group.expenseTotal.toLocaleString()}</ExpenseAmount>
              )}
              {group.incomeTotal > 0 && (
                <IncomeAmount $selected={selected}>+{group.incomeTotal.toLocaleString()}</IncomeAmount>
              )}
            </DayAmounts>
          );
        }}
      />

      <ExpensePanel>
        <ExpensePanelHeader>
          <span>
            {selectedDate.getMonth() + 1}/{selectedDate.getDate()} 지출 - {(selectedGroup?.expenseTotal ?? 0).toLocaleString()}원
          </span>
          {selectedGroup && (
            <MoreLink type="button" onClick={() => navigate(`/day/${selectedKey}`)}>
              + 더보기
            </MoreLink>
          )}
        </ExpensePanelHeader>

        {selectedGroup ? (
          selectedGroup.items.map((tx) => (
            <ExpenseRow key={tx.id}>
              <ItemIcon>
                {CATEGORY_ICONS[tx.category] && (
                  <img src={CATEGORY_ICONS[tx.category]} alt={tx.category} width={22} height={22} />
                )}
              </ItemIcon>
              <ItemInfo>
                <ItemName>{tx.merchant}</ItemName>
                <ItemMeta>
                  {tx.transaction_time} · {tx.category}
                </ItemMeta>
              </ItemInfo>
              <ItemAmount>
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

// ---- styles ----

const Page = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const AddButton = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: #6a5ce6;
  color: #fff;
  font-size: 22px;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
`;


const DayAmounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
`;

const ExpenseAmount = styled.span<{ $selected?: boolean }>`
  font-size: 9px;
  line-height: 1.2;
  color: ${({ $selected }) => ($selected ? '#fff' : '#ff7d7d')};
`;

const IncomeAmount = styled.span<{ $selected?: boolean }>`
  font-size: 9px;
  line-height: 1.2;
  color: ${({ $selected }) => ($selected ? '#fff' : '#6a5ce6')};
`;

const ExpensePanel = styled.div`
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 16px;
`;

const ExpensePanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 10px 0;
`;

const ItemIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #ece9fb;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 2px;
`;

const ItemAmount = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #000;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 24px 0;
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