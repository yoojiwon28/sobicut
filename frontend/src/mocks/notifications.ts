import type { AppNotification } from '../types/notification';

// TODO: GET /notifications 로 교체
export const DUMMY_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    type: 'budget_weekly',
    title: '주간 예산 초과',
    message: '이번 주 예산을 초과했습니다.',
    is_read: false,
    created_at: '2026-07-28T14:30:00',
  },
  {
    id: 2,
    type: 'heatmap_time',
    title: '야간 야망 컷 ✂️',
    message: '밤 11시, 지금이 가장 많이 쓰는 시간대예요!',
    is_read: false,
    created_at: '2026-07-27T23:05:00',
  },
  {
    id: 3,
    type: 'impulse_warning',
    title: '충동 소비 경고',
    message: '최근 충동 지수가 평소보다 높아요. 잠깐 멈춰볼까요?',
    is_read: true,
    created_at: '2026-07-26T20:10:00',
  },
  {
    id: 4,
    type: 'satisfaction_request',
    title: '만족도를 알려주세요',
    message: '어제 소비, 만족스러우셨나요?',
    is_read: true,
    created_at: '2026-07-25T09:00:00',
    transaction_id: 21,
  },
  {
    id: 5,
    type: 'heatmap_day',
    title: '주말 소비 패턴',
    message: '주말마다 소비가 크게 늘어나고 있어요.',
    is_read: false,
    created_at: '2026-07-24T18:20:00',
  },
  {
    id: 6,
    type: 'budget_monthly',
    title: '월간 예산 초과',
    message: '이번 달 예산의 90%를 사용했어요.',
    is_read: true,
    created_at: '2026-07-20T11:00:00',
  },
];