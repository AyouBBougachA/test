import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginResponse } from '../types';

interface AuthState {
  token: string | null;
  user: Partial<User> | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (data) => set({ 
        token: data.accessToken, 
        isAuthenticated: true,
        user: data.user
      }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
    }),
    {
      name: 'identity-auth-storage',
    }
  )
);
