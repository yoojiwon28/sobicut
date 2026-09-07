import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import Logo from '../../components/Logo';
import { AuthTitle, Field, Label, Select, Input, ButtonPrimary, LoadingOverlay, Spinner } from '../../styles/auth.styles';
import { loginWithKakao } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../api/client';
import { NOTIFICATION_TYPES } from '../../utils/notificationTypes';
import { getVapidPublicKey, subscribePush } from '../../api/notifications';
import { ensurePushSubscription } from '../../utils/push';

const LIVING_OPTIONS = ['자취', '기숙사', '통학'];

function mapIncomeToLevel(income: number): string {
  if (income < 30) return 'under-30';
  if (income < 60) return '30-60';
  if (income < 100) return '60-100';
  return 'over-100';
}

const IncomeSlider = styled.input`
  width: 100%;
  accent-color: #6c5ce7;
  margin-top: 12px;
`;

const IncomeSliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
`;

const IncomeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const IncomeManualLink = styled.button`
  background: none;
  border: none;
  text-decoration: underline;
  color: #444;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
`;

const IncomeValue = styled.span`
  background: #6c5ce7;
  color: #fff;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  text-align: center;
  margin: 8px 0 0;
`;

type KakaoProfileState = { kakaoAccessToken: string };

export default function KakaoProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const state = location.state as KakaoProfileState | null;

  // access_token 없이 직접 접근한 경우 로그인 화면으로 되돌려보냄
  useEffect(() => {
    if (!state?.kakaoAccessToken) {
      navigate('/login', { replace: true });
    }
  }, [state, navigate]);

  const [nickname, setNickname] = useState('');
  const [livingType, setLivingType] = useState('');
  const [income, setIncome] = useState(70);
  const [manualIncome, setManualIncome] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = nickname.trim().length > 0 && Boolean(livingType);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!state?.kakaoAccessToken || !canSubmit || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      const { access_token } = await loginWithKakao({
        access_token: state.kakaoAccessToken,
        nickname: nickname.trim(),
        residence_type: livingType,
        income_level: mapIncomeToLevel(income),
      });
      authLogin(access_token);

      // 알림 전체 구독 — 실패(권한 거부 등)해도 가입 자체는 그대로 진행
      try {
        const { public_key } = await getVapidPublicKey();
        const subscription = await ensurePushSubscription(public_key);
        const json = subscription.toJSON();
        const { endpoint, keys } = json;
        if (endpoint && keys?.p256dh && keys?.auth) {
          const pushKeys = { p256dh: keys.p256dh, auth: keys.auth };
          await Promise.all(
            Object.values(NOTIFICATION_TYPES).map((notification_type) =>
              subscribePush({ endpoint, keys: pushKeys, notification_type }),
            ),
          );
        }
      } catch {
        // 푸시 구독 실패는 무시하고 진행
      }

      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '가입에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <BackButton to="/login" />
      <Logo />
      <AuthTitle $align="left" $size={20}>
        추가 정보를 입력해주세요
      </AuthTitle>

      <Field>
        <Label>닉네임</Label>
        <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="사용하실 닉네임을 입력해주세요" />
      </Field>

      <Field>
        <Label>거주형태</Label>
        <Select value={livingType} onChange={(e) => setLivingType(e.target.value)}>
          <option value="">거주 형태를 선택해주세요</option>
          {LIVING_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <Label>소득구간 (월별)</Label>
        {manualIncome ? (
          <Input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
        ) : (
          <>
            <IncomeSlider
              type="range"
              min={0}
              max={200}
              step={5}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
            />
            <IncomeSliderLabels>
              <span>0</span>
              <span>100만 원</span>
              <span>200만 원</span>
            </IncomeSliderLabels>
          </>
        )}
        <IncomeRow>
          <IncomeManualLink type="button" onClick={() => setManualIncome((v) => !v)}>
            직접 입력
          </IncomeManualLink>
          <IncomeValue>{income}만 원</IncomeValue>
        </IncomeRow>
      </Field>

      {error && <ErrorText>{error}</ErrorText>}

      <ButtonPrimary type="submit" disabled={!canSubmit || submitting}>
        시작하기
      </ButtonPrimary>

      {submitting && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}
    </form>
  );
}