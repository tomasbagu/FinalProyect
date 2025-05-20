// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../../../context/AuthContext';
import { CareProvider } from '../../../context/CareContext';

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
