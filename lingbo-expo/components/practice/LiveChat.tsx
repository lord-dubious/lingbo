import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Phone, AudioWaveform, Mic, X } from 'lucide-react-native';
import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { base64ToUint8Array, uint8ArrayToBase64, pcmToAudioBuffer, float32ToInt16 } from '../../utils/audioUtils';

// API Key from Expo environment
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const LiveChat = () => {
    const [connected, setConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for audio contexts and session management
    const audioContextOutputRef = useRef<AudioContext | null>(null);
    const audioContextInputRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sessionRef = useRef<Promise<Session> | null>(null);

    useEffect(() => {
        // Cleanup on unmount
        return () => disconnect();
    }, []);

    const connect = async () => {
        setError(null);

        // Check if we're on web platform (Live API requires WebSocket support)
        if (Platform.OS !== 'web') {
            setError("Live voice is available on web. Use Text Chat on mobile for now.");
            return;
        }

        if (!API_KEY) {
            setError("API Key missing. Configure EXPO_PUBLIC_GEMINI_API_KEY");
            return;
        }

        try {
            // 1. Setup Output Audio Context (24kHz for Gemini output)
            const audioCtxOut = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            await audioCtxOut.resume();
            audioContextOutputRef.current = audioCtxOut;
            nextStartTimeRef.current = audioCtxOut.currentTime + 0.1;

            // 2. Setup Input Audio Context (16kHz for Gemini input)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioCtxIn = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextInputRef.current = audioCtxIn;
            await audioCtxIn.resume();

            const source = audioCtxIn.createMediaStreamSource(stream);
            const processor = audioCtxIn.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            source.connect(processor);
            processor.connect(audioCtxIn.destination); // Necessary for Chrome to fire events

            // 3. Connect to Gemini Live API
            const client = new GoogleGenAI({ apiKey: API_KEY });
            const sessionPromise = client.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    },
                    systemInstruction: {
                        parts: [{
                            text: "You are Chike, a friendly and patient Igbo language teacher. Speak English with a Nigerian accent. Keep responses short and conversational. Teach basic Igbo phrases. Always use correct Igbo diacritics when writing Igbo words."
                        }]
                    }
                },
                callbacks: {
                    onopen: () => {
                        setConnected(true);
                        setIsSpeaking(false);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Extract audio data from server response
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            setIsSpeaking(true);
                            const ctx = audioContextOutputRef.current;
                            if (!ctx) return;

                            try {
                                // Decode and Schedule playback
                                const pcmData = base64ToUint8Array(base64Audio);
                                const buffer = await pcmToAudioBuffer(pcmData, ctx, 24000, 1);

                                const audioSource = ctx.createBufferSource();
                                audioSource.buffer = buffer;
                                audioSource.connect(ctx.destination);

                                // Smart Scheduling - avoid overlap
                                if (nextStartTimeRef.current < ctx.currentTime) {
                                    nextStartTimeRef.current = ctx.currentTime + 0.05;
                                }

                                audioSource.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += buffer.duration;

                                // Reset speaking state when audio ends
                                audioSource.onended = () => {
                                    if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
                                        setIsSpeaking(false);
                                    }
                                };
                            } catch (err) {
                                console.error("Audio decoding error:", err);
                            }
                        }

                        // Handle interruption signal
                        if (message.serverContent?.interrupted) {
                            nextStartTimeRef.current = audioContextOutputRef.current?.currentTime || 0;
                            setIsSpeaking(false);
                        }
                    },
                    onclose: () => {
                        setConnected(false);
                        setIsSpeaking(false);
                    },
                    onerror: (err) => {
                        console.error("Session error:", err);
                        setError("Connection failed. Please try again.");
                        setConnected(false);
                    }
                }
            });

            sessionRef.current = sessionPromise;

            // 4. Handle Microphone Input - Convert and send to Gemini
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);

                // Convert Float32 to Int16 PCM using utility function
                const int16 = float32ToInt16(inputData);

                // Convert to Base64
                const base64Data = uint8ArrayToBase64(new Uint8Array(int16.buffer));

                // Send to Gemini Live API
                if (sessionRef.current) {
                    sessionRef.current.then((session: Session) => {
                        session.sendRealtimeInput({
                            media: {
                                mimeType: 'audio/pcm;rate=16000',
                                data: base64Data
                            }
                        });
                    });
                }
            };

        } catch (e: any) {
            console.error("Connection error:", e);
            setError("Could not access microphone or connect.");
            setConnected(false);
        }
    };

    const disconnect = () => {
        setConnected(false);
        setIsSpeaking(false);

        // Stop Mic Stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        // Stop Processor
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        // Close Input Context
        if (audioContextInputRef.current) {
            audioContextInputRef.current.close();
            audioContextInputRef.current = null;
        }
        // Close Output Context
        if (audioContextOutputRef.current) {
            audioContextOutputRef.current.close();
            audioContextOutputRef.current = null;
        }
        sessionRef.current = null;
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
                {Platform.OS === 'web' 
                    ? '💡 Speak naturally - Chike will respond in real-time'
                    : '💡 Live voice available on web. Use Text Chat on mobile.'}
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
