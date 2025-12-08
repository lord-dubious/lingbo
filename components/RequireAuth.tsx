import React, { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { activeProfile } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // If not authenticated, redirect to onboarding
    // We check if we are already in onboarding to avoid loops
    const inOnboarding = segments[0] === 'onboarding';

    if (!activeProfile && !inOnboarding) {
        // Need to wait for navigation to be ready or just push
        router.replace('/onboarding');
    }
  }, [activeProfile, segments]);

  if (!activeProfile) {
      return (
          <View className="flex-1 items-center justify-center bg-white">
              <ActivityIndicator size="large" color="#FF6B00" />
          </View>
      );
  }

  return <>{children}</>;
};

export default RequireAuth;
