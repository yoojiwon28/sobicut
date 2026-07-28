import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { AuthTitle, Field, Label, Input, FormColumn, ButtonPrimary } from '../../styles/auth.styles';

export default function EditPassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const canSubmit =
    currentPassword.length > 0 && newPassword.length > 0 && newPassword === newPasswordConfirm;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: PATCH /users/me/password { current_password: currentPassword, new_password: newPassword }
    navigate('/mypage/edit');
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormColumn>
        <div>
          <BackButton to="/mypage/edit" />
          <AuthTitle $size={20}>비밀번호 변경</AuthTitle>

          <Field>
            <Label>안전한 변경을 위해 현재 비밀번호를 입력해주세요</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </Field>

          <Field>
            <Label>새 비밀번호를 입력해주세요</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Field>

          <Field>
            <Label>새 비밀번호를 한번 더 입력해주세요</Label>
            <Input
              type="password"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
            />
          </Field>
        </div>

        <ButtonPrimary type="submit" disabled={!canSubmit}>
          변경하기
        </ButtonPrimary>
      </FormColumn>
    </form>
  );
}