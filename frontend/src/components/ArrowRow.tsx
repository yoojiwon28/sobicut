// 페이지 이동하는 화살표 버튼

import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import angleRightIcon from '../../assets/images/angle_right.svg';

type ArrowRowProps = {
  to?: string;
  onClick?: () => void;
  icon?: string;
  label: string;
  value?: string;
  showArrow?: boolean;
};

export default function ArrowRow({ to, onClick, icon, label, value, showArrow = true }: ArrowRowProps) {
  const content = (
    <>
      <Left>
        {icon && <Icon src={icon} alt="" />}
        <RowLabel>{label}</RowLabel>
      </Left>
      <Right>
        {value && <Value>{value}</Value>}
        {showArrow && <img src={angleRightIcon} alt="" width={20} height={20} />}
      </Right>
    </>
  );

  if (to) {
    return <RowLink to={to}>{content}</RowLink>;
  }

  return (
    <RowButton type="button" onClick={onClick} disabled={!onClick}>
      {content}
    </RowButton>
  );
}

const rowStyles = css`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  background: none;
  border: none;
  text-decoration: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
`;

const RowLink = styled(Link)`
  ${rowStyles}
`;

const RowButton = styled.button`
  ${rowStyles}

  &:disabled {
    cursor: default;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Icon = styled.img`
  width: 22px;
  height: 22px;
`;

const RowLabel = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #111;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Value = styled.span`
  font-size: 14px;
  color: #888;
`;