import { Outlet } from 'react-router-dom';
import { AuthWrapper } from '../styles/auth.styles';

export default function AuthLayout() {
  return (
    <AuthWrapper>
      <Outlet />
    </AuthWrapper>
  );
}