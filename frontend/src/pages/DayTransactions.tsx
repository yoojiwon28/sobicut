import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../components/BackButton';
import ExpenseList from '../components/ExpenseList';
import { AuthTitle } from '../styles/auth.styles';
import { getTransactions } from '../api/transactions';
import { formatKoreanDate } from '../utils/date';

export default function DayTransactions() {
  const navigate = useNavigate();
  const { date = '' } = useParams<{ date: string }>();

  const { data: items = [] } = useQuery({
    queryKey: ['transactions', { date }],
    queryFn: () => getTransactions({ date }),
    enabled: !!date,
  });

  const expenseTotal = items.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const incomeTotal = items.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);

  const categoryTotals = items
    .filter((tx) => tx.type === 'expense')
    .reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount;
      return acc;
    }, {});

  const breakdown = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      percent: expenseTotal > 0 ? Math.round((amount / expenseTotal) * 100) : 0,
    }));

  return (
    <Page>
      <BackButton to="/calendar" />
      <AuthTitle $size={20}>지출·수입 내역</AuthTitle>
      <DateText>{date && formatKoreanDate(date)}</DateText>

      <TotalBox>
        <TotalRow>
          <span>지출</span>
          <span>{expenseTotal.toLocaleString()}원</span>
        </TotalRow>
        <TotalRow>
          <span>수입</span>
          <span>{incomeTotal.toLocaleString()}원</span>
        </TotalRow>
        {breakdown.length > 0 && (
          <BreakdownList>
            {breakdown.map(({ category, percent }) => (
              <BreakdownChip key={category}>
                <span>{category}</span>
                <b>{percent}%</b>
              </BreakdownChip>
            ))}
          </BreakdownList>
        )}
      </TotalBox>

      <ExpenseList
        items={items}
        showArrow
        emptyText="이 날짜에는 내역이 없어요."
        onRowClick={(tx) => navigate(`/transactions/${tx.id}`)}
      />
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

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;

  & + & {
    margin-top: 6px;
  }
`;

const BreakdownList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
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

  b {
    color: #6a5ce6;
    font-size: 13px;
    font-weight: 700;
  }
`;