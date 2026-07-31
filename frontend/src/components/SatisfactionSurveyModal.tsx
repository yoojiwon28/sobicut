import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Modal from './Modal';
import EmotionDonutChart from './EmotionDonutChart';
import { ButtonPrimary } from '../styles/auth.styles';
import { EMOTION_ROWS, EMOTION_MESSAGES, POSITIVE_EMOTIONS, buildEmotionSegments } from '../utils/emotion';
import { DUMMY_EMOTION_BASE_STATS } from '../mocks/emotion';
import type { EmotionKey } from '../types/emotion';

type SatisfactionSurveyModalProps = {
  transactionId: number;
  onClose: () => void;
};

export default function SatisfactionSurveyModal({ transactionId, onClose }: SatisfactionSurveyModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'survey' | 'result'>('survey');
  const [selected, setSelected] = useState<EmotionKey | null>(null);

  const handleSubmit = () => {
    if (!selected) return;
    // PATCH /transactions/:id { emotion_tag: selected }
    console.log(`PATCH /transactions/${transactionId}`, { emotion_tag: selected });
    setStep('result');
  };

  if (step === 'result' && selected) {
    const segments = buildEmotionSegments({
      ...DUMMY_EMOTION_BASE_STATS,
      [selected]: (DUMMY_EMOTION_BASE_STATS[selected] ?? 0) + 1,
    });
    const dominant = segments[0]?.key ?? selected;

    return (
      <Modal onClose={onClose}>
        <EmotionDonutChart segments={segments} />
        <ResultLabel>나는 요즘</ResultLabel>
        <ResultMessage>{EMOTION_MESSAGES[dominant]}</ResultMessage>
        <ReportLink
          type="button"
          onClick={() => {
            onClose();
            navigate('/analysis/report');
          }}
        >
          나의 소비 패턴 바로보기
        </ReportLink>
      </Modal>
    );
  }

  return (
    <Modal>
      <Title>이 소비를 부른 감정을 골라봐요</Title>

      <EmotionGrid>
        {EMOTION_ROWS.map((row) => (
          <Row key={row.positive}>
            {[row.positive, row.negative].map((emotion) => (
              <EmotionButton
                key={emotion}
                type="button"
                $positive={POSITIVE_EMOTIONS.has(emotion)}
                $active={selected === emotion}
                onClick={() => setSelected(emotion)}
              >
                {emotion}
              </EmotionButton>
            ))}
          </Row>
        ))}
      </EmotionGrid>

      <ButtonPrimary type="button" disabled={!selected} onClick={handleSubmit}>
        기록 완료
      </ButtonPrimary>
      <SkipButton type="button" onClick={onClose}>
        나중에 태그할게요
      </SkipButton>
    </Modal>
  );
}

const Title = styled.h2`
  font-size: 17px;
  font-weight: 700;
  text-align: center;
  margin: 4px 0 20px;
`;

const EmotionGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
`;

const EmotionButton = styled.button<{ $positive: boolean; $active: boolean }>`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  border: 2px solid transparent;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: ${({ $positive }) => ($positive ? '#E7E4FA' : '#FF8A80')};
  color: ${({ $positive }) => ($positive ? '#4B3FBF' : '#fff')};
  border-color: ${({ $active, $positive }) => ($active ? ($positive ? '#6A5CE6' : '#E64545') : 'transparent')};
  transition: border-color 0.15s ease;
`;

const SkipButton = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  text-decoration: underline;
  color: #888;
  font-size: 13px;
  text-align: center;
  padding: 14px 0 0;
  cursor: pointer;
`;

const ResultLabel = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #6a5ce6;
  margin: 24px 0 8px;
`;

const ResultMessage = styled.div`
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  border: 2px solid #e0ddf7;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
`;

const ReportLink = styled.button`
  display: block;
  width: 100%;
  background: none;
  border: none;
  text-decoration: underline;
  color: #444;
  font-size: 13px;
  text-align: center;
  cursor: pointer;
`;
