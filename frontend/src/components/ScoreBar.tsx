import styled from 'styled-components';

type ScoreBarProps = {
  value: number;
  max: number;
  markerValue: number;
  markerLabel: string;
  color?: string;
};

export default function ScoreBar({ value, max, markerValue, markerLabel, color = '#FF7D7D' }: ScoreBarProps) {
  const valuePercent = Math.min(100, Math.max(0, (value / max) * 100));
  const markerPercent = Math.min(100, Math.max(0, (markerValue / max) * 100));

  return (
    <Wrap>
      <Track>
        <Fill style={{ width: `${valuePercent}%`, background: color }} />
        <Marker style={{ left: `${markerPercent}%` }}>
          <Scissors>✂</Scissors>
        </Marker>
      </Track>
      <MarkerLabel style={{ left: `${markerPercent}%` }}>{markerLabel}</MarkerLabel>
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
`;

const Track = styled.div`
  position: relative;
  width: 100%;
  height: 20px;
  border-radius: 999px;
  background: #ececec;
  overflow: visible;
`;

const Fill = styled.div`
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s ease;
`;

const Marker = styled.div`
  position: absolute;
  top: -14px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;

  &::after {
    content: '';
    width: 0;
    height: 26px;
    border-left: 1px dashed #666;
    margin-top: 2px;
  }
`;

const Scissors = styled.span`
  font-size: 11px;
  transform: rotate(90deg);
`;

const MarkerLabel = styled.div`
  position: relative;
  transform: translateX(-50%);
  margin-top: 4px;
  font-size: 10px;
  color: #888;
  white-space: nowrap;
`;
