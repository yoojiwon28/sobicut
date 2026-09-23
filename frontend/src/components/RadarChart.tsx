import styled from 'styled-components';
import fireImg from '../assets/images/bpti/fire.png';
import fogImg from '../assets/images/bpti/fog.png';
import lazyImg from '../assets/images/bpti/lazy.png';
import sageImg from '../assets/images/bpti/sage.png';
import visionImg from '../assets/images/bpti/vision.png';

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

const BPTI_SIGN: Record<string, '+' | '-'> = {
  스트레스: '-',
  즉흥성: '-',
  장기적가치: '+',
  충분한숙고: '+',
  비교회피: '-',
};

const SIGN_COLORS: Record<'+' | '-', { bg: string; color: string }> = {
  '-': { bg: '#ffe8e8', color: '#ff4040' },
  '+': { bg: '#e6f7ec', color: '#22b356' },
};

const BPTI_TAG_IMAGE: Record<string, string> = {
  스트레스: fireImg,
  즉흥성: fogImg,
  비교회피: lazyImg,
  충분한숙고: sageImg,
  장기적가치: visionImg,
};


function estimateLabelWidth(label: string) {
  let width = 0;
  for (const ch of label) {
    width += ch === ' ' ? 5 : 11;
  }
  return width;
}

const SIGN_CIRCLE_R = 7;
const SIGN_GAP = 6;
const TAG_IMAGE_SIZE = 52;
const TAG_IMAGE_GAP = 6;

const VIEW_W = 480;
const VIEW_H = 440;
const CENTER_X = VIEW_W / 2;
const CENTER_Y = 230;
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

        const displayLabel = BPTI_LABEL_DISPLAY[axis.label] ?? axis.label;
        const sign = BPTI_SIGN[axis.label];
        const tagImage = BPTI_TAG_IMAGE[axis.label];
        const textX = x + dx;
        const textY = y + dy;
        const labelWidth = estimateLabelWidth(displayLabel);

        let textLeftEdge = textX;
        if (textAnchor === 'end') textLeftEdge = textX - labelWidth;
        else if (textAnchor === 'middle') textLeftEdge = textX - labelWidth / 2;

        const signCx = textLeftEdge - SIGN_GAP - SIGN_CIRCLE_R;
        const signCy = baseline === 'hanging' ? textY + 5 : textY - 4;

        const labelCenterX = textLeftEdge + labelWidth / 2;
        const textTop = baseline === 'hanging' ? textY : textY - 9;
        const tagImageY = textTop - TAG_IMAGE_GAP - TAG_IMAGE_SIZE;
        const tagImageX = labelCenterX - TAG_IMAGE_SIZE / 2;

        return (
          <g key={axis.label}>
            {tagImage && (
              <image
                href={tagImage}
                x={tagImageX}
                y={tagImageY}
                width={TAG_IMAGE_SIZE}
                height={TAG_IMAGE_SIZE}
              />
            )}
            {sign && (
              <>
                <circle cx={signCx} cy={signCy} r={SIGN_CIRCLE_R} fill={SIGN_COLORS[sign].bg} />
                <line
                  x1={signCx - 3}
                  y1={signCy}
                  x2={signCx + 3}
                  y2={signCy}
                  stroke={SIGN_COLORS[sign].color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                {sign === '+' && (
                  <line
                    x1={signCx}
                    y1={signCy - 3}
                    x2={signCx}
                    y2={signCy + 3}
                    stroke={SIGN_COLORS[sign].color}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                )}
              </>
            )}
            <text
              x={textX}
              y={textY}
              fontSize={12}
              fill="#888"
              textAnchor={textAnchor}
              dominantBaseline={baseline}
            >
              {displayLabel}
            </text>
          </g>
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