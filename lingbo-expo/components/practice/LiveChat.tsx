import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Phone, AudioWaveform, Mic, X } from 'lucide-react-native';

const LiveChat = () => {
    const [connected, setConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connect = async () => {
        setError(null);

        // Note: Real-time Gemini Live API requires WebSocket
        // This is a placeholder for the mobile implementation
        // You'll need to implement audio streaming with expo-av

        setError("Live conversation requires additional setup for mobile. Use Chat mode for now.");
    };

    const disconnect = () => {
        setConnected(false);
        setIsSpeaking(false);
    };

    return (
        <View style={styles.container}>
            {/* Pulse animation background when connected */}
            {connected && (
                <View style={styles.pulseContainer}>
                    <View style={[styles.pulseRing, styles.pulseRing1]} />
                    <View style={[styles.pulseRing, styles.pulseRing2]} />
                    <View style={[styles.pulseRing, styles.pulseRing3]} />
                </View>
            )}

            {/* Main icon */}
            <View style={[
                styles.iconContainer,
                connected && styles.iconContainerActive
            ]}>
                {connected ? (
                    isSpeaking ? (
                        <AudioWaveform size={48} color="white" />
                    ) : (
                        <Mic size={48} color="white" />
                    )
                ) : (
                    <Phone size={48} color="#9ca3af" />
                )}
            </View>

            {/* Title */}
            <Text style={styles.title}>
                {connected
                    ? (isSpeaking ? 'Chike is speaking...' : 'Listening...')
                    : 'Start Call'}
            </Text>

            {/* Description */}
            <Text style={styles.description}>
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : connected
                    ? 'Speak naturally in English or Igbo.'
                    : 'Practice conversation with a real-time AI tutor.'}
            </Text>

            {/* Action Button */}
            {!connected ? (
                <TouchableOpacity onPress={connect} style={styles.callButton}>
                    <Phone size={24} color="white" />
                    <Text style={styles.callButtonText}>Call Chike</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={disconnect} style={styles.endButton}>
                    <X size={24} color="#ef4444" />
                    <Text style={styles.endButtonText}>End Call</Text>
                </TouchableOpacity>
            )}

            {/* Info note */}
            <Text style={styles.note}>
                💡 For full voice experience, use Text Chat for now
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    pulseContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseRing: {
        position: 'absolute',
        borderRadius: 999,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
    },
    pulseRing1: {
        width: 256,
        height: 256,
    },
    pulseRing2: {
        width: 192,
        height: 192,
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
    },
    pulseRing3: {
        width: 128,
        height: 128,
        backgroundColor: 'rgba(249, 115, 22, 0.3)',
    },
    iconContainer: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    iconContainerActive: {
        backgroundColor: '#ef4444',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 280,
    },
    errorText: {
        color: '#ef4444',
        fontWeight: 'bold',
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f97316',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 32,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    callButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    endButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fee2e2',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 32,
    },
    endButtonText: {
        color: '#ef4444',
        fontSize: 18,
        fontWeight: 'bold',
    },
    note: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 24,
        textAlign: 'center',
    },
});

export default LiveChat;
