import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BackButton from '../../components/BackButton';
import { AuthTitle, Field, Select, FormColumn, ButtonPrimary } from '../../styles/auth.styles';

const LIVING_OPTIONS = ['자취', '본가', '기숙사'];

const DUMMY_SETTINGS = {
  residence_type: '자취',
};

export default function EditResidence() {
  const navigate = useNavigate();
  const [residenceType, setResidenceType] = useState(DUMMY_SETTINGS.residence_type);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: PATCH /users/me/residence-type { residence_type: residenceType }
    navigate('/mypage/edit');
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to="/mypage/edit" />
          <AuthTitle $size={20}>거주 형태 변경</AuthTitle>
          <Intro>바뀐 거주 형태를 선택해주세요</Intro>

          <Field>
            <Select value={residenceType} onChange={(e) => setResidenceType(e.target.value)}>
              <option value="">거주 형태를 선택해주세요</option>
              {LIVING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <ButtonPrimary type="submit" disabled={!residenceType}>
          변경하기
        </ButtonPrimary>
      </FormColumn>
    </form>
  );
}

const Intro = styled.p`
  font-size: 14px;
  margin: -12px 0 20px;
`;