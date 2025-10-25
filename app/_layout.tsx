import React, { useState, useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useFonts } from '@/hooks/useFonts';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { SplashScreen as CustomSplashScreen } from '@/components/SplashScreen';
import queryClient from '@/api/queryClient';
import '../global.css';

SplashScreen.hide();

const App = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function Layout() {
  const { fontsLoaded, error } = useFonts();
  const [isAppReady, setIsAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useProtectedRoute();

  useEffect(() => {
    const prepare = async () => {
      try {
        await SplashScreen.hideAsync();
        
        if (fontsLoaded && !error) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setIsAppReady(true);
        }
      } catch (e) {
        console.warn('Error preparing app:', e);
        setIsAppReady(true);
      }
    };

    prepare();
  }, [fontsLoaded, error]);

  const handleSplashComplete = useCallback(() => {
    setShowCustomSplash(false);
  }, []);

  if (showCustomSplash) {
    return (
      <CustomSplashScreen
        isReady={isAppReady}
        onAnimationComplete={handleSplashComplete}
      />
    );
  }

  if (error) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="basket/create" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    );
  }

  return (
    <KeyboardProvider>
      <View className="flex-1 bg-white">
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <App />
          </SafeAreaProvider>
        </QueryClientProvider>
      </View>
    </KeyboardProvider>
  );
}
