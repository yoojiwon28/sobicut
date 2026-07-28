import { useMemo, useState } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styled from 'styled-components';
import Logo2 from '../components/Logo2';
import foodIcon from '../assets/images/category/food.svg';
import fixedExpenseIcon from '../assets/images/category/fixed-expense.svg';
import transportIcon from '../assets/images/category/transport.svg';
import dailyLifeIcon from '../assets/images/category/daily-life.svg';
import shoppingIcon from '../assets/images/category/shopping.svg';
import selfDevelopmentIcon from '../assets/images/category/self-development.svg';
import cultureLeisureIcon from '../assets/images/category/culture-leisure.svg';
import meetingEtcIcon from '../assets/images/category/meeting-etc.svg';

// ---- 타입 (백엔드 응답 형태) ----

type EmotionTag = {
  id: number;
  name: string;
};

type TransactionType = 'expense' | 'income';

type Transaction = {
  id: number;
  amount: number;
  type: TransactionType;
  category: string;
  merchant: string;
  description: string;
  transaction_date: string; // 'YYYY-MM-DD'
  transaction_time: string; // 'HH:mm'
  emotion_tags: EmotionTag[];
  created_at: string;
};

// 카테고리별 아이콘 매핑
const CATEGORY_ICONS: Record<string, string> = {
  '식비': foodIcon,
  '고정지출': fixedExpenseIcon,
  '교통': transportIcon,
  '생활': dailyLifeIcon,
  '쇼핑/패션': shoppingIcon,
  '자기계발': selfDevelopmentIcon,
  '문화/여가': cultureLeisureIcon,
  '모임/기타': meetingEtcIcon,
};

// 더미 데이터 
const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    amount: 10000,
    type: 'expense',
    category: '식비',
    merchant: '스타벅스',
    description: '커피',
    transaction_date: '2026-04-19',
    transaction_time: '14:30',
    emotion_tags: [{ id: 1, name: '스트레스' }],
    created_at: '2026-04-19T14:30:00',
  },
  {
    id: 2,
    amount: 50000,
    type: 'income',
    category: '모임/기타',
    merchant: '부모님',
    description: '용돈',
    transaction_date: '2026-04-19',
    transaction_time: '09:00',
    emotion_tags: [],
    created_at: '2026-04-19T09:00:00',
  },
  {
    id: 3,
    amount: 58000,
    type: 'expense',
    category: '쇼핑/패션',
    merchant: '올리브영',
    description: '화장품',
    transaction_date: '2026-04-03',
    transaction_time: '15:30',
    emotion_tags: [],
    created_at: '2026-04-03T15:30:00',
  },
  {
    id: 4,
    amount: 10000,
    type: 'expense',
    category: '식비',
    merchant: '신룽푸마라탕 숙대입구점',
    description: '점심',
    transaction_date: '2026-04-04',
    transaction_time: '12:15',
    emotion_tags: [],
    created_at: '2026-04-04T12:15:00',
  },
  {
    id: 5,
    amount: 3000,
    type: 'expense',
    category: '식비',
    merchant: '메가커피 숙명여대점',
    description: '커피',
    transaction_date: '2026-04-04',
    transaction_time: '14:02',
    emotion_tags: [],
    created_at: '2026-04-04T14:02:00',
  },
  {
    id: 6,
    amount: 4000,
    type: 'expense',
    category: '식비',
    merchant: '더베이크 숙명여대점',
    description: '빵',
    transaction_date: '2026-04-04',
    transaction_time: '18:40',
    emotion_tags: [],
    created_at: '2026-04-04T18:40:00',
  },
];

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = new Date();

  // 날짜별로 묶어서 지출/수입 합계 계산 
  const groupedByDate = useMemo(() => {
    const map: Record<string, DayGroup> = {};
    for (const tx of DUMMY_TRANSACTIONS) {
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
        <AddButton type="button" onClick={() => {/* TODO: 지출 추가 화면 이동 */}}>
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
          <MoreLink type="button">+ 더보기</MoreLink>
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

const StyledCalendar = styled(ReactCalendar)`
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;

  .react-calendar__navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    margin-bottom: 12px;
  }

  .react-calendar__navigation button {
    background: none;
    border: none;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    color: #000;
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: transparent;
  }

  .react-calendar__navigation button:disabled {
    background-color: transparent;
    cursor: default;
  }

  .react-calendar__navigation__label {
    font-size: 16px;
    font-weight: 700;
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    font-size: 13px;
    color: #888;
    margin-bottom: 8px;
  }

  .react-calendar__month-view__weekdays abbr {
    text-decoration: none;
  }

  .react-calendar__tile {
    position: relative;
    height: 56px;
    background: transparent;
    border-radius: 10px;
    margin: 2px 0;
    border: none;
    color: #000;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background: transparent;
  }

  .react-calendar__tile--now {
    background: transparent;
  }

  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: transparent;
  }

  .react-calendar__tile--active {
    background: transparent;
  }

  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: transparent;
  }

  .react-calendar__tile abbr {
    font-size: 14px;
  }

  .react-calendar__tile.is-today abbr {
    color: #6a5ce6;
    font-weight: 800;
  }

  .react-calendar__tile.is-selected {
    background: #6a5ce6;
  }

  .react-calendar__tile.is-selected:enabled:hover,
  .react-calendar__tile.is-selected:enabled:focus {
    background: #6a5ce6;
  }

  .react-calendar__tile.is-selected abbr {
    color: #fff;
    font-weight: 800;
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    visibility: hidden;
  }
`;

const DayAmounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
`;

const ExpenseAmount = styled.span<{ $selected?: boolean }>`
  font-size: 9px;
  color: ${({ $selected }) => ($selected ? '#fff' : '#ff4040')};
`;

const IncomeAmount = styled.span<{ $selected?: boolean }>`
  font-size: 9px;
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
  background: none;
  border: none;
  color: #6a5ce6;
  font-size: 13px;
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