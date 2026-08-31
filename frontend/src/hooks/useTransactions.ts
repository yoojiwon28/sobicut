import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTransaction,
  getTransaction,
  getTransactions,
  parseCardMessage,
  tagTransactionEmotions,
  type TransactionCreatePayload,
} from '../api/transactions';
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

// 카드 결제 문자 파싱. POST /transactions/parse
// 실패(400)는 ApiError 로 onError 에 전달된다.
export function useParseCardMessage() {
  return useMutation({
    mutationFn: (messageText: string) => parseCardMessage(messageText),
  });
}

// 지출 등록 + (선택) 감정 태그 연결.
// POST /transactions → 성공 시 POST /transactions/{id}/emotions
export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      payload,
      emotionTagIds,
    }: {
      payload: TransactionCreatePayload;
      emotionTagIds: number[];
    }) => {
      const { id } = await createTransaction(payload);
      if (emotionTagIds.length > 0) {
        await tagTransactionEmotions(id, emotionTagIds);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
