import styled from 'styled-components';

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
};

export default function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <Track type="button" $on={checked} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <Thumb />
    </Track>
  );
}

const Track = styled.button<{ $on: boolean }>`
  width: 44px;
  height: 26px;
  border-radius: 999px;
  border: none;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: ${({ $on }) => ($on ? 'flex-end' : 'flex-start')};
  background: ${({ $on }) => ($on ? '#6a5ce6' : '#d9d9d9')};
  cursor: pointer;
  transition: background 0.15s ease;
`;

const Thumb = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  display: block;
`;