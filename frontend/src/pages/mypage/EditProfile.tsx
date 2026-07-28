import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import ArrowRow from '../../components/ArrowRow';
import { AuthTitle, PageWrap } from '../../styles/auth.styles';
import { formatIncomeLevel } from '../../utils/income';

// GET /users/me/settings 더미데이터
const DUMMY_SETTINGS = {
  email: 'test@test.com',
  nickname: 'user1',
  residence_type: '자취',
  income_level: '30-60',
};

export default function EditProfile() {
  return (
    <PageWrap>
      <BackButton to="/mypage/settings" />
      <AuthTitle $size={20}>내 정보 수정</AuthTitle>

      <ArrowRow to="/mypage/edit/nickname" label="닉네임" value={DUMMY_SETTINGS.nickname} />

      <Notice>[ 정확한 또래 비교를 위해 필요한 정보예요 ]</Notice>

      <ArrowRow to="/mypage/edit/residence" label="거주 형태" value={DUMMY_SETTINGS.residence_type} />

      <ArrowRow to="/mypage/edit/income" label="소득 구간" />
      <IncomeValue>{formatIncomeLevel(DUMMY_SETTINGS.income_level)}</IncomeValue>

      <Divider />

      <ArrowRow label="아이디" value={DUMMY_SETTINGS.email} showArrow={false} />
      <ArrowRow to="/mypage/edit/password" label="비밀번호 변경" />
    </PageWrap>
  );
}

const Notice = styled.p`
  font-size: 12px;
  color: #888;
  margin: 2px 0 0;
`;

const IncomeValue = styled.div`
  font-size: 14px;
  color: #444;
  padding: 0 0 12px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 4px 0;
`;