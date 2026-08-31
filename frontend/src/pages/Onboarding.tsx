import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Logo2 from '../components/Logo2';
import { ButtonPrimary } from '../styles/auth.styles';
import onboarding1 from '../assets/images/onboarding/onboarding1.svg';
import onboarding2 from '../assets/images/onboarding/onboarding2.svg';
import onboarding3 from '../assets/images/onboarding/onboarding3.svg';
import onboarding4 from '../assets/images/onboarding/onboarding4.svg';
import onboarding5 from '../assets/images/onboarding/onboarding5.svg';

type Chunk = { text: string; strong?: boolean };

const SLIDES: { image: string; lines: [Chunk[], Chunk[]] }[] = [
  {
    image: onboarding1,
    lines: [
      [{ text: '한 눈에', strong: true }, { text: ' 보는 소비 상태!' }],
      [{ text: '내 습관을 ' }, { text: '점수', strong: true }, { text: '로 확인해요' }],
    ],
  },
  {
    image: onboarding2,
    lines: [
      [{ text: '문자 한 통이면 ' }, { text: '소비컷이 대신!', strong: true }],
      [{ text: '가계부가 3초 만에 완성돼요' }],
    ],
  },
  {
    image: onboarding3,
    lines: [
      [{ text: '숫자보다 궁금한 건 ' }, { text: '그날의 나!', strong: true }],
      [{ text: '버튼 하나로 마음까지 기록해요' }],
    ],
  },
  {
    image: onboarding4,
    lines: [
      [{ text: '내 손 안의 ' }, { text: '소비 정령 커티', strong: true }, { text: '가' }],
      [{ text: '그 기록을 먹고 함께 성장해요' }],
    ],
  },
  {
    image: onboarding5,
    lines: [
      [{ text: '패턴 ' }, { text: '리포트', strong: true }, { text: '로 나를 돌아봐요' }],
      [{ text: 'AI가 분석한 ' }, { text: '맞춤 처방전', strong: true }, { text: '까지 콕!' }],
    ],
  },
];

const SWIPE_THRESHOLD = 50;

export default function Onboarding() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);

  const clampIndex = (i: number) => Math.max(0, Math.min(SLIDES.length - 1, i));

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDragOffset(e.clientX - startX.current);
  };

  const handlePointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragOffset > SWIPE_THRESHOLD) {
      setIndex((i) => clampIndex(i - 1));
    } else if (dragOffset < -SWIPE_THRESHOLD) {
      setIndex((i) => clampIndex(i + 1));
    }
    setDragOffset(0);
  };

  return (
    <Wrap>
      <TopArea>
        <Dots>
          {SLIDES.map((_, i) => (
            <Dot key={i} $active={i === index} onClick={() => setIndex(i)} aria-label={`${i + 1}번째 화면으로 이동`} />
          ))}
        </Dots>

        <Viewport
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <Track $index={index} $dragOffset={dragOffset} $dragging={dragging.current}>
            {SLIDES.map((slide, i) => (
              <Slide key={i}>
                <Title>
                  {slide.lines.map((line, li) => (
                    <div key={li}>
                      {line.map((chunk, ci) => (
                        <span key={ci} style={chunk.strong ? { fontWeight: 800 } : undefined}>
                          {chunk.text}
                        </span>
                      ))}
                    </div>
                  ))}
                </Title>
                <ImageWrap>
                  <img src={slide.image} alt="" draggable={false} />
                </ImageWrap>
              </Slide>
            ))}
          </Track>
        </Viewport>
      </TopArea>

      <BottomArea>
        <LogoWrap>
          <Logo2 width={200} />
        </LogoWrap>
        <StartButton type="button" onClick={() => navigate('/login')}>
          시작하기
        </StartButton>
      </BottomArea>
    </Wrap>
  );
}

const Wrap = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  margin: -32px -20px 0;
  width: calc(100% + 40px);
`;

const TopArea = styled.div`
  height: 560px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(to top, rgba(149, 137, 240, 0.3) 0%, #f8f7ff 65%);
  padding-top: 50px;
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 30px;
  flex-shrink: 0;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#6A5CE6' : '#D9D4F5')};
  transition: background 0.2s ease;
`;

const Viewport = styled.div`
  flex: 1;
  overflow: hidden;
  touch-action: pan-y;
`;

const Track = styled.div<{ $index: number; $dragOffset: number; $dragging: boolean }>`
  display: flex;
  height: 100%;
  transition: ${({ $dragging }) => ($dragging ? 'none' : 'transform 0.3s ease')};
  transform: ${({ $index, $dragOffset }) => `translateX(calc(${-$index * 100}% + ${$dragOffset}px))`};
`;

const Slide = styled.div`
  flex: 0 0 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
`;

const Title = styled.h1`
  font-size: 21px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  line-height: 1.45;
  margin: 0 0 0px;
  flex-shrink: 0;
`;

const ImageWrap = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  min-height: 0;

  img {
    width: 100%;
    max-width: 340px;
    height: auto;
    user-select: none;
    -webkit-user-drag: none;
  }
`;

const StartButton = styled(ButtonPrimary)`
  width: 70%;
`;

const BottomArea = styled.div`
  flex: 1;
  background: #fff;
  padding: 0px 24px 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
`;

const LogoWrap = styled.div`
  width: 55%;

  img {
    width: 100% !important;
    height: auto !important;
  }
`;