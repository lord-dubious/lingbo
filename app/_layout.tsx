import React from 'react';
import { Stack } from 'expo-router';
import { UserProvider } from '../context/UserContext';
import { ToastProvider } from '../context/ToastContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import IgboKeyboard from '../components/IgboKeyboard';
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ToastProvider>
           <Stack screenOptions={{ headerShown: false }} />
           <IgboKeyboard />
        </ToastProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
