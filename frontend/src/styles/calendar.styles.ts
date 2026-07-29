import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styled from 'styled-components';

export const StyledCalendar = styled(ReactCalendar)<{ $compact?: boolean }>`
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;

  .react-calendar__navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${({ $compact }) => ($compact ? '10px' : '24px')};
    margin-bottom: ${({ $compact }) => ($compact ? '6px' : '12px')};
  }

  .react-calendar__navigation button {
    background: none;
    border: none;
    font-size: ${({ $compact }) => ($compact ? '13px' : '16px')};
    font-weight: 700;
    cursor: pointer;
    color: #000;
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: transparent;
  }

  .react-calendar__navigation button:disabled {
    background-color: transparent;
    cursor: default;
  }

  .react-calendar__navigation__label {
    font-size: ${({ $compact }) => ($compact ? '14px' : '16px')};
    font-weight: 700;
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    font-size: ${({ $compact }) => ($compact ? '10px' : '13px')};
    color: #888;
    margin-bottom: ${({ $compact }) => ($compact ? '4px' : '8px')};
  }

  .react-calendar__month-view__weekdays abbr {
    text-decoration: none;
  }

  .react-calendar__tile {
    position: relative;
    height: ${({ $compact }) => ($compact ? '32px' : '56px')};
    background: transparent;
    border-radius: 10px;
    margin: 2px 0;
    border: none;
    color: #000;
    font-size: ${({ $compact }) => ($compact ? '11px' : '14px')};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background: transparent;
  }

  .react-calendar__tile--now {
    background: transparent;
  }

  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: transparent;
  }

  .react-calendar__tile--active {
    background: transparent;
  }

  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: transparent;
  }

  .react-calendar__tile abbr {
    font-size: ${({ $compact }) => ($compact ? '11px' : '14px')};
  }

  .react-calendar__tile.is-today abbr {
    color: #6a5ce6;
    font-weight: 800;
  }

  .react-calendar__tile.is-selected {
    background: #6a5ce6;
  }

  .react-calendar__tile.is-selected:enabled:hover,
  .react-calendar__tile.is-selected:enabled:focus {
    background: #6a5ce6;
  }

  .react-calendar__tile.is-selected abbr {
    color: #fff;
    font-weight: 800;
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    visibility: hidden;
  }
`;