import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { ButtonPrimary, PageWrap } from '../../styles/auth.styles';
import { FieldLabel } from '../../styles/field.styles';
import { DUMMY_ALL_TRANSACTIONS } from '../../mocks/transactions';
import { CATEGORY_ICONS } from '../../utils/category';

const SCORE_CAPTIONS: Record<number, string> = {
  1: '매우 불만족',
  5: '매우 만족',
};

function getDaysAfter(dateStr: string) {
  const target = new Date(dateStr);
  const today = new Date();
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((todayMidnight.getTime() - targetMidnight.getTime()) / 86400000);
}

export default function SatisfactionSurvey() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const [score, setScore] = useState<number | null>(null);

  const tx = DUMMY_ALL_TRANSACTIONS.find((t) => String(t.id) === transactionId);

  if (!tx) {
    return (
      <PageWrap>
        <BackButton to="/notification" />
        <EmptyText>거래를 찾을 수 없어요</EmptyText>
      </PageWrap>
    );
  }

  const daysAfter = getDaysAfter(tx.transaction_date);
  const isExpense = tx.type === 'expense';

  const handleSubmit = () => {
    if (!score) return;
    // TODO: PATCH /transactions/:id/satisfaction 로 교체
    console.log(`PATCH /transactions/${tx.id}/satisfaction`, { score, days_after: daysAfter });
    navigate('/satisfaction/result');
  };

  return (
    <PageWrap>
      <BackButton to="/notification" />
      <Title>만족도 입력</Title>

      <BadgeRow>
        <DaysBadge>{daysAfter}일 전</DaysBadge>
      </BadgeRow>
      <AmountRow>
        <Amount>
          {isExpense ? '-' : '+'}
          {tx.amount.toLocaleString()} 원
        </Amount>
        <img src={CATEGORY_ICONS[tx.category]} alt="" width={28} height={28} />
      </AmountRow>

      <Divider />

      <FieldLabel>결제처</FieldLabel>
      <MerchantBox>{tx.merchant}</MerchantBox>

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
        <SubmitButton type="button" disabled={!score} onClick={handleSubmit}>
          제출하기
        </SubmitButton>
      </SubmitWrap>

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
