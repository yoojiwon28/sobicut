import { apiFetch } from './client';
import type { Transaction, TransactionListParams } from '../types/transaction';

export function getTransactions(params: TransactionListParams = {}) {
  const query = new URLSearchParams();
  if (params.date) query.set('date', params.date);
  if (params.year) query.set('year', String(params.year));
  if (params.month) query.set('month', String(params.month));
  if (params.week) query.set('week', String(params.week));
  if (params.type) query.set('type', params.type);
  if (params.category) query.set('category', params.category);
  const qs = query.toString();
  return apiFetch<Transaction[]>(`/transactions${qs ? `?${qs}` : ''}`);
}

export function getTransaction(id: number) {
  return apiFetch<Transaction>(`/transactions/${id}`);
}

export type ParsedCardMessage = {
  amount: number;
  merchant: string;
  transaction_date: string;
  transaction_time: string;
  card_company: string;
};

export function parseCardMessage(messageText: string) {
  return apiFetch<ParsedCardMessage>('/transactions/parse', {
    method: 'POST',
    body: JSON.stringify({ message_text: messageText }),
  });
}

export type TransactionCreatePayload = {
  amount: number;
  type: 'expense' | 'income';
  category: string;
  merchant?: string;
  description?: string;
  transaction_date: string; // 'YYYY-MM-DD'
  transaction_time: string; // 'HH:mm'
};

export function createTransaction(payload: TransactionCreatePayload) {
  return apiFetch<{ id: number }>('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      transaction_time: `${payload.transaction_time}:00`, // 백엔드가 HH:MM:SS 형식 요구
    }),
  });
}

export type TransactionUpdateBody = {
  amount: number; // > 0, 화면에서 수정 불가지만 원본 값 그대로 포함
  type: string;
  category: string;
  merchant: string | null;
  description: string | null;
  transaction_date: string; // 'YYYY-MM-DD'
  transaction_time: string; // 'HH:mm:ss'
};

// PUT은 전체 교체 방식. emotion_tags는 body에 포함하지 않는다.
export function updateTransaction(id: number, body: TransactionUpdateBody): Promise<void> {
  return apiFetch<void>(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function tagTransactionEmotions(transactionId: number, emotionTagIds: number[]) {
  return apiFetch<{ message: string }>(`/transactions/${transactionId}/emotions`, {
    method: 'POST',
    body: JSON.stringify({ emotion_tag_ids: emotionTagIds }),
  });
}

export function deleteTransaction(id: number) {
  return apiFetch<{ message: string }>(`/transactions/${id}`, { method: 'DELETE' });
}