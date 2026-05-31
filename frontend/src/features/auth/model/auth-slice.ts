import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: AuthUser;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiresIn = action.payload.expiresIn;
      state.user = action.payload.user;
    },
    clearSession: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresIn = null;
      state.user = null;
    },
  },
});

export const { setCredentials, clearSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
