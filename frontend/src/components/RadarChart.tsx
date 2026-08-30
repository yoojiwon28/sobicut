import styled from 'styled-components';

type RadarAxis = {
  label: string;
  value: number;
};

type RadarChartProps = {
  axes: RadarAxis[];
  max: number;
  size?: number;
  color?: string;
};

const RINGS = [1 / 3, 2 / 3, 1];

// 화면 표시용 라벨 맵. 백엔드 emotion_tags 태그 이름(원본)은 그대로 두고,
// 렌더링할 때만 이 맵을 통해 띄어쓰기가 들어간 문자열로 변환한다.
// 맵에 없는 태그가 오면 원본 이름을 그대로 표시한다.
const BPTI_LABEL_DISPLAY: Record<string, string> = {
  스트레스: '스트레스',
  즉흥성: '즉흥성',
  비교회피: '비교 회피',
  충분한숙고: '충분한 숙고',
  장기적가치: '장기적 가치',
};

// 라벨이 SVG 경계에서 잘리지 않도록 좌우/상하 여백을 포함한 좌표계를 사용한다.
// (좌우 각 120px, 상단/하단 각 40px 수준의 라벨 영역을 확보)
const VIEW_W = 480;
const VIEW_H = 400;
const CENTER_X = VIEW_W / 2;
const CENTER_Y = 210;
const OUTER_RADIUS = 125;
const LABEL_RADIUS = OUTER_RADIUS + 20;

function hexPoint(index: number, count: number, radius: number, cx: number, cy: number) {
  const angle = ((Math.PI * 2) / count) * index;
  const x = cx + radius * Math.sin(angle);
  const y = cy - radius * Math.cos(angle);
  return [x, y] as const;
}

function pointsAttr(points: readonly (readonly [number, number])[]) {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

export default function RadarChart({ axes, max, size = 300, color = '#6A5CE6' }: RadarChartProps) {
  const cx = CENTER_X;
  const cy = CENTER_Y;
  const radius = OUTER_RADIUS;
  const labelRadius = LABEL_RADIUS;
  const count = axes.length;

  const dataPoints = axes.map((axis, i) =>
    hexPoint(i, count, radius * Math.min(1, Math.max(0, axis.value / max)), cx, cy),
  );

  return (
    <Svg $size={size} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} xmlns="http://www.w3.org/2000/svg">
      {RINGS.map((ratio) => (
        <polygon
          key={ratio}
          points={pointsAttr(axes.map((_, i) => hexPoint(i, count, radius * ratio, cx, cy)))}
          fill="none"
          stroke="#E8E8E8"
          strokeWidth={1}
        />
      ))}

      {axes.map((_, i) => {
        const [x, y] = hexPoint(i, count, radius, cx, cy);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E8E8E8" strokeWidth={1} />;
      })}

      <polygon points={pointsAttr(dataPoints)} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} />

      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill={color} />
      ))}

      {axes.map((axis, i) => {
        const [x, y] = hexPoint(i, count, labelRadius, cx, cy);

        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        let dx = 0;
        if (x < cx - 10) {
          textAnchor = 'end';
          dx = -10;
        } else if (x > cx + 10) {
          textAnchor = 'start';
          dx = 10;
        }

        let baseline: 'auto' | 'hanging' = 'auto';
        let dy = 0;
        if (y < cy) {
          baseline = 'auto';
          dy = -12;
        } else if (y > cy) {
          baseline = 'hanging';
          dy = 12;
        }

        return (
          <text
            key={axis.label}
            x={x + dx}
            y={y + dy}
            fontSize={12}
            fill="#888"
            textAnchor={textAnchor}
            dominantBaseline={baseline}
          >
            {BPTI_LABEL_DISPLAY[axis.label] ?? axis.label}
          </text>
        );
      })}
    </Svg>
  );
}

const Svg = styled.svg<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
  overflow: visible;
`;
