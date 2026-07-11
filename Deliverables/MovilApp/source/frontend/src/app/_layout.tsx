import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="tabs" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen
          name="historial-pagos"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="historial-hoteles"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="historial-transporte"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="mis-alojamientos"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="informe-personal"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="notificaciones"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="gestion-transporte"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
