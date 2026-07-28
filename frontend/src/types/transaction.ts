export type EmotionTag = {
  id: number;
  name: string;
};

export type TransactionType = 'expense' | 'income';

export type Transaction = {
  id: number;
  amount: number;
  type: TransactionType;
  category: string;
  merchant: string;
  description: string;
  transaction_date: string; // 'YYYY-MM-DD'
  transaction_time: string; // 'HH:mm'
  emotion_tags: EmotionTag[];
  created_at: string;
};