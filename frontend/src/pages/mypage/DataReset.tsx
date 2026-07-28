// src/pages/mypage/DataReset.tsx
import BackButton from '../../components/BackButton';
import { AuthTitle, PageWrap } from '../../styles/auth.styles';

export default function DataReset() {
  return (
    <PageWrap>
      <BackButton to="/mypage/settings" />
      <AuthTitle $size={20}>데이터 초기화</AuthTitle>
      <p style={{ fontSize: 14, color: '#888', marginTop: 40, textAlign: 'center' }}>준비 중인 기능이에요.</p>
    </PageWrap>
  );
}