import { useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import ExpenseList from '../../components/ExpenseList';
import { PageWrap } from '../../styles/auth.styles';
import { DUMMY_CALENDAR_TRANSACTIONS } from '../../mocks/transactions';
import { getMonthKey, formatMonthDay, formatMonthLabel } from '../../utils/date';
import type { Transaction } from '../../types/transaction';

type DateGroup = {
  date: string;
  items: Transaction[];
};

export default function CategoryDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { category = '' } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const decoded = decodeURIComponent(category);
  const currentMonthKey = getMonthKey(new Date());
  const monthKey = searchParams.get('month') ?? currentMonthKey;
  const monthLabel = monthKey === currentMonthKey ? '이번 달' : formatMonthLabel(new Date(`${monthKey}-01`));
  const fromParam = searchParams.get('from');
  const backTo = fromParam ? decodeURIComponent(fromParam) : `/analysis/categories?month=${monthKey}`;

  const groups = useMemo(() => {
    const items = DUMMY_CALENDAR_TRANSACTIONS.filter(
      (tx) => tx.type === 'expense' && tx.category === decoded && tx.transaction_date.startsWith(monthKey),
    ).sort(
      (a, b) =>
        b.transaction_date.localeCompare(a.transaction_date) || b.transaction_time.localeCompare(a.transaction_time),
    );

    const result: DateGroup[] = [];
    for (const tx of items) {
      const last = result[result.length - 1];
      if (last && last.date === tx.transaction_date) {
        last.items.push(tx);
      } else {
        result.push({ date: tx.transaction_date, items: [tx] });
      }
    }
    return result;
  }, [decoded, monthKey]);

  const total = groups.reduce((sum, g) => sum + g.items.reduce((s, tx) => s + tx.amount, 0), 0);

  return (
    <PageWrap>
      <BackButton to={backTo} />
      <Header>
        <HeaderLeft>
          <MonthLabel>{monthLabel}</MonthLabel>
          <CategoryTitle>{decoded}</CategoryTitle>
        </HeaderLeft>
        <Total>{total.toLocaleString()}원</Total>
      </Header>

      {groups.length === 0 ? (
        <EmptyText>{monthLabel} {decoded} 소비 내역이 없어요.</EmptyText>
      ) : (
        <ListCard>
          {groups.map((group) => (
            <DateGroupBlock key={group.date}>
              <DateLabel>{formatMonthDay(group.date)}</DateLabel>
              <ExpenseList
                items={group.items}
                showArrow={false}
                onRowClick={(tx) => {
                  const from = encodeURIComponent(`${location.pathname}${location.search}`);
                  navigate(`/transactions/${tx.id}?from=${from}`);
                }}
              />
            </DateGroupBlock>
          ))}
        </ListCard>
      )}
    </PageWrap>
  );
}

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #E5E5E5;
  padding-bottom: 14px;
  margin-bottom: 18px;
`;

const HeaderLeft = styled.div``;

const MonthLabel = styled.div`
  font-size: 16px;
  color: #333;
`;

const CategoryTitle = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: #000;
  margin-top: 4px;
`;

const Total = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #898989;
`;

const ListCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 6px 18px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
`;

const DateGroupBlock = styled.div``;

const DateLabel = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #8B8578;
  padding: 18px 0 6px;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 24px 0;
`;
