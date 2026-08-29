import { useQuery } from '@tanstack/react-query';
import { getTransaction, getTransactions } from '../api/transactions';
import type { TransactionListParams } from '../types/transaction';

const STALE_TIME = 60 * 1000; // 1분

export function useTransactions(params: TransactionListParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
    staleTime: STALE_TIME,
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => getTransaction(id),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}
