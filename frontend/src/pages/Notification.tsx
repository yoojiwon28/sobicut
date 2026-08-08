import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../components/BackButton';
import { AuthTitle, PageWrap } from '../styles/auth.styles';
import { DUMMY_NOTIFICATIONS } from '../mocks/notifications';
import type { AppNotification, NotificationType } from '../types/notification';
import { formatShortDateTime } from '../utils/date';
import iconBudget from '../assets/images/notification/icon_budget.svg';
import iconImpulse from '../assets/images/notification/icon_impulse.svg';
import iconClock from '../assets/images/notification/icon_clock.svg';
import iconGraph from '../assets/images/notification/icon_graph.svg';
import iconSurvey from '../assets/images/notification/icon_survey.svg';

const TYPE_ICONS: Record<NotificationType, string> = {
  budget_weekly: iconBudget,
  budget_monthly: iconBudget,
  impulse_warning: iconImpulse,
  heatmap_time: iconClock,
  heatmap_day: iconGraph,
  satisfaction_request: iconSurvey,
};

export default function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>(DUMMY_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = (id: number) => {
    // TODO: PUT /notifications/{id}
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAllRead = () => {
    // TODO: PUT /notifications/read-all
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleItemClick = (n: AppNotification) => {
    handleMarkRead(n.id);
    if (n.type === 'satisfaction_request' && n.transaction_id != null) {
      navigate(`/satisfaction/${n.transaction_id}`);
    }
  };

  return (
    <PageWrap>
      <TopRow>
        <BackButton to="/" />
        {unreadCount > 0 && (
          <MarkAllButton type="button" onClick={handleMarkAllRead}>
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

const EmptyText = styled.div`
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 60px 0;
`;