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
  merchant: string | null;
  description: string | null;
  transaction_date: string; // 'YYYY-MM-DD'
  transaction_time: string; // 'HH:mm:ss'
  emotion_tags: EmotionTag[];
  created_at: string;
};