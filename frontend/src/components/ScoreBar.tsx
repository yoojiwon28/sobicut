import styled from 'styled-components';

type ScoreBarProps = {
  value: number;
  max: number;
  markerValue: number;
  markerLabel: string;
  markerValueLabel?: string;
  color?: string;
};

// 게이지 바가 카드 가장자리에 붙지 않도록 좌우로 확보하는 여백.
// 마커/라벨의 0~100% 위치 계산도 이 안쪽 영역(Inner) 기준으로 맞춘다.
const EDGE_PADDING = 24;

export default function ScoreBar({
  value,
  max,
  markerValue,
  markerLabel,
  markerValueLabel,
  color = '#FF7D7D',
}: ScoreBarProps) {
  const valueRatio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const markerRatio = max > 0 ? Math.min(1, Math.max(0, markerValue / max)) : 0;

  const markerLeft = `${markerRatio * 100}%`;

  // 마커가 양 끝에 가까우면 중앙 정렬(translateX(-50%)) 시 라벨이 영역 밖으로 빠져나가므로
  // 좌측 끝에서는 좌측 정렬, 우측 끝에서는 우측 정렬로 분기한다.
  const labelTransform =
    markerRatio < 0.1
      ? 'translateX(0)'
      : markerRatio > 0.9
        ? 'translateX(-100%)'
        : 'translateX(-50%)';

  return (
    <Wrap>
      <Inner>
        <Track>
          <Fill style={{ width: `${valueRatio * 100}%`, background: color }} />
        </Track>

        {/* 점선 마커와 라벨은 같은 Inner 안에서 동일한 markerLeft 기준을 공유한다. */}
        <Marker style={{ left: markerLeft }}>
          <Scissors>✂</Scissors>
          <MarkerStem />
        </Marker>

        <LabelGroup style={{ left: markerLeft, transform: labelTransform }}>
          <MarkerLabel>{markerLabel}</MarkerLabel>
          {markerValueLabel && <MarkerValueLabel>{markerValueLabel}</MarkerValueLabel>}
        </LabelGroup>
      </Inner>
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
  padding: 14px ${EDGE_PADDING}px 40px;
`;

const Inner = styled.div`
  position: relative;
  width: 100%;
`;

const Track = styled.div`
  position: relative;
  width: 100%;
  height: 26px;
  border-radius: 999px;
  background: #f5f5f5;
  overflow: visible;
`;

const Fill = styled.div`
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s ease;
`;

const Marker = styled.div`
  position: absolute;
  top: -12px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
`;

const MarkerStem = styled.div`
  width: 0;
  height: 26px;
  border-left: 1px dashed #666;
  margin-top: 2px;
`;

const Scissors = styled.span`
  font-size: 11px;
  transform: rotate(90deg);
`;

const LabelGroup = styled.div`
  position: absolute;
  top: 100%;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
`;

const MarkerLabel = styled.div`
  font-size: 10px;
  color: #888;
  white-space: nowrap;
`;

const MarkerValueLabel = styled.div`
  margin-top: 2px;
  font-size: 11px;
  font-weight: 700;
  color: #666;
  white-space: nowrap;
  text-align: center;
`;
