import styled from 'styled-components';

type ChipSelectProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  getIcon?: (option: string) => string | undefined;
};

export default function ChipSelect({ options, value, onChange, getIcon }: ChipSelectProps) {
  return (
    <ChipRow>
      {options.map((option) => {
        const icon = getIcon?.(option);
        const active = option === value;
        return (
          <Chip key={option} type="button" $active={active} onClick={() => onChange(option)}>
            {icon && <img src={icon} alt="" width={16} height={16} />}
            {option}
          </Chip>
        );
      })}
    </ChipRow>
  );
}

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#6A5CE6' : '#f1f0f5')};
  color: ${({ $active }) => ($active ? '#fff' : '#555')};
  transition: background 0.15s ease, color 0.15s ease;

  img {
    filter: ${({ $active }) => ($active ? 'brightness(0) invert(1)' : 'none')};
  }
`;