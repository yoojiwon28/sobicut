import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import ScoreBar from '../../components/ScoreBar';
import { PageWrap } from '../../styles/auth.styles';

// GET /reports/impulse 더미데이터
const DUMMY_IMPULSE = {
  score: 67,
  peerAverage: 60,
};

// GET /reports/impulse/factors 더미데이터
const DUMMY_FACTORS = {
  negative: ['밤 11시 이후 쇼핑 3회 발생', '스트레스 태그가 달린 소비 5회', '무계획 소비(항목 미입력) 4회'],
  positive: ['예산 초과 없이 3일 연속 소비 기록'],
};

// GET /reports/impulse/prescriptions 더미데이터
const DUMMY_PRESCRIPTIONS = [
  '밤 11시 이후 쇼핑 앱 알림 끄기',
  '스트레스 받을 땐 5분 산책으로 대신하기',
  '충동 구매 전 장바구니에 24시간 담아두기',
];

export default function ImpulseReport() {
  return (
    <PageWrap>
      <BackButton to="/analysis/report" />

      <Headline>
        나의 충동 지수는
        <br />
        <strong>{DUMMY_IMPULSE.score}점</strong>이에요
      </Headline>

      <BarWrap>
        <ScoreBar
          value={DUMMY_IMPULSE.score}
          max={100}
          markerValue={DUMMY_IMPULSE.peerAverage}
          markerLabel="또래 평균 점수"
        />
      </BarWrap>

      <SectionTitle>점수에 영향을 준 정보예요</SectionTitle>

      <FactorGroupTitle>📈 점수를 높인 요인 (부정적 습관)</FactorGroupTitle>
      <FactorList>
        {DUMMY_FACTORS.negative.map((factor) => (
          <FactorRow key={factor}>{factor}</FactorRow>
        ))}
      </FactorList>

      <FactorGroupTitle>📉 점수를 낮춘 요인 (긍정적 습관)</FactorGroupTitle>
      <FactorList>
        {DUMMY_FACTORS.positive.map((factor) => (
          <FactorRow key={factor}>{factor}</FactorRow>
        ))}
      </FactorList>

      <SectionTitle>이번 주 맞춤 처방전</SectionTitle>
      <PrescriptionList>
        {DUMMY_PRESCRIPTIONS.map((item) => (
          <PrescriptionItem key={item}>{item}</PrescriptionItem>
        ))}
      </PrescriptionList>
    </PageWrap>
  );
}

const Headline = styled.h1`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  margin: 4px 0 6px;

  strong {
    font-size: 22px;
    font-weight: 800;
  }
`;

const BarWrap = styled.div`
  margin-bottom: 28px;
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 14px;
`;

const FactorGroupTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #444;
  margin-bottom: 8px;
`;

const FactorList = styled.div`
  margin-bottom: 20px;
`;

const FactorRow = styled.div`
  background: #f6f6f6;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  color: #444;

  & + & {
    margin-top: 8px;
  }
`;

const PrescriptionList = styled.ul`
  margin: 0 0 16px;
  padding-left: 18px;
`;

const PrescriptionItem = styled.li`
  font-size: 13px;
  color: #444;
  line-height: 1.8;
`;
