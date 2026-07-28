import BackButton from '../components/BackButton';
import { AuthTitle, PageWrap } from '../styles/auth.styles';

export default function AddIncome() {
  return (
    <PageWrap>
      <BackButton to="/" />
      <AuthTitle $size={20}>수입 추가</AuthTitle>
    </PageWrap>
  );
}