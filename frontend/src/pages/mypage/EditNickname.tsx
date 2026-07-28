import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { AuthTitle, Field, Label, Input, FormColumn, ButtonPrimary } from '../../styles/auth.styles';

const DUMMY_SETTINGS = {
  nickname: 'user1',
};

export default function EditNickname() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(DUMMY_SETTINGS.nickname);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: PATCH /users/me/nickname { nickname }
    navigate('/mypage/edit');
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to="/mypage/edit" />
          <AuthTitle $size={20}>닉네임 변경</AuthTitle>

          <Field>
            <Label>새로운 닉네임을 입력해주세요</Label>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </Field>
        </div>

        <ButtonPrimary type="submit" disabled={!nickname.trim()}>
          변경하기
        </ButtonPrimary>
      </FormColumn>
    </form>
  );
}