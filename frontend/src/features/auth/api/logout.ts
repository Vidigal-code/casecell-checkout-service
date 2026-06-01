import { api } from '@/shared/api/client';

export interface LogoutPayload {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
}

export async function logout(payload: LogoutPayload): Promise<LogoutResponse> {
  const { data } = await api.post<LogoutResponse>('/auth/logout', payload);
  return data;
}
