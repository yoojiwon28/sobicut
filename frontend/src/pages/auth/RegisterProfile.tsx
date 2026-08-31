import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import Logo from '../../components/Logo';
import Modal from '../../components/Modal';
import { AuthTitle, Field, Label, Select, Input, ButtonPrimary, CheckboxRow, LoadingOverlay, Spinner } from '../../styles/auth.styles';
import { signup, login as loginApi } from '../../api/auth';
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

const ConsentCheckboxRow = styled(CheckboxRow)`
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const ConsentLabel = styled.span`
  flex: 1;
`;

const DetailLink = styled.button`
  background: none;
  border: none;
  text-decoration: underline;
  color: #6a5ce6;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  white-space: nowrap;
`;

const TermsTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 12px;
`;

const TermsBody = styled.div`
  font-size: 13px;
  line-height: 1.6;
  color: #444;
  max-height: 300px;
  overflow-y: auto;
`;

type RegisterState = { email: string; password: string; nickname: string };

export default function RegisterProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const state = location.state as RegisterState | null;

  // Register 단계를 건너뛰고 직접 접근한 경우 되돌려보냄
  useEffect(() => {
    if (!state?.email) {
      navigate('/register', { replace: true });
    }
  }, [state, navigate]);

  const [livingType, setLivingType] = useState('');
  const [income, setIncome] = useState(70);
  const [manualIncome, setManualIncome] = useState(false);
  const [agreeDataUse, setAgreeDataUse] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = Boolean(livingType) && agreeDataUse;

    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!state?.email || !canSubmit || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      await signup({
        email: state.email,
        password: state.password,
        nickname: state.nickname,
        residence_type: livingType,
        income_level: mapIncomeToLevel(income),
      });

      const { access_token } = await loginApi(state.email, state.password);
      authLogin(access_token);

      // 알림 전체 구독 — 실패(권한 거부 등)해도 회원가입 자체는 그대로 진행
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
      setError(err instanceof ApiError ? err.message : '회원가입에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <BackButton to="/register" />
      <Logo />
      <AuthTitle $align="left" $size={20}>
        추가 정보를 입력해주세요
      </AuthTitle>

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


      <ConsentCheckboxRow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={agreeDataUse}
            onChange={(e) => setAgreeDataUse(e.target.checked)}
          />
          <ConsentLabel>(필수) 맞춤형 서비스 제공 및 상세 정보 이용 동의</ConsentLabel>
        </div>
        <DetailLink type="button" onClick={() => setShowTermsModal(true)}>
          전문보기
        </DetailLink>
      </ConsentCheckboxRow>

      {error && <ErrorText>{error}</ErrorText>}

      <ButtonPrimary type="submit" disabled={!canSubmit || submitting}>
        시작하기
      </ButtonPrimary>

      {submitting && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}

      {showTermsModal && (
        <Modal onClose={() => setShowTermsModal(false)}>
          <TermsTitle>맞춤형 서비스 제공 및 상세 정보 이용 동의</TermsTitle>
          <TermsBody>
            <p>1. 수집 항목: 거주형태, 소득구간, 지출·수입 내역, 소비 태그</p>
            <p>2. 이용 목적: 또래 사용자와의 소비 패턴 비교 분석, AI 기반 지출 내역 분석을 통한
              맞춤형 소비 리포트·알림 제공</p>
            <p>3. 보유·이용 기간: 회원 탈퇴 시까지 (탈퇴 시 즉시 파기)</p>
            <p>4. 동의를 거부할 권리가 있으며, 동의 거부 시 서비스 이용이 제한될 수 있어요.</p>
          </TermsBody>
        </Modal>
      )}
    </form>
  );
}