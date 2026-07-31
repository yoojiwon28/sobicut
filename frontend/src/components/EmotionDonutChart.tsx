import styled from 'styled-components';
import type { EmotionSegment } from '../utils/emotion';

type EmotionDonutChartProps = {
  segments: EmotionSegment[];
  size?: number;
};

const VIEW_BOX = 260;
const CENTER = VIEW_BOX / 2;
const RADIUS = 72;
const STROKE_WIDTH = 46;
const LABEL_RADIUS = RADIUS + STROKE_WIDTH / 2 + 26;

function polarPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.sin(rad),
    y: CENTER - radius * Math.cos(rad),
  };
}

export default function EmotionDonutChart({ segments, size = 220 }: EmotionDonutChartProps) {
  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const dashOffset = -cumulative;
    cumulative += seg.percent;
    return { ...seg, dashOffset };
  });

  let labelCumulative = 0;
  const labels = segments.map((seg) => {
    const midAngle = (labelCumulative + seg.percent / 2) * 3.6;
    labelCumulative += seg.percent;
    const { x, y } = polarPoint(midAngle, LABEL_RADIUS);
    return { key: seg.key, percent: seg.percent, color: seg.color, x, y };
  });

  return (
    <Wrap style={{ width: size, height: size }}>
      <Svg viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}>
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE_WIDTH}
              pathLength={100}
              strokeDasharray={`${arc.percent} ${100 - arc.percent}`}
              strokeDashoffset={arc.dashOffset}
            />
          ))}
        </g>
      </Svg>
      {labels.map((label) => (
        <Label
          key={label.key}
          style={{
            left: `${(label.x / VIEW_BOX) * 100}%`,
            top: `${(label.y / VIEW_BOX) * 100}%`,
          }}
        >
          <LabelName>{label.key}</LabelName>
          <LabelPercent style={{ color: label.color }}>{Math.round(label.percent)}%</LabelPercent>
        </Label>
      ))}
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
  margin: 0 auto;
`;

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
`;

const Label = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  white-space: nowrap;
`;

const LabelName = styled.div`
  font-size: 12px;
  color: #666;
`;

const LabelPercent = styled.div`
  font-size: 14px;
  font-weight: 800;
`;
