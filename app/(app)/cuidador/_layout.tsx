// app/_layout.tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../../../context/AuthContext";
import { CareProvider } from '../../../context/CareContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <AuthProvider>
      <CareProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </CareProvider>
    </AuthProvider>
    </GestureHandlerRootView>
  );
}
