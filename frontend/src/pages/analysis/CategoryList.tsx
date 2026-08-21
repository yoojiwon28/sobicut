import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { PageWrap } from '../../styles/auth.styles';
import { DUMMY_CALENDAR_TRANSACTIONS } from '../../mocks/transactions';
import { CATEGORY_COLORS } from '../../utils/category';
import { getMonthKey } from '../../utils/date';
import angleRightIcon from '../../assets/images/angle_right.svg';

export default function CategoryList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const monthKey = searchParams.get('month') ?? getMonthKey(new Date());

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
      <Title>카테고리 별 소비</Title>

      {rows.length === 0 ? (
        <EmptyText>이번 달 소비 내역이 없어요.</EmptyText>
      ) : (
        <List>
          {rows.map(({ category, amount, percent }) => (
            <Row
              key={category}
              type="button"
              onClick={() => {
                const from = encodeURIComponent(`/analysis/categories?month=${monthKey}`);
                navigate(`/analysis/categories/${encodeURIComponent(category)}?month=${monthKey}&from=${from}`);
              }}
            >
              <Dot style={{ background: CATEGORY_COLORS[category] ?? '#ccc' }} />
              <Info>
                <Name>{category}</Name>
                <Percent>{percent}%</Percent>
              </Info>
              <Amount>{amount.toLocaleString()}원</Amount>
              <Arrow src={angleRightIcon} alt="" width={18} height={18} />
            </Row>
          ))}
        </List>
      )}
    </PageWrap>
  );
}

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #000;
  margin: 4px 0 18px;
  text-align: left;
`;

const List = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  padding: 4px 18px;

  > *:not(:last-child) {
    border-bottom: 1px solid #F0F0F0;
  }
`;

const Row = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 0;
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
  font-size: 16px;
  font-weight: 800;
`;

const Percent = styled.div`
  font-size: 13px;
  color: #8B8578;
  margin-top: 3px;
`;

const Amount = styled.div`
  font-size: 17px;
  font-weight: 800;
`;

const Arrow = styled.img`
  width: 18px;
  height: 18px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 24px 0;
`;
