export type NotificationType =
  | 'budget_weekly'
  | 'budget_monthly'
  | 'impulse_warning'
  | 'heatmap_time'
  | 'heatmap_day'
  | 'satisfaction_request'
  | 'no_transaction_reminder';

export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  transaction_id?: number;
};