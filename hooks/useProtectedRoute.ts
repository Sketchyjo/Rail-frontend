import { useState, useEffect, useRef } from 'react';
import { router, useSegments, usePathname } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import type { AuthState } from '@/types/routing.types';
import {
  buildRouteConfig,
  determineRoute,
  validateAccessToken,
  checkWelcomeStatus,
} from '@/utils/routeHelpers';

/**
 * Protected route hook that manages authentication-based navigation
 * Handles token validation, welcome screen status, and routing logic
 */
export function useProtectedRoute() {
  const segments = useSegments();
  const pathname = usePathname();
  
  const authState: AuthState = {
    user: useAuthStore((state) => state.user),
    isAuthenticated: useAuthStore((state) => state.isAuthenticated),
    accessToken: useAuthStore((state) => state.accessToken),
    onboardingStatus: useAuthStore((state) => state.onboardingStatus),
    pendingVerificationEmail: useAuthStore((state) => state.pendingVerificationEmail),
  };
  
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasNavigatedRef = useRef(false);

  // Initialize app: validate token and check welcome status
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const welcomed = await checkWelcomeStatus();
        setHasSeenWelcome(welcomed);
        
        if (authState.isAuthenticated && authState.accessToken) {
          const isValid = await validateAccessToken();
          if (!isValid) {
            useAuthStore.getState().reset();
          }
        }
      } catch (error) {
        console.error('[Auth] Error initializing app:', error);
      } finally {
        setIsReady(true);
      }
    };
    
    initializeApp();
  }, []); // Run once on mount

  // Handle routing based on auth state
  useEffect(() => {
    if (!isReady || hasNavigatedRef.current) return;

    const config = buildRouteConfig(segments, pathname);
    const targetRoute = determineRoute(authState, config, hasSeenWelcome);
    
    if (targetRoute) {
      hasNavigatedRef.current = true;
      router.replace(targetRoute as any);
    }
  }, [
    authState.user,
    authState.isAuthenticated,
    authState.accessToken,
    authState.onboardingStatus,
    authState.pendingVerificationEmail,
    pathname,
    segments,
    hasSeenWelcome,
    isReady,
  ]);
}

