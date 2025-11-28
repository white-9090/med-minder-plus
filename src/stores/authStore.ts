import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  generateInviteCode: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock user data - in real app, this would come from API
          const mockUser: User = {
            id: `user_${Date.now()}`,
            name: email.split('@')[0],
            email,
            role: 'PATIENT',
            elderlyMode: false,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            caregiverInviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            createdAt: new Date().toISOString(),
          };

          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw new Error('Login failed');
        }
      },

      signup: async (name: string, email: string, password: string, role: UserRole) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newUser: User = {
            id: `user_${Date.now()}`,
            name,
            email,
            role,
            elderlyMode: false,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            caregiverInviteCode: role === 'PATIENT' 
              ? Math.random().toString(36).substring(2, 8).toUpperCase()
              : undefined,
            createdAt: new Date().toISOString(),
          };

          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw new Error('Signup failed');
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ 
            user: { ...user, ...updates } 
          });
        }
      },

      generateInviteCode: () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { user } = get();
        if (user) {
          set({ 
            user: { ...user, caregiverInviteCode: code } 
          });
        }
        return code;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);