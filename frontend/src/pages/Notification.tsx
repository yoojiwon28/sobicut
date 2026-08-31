import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../components/BackButton';
import { AuthTitle, PageWrap } from '../styles/auth.styles';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import type { AppNotification, NotificationType } from '../types/notification';
import { formatShortDateTime } from '../utils/date';
import iconBudget from '../assets/images/notification/icon_budget.svg';
import iconImpulse from '../assets/images/notification/icon_impulse.svg';
import iconClock from '../assets/images/notification/icon_clock.svg';
import iconGraph from '../assets/images/notification/icon_graph.svg';
import iconSurvey from '../assets/images/notification/icon_survey.svg';
import iconWallet from '../assets/images/wallet_icon.svg';
import angleRightIcon from '../assets/images/angle_right.svg';

const TYPE_ICONS: Record<NotificationType, string> = {
  budget_weekly: iconBudget,
  budget_monthly: iconBudget,
  impulse_warning: iconImpulse,
  heatmap_time: iconClock,
  heatmap_day: iconGraph,
  satisfaction_request: iconSurvey,
  no_transaction_reminder: iconWallet,
};

const TYPE_ROUTES: Partial<Record<NotificationType, string>> = {
  budget_weekly: '/analysis',
  budget_monthly: '/analysis',
  impulse_warning: '/analysis/report/impulse',
  heatmap_time: '/analysis',
  heatmap_day: '/analysis',
  no_transaction_reminder: '/expenses/add',
};

export default function Notification() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleItemClick = (n: AppNotification) => {
    if (!n.is_read) markReadMutation.mutate(n.id);

    if (n.type === 'satisfaction_request' && n.transaction_id != null) {
      navigate(`/satisfaction/${n.transaction_id}`);
      return;
    }
    const route = TYPE_ROUTES[n.type];
    if (route) navigate(route);
  };

  return (
    <PageWrap>
      <TopRow>
        <BackButton to="/" />
        {unreadCount > 0 && (
          <MarkAllButton type="button" onClick={() => markAllReadMutation.mutate()}>
            전체 읽음
          </MarkAllButton>
        )}
      </TopRow>
      <AuthTitle $size={20}>알림</AuthTitle>

      {notifications.length === 0 ? (
        <EmptyText>알림이 없어요.</EmptyText>
      ) : (
        <List>
          {notifications.map((n) => (
            <Item key={n.id} type="button" $unread={!n.is_read} onClick={() => handleItemClick(n)}>
              <IconWrap>
                <img src={TYPE_ICONS[n.type]} alt="" width={18} height={18} />
              </IconWrap>
              <Content>
                <TitleRow>
                  <ItemTitle>{n.title}</ItemTitle>
                  {!n.is_read && <Dot />}
                </TitleRow>
                <ItemMessage>{n.message}</ItemMessage>
                <ItemTime>{formatShortDateTime(n.created_at)}</ItemTime>
              </Content>
              <ChevronIcon src={angleRightIcon} alt="" width={18} height={18} />
            </Item>
          ))}
        </List>
      )}
    </PageWrap>
  );
}

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MarkAllButton = styled.button`
  background: none;
  border: none;
  color: #6a5ce6;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;

const List = styled.div`
  > *:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

const Item = styled.button<{ $unread: boolean }>`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 10px;
  border: none;
  background: ${({ $unread }) => ($unread ? '#f8f6fe' : 'transparent')};
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
`;

const IconWrap = styled.div`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(255, 125, 125, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  flex: 1;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ItemTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff7d7d;
`;

const ItemMessage = styled.div`
  font-size: 13px;
  color: #555;
  margin-top: 4px;
  line-height: 1.4;
`;

const ItemTime = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 6px;
`;

const ChevronIcon = styled.img`
  flex-shrink: 0;
  align-self: center;
  opacity: 0.4;
`;

const EmptyText = styled.div`
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 60px 0;
`;