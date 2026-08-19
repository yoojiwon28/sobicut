import { apiFetch } from './client';

export type SignupPayload = {
  email: string;
  password: string;
  nickname: string;
  residence_type: string;
  income_level: string;
};

export function checkEmail(email: string) {
  return apiFetch<{ is_available: boolean }>('/auth/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function validatePassword(password: string) {
  return apiFetch<{ is_valid: boolean; message: string }>('/auth/validate-password', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function signup(payload: SignupPayload) {
  return apiFetch<{ id: number; email: string }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(email: string, password: string) {
  return apiFetch<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch<{ message: string }>('/auth/logout', {
    method: 'GET',
  });
}