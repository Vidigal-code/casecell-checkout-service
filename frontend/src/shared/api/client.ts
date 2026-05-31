import axios from 'axios';
import { env } from '@/shared/config/env';
import { store } from '@/shared/store';
import { clearSession, setCredentials } from '@/features/auth/model/auth-slice';

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = store.getState().auth.refreshToken;

      if (!refreshToken) {
        store.dispatch(clearSession());
        isRefreshing = false;
        throw error;
      }

      try {
        const { data } = await axios.post(`${env.apiBaseUrl.replace(/\/$/, '')}/auth/refresh`, {
          refreshToken,
        });
        store.dispatch(
          setCredentials({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn,
            user: data.user,
          }),
        );
        pendingRequests.forEach((callback) => callback(data.accessToken));
        pendingRequests = [];
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(clearSession());
        pendingRequests.forEach((callback) => callback(null));
        pendingRequests = [];
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  },
);

export { api };
