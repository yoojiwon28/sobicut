import styled, { css } from 'styled-components';
import { CATEGORY_ICONS } from '../utils/category';
import type { Transaction } from '../types/transaction';
import angleRightIcon from '../assets/images/angle_right.svg';
import incomeIcon from '../assets/images/income_icon.svg';

type ExpenseListProps = {
  items: Transaction[];
  showArrow?: boolean;
  onRowClick?: (tx: Transaction) => void;
  emptyText?: string;
};

export default function ExpenseList({
  items,
  showArrow = false,
  onRowClick,
  emptyText = '지출 내역이 없어요.',
}: ExpenseListProps) {
  if (items.length === 0) {
    return <EmptyText>{emptyText}</EmptyText>;
  }

  return (
    <List>
      {items.map((tx) => (
        <Row
          key={tx.id}
          type="button"
          onClick={onRowClick ? () => onRowClick(tx) : undefined}
          disabled={!onRowClick}
        >
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
          <ItemAmount>
            {tx.type === 'expense' ? '-' : '+'}
            {tx.amount.toLocaleString()}원
          </ItemAmount>
          {showArrow && <img src={angleRightIcon} alt="" width={18} height={18} />}
        </Row>
      ))}
    </List>
  );
}

const List = styled.div`
  > *:not(:last-child) {
    border-bottom: 1px solid #ede9f9;
  }
`;

const rowStyles = css`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  background: none;
  border: none;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }
`;

const Row = styled.button`
  ${rowStyles}
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