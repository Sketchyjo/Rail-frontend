import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from '@/hooks/useFonts';
import '../global.css';

export default function Layout() {
  const { fontsLoaded, error, retryLoading } = useFonts();

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !error) {
    return null
  }

  // Fonts are loaded successfully, render the app
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#ffffff' }
      }} 
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)"  />
    </Stack>
  );
}
