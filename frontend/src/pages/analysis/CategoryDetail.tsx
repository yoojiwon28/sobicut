import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  const { category = '' } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const decoded = decodeURIComponent(category);
  const currentMonthKey = getMonthKey(new Date());
  const monthKey = searchParams.get('month') ?? currentMonthKey;
  const monthLabel = monthKey === currentMonthKey ? '이번 달' : formatMonthLabel(new Date(`${monthKey}-01`));

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
      <BackButton to={`/analysis/categories?month=${monthKey}`} />
      <Header>
        <MonthLabel>{monthLabel}</MonthLabel>
        <CategoryTitle>{decoded}</CategoryTitle>
        <Total>{total.toLocaleString()}원</Total>
      </Header>

      {groups.length === 0 ? (
        <EmptyText>{monthLabel} {decoded} 소비 내역이 없어요.</EmptyText>
      ) : (
        groups.map((group) => (
          <DateGroupBlock key={group.date}>
            <DateLabel>{formatMonthDay(group.date)}</DateLabel>
            <ExpenseList
              items={group.items}
              showArrow
              onRowClick={(tx) => {
                const from = encodeURIComponent(`/analysis/categories/${encodeURIComponent(decoded)}?month=${monthKey}`);
                navigate(`/transactions/${tx.id}?from=${from}`);
              }}
            />
          </DateGroupBlock>
        ))
      )}
    </PageWrap>
  );
}

const Header = styled.div`
  margin-bottom: 16px;
`;

const MonthLabel = styled.div`
  font-size: 13px;
  color: #888;
`;

const CategoryTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-top: 2px;
`;

const Total = styled.div`
  font-size: 26px;
  font-weight: 800;
  margin-top: 8px;
`;

const DateGroupBlock = styled.div`
  margin-bottom: 8px;
`;

const DateLabel = styled.div`
  font-size: 12px;
  color: #888;
  padding: 12px 0 4px;
  border-top: 1px solid #eee;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 24px 0;
`;
