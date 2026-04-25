import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from 'styled-components/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import { DMSerifDisplay_400Regular, } from '@expo-google-fonts/dm-serif-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

import theme from './src/theme/theme';
import RootNavigation from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log("Carregando fontes...");
        await Font.loadAsync({
          DMSerifDisplay_400Regular,
          DMSans_400Regular,
          DMSans_500Medium,
          DMSans_700Bold,
        });
        console.log("Fontes carregadas!");
      } catch (e) {
        console.warn('Falha ao carregar fontes:', e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      const hide = async () => {
        console.log("Escondendo a Splash Screen...");
        await SplashScreen.hideAsync();
      };
      hide();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <StatusBar style="light" backgroundColor={theme.colors.background} />
            <RootNavigation />
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
