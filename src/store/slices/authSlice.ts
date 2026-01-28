import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'ADMIN' | 'AGRICULTURE_OFFICER' | 'AGENT' | 'FARMER';
  unique_id?: string;
  surname?: string;
  gender?: string;
  date_of_birth?: string | Date;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
  pincode?: string;
  officer_count?: number;
  agent_count?: number;
  farmer_count?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
