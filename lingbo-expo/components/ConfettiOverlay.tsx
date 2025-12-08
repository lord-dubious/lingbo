import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    withSequence
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ConfettiOverlayProps {
    title?: string;
    subtitle?: string;
    onRestart: () => void;
}

// Simple confetti piece component
const ConfettiPiece = ({ delay, color, startX }: { delay: number; color: string; startX: number }) => {
    const translateY = useSharedValue(-50);
    const translateX = useSharedValue(startX);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    React.useEffect(() => {
        translateY.value = withDelay(
            delay,
            withTiming(height + 50, { duration: 3000 })
        );
        translateX.value = withDelay(
            delay,
            withSequence(
                withTiming(startX + 30, { duration: 500 }),
                withTiming(startX - 30, { duration: 500 }),
                withTiming(startX + 20, { duration: 500 }),
                withTiming(startX - 20, { duration: 500 }),
                withTiming(startX, { duration: 1000 })
            )
        );
        rotate.value = withDelay(
            delay,
            withRepeat(withTiming(360, { duration: 1000 }), -1)
        );
        opacity.value = withDelay(
            delay + 2500,
            withTiming(0, { duration: 500 })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.confettiPiece,
                { backgroundColor: color },
                animatedStyle,
            ]}
        />
    );
};

export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({
    title = "You did it!",
    subtitle,
    onRestart,
}) => {
    const colors = ['#f97316', '#eab308', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'];

    // Generate confetti pieces
    const confetti = React.useMemo(() => {
        const pieces = [];
        for (let i = 0; i < 30; i++) {
            pieces.push({
                id: i,
                delay: Math.random() * 500,
                color: colors[Math.floor(Math.random() * colors.length)],
                startX: Math.random() * width,
            });
        }
        return pieces;
    }, []);

    return (
        <View style={styles.overlay}>
            {/* Confetti */}
            {confetti.map((piece) => (
                <ConfettiPiece
                    key={piece.id}
                    delay={piece.delay}
                    color={piece.color}
                    startX={piece.startX}
                />
            ))}

            {/* Content Card */}
            <View style={styles.card}>
                <Text style={styles.emoji}>🎉</Text>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

                <TouchableOpacity onPress={onRestart} style={styles.button}>
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    confettiPiece: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        width: width * 0.85,
        maxWidth: 360,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#f97316',
        paddingHorizontal: 48,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ConfettiOverlay;
