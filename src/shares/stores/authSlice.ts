import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  roles: string;
  isActive: boolean;
  createdAt: string;
};

type AuthState = {
  accessToken: string | null;
  userId: string | null;
  role: string | null;
  user: User | null;
};

const initialState: AuthState = {
  accessToken: null,
  userId: null,
  role: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        userId: string;
        role: string;
        user?: User;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.userId = action.payload.userId;
      state.role = action.payload.role;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearTokens: (state) => {
      state.accessToken = null;
      state.userId = null;
      state.role = null;
      state.user = null;
    },
  },
});

export const { setTokens, clearTokens, setUser } = authSlice.actions;
export default authSlice.reducer;
