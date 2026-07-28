import BackButton from '../components/BackButton';
import { AuthTitle, PageWrap } from '../styles/auth.styles';

export default function AddExpense() {
  return (
    <PageWrap>
      <BackButton to="/" />
      <AuthTitle $size={20}>지출 추가</AuthTitle>
    </PageWrap>
  );
}