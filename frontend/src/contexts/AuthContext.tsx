import { createContext, useContext, useState, type ReactNode } from 'react';
import { getToken, setToken as persistToken, clearToken as removeToken } from '../api/client';

type AuthContextValue = {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => void; // 이메일 로그인이든 카카오든, 토큰만 받으면 됨
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());

  const login = (newToken: string) => {
    persistToken(newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있어요.');
  return ctx;
}