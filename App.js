import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from 'styled-components/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

import theme from './src/theme/theme';
import RootNavigation from './src/navigation';
import { AuthProvider } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[App] Carregando fontes...');
        await Font.loadAsync({
          DMSerifDisplay_400Regular,
          DMSans_400Regular,
          DMSans_500Medium,
          DMSans_700Bold,
        });
        console.log('[App] ✅ Fontes carregadas.');
      } catch (e) {
          console.warn('[App] ⚠️ Falha nas fontes (usando fallback):', e.message);
      } finally {
          setAppReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync()
        .then(() => console.log('[App] ✅ SplashScreen escondida.'))
        .catch((e) => console.warn('[App] ⚠️ hideAsync:', e.message));
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <FavoritesProvider>
            <ThemeProvider theme={theme}>
              <StatusBar style="light" backgroundColor={theme.colors.background} />
              <RootNavigation />
            </ThemeProvider>
          </FavoritesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
