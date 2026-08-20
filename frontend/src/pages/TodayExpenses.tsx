import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../components/BackButton';
import ExpenseList from '../components/ExpenseList';
import { AuthTitle } from '../styles/auth.styles';
import { getTransactions } from '../api/transactions';
import { formatKoreanDate } from '../utils/date';
import { toDateKey } from '../utils/date';

export default function TodayExpenses() {
  const navigate = useNavigate();
  const today = toDateKey(new Date());

  const { data: items = [] } = useQuery({
    queryKey: ['transactions', { date: today, type: 'expense' }],
    queryFn: () => getTransactions({ date: today, type: 'expense' }),
  });

  const total = items.reduce((sum, tx) => sum + tx.amount, 0);

  const categoryTotals = items.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount;
    return acc;
  }, {});

  const breakdown = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
    }));

  return (
    <Page>
      <BackButton to="/" />
      <AuthTitle $size={20}>오늘의 지출</AuthTitle>
      <DateText>{formatKoreanDate(today)}</DateText>

      <TotalBox>
        <TotalLabel>총 지출 : {total.toLocaleString()} 원</TotalLabel>
        <BreakdownList>
          {breakdown.map(({ category, percent }) => (
            <BreakdownChip key={category}>
              <span>{category}</span>
              <strong>{percent}%</strong>
            </BreakdownChip>
          ))}
        </BreakdownList>
      </TotalBox>

      <ExpenseList items={items} showArrow onRowClick={(tx) => navigate(`/transactions/${tx.id}`)} />
    </Page>
  );
}

const Page = styled.div`
  padding: 20px;
`;

const DateText = styled.p`
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: -20px 0 20px;
`;

const TotalBox = styled.div`
  background: #f4f2fc;
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 20px;
`;

const TotalLabel = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const BreakdownList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const BreakdownChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  color: #555;

  strong {
    color: #6a5ce6;
    font-size: 13px;
    font-weight: 700;
  }
`;