import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { ButtonPrimary, PageWrap } from '../../styles/auth.styles';
import { FieldLabel } from '../../styles/field.styles';
import { ApiError } from '../../api/client';
import { createSatisfaction } from '../../api/satisfactions';
import { usePendingSatisfactions } from '../../hooks/useSatisfactions';

const SCORE_CAPTIONS: Record<number, string> = {
  1: '매우 불만족',
  5: '매우 만족',
};

export default function SatisfactionSurvey() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [score, setScore] = useState<number | null>(null);

  const txId = Number(transactionId);
  const dayTypeParam = searchParams.get('day_type');

  const { data: pending, isLoading, isError } = usePendingSatisfactions();

  // transaction_id 가 일치하는 pending 항목들 중에서
  // day_type 쿼리가 있으면 그 회차를, 없으면 due_date 가 가장 최근인 회차를 사용한다.
  // (백엔드는 마감 지난 pending 을 만료 처리하지 않고 계속 내려주므로
  //  프론트에서 최신 회차만 보여준다.)
  // useParams 의 transactionId 는 문자열이고, API 응답의 transaction_id 가
  // 런타임에서 문자열로 올 수도 있으므로 양쪽 모두 문자열로 비교한다.
  const candidates = (pending ?? []).filter(
    (p) => String(p.transaction_id) === transactionId,
  );
  const item = dayTypeParam
    ? candidates.find((p) => p.day_type === dayTypeParam)
    : // due_date 는 "YYYY-MM-DD" 문자열이라 문자열 내림차순 비교로 최신 회차를 찾을 수 있다.
      [...candidates].sort((a, b) => (a.due_date < b.due_date ? 1 : a.due_date > b.due_date ? -1 : 0))[0];

  const mutation = useMutation({
    mutationFn: () =>
      createSatisfaction({ transaction_id: txId, day_type: item!.day_type, score: score! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['satisfactions', 'pending'] });
      navigate('/satisfaction/result');
    },
  });

  if (isLoading) {
    return (
      <PageWrap>
        <BackButton to="/notification" />
        <EmptyText>불러오는 중…</EmptyText>
      </PageWrap>
    );
  }

  if (isError || !item) {
    return (
      <PageWrap>
        <BackButton to="/notification" />
        <EmptyText>
          {isError ? '설문을 불러오지 못했어요' : '이미 응답했거나 만료된 설문이에요'}
        </EmptyText>
      </PageWrap>
    );
  }

  const dayType = item.day_type;

  const handleSubmit = () => {
    if (!score || mutation.isPending) return;
    mutation.mutate();
  };

  return (
    <PageWrap>
      <BackButton to="/notification" />
      <Title>만족도 입력</Title>

      <BadgeRow>
        <DaysBadge>{dayType} 후</DaysBadge>
      </BadgeRow>
      <AmountRow>
        <Amount>
          -{item.amount.toLocaleString()} 원
        </Amount>
        {/* pending 응답에 category가 없어 아이콘을 확정할 수 없다 → 아이콘 영역을 숨긴다 */}
      </AmountRow>

      <Divider />

      <FieldLabel>결제처</FieldLabel>
      <MerchantBox>{item.merchant}</MerchantBox>

      <Guide>현재 이 지출에 대한 만족도를 입력해주세요.</Guide>

      <ScoreRow>
        {[1, 2, 3, 4, 5].map((value) => (
          <ScoreCol key={value}>
            <CircleBox>
              <ScoreCircle
                type="button"
                $size={value === 1 || value === 5 ? 56 : 36}
                $active={score === value}
                onClick={() => setScore(value)}
                aria-label={`${value}점`}
              />
            </CircleBox>
            <ScoreNumber>{value}</ScoreNumber>
            {SCORE_CAPTIONS[value] && <ScoreCaption>{SCORE_CAPTIONS[value]}</ScoreCaption>}
          </ScoreCol>
        ))}
      </ScoreRow>

      <SubmitWrap>
        <SubmitButton
          type="button"
          disabled={!score || mutation.isPending}
          onClick={handleSubmit}
        >
          {mutation.isPending ? '제출 중…' : '제출하기'}
        </SubmitButton>
      </SubmitWrap>

      {mutation.isError && (
        <ErrorText>
          {mutation.error instanceof ApiError
            ? mutation.error.message
            : '제출에 실패했어요. 다시 시도해주세요.'}
        </ErrorText>
      )}

      <ResultLinkWrap>
        <ResultLink type="button" onClick={() => navigate('/satisfaction/result')}>
          이번달 소비 만족도 전체 보기 &gt;
        </ResultLink>
      </ResultLinkWrap>
    </PageWrap>
  );
}

const Title = styled.h1`
  font-size: 17px;
  font-weight: 700;
  text-align: center;
  margin: 4px 0 16px;
`;

const BadgeRow = styled.div`
  text-align: left;
  margin-bottom: 8px;
`;

const DaysBadge = styled.span`
  display: inline-block;
  background: #8b7dee;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
`;

const AmountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Amount = styled.span`
  font-size: 28px;
  font-weight: 800;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eee;
  margin: 0 0 20px;
`;

const MerchantBox = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 24px;
`;

const Guide = styled.p`
  text-align: center;
  font-size: 15px;
  color: #333;
  margin: 0 0 20px;
`;

const ScoreRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const ScoreCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CircleBox = styled.div`
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScoreCircle = styled.button<{ $size: number; $active: boolean }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  border: 3px solid #6a5ce6;
  background: ${({ $active }) => ($active ? '#6a5ce6' : '#fff')};
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
`;

const ScoreNumber = styled.div`
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #6a5ce6;
`;

const ScoreCaption = styled.div`
  margin-top: 2px;
  font-size: 11px;
  color: #6a5ce6;
  white-space: nowrap;
`;

const SubmitWrap = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const SubmitButton = styled(ButtonPrimary)`
  width: 160px;
  height: 48px;
  margin-top: 0;
`;

const ResultLinkWrap = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ResultLink = styled.button`
  background: none;
  border: none;
  text-decoration: underline;
  color: #444;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
`;

const EmptyText = styled.div`
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 60px 0;
`;

const ErrorText = styled.p`
  color: #e74c3c;
  font-size: 13px;
  text-align: center;
  margin: 0 0 16px;
`;
