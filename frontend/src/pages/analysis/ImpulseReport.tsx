import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import ScoreBar from '../../components/ScoreBar';
import { PageWrap } from '../../styles/auth.styles';
import { useImpulseReport } from '../../hooks/useReports';

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
  const impulseQuery = useImpulseReport();
  const impulse = impulseQuery.data;

  const impulseScore = impulse?.impulse_score;
  const peerAvgImpulseScore = impulse?.peer_avg_impulse_score ?? null;

  return (
    <PageWrap>
      <BackButton to="/analysis/report" />

      {impulseQuery.isError ? (
        <LoadError>불러오지 못했어요</LoadError>
      ) : (
        <>
          <Headline>
            나의 충동 지수는
            <br />
            <strong>{impulseScore ?? '—'}점</strong>이에요
          </Headline>

          <BarWrap>
            <ScoreBar
              value={impulseScore ?? 0}
              max={100}
              markerValue={peerAvgImpulseScore}
              markerLabel="또래 평균 점수"
              markerValueLabel={peerAvgImpulseScore != null ? `${peerAvgImpulseScore}점` : undefined}
              color="#FF7D7D"
            />
          </BarWrap>
        </>
      )}

      <Card>
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
            <FactorRow key={factor} $positive>
              {factor}
            </FactorRow>
          ))}
        </FactorList>
      </Card>

      <Card>
        <PrescriptionSectionTitle>이번 주 맞춤 처방전</PrescriptionSectionTitle>
        <PrescriptionList>
          {DUMMY_PRESCRIPTIONS.map((item, i) => (
            <PrescriptionRow key={item}>
              <PrescriptionBadge>{i + 1}</PrescriptionBadge>
              <PrescriptionText>{item}</PrescriptionText>
            </PrescriptionRow>
          ))}
        </PrescriptionList>
      </Card>
    </PageWrap>
  );
}

const Headline = styled.h1`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  margin: 4px 0 6px;

  strong {
    font-size: 34px;
    font-weight: 800;
  }
`;

const BarWrap = styled.div`
  margin-bottom: 34px;
`;

const LoadError = styled.div`
  font-size: 14px;
  color: #999;
  text-align: center;
  padding: 40px 0;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 20px 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

  & + & {
    margin-top: 14px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 12px;
  font-weight: 500;
  color: #888;
  margin: 0 0 14px;
`;

const PrescriptionSectionTitle = styled.h2`
  font-size: 17px;
  font-weight: 800;
  color: #222;
  margin: 0 0 14px;
`;

const FactorGroupTitle = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: #222;
  margin: 14px 0 10px;
`;

const FactorList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const FactorRow = styled.div<{ $positive?: boolean }>`
  display: inline-block;
  width: auto;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 700;
  background: ${({ $positive }) => ($positive ? '#E2DEFF' : '#FFE8E8')};
  color: ${({ $positive }) => ($positive ? '#6A5CE6' : '#FF4040')};
`;

const PrescriptionList = styled.div`
  margin: 0 0 4px;
`;

const PrescriptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;

  & + & {
    border-top: 1px solid #f0f0f0;
  }
`;

const PrescriptionBadge = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: #edeafb;
  color: #6a5ce6;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PrescriptionText = styled.div`
  font-size: 15px;
  color: #333;
`;
