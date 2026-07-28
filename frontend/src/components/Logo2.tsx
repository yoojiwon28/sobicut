import styled from 'styled-components';
import logo2 from '../../assets/images/logo2.svg';

const StyledImg = styled.img<{ $width: number }>`
  width: ${({ $width }) => $width}px;
  height: auto;
  display: block;
`;

export default function Logo2({ width = 120 }: { width?: number }) {
  return <StyledImg src={logo2} alt="소비컷" $width={width} />;
}