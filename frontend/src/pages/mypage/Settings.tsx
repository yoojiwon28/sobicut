import { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BackButton from '../../components/BackButton';
import ArrowRow from '../../components/ArrowRow';
import ToggleSwitch from '../../components/ToggleSwitch';
import { AuthTitle, PageWrap, LoadingOverlay, Spinner } from '../../styles/auth.styles';
import { useNavigate } from 'react-router-dom';
import { logout as logoutApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import WithdrawModal from '../../components/WithdrawModal';
import {
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  getActiveSubscriptions,
} from '../../api/notifications';
import { ensurePushSubscription } from '../../utils/push';
import { ApiError } from '../../api/client';
import { NOTIFICATION_TYPES } from '../../utils/notificationTypes';


const SUBSCRIPTIONS_QUERY_KEY = ['notifications', 'subscriptions'];

export default function Settings() {
  const queryClient = useQueryClient();
  const {
    data: activeSubscriptions = [],
    isLoading: loadingSubscriptions,
  } = useQuery({
    queryKey: SUBSCRIPTIONS_QUERY_KEY,
    queryFn: getActiveSubscriptions,
  });

  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [pushBusyType, setPushBusyType] = useState<string | null>(null);
  const [pushError, setPushError] = useState('');

  const isSubscribed = (notificationType: string) => activeSubscriptions.includes(notificationType);

  const handleToggleSubscription = async (notificationType: string, next: boolean) => {
    setPushBusyType(notificationType);
    setPushError('');
    try {
      if (next) {
        const { public_key } = await getVapidPublicKey();
        const subscription = await ensurePushSubscription(public_key);
        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          throw new Error('구독 정보를 가져오지 못했어요.');
        }
        await subscribePush({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          notification_type: notificationType,
        });
      } else {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          try {
            await unsubscribePush({ endpoint: existing.endpoint, notification_type: notificationType });
          } catch (err) {
            if (!(err instanceof ApiError && err.status === 404)) throw err;
          }
        }
      }
      await queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
    } catch (err) {
      setPushError(err instanceof ApiError ? err.message : '알림 설정을 변경하지 못했어요.');
    } finally {
      setPushBusyType(null);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
        await logoutApi();
    } catch {
        // 서버 로그아웃 실패해도 클라이언트 세션은 정리함
    } finally {
        logout();
        navigate('/onboarding');
    }
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
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
            <span>소비컷 패턴 알림</span>
            <ToggleSwitch
              checked={isSubscribed(NOTIFICATION_TYPES.heatmap)}
              onChange={(v) => handleToggleSubscription(NOTIFICATION_TYPES.heatmap, v)}
              disabled={loadingSubscriptions || pushBusyType === NOTIFICATION_TYPES.heatmap}
            />
        </ToggleRow>
        <ToggleRow>
            <span>가계부 입력 도우미 알림</span>
            <ToggleSwitch
              checked={isSubscribed(NOTIFICATION_TYPES.ledgerHelper)}
              onChange={(v) => handleToggleSubscription(NOTIFICATION_TYPES.ledgerHelper, v)}
              disabled={loadingSubscriptions || pushBusyType === NOTIFICATION_TYPES.ledgerHelper}
            />
        </ToggleRow>
        <ToggleRow>
            <span>만족도 조사 알림</span>
            <ToggleSwitch
              checked={isSubscribed(NOTIFICATION_TYPES.survey)}
              onChange={(v) => handleToggleSubscription(NOTIFICATION_TYPES.survey, v)}
              disabled={loadingSubscriptions || pushBusyType === NOTIFICATION_TYPES.survey}
            />
        </ToggleRow>
        <ToggleRow>
            <span>예산 초과 · 충동 소비 알림</span>
            <ToggleSwitch
              checked={isSubscribed(NOTIFICATION_TYPES.budgetImpulse)}
              onChange={(v) => handleToggleSubscription(NOTIFICATION_TYPES.budgetImpulse, v)}
              disabled={loadingSubscriptions || pushBusyType === NOTIFICATION_TYPES.budgetImpulse}
            />
        </ToggleRow>

        <ArrowRow to="/mypage/settings/reset" label="데이터 초기화" />
      </MenuList>

      {pushError && <ErrorText>{pushError}</ErrorText>}

      <FooterLinks>
        <button type="button" onClick={handleLogout} disabled={loggingOut}>
            로그아웃
        </button>
        <span>|</span>
        <button type="button" onClick={handleWithdraw}>
            회원탈퇴
        </button>
      </FooterLinks>
      {showWithdrawModal && (
        <WithdrawModal
            onClose={() => setShowWithdrawModal(false)}
            onSuccess={() => {
            logout();
            navigate('/onboarding');
            }}
        />
      )}

      {loggingOut && (
        <LoadingOverlay>
            <Spinner />
        </LoadingOverlay>
      )}  

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

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 12px;
  margin: 0 0 8px;
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