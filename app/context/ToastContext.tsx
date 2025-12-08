import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { X as XIcon } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '#dcfce7';
      case 'error':
        return '#fee2e2';
      case 'info':
        return '#dbeafe';
    }
  };

  const getTextColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '#166534';
      case 'error':
        return '#991b1b';
      case 'info':
        return '#0c4a6e';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <SafeAreaView style={styles.container}>
        {toasts.map((toast) => (
          <View
            key={toast.id}
            style={[
              styles.toast,
              { backgroundColor: getBackgroundColor(toast.type) }
            ]}
          >
            <Text
              style={[
                styles.toastText,
                { color: getTextColor(toast.type) }
              ]}
            >
              {toast.message}
            </Text>
            <XIcon
              size={16}
              color={getTextColor(toast.type)}
              onPress={() => removeToast(toast.id)}
              style={styles.closeButton}
            />
          </View>
        ))}
      </SafeAreaView>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 1000,
    padding: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  toastText: {
    flex: 1,
    fontWeight: '500',
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
