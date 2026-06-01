import axios from 'axios';
import { env } from '@/shared/config/env';
import { store } from '@/shared/store';
import { clearSession, setCredentials } from '@/features/auth/model/auth-slice';

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const isBrowser = typeof window !== 'undefined';

const trimTrailingSlash = (value: string) => (value.endsWith('/') && value !== '/' ? value.slice(0, -1) : value);
const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const browserBaseUrl = trimTrailingSlash(env.apiBaseUrl);
const apiPath = trimTrailingSlash(ensureLeadingSlash(env.apiBasePath));

const baseURL = isBrowser ? browserBaseUrl : `${env.internalApiBaseUrl}${apiPath}`;

const api = axios.create({
  baseURL,
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
        const refreshUrl = isBrowser
          ? `${browserBaseUrl}/auth/refresh`
          : `${env.internalApiBaseUrl}${apiPath}/auth/refresh`;
        const { data } = await axios.post(refreshUrl, {
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
