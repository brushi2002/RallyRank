import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-url-polyfill/auto';
import { useFonts } from 'expo-font';
import { Stack, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { GlobalProvider } from '../lib/global-provider';
import '../global.css'
console.log('CSS imported');

import { useColorScheme } from '../hooks/useColorScheme';

// Web-specific configuration
if (typeof window !== 'undefined') {
  // Ensure React Native Web is properly configured
  const { Platform } = require('react-native');
  if (Platform.OS === 'web') {
    // Add any web-specific polyfills here if needed
  }
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GlobalProvider>
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(root)" />
      </Stack>
    </GlobalProvider>
  );
}
