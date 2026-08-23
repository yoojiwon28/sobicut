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
    justify-content: ${({ $compact }) => ($compact ? 'center' : 'space-between')};
    align-items: center;
    gap: ${({ $compact }) => ($compact ? '10px' : '0')};
    margin-bottom: ${({ $compact }) => ($compact ? '6px' : '20px')};
    padding: ${({ $compact }) => ($compact ? '0' : '0 2px')};
  }

  .react-calendar__navigation button {
    background: none;
    border: none;
    font-family: inherit;
    font-size: ${({ $compact }) => ($compact ? '13px' : '16px')};
    font-weight: 700;
    cursor: pointer;
    color: ${({ $compact }) => ($compact ? '#000' : '#999')};
    ${({ $compact }) =>
      !$compact &&
      `
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    `}
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: transparent;
  }

  .react-calendar__navigation button:disabled {
    background-color: transparent;
    cursor: default;
  }

  .react-calendar__navigation button.react-calendar__navigation__label {
    font-size: ${({ $compact }) => ($compact ? '14px' : '18px')};
    font-weight: 600;
    letter-spacing: 1px;
    color: #000;
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    font-size: ${({ $compact }) => ($compact ? '10px' : '12px')};
    font-weight: 600;
    color: #aaa;
    margin-bottom: ${({ $compact }) => ($compact ? '4px' : '10px')};
  }

  .react-calendar__month-view__weekdays abbr {
    text-decoration: none;
  }

  .react-calendar__tile {
    position: relative;
    height: ${({ $compact }) => ($compact ? '32px' : '60px')};
    background: transparent;
    border-radius: ${({ $compact }) => ($compact ? '10px' : '14px')};
    margin: ${({ $compact }) => ($compact ? '2px 0' : '3px 0')};
    border: none;
    font-family: inherit;
    color: #000;
    font-size: ${({ $compact }) => ($compact ? '11px' : '14px')};
    font-weight: 500;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: ${({ $compact }) => ($compact ? '6px' : '9px')};
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
    box-shadow: ${({ $compact }) => ($compact ? 'none' : '0 6px 14px rgba(106, 92, 230, 0.35)')};
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