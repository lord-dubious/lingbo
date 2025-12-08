import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { UserProvider, useUser } from '../context/UserContext';
import { Text, Button } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const TestComponent = () => {
  const { createProfile, activeProfile, profiles } = useUser();
  return (
    <>
      <Text testID="profile-count">{profiles.length}</Text>
      <Text testID="active-profile">{activeProfile ? activeProfile.name : 'None'}</Text>
      <Button title="Create" onPress={() => createProfile('Test User', '🦁')} />
    </>
  );
};

describe('UserContext', () => {
  it('creates a profile and sets it as active', async () => {
    const { getByTestId, getByText } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Initial state
    expect(getByTestId('profile-count').children[0]).toBe('0');
    expect(getByTestId('active-profile').children[0]).toBe('None');

    // Create profile
    await act(async () => {
        fireEvent.press(getByText('Create'));
    });

    // Check updates
    expect(getByTestId('profile-count').children[0]).toBe('1');
    expect(getByTestId('active-profile').children[0]).toBe('Test User');
  });
});
