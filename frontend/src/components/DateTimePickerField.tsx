import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { StyledCalendar } from '../styles/calendar.styles';
import { OutlinedInput, IconFieldWrap } from '../styles/field.styles';
import { formatDetailDateTime } from '../utils/date';
import calendarIcon from '../assets/images/calendar_color.svg';

type DateTimePickerFieldProps = {
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  onChange: (date: string, time: string) => void;
  onConfirm?: () => void;
};

const toKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function DateTimePickerField({ date, time, onChange, onConfirm }: DateTimePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectedDate = date ? new Date(date) : new Date();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm?.();
  };

  return (
    <Wrap ref={wrapRef}>
      <IconFieldWrap>
        <OutlinedInput value={formatDetailDateTime(date, time)} readOnly onClick={() => setOpen((v) => !v)} />
        <button type="button" aria-label="날짜 선택" onClick={() => setOpen((v) => !v)}>
          <img src={calendarIcon} alt="" width={18} height={18} />
        </button>
      </IconFieldWrap>

      {open && (
        <Popover>
          <StyledCalendar
            $compact
            value={selectedDate}
            calendarType="gregory"
            locale="ko-KR"
            formatDay={(_, d) => String(d.getDate())}
            minDetail="year"
            next2Label={null}
            prev2Label={null}
            showNeighboringMonth={false}
            tileClassName={({ date: d, view }) =>
              view === 'month' && date && toKey(d) === toKey(selectedDate) ? 'is-selected' : ''
            }
            onClickDay={(d) => onChange(toKey(d), time)}
          />
          <TimeRow>
            <OutlinedInput type="time" value={time} onChange={(e) => onChange(date, e.target.value)} />
          </TimeRow>
          <ConfirmButton type="button" onClick={handleConfirm}>
            확인
          </ConfirmButton>
        </Popover>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`
  position: relative;
`;

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 280px;
  max-width: calc(100vw - 40px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 10px;
  z-index: 20;
`;

const TimeRow = styled.div`
  margin-top: 8px;
`;

const ConfirmButton = styled.button`
  width: 100%;
  height: 40px;
  margin-top: 10px;
  border: none;
  border-radius: 10px;
  background: #6a5ce6;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;
