import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'ADMIN' | 'FIELD_OFFICER' | 'AGENT' | 'FARMER';
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
  land_count?: number;
  total_acres?: number;
  aadhar_front?: string;
  farmer_aadhar_front?: string;
  aadhar_back?: string;
  farmer_aadhar_back?: string;
  farmer_aadhar_card_number?: string;
  aadhar_card_number?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const storedUser = localStorage.getItem('user');
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!localStorage.getItem('user_phone'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('user_phone', action.payload.user.phone_number);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user_phone');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
