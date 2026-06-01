import { api } from '@/shared/api/client';
import { LoginResponse } from './login';

export interface RegisterPayload {
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/register', payload);
  return data;
}
