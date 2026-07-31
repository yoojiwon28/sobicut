import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { AuthTitle, PageWrap } from '../../styles/auth.styles';
import { DUMMY_CALENDAR_TRANSACTIONS } from '../../mocks/transactions';
import { CATEGORY_COLORS } from '../../utils/category';
import { getMonthKey } from '../../utils/date';
import angleRightIcon from '../../assets/images/angle_right.svg';

export default function CategoryList() {
  const navigate = useNavigate();
  const monthKey = getMonthKey(new Date());

  const rows = useMemo(() => {
    const monthExpenses = DUMMY_CALENDAR_TRANSACTIONS.filter(
      (tx) => tx.type === 'expense' && tx.transaction_date.startsWith(monthKey),
    );
    const total = monthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
    const totals: Record<string, number> = {};
    for (const tx of monthExpenses) {
      totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount;
    }
    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthKey]);

  return (
    <PageWrap>
      <BackButton to="/analysis" />
      <AuthTitle $size={20}>카테고리 별 소비</AuthTitle>

      {rows.length === 0 ? (
        <EmptyText>이번 달 소비 내역이 없어요.</EmptyText>
      ) : (
        <List>
          {rows.map(({ category, amount, percent }) => (
            <Row
              key={category}
              type="button"
              onClick={() => navigate(`/analysis/categories/${encodeURIComponent(category)}`)}
            >
              <Dot style={{ background: CATEGORY_COLORS[category] ?? '#ccc' }} />
              <Info>
                <Name>{category}</Name>
                <Percent>{percent}%</Percent>
              </Info>
              <Amount>{amount.toLocaleString()}원</Amount>
              <img src={angleRightIcon} alt="" width={18} height={18} />
            </Row>
          ))}
        </List>
      )}
    </PageWrap>
  );
}

const List = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  padding: 4px 16px;

  > *:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

const Row = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
`;

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const Info = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const Percent = styled.div`
  font-size: 11px;
  color: #888;
  margin-top: 2px;
`;

const Amount = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 24px 0;
`;
