import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, passcodeService } from '../api/services';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  phoneVerified?: boolean;
  kycStatus?: 'pending' | 'processing' | 'approved' | 'rejected' | 'expired';
  onboardingStatus?: 'pending' | 'started' | 'kyc_pending' | 'kyc_processing' | 'kyc_rejected' | 'completed';
  hasPasscode?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  // User & Session
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  
  // Onboarding State
  hasCompletedOnboarding: boolean;
  onboardingStatus: string | null;
  currentOnboardingStep: string | null;
  
  // Email Verification
  pendingVerificationEmail: string | null;
  
  // Passcode/Biometric
  hasPasscode: boolean;
  isBiometricEnabled: boolean;
  passcodeSessionToken?: string;
  passcodeSessionExpiresAt?: string;
  
  // Loading & Error
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  // Authentication
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  
  // Session management
  refreshSession: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  
  // Passcode/Biometric
  setPasscode: (passcode: string) => Promise<void>;
  verifyPasscode: (passcode: string) => Promise<boolean>;
  enableBiometric: () => void;
  disableBiometric: () => void;
  
  // State Management
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setPendingEmail: (email: string | null) => void;
  setOnboardingStatus: (status: string, step?: string) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setHasPasscode: (hasPasscode: boolean) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Reset
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  hasCompletedOnboarding: false,
  onboardingStatus: null,
  currentOnboardingStep: null,
  pendingVerificationEmail: null,
  hasPasscode: false,
  isBiometricEnabled: false,
  passcodeSessionToken: undefined,
  passcodeSessionExpiresAt: undefined,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Authentication
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          
          set({
            user: response.user,
            isAuthenticated: true,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            onboardingStatus: response.user.onboardingStatus || null,
            hasPasscode: response.user.hasPasscode || false,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // Call API to invalidate tokens on server
          await authService.logout().catch(() => {
            // Ignore errors - still clear local state
          });
          
          // Clear all auth state on logout
          set({
            ...initialState,
            hasPasscode: false,
            hasCompletedOnboarding: false,
          });
        } catch (error) {
          // Even if logout fails, clear local state
          set({
            ...initialState,
            hasPasscode: false,
            hasCompletedOnboarding: false,
            error: error instanceof Error ? error.message : 'Logout failed',
          });
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({ email, password, name });
          
          // Store pending email but DON'T authenticate yet - user needs to verify
          set({
            pendingVerificationEmail: email || response.identifier,
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // Session management
      refreshSession: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        set({ isLoading: true });
        try {
          const response = await authService.refreshToken({ refreshToken });
          
          set({
            accessToken: response.token,
            refreshToken: response.refreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Session refresh failed',
            isLoading: false,
          });
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      // State Management
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setPendingEmail: (email: string | null) => {
        set({ pendingVerificationEmail: email });
      },

      setOnboardingStatus: (status: string, step?: string) => {
        set({ 
          onboardingStatus: status,
          currentOnboardingStep: step || null,
        });
      },

      setHasCompletedOnboarding: (completed: boolean) => {
        set({ hasCompletedOnboarding: completed });
      },

      setHasPasscode: (hasPasscode: boolean) => {
        set({ hasPasscode });
      },

      // Passcode/Biometric
      setPasscode: async (passcode: string) => {
        try {
          await passcodeService.createPasscode({ 
            passcode, 
            confirmPasscode: passcode 
          });
          set({ hasPasscode: true });
        } catch (error) {
          console.error('[AuthStore] Failed to set passcode:', error);
          throw error;
        }
      },

      verifyPasscode: async (passcode: string) => {
        try {
          const response = await passcodeService.verifyPasscode({ passcode });
          
          // Store the session token if verification succeeds
          if (response.verified) {
            set({
              passcodeSessionToken: response.sessionToken,
              passcodeSessionExpiresAt: response.expiresAt,
            });
          }
          
          return response.verified;
        } catch (error) {
          console.error('[AuthStore] Failed to verify passcode:', error);
          return false;
        }
      },

      enableBiometric: () => {
        set({ isBiometricEnabled: true });
      },

      disableBiometric: () => {
        set({ isBiometricEnabled: false });
      },

      // Error handling
      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        hasPasscode: state.hasPasscode,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isBiometricEnabled: state.isBiometricEnabled,
        isAuthenticated: state.isAuthenticated,
        onboardingStatus: state.onboardingStatus,
        pendingVerificationEmail: state.pendingVerificationEmail,
        passcodeSessionToken: state.passcodeSessionToken,
        passcodeSessionExpiresAt: state.passcodeSessionExpiresAt,
      }),
    }
  )
);
