import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getToastStyle = (type: ToastType) => {
        switch (type) {
            case 'success':
                return { borderColor: '#86efac', iconColor: '#22c55e' };
            case 'error':
                return { borderColor: '#fecaca', iconColor: '#ef4444' };
            case 'info':
            default:
                return { borderColor: '#bfdbfe', iconColor: '#3b82f6' };
        }
    };

    const getIcon = (type: ToastType) => {
        const { iconColor } = getToastStyle(type);
        switch (type) {
            case 'success':
                return <CheckCircle size={20} color={iconColor} />;
            case 'error':
                return <AlertCircle size={20} color={iconColor} />;
            case 'info':
            default:
                return <Info size={20} color={iconColor} />;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <View style={styles.container} pointerEvents="box-none">
                {toasts.map((toast) => {
                    const { borderColor } = getToastStyle(toast.type);
                    return (
                        <View
                            key={toast.id}
                            style={[styles.toast, { borderColor }]}
                        >
                            <View style={styles.iconContainer}>
                                {getIcon(toast.type)}
                            </View>
                            <Text style={styles.message}>{toast.message}</Text>
                            <Pressable onPress={() => removeToast(toast.id)} style={styles.closeButton}>
                                <X size={16} color="#9ca3af" />
                            </Pressable>
                        </View>
                    );
                })}
            </View>
        </ToastContext.Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        right: 16,
        left: 16,
        zIndex: 100,
        gap: 8,
    },
    toast: {
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        marginTop: 2,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    closeButton: {
        padding: 4,
    },
});

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
