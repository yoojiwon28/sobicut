import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { StyledCalendar } from '../styles/calendar.styles';
import { OutlinedInput, IconFieldWrap } from '../styles/field.styles';
import calendarIcon from '../assets/images/calendar_color.svg';

type DatePickerFieldProps = {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
};

const toKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatDisplay = (value: string) => (value ? value.replaceAll('-', '.') : '');

export default function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : new Date();

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

  return (
    <Wrap ref={wrapRef}>
      <IconFieldWrap>
        <OutlinedInput value={formatDisplay(value)} readOnly onClick={() => setOpen((v) => !v)} />
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
            formatDay={(_, date) => String(date.getDate())}
            minDetail="year"
            next2Label={null}
            prev2Label={null}
            showNeighboringMonth={false}
            tileClassName={({ date, view }) =>
              view === 'month' && toKey(date) === toKey(selectedDate) ? 'is-selected' : ''
            }
            onClickDay={(date) => {
              onChange(toKey(date));
              setOpen(false);
            }}
          />
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