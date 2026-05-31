import { RootState } from '@/shared/store';

export const selectAuthState = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.accessToken);
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
