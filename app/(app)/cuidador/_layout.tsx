// app/_layout.tsx
import { AuthProvider } from '@/context/AuthContext';
import { CareProvider } from '@/context/CareContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CareProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </CareProvider>
    </AuthProvider>
  );
}
