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

function hexPoint(index: number, count: number, radius: number, cx: number, cy: number) {
  const angle = ((Math.PI * 2) / count) * index;
  const x = cx + radius * Math.sin(angle);
  const y = cy - radius * Math.cos(angle);
  return [x, y] as const;
}

function pointsAttr(points: readonly (readonly [number, number])[]) {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

export default function RadarChart({ axes, max, size = 260, color = '#6A5CE6' }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.32;
  const labelRadius = radius + size * 0.16;
  const count = axes.length;

  const dataPoints = axes.map((axis, i) =>
    hexPoint(i, count, radius * Math.min(1, Math.max(0, axis.value / max)), cx, cy),
  );

  return (
    <Svg $size={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
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
        return (
          <text
            key={axis.label}
            x={x}
            y={y}
            fontSize={12}
            fill="#888"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {axis.label}
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
`;
