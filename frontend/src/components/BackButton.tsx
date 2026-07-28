//뒤로가기 버튼

import { Link } from 'react-router-dom';
import styled from 'styled-components';
import angleLeftIcon from '../../assets/images/angle_left.svg';

const StyledLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
`;

export default function BackButton({ to }: { to: string }) {
  return (
    <StyledLink to={to}>
      <img src={angleLeftIcon} alt="뒤로가기" width={24} height={24} />
    </StyledLink>
  );
}