import { apiFetch } from './client';

export type UserLevel = {
  level: number;
  level_name: string;
  current_exp: number;
  next_level_exp: number;
  description: string;
};

export type UserSettings = {
  email: string;
  nickname: string;
  residence_type: string;
  income_level: string;
};

export function getLevel() {
  return apiFetch<UserLevel>('/users/me/level');
}

export function getSettings() {
  return apiFetch<UserSettings>('/users/me/settings');
}

export function updateNickname(nickname: string) {
  return apiFetch<{ message: string }>('/users/me/nickname', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  });
}

export function updatePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ message: string }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export function updateResidenceType(residenceType: string) {
  return apiFetch<{ message: string }>('/users/me/residence-type', {
    method: 'PATCH',
    body: JSON.stringify({ residence_type: residenceType }),
  });
}

export function updateIncomeLevel(incomeLevel: string) {
  return apiFetch<{ message: string }>('/users/me/income-level', {
    method: 'PATCH',
    body: JSON.stringify({ income_level: incomeLevel }),
  });
}