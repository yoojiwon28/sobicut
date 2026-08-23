import { apiFetch } from './client';
import type { Transaction } from '../types/transaction';

export function getTransactions(params: {
  date?: string;
  year?: number;
  month?: number;
  type?: 'expense' | 'income';
  category?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.date) query.set('date', params.date);
  if (params.year) query.set('year', String(params.year));
  if (params.month) query.set('month', String(params.month));
  if (params.type) query.set('type', params.type);
  if (params.category) query.set('category', params.category);
  const qs = query.toString();
  return apiFetch<Transaction[]>(`/transactions${qs ? `?${qs}` : ''}`);
}

export type ParsedCardMessage = {
  amount: number;
  merchant: string;
  transaction_date: string; // 'YYYY-MM-DD'
  transaction_time: string; // 'HH:MM'
  card_company: string;
};

export function parseCardMessage(messageText: string) {
  return apiFetch<ParsedCardMessage>('/transactions/parse', {
    method: 'POST',
    body: JSON.stringify({ message_text: messageText }),
  });
}