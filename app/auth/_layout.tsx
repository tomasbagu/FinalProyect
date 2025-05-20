import { AuthProvider } from '../../context/AuthContext';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Quicksand': require('../../assets/fonts/Quicksand-Regular.ttf'),
    'Quicksand-Semibold': require('../../assets/fonts/Quicksand-SemiBold.ttf'),
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </View>
  );
}
