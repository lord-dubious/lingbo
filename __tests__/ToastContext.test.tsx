import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { ToastProvider, useToast } from '../context/ToastContext';
import { Text, Button } from 'react-native';

const TestComponent = () => {
  const { showToast } = useToast();
  return (
    <Button title="Show Toast" onPress={() => showToast('Hello World', 'success')} />
  );
};

describe('ToastContext', () => {
  it('renders toast when showToast is called', async () => {
    const { getByText, queryByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Initial state: no toast
    expect(queryByText('Hello World')).toBeNull();

    // Trigger toast
    await act(async () => {
      fireEvent.press(getByText('Show Toast'));
    });

    // Toast should appear
    expect(getByText('Hello World')).toBeTruthy();
  });
});
