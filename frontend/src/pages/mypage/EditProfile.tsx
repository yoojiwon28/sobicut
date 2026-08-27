import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import BackButton from '../../components/BackButton';
import ArrowRow from '../../components/ArrowRow';
import { AuthTitle, PageWrap, PageSpinnerWrap, Spinner } from '../../styles/auth.styles';
import { formatIncomeLevel } from '../../utils/income';
import { getSettings } from '../../api/users';

export default function EditProfile() {
  const { data: settings } = useQuery({
    queryKey: ['users', 'me', 'settings'],
    queryFn: getSettings,
  });

  if (!settings) {
    return (
        <PageWrap>
        <BackButton to="/mypage/settings" />
        <AuthTitle $size={20}>내 정보 수정</AuthTitle>
        <PageSpinnerWrap>
            <Spinner />
        </PageSpinnerWrap>
        </PageWrap>
    );
  }

  return (
    <PageWrap>
      <BackButton to="/mypage/settings" />
      <AuthTitle $size={20}>내 정보 수정</AuthTitle>

      <ArrowRow to="/mypage/edit/nickname" label="닉네임" value={settings.nickname} />

      <Notice>[ 정확한 또래 비교를 위해 필요한 정보예요 ]</Notice>

      <ArrowRow to="/mypage/edit/residence" label="거주 형태" value={settings.residence_type} />

      <ArrowRow to="/mypage/edit/income" label="소득 구간" />
      <IncomeValue>{formatIncomeLevel(settings.income_level)}</IncomeValue>

      <Divider />

      <ArrowRow label="아이디" value={settings.email} showArrow={false} />
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

