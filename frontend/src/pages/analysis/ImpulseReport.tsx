import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import ScoreBar, { EDGE_PADDING } from '../../components/ScoreBar';
import { PageWrap } from '../../styles/auth.styles';
import { useImpulseReport, usePrescriptionReport } from '../../hooks/useReports';
import { getImpulseGaugeColor } from '../../utils/impulse';

// 'YYYY-MM-DD' → 'M/D'
function formatMonthDay(iso: string): string {
  const [, month, day] = iso.split('-');
  return `${Number(month)}/${Number(day)}`;
}

export default function ImpulseReport() {
  const impulseQuery = useImpulseReport();
  const impulse = impulseQuery.data;

  const impulseScore = impulse?.impulse_score;
  const peerAvgImpulseScore = impulse?.peer_avg_impulse_score ?? null;

  const prescriptionQuery = usePrescriptionReport();
  const prescriptionReport = prescriptionQuery.data;

  const negativeFactors = prescriptionReport?.negative_factors ?? [];
  const positiveFactors = prescriptionReport?.positive_factors ?? [];
  const hasFactors = negativeFactors.length > 0 || positiveFactors.length > 0;
  const prescription = prescriptionReport?.prescription ?? [];

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
              color={getImpulseGaugeColor(impulse?.is_warning)}
            />
          </BarWrap>
        </>
      )}

      <Card>
        <SectionTitle>점수에 영향을 준 정보예요</SectionTitle>
        {prescriptionReport && (
          <PeriodText>
            {formatMonthDay(prescriptionReport.period_start)} ~ {formatMonthDay(prescriptionReport.period_end)} 소비 기준
          </PeriodText>
        )}

        {prescriptionQuery.isError ? (
          <LoadError>불러오지 못했어요</LoadError>
        ) : !hasFactors ? (
          <EmptyText>아직 분석할 소비 기록이 없어요</EmptyText>
        ) : (
          <FactorGroups>
            {negativeFactors.length > 0 && (
              <>
                <FactorGroupTitle>점수를 높인 요인 (부정적 습관)</FactorGroupTitle>
                <FactorList>
                  {negativeFactors.map((factor) => (
                    <FactorRow key={factor}>{factor}</FactorRow>
                  ))}
                </FactorList>
              </>
            )}

            {positiveFactors.length > 0 && (
              <>
                <FactorGroupTitle>점수를 낮춘 요인 (긍정적 습관)</FactorGroupTitle>
                <FactorList>
                  {positiveFactors.map((factor) => (
                    <FactorRow key={factor} $positive>
                      {factor}
                    </FactorRow>
                  ))}
                </FactorList>
              </>
            )}
          </FactorGroups>
        )}
      </Card>

      <Card>
        <PrescriptionSectionTitle>이번 주 맞춤 처방전</PrescriptionSectionTitle>
        {prescriptionQuery.isError ? (
          <LoadError>불러오지 못했어요</LoadError>
        ) : prescription.length === 0 ? (
          <EmptyText>이번 주 처방전은 아직 준비 중이에요</EmptyText>
        ) : (
          <PrescriptionList>
            {prescription.map((item, i) => (
              <PrescriptionRow key={item}>
                <PrescriptionBadge>{i + 1}</PrescriptionBadge>
                <PrescriptionText>{item}</PrescriptionText>
              </PrescriptionRow>
            ))}
          </PrescriptionList>
        )}
      </Card>
    </PageWrap>
  );
}

const Headline = styled.h1`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  margin: 4px 0 6px;
  /* 아래 게이지 바(ScoreBar)의 좌측 시작선과 맞추기 위해 동일한 여백 사용 */
  padding-left: ${EDGE_PADDING}px;

  strong {
    font-size: 34px;
    font-weight: 800;
  }
`;

const BarWrap = styled.div`
  margin-bottom: 0;
`;

const LoadError = styled.div`
  font-size: 14px;
  color: #999;
  text-align: center;
  padding: 40px 0;
`;

const EmptyText = styled.div`
  font-size: 14px;
  color: #999;
  text-align: center;
  padding: 24px 0;
`;

const PeriodText = styled.div`
  font-size: 12px;
  color: #aaa;
  margin: 0 0 14px;
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
  color: #222;
  margin: 0 0 4px;
`;

const PrescriptionSectionTitle = styled.h2`
  font-size: 17px;
  font-weight: 800;
  color: #222;
  margin: 0 0 14px;
`;

const FactorGroups = styled.div`
  margin-top: 24px;
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
  border-radius: 15px;
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 700;
  background: ${({ $positive }) => ($positive ? '#E2DEFF' : '#FFE8E8')};
  color: ${({ $positive }) => ($positive ? '#4035B0' : '#C23B3B')};
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
