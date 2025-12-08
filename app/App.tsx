import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserProvider, useUser } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';

// Screens
import OnboardingScreen from './screens/OnboardingScreen';
import HubScreen from './screens/HubScreen';
import AdultDashboardScreen from './screens/adult/AdultDashboardScreen';
import LessonViewScreen from './screens/adult/LessonViewScreen';
import KidsDashboardScreen from './screens/kids/KidsDashboardScreen';
import KidsGameMenuScreen from './screens/kids/KidsGameMenuScreen';
import WordFlashScreen from './screens/kids/games/WordFlashScreen';
import SentencePuzzleScreen from './screens/kids/games/SentencePuzzleScreen';
import MemoryMatchScreen from './screens/kids/games/MemoryMatchScreen';
import SpeedTapScreen from './screens/kids/games/SpeedTapScreen';
import TraceBookScreen from './screens/kids/TraceBookScreen';
import AlphabetBoardScreen from './screens/reference/AlphabetBoardScreen';
import NumbersBoardScreen from './screens/reference/NumbersBoardScreen';
import MediaLibraryScreen from './screens/media/MediaLibraryScreen';
import PracticeScreen from './screens/practice/PracticeScreen';
import ProfilePageScreen from './screens/ProfilePageScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const RootNavigator = () => {
  const { activeProfile, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!activeProfile) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animationEnabled: false }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ animationEnabled: false }}
      />
      
      {/* Adult Stack */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="LessonView" component={LessonViewScreen} />
      </Stack.Group>

      {/* Kids Games Stack */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="WordFlash" component={WordFlashScreen} />
        <Stack.Screen name="SentencePuzzle" component={SentencePuzzleScreen} />
        <Stack.Screen name="MemoryMatch" component={MemoryMatchScreen} />
        <Stack.Screen name="SpeedTap" component={SpeedTapScreen} />
        <Stack.Screen name="TraceBook" component={TraceBookScreen} />
      </Stack.Group>

      {/* Shared Screens */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="AlphabetBoard" component={AlphabetBoardScreen} />
        <Stack.Screen name="NumbersBoard" component={NumbersBoardScreen} />
        <Stack.Screen name="MediaLibrary" component={MediaLibraryScreen} />
        <Stack.Screen name="Practice" component={PracticeScreen} />
        <Stack.Screen name="ProfilePage" component={ProfilePageScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  const { activeProfile } = useUser();
  const isKidsMode = activeProfile?.type === 'kid';

  if (isKidsMode) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen
          name="KidsDashboard"
          component={KidsDashboardScreen}
          options={{ animationEnabled: false }}
        />
        <Stack.Screen
          name="KidsGameMenu"
          component={KidsGameMenuScreen}
          options={{ animationEnabled: false }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Hub"
        component={HubScreen}
        options={{
          tabBarLabel: 'Hub',
        }}
      />
      <Tab.Screen
        name="Adults"
        component={AdultDashboardScreen}
        options={{
          tabBarLabel: 'Learn',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePageScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  useEffect(() => {
    // Initialize async storage
    AsyncStorage.getItem('lingbo_profiles');
  }, []);

  return (
    <UserProvider>
      <ToastProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ToastProvider>
    </UserProvider>
  );
};

export default App;
