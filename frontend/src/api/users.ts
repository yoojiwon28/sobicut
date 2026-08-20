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