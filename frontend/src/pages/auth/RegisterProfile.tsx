import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import Logo from '../../components/Logo';
import { AuthTitle, Field, Label, Select, Input, ButtonPrimary, CheckboxRow } from '../../styles/auth.styles';

const LIVING_OPTIONS = ['자취', '본가','기숙사'];

const IncomeSlider = styled.input`
  width: 100%;
  accent-color: #6c5ce7;
  margin-top: 12px;
`;

const IncomeSliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
`;

const IncomeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const IncomeManualLink = styled.button`
  background: none;
  border: none;
  text-decoration: underline;
  color: #444;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
`;

const IncomeValue = styled.span`
  background: #6c5ce7;
  color: #fff;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
`;

export default function RegisterProfile() {
  const navigate = useNavigate();
  const [livingType, setLivingType] = useState('');
  const [income, setIncome] = useState(70);
  const [manualIncome, setManualIncome] = useState(false);
  const [agreeDetail, setAgreeDetail] = useState(false);
  const [agreePersonalized, setAgreePersonalized] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 프로필 저장 API 연동
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <BackButton to="/register" />
      <Logo/>
      <AuthTitle $align="left" $size={20}>
        추가 정보를 입력해주세요
      </AuthTitle>

      <Field>
        <Label>거주형태</Label>
        <Select value={livingType} onChange={(e) => setLivingType(e.target.value)}>
          <option value="">거주 형태를 선택해주세요</option>
          {LIVING_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field>
        <Label>소득구간 (월별)</Label>
        {manualIncome ? (
          <Input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
        ) : (
          <>
            <IncomeSlider
              type="range"
              min={0}
              max={200}
              step={5}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
            />
            <IncomeSliderLabels>
              <span>0</span>
              <span>100만 원</span>
              <span>200만 원</span>
            </IncomeSliderLabels>
          </>
        )}
        <IncomeRow>
          <IncomeManualLink type="button" onClick={() => setManualIncome((v) => !v)}>
            직접 입력
          </IncomeManualLink>
          <IncomeValue>{income}만 원</IncomeValue>
        </IncomeRow>
      </Field>

      <CheckboxRow>
        <input type="checkbox" checked={agreeDetail} onChange={(e) => setAgreeDetail(e.target.checked)} />
        (선택) 상세 정보 제공 동의
      </CheckboxRow>
      <CheckboxRow>
        <input type="checkbox" checked={agreePersonalized} onChange={(e) => setAgreePersonalized(e.target.checked)} />
        (선택) 맞춤형 서비스 제공 이용
      </CheckboxRow>

      <ButtonPrimary type="submit">시작하기</ButtonPrimary>
    </form>
  );
}