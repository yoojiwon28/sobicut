import { useState } from 'react';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import ArrowRow from '../../components/ArrowRow';
import ToggleSwitch from '../../components/ToggleSwitch';
import { AuthTitle, PageWrap } from '../../styles/auth.styles';

export default function Settings() {
  const [cuttyAlert, setCuttyAlert] = useState(true);
  const [ledgerHelperAlert, setLedgerHelperAlert] = useState(true);
  const [surveyAlert, setSurveyAlert] = useState(true);

  const handleLogout = () => {
    // TODO: 로그아웃 처리
  };

  const handleWithdraw = () => {
    // TODO: 회원탈퇴 처리
  };

  return (
    <PageWrap>
      <BackButton to="/mypage" />
      <AuthTitle $size={20} style={{ margin: '8px 0 20px' }}>
        환경 설정
      </AuthTitle>
      <Divider />

      <MenuList>
        <ArrowRow to="/mypage/edit" label="내 정보 수정하기" />

        <ToggleRow>
            <span>소비컷 알림</span>
            <ToggleSwitch checked={cuttyAlert} onChange={setCuttyAlert} />
        </ToggleRow>
        <ToggleRow>
            <span>가계부 입력 도우미 알림</span>
            <ToggleSwitch checked={ledgerHelperAlert} onChange={setLedgerHelperAlert} />
        </ToggleRow>
        <ToggleRow>
            <span>만족도 조사 알림</span>
            <ToggleSwitch checked={surveyAlert} onChange={setSurveyAlert} />
        </ToggleRow>

        <ArrowRow to="/mypage/settings/reset" label="데이터 초기화" />
      </MenuList>

      <FooterLinks>
        <button type="button" onClick={handleLogout}>
          로그아웃
        </button>
        <span>|</span>
        <button type="button" onClick={handleWithdraw}>
          회원탈퇴
        </button>
      </FooterLinks>
    </PageWrap>
  );
}

const Divider = styled.hr`
  border: none;
  border-top: 1px solid  #EDE9F9;
  margin: 12px 0 12px;
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  font-size: 15px;
  font-weight: 600;
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
  font-size: 13px;

  button {
    background: none;
    border: none;
    color: #444;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    font-size: 13px;
  }

  span {
    color: #ccc;
  }
`;

const MenuList = styled.div`
  > *:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;