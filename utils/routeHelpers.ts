import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '@/api/services';
import type { RouteConfig, AuthState } from '@/types/routing.types';

/**
 * Validates the current access token by making an API call
 */
export const validateAccessToken = async (): Promise<boolean> => {
  try {
    await userService.getProfile();
    console.log('[Auth] Token validated successfully');
    return true;
  } catch (error) {
    console.warn('[Auth] Token validation failed:', error);
    return false;
  }
};

/**
 * Checks if user has seen the welcome screen
 */
export const checkWelcomeStatus = async (): Promise<boolean> => {
  try {
    const welcomed = await AsyncStorage.getItem('hasSeenWelcome');
    return welcomed === 'true';
  } catch (error) {
    console.error('[Auth] Error checking welcome status:', error);
    return false;
  }
};

/**
 * Builds route configuration from segments and pathname
 */
export const buildRouteConfig = (segments: string[], pathname: string): RouteConfig => ({
  inAuthGroup: segments[0] === '(auth)',
  inTabsGroup: segments[0] === '(tabs)',
  isOnWelcomeScreen: pathname === '/',
  isOnLoginPasscode: pathname === '/(auth)/login-passcode',
  isOnVerifyEmail: pathname === '/(auth)/verify-email',
  isOnCreatePasscode: pathname === '/(auth)/create-passcode',
  isOnConfirmPasscode: pathname === '/(auth)/confirm-passcode',
});

/**
 * Checks if user is in a critical auth flow that shouldn't be interrupted
 */
export const isInCriticalAuthFlow = (config: RouteConfig): boolean => {
  return (
    config.isOnLoginPasscode ||
    config.isOnVerifyEmail ||
    config.isOnCreatePasscode ||
    config.isOnConfirmPasscode
  );
};

/**
 * Handles routing for authenticated users
 */
const handleAuthenticatedUser = (
  authState: AuthState,
  config: RouteConfig
): string | null => {
  const { user, onboardingStatus } = authState;
  
  if (isInCriticalAuthFlow(config)) return null;
  
  const userOnboardingStatus = user?.onboardingStatus || onboardingStatus;
  if (userOnboardingStatus === 'completed' && config.inTabsGroup) return null;
  
  if (!config.inTabsGroup) return '/(tabs)';
  
  return null;
};

/**
 * Handles routing for users with stored credentials but no active session
 */
const handleStoredCredentials = (
  authState: AuthState,
  config: RouteConfig
): string | null => {
  const { user } = authState;
  
  if (config.inAuthGroup) return null;
  
  const userHasPasscode = user?.hasPasscode;
  
  if (userHasPasscode && !config.isOnLoginPasscode) {
    return '/(auth)/login-passcode';
  }
  
  if (!userHasPasscode && !config.isOnWelcomeScreen) {
    return '/(auth)/signin';
  }
  
  return null;
};

/**
 * Handles routing for users in email verification flow
 */
const handleEmailVerification = (config: RouteConfig): string | null => {
  if (config.isOnVerifyEmail) return null;
  
  if (!config.isOnVerifyEmail && !config.isOnWelcomeScreen) {
    return '/(auth)/verify-email';
  }
  
  return null;
};

/**
 * Handles routing for guest users
 */
const handleGuestUser = (
  hasSeenWelcome: boolean,
  config: RouteConfig
): string | null => {
  if (hasSeenWelcome && config.inAuthGroup) return null;
  
  if (!hasSeenWelcome && !config.isOnWelcomeScreen) return '/';
  
  if (config.inTabsGroup || (!config.inAuthGroup && !config.isOnWelcomeScreen)) {
    return '/';
  }
  
  return null;
};

/**
 * Determines the appropriate route based on complete auth state
 */
export const determineRoute = (
  authState: AuthState,
  config: RouteConfig,
  hasSeenWelcome: boolean
): string | null => {
  const { user, isAuthenticated, accessToken, pendingVerificationEmail } = authState;
  
  if (isAuthenticated && user && accessToken) {
    return handleAuthenticatedUser(authState, config);
  }
  
  if (!isAuthenticated && user) {
    return handleStoredCredentials(authState, config);
  }
  
  if (!isAuthenticated && !user && pendingVerificationEmail) {
    return handleEmailVerification(config);
  }
  
  if (!isAuthenticated && !user) {
    return handleGuestUser(hasSeenWelcome, config);
  }
  
  return null;
};

