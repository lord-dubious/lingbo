import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Phone, AudioWaveform, Mic, X, MicOff } from 'lucide-react-native';
import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { Audio } from 'expo-av';
import { useAudioRecorder, AudioDataEvent } from '@siteed/expo-audio-studio';
import { base64ToUint8Array, uint8ArrayToBase64, pcmToAudioBuffer, float32ToInt16, playPCMAudio } from '../../utils/audioUtils';

// API Key from Expo environment
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const LiveChat = () => {
    const [connected, setConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for audio contexts and session management (Web)
    const audioContextOutputRef = useRef<AudioContext | null>(null);
    const audioContextInputRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sessionRef = useRef<Session | null>(null);
    
    // Refs for native mobile audio
    const audioQueueRef = useRef<string[]>([]);
    const isPlayingRef = useRef<boolean>(false);

    // Use expo-audio-studio for real-time audio streaming on native
    const audioRecorder = useAudioRecorder();

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            disconnect();
        };
    }, []);

    // Native mobile: Process audio queue for playback
    const processAudioQueue = async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
        
        isPlayingRef.current = true;
        setIsSpeaking(true);
        
        while (audioQueueRef.current.length > 0) {
            const audioData = audioQueueRef.current.shift();
            if (audioData) {
                try {
                    await playPCMAudio(audioData);
                } catch (e) {
                    console.error('Audio playback error:', e);
                }
            }
        }
        
        isPlayingRef.current = false;
        setIsSpeaking(false);
    };

    // Native mobile: Handle real-time audio stream from expo-audio-studio
    const handleNativeAudioStream = async (event: AudioDataEvent) => {
        if (!sessionRef.current) return;

        try {
            // The data is base64 encoded PCM from native, or Float32Array from web
            let base64Data: string;
            
            if (typeof event.data === 'string') {
                // Native: data is already base64 encoded
                base64Data = event.data;
            } else {
                // Web fallback: convert Float32Array to Int16 PCM then base64
                const int16 = float32ToInt16(event.data);
                base64Data = uint8ArrayToBase64(new Uint8Array(int16.buffer));
            }

            // Send to Gemini Live API
            sessionRef.current.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Data
                }
            });
        } catch (e) {
            console.error('Failed to send audio stream to Gemini Live API:', e);
        }
    };

    const connect = async () => {
        setError(null);

        if (!API_KEY) {
            setError("API Key missing. Configure EXPO_PUBLIC_GEMINI_API_KEY");
            return;
        }

        try {
            // Connect to Gemini Live API
            const client = new GoogleGenAI({ apiKey: API_KEY });
            
            if (Platform.OS === 'web') {
                // Web platform: Use Web Audio API for real-time streaming
                await connectWeb(client);
            } else {
                // Native mobile: Use expo-audio-studio for real-time streaming
                await connectNative(client);
            }
        } catch (e: any) {
            console.error("Connection error:", e);
            setError("Could not connect. Please try again.");
            setConnected(false);
        }
    };

    // Web platform connection with Web Audio API
    const connectWeb = async (client: GoogleGenAI) => {
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
        processor.connect(audioCtxIn.destination);

        // 3. Connect to Gemini Live API
        const session = await client.live.connect({
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
                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) {
                        setIsSpeaking(true);
                        const ctx = audioContextOutputRef.current;
                        if (!ctx) return;

                        try {
                            const pcmData = base64ToUint8Array(base64Audio);
                            const buffer = await pcmToAudioBuffer(pcmData, ctx, 24000, 1);

                            const audioSource = ctx.createBufferSource();
                            audioSource.buffer = buffer;
                            audioSource.connect(ctx.destination);

                            if (nextStartTimeRef.current < ctx.currentTime) {
                                nextStartTimeRef.current = ctx.currentTime + 0.05;
                            }

                            audioSource.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += buffer.duration;

                            audioSource.onended = () => {
                                if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
                                    setIsSpeaking(false);
                                }
                            };
                        } catch (err) {
                            console.error("Audio decoding error:", err);
                        }
                    }

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

        sessionRef.current = session;

        // 4. Handle Microphone Input
        processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = float32ToInt16(inputData);
            const base64Data = uint8ArrayToBase64(new Uint8Array(int16.buffer));

            if (sessionRef.current) {
                sessionRef.current.sendRealtimeInput({
                    media: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: base64Data
                    }
                });
            }
        };
    };

    // Native mobile connection with expo-audio-studio for real-time streaming
    const connectNative = async (client: GoogleGenAI) => {
        // Request audio permissions
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
            setError('Microphone permission denied');
            return;
        }

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
        });

        // Connect to Gemini Live API
        const session = await client.live.connect({
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
                    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) {
                        // Queue audio for playback
                        audioQueueRef.current.push(base64Audio);
                        processAudioQueue();
                    }

                    if (message.serverContent?.interrupted) {
                        audioQueueRef.current = [];
                        setIsSpeaking(false);
                    }
                },
                onclose: () => {
                    setConnected(false);
                    setIsSpeaking(false);
                    setIsRecording(false);
                },
                onerror: (err) => {
                    console.error("Session error:", err);
                    setError("Connection failed. Please try again.");
                    setConnected(false);
                }
            }
        });

        sessionRef.current = session;
        setConnected(true);

        // Start real-time audio streaming using expo-audio-studio
        try {
            await audioRecorder.startRecording({
                sampleRate: 16000,
                channels: 1,
                encoding: 'pcm_16bit',
                interval: 100, // Stream audio every 100ms for low latency
                onAudioStream: handleNativeAudioStream,
                output: {
                    primary: { enabled: false } // Don't save to file, just stream
                }
            });
            setIsRecording(true);
        } catch (e) {
            console.error('Failed to start audio streaming in connectNative():', e);
            setError('Failed to start audio streaming. Please check microphone permissions.');
        }
    };

    const disconnect = () => {
        setConnected(false);
        setIsSpeaking(false);
        setIsRecording(false);

        // Stop native audio streaming (fire and forget)
        if (audioRecorder.isRecording) {
            audioRecorder.stopRecording().catch(e => {
                console.error('Failed to stop audio recording in disconnect():', e);
            });
        }

        // Clear audio queue
        audioQueueRef.current = [];

        // Stop Mic Stream (Web)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        // Stop Processor (Web)
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        // Close Input Context (Web)
        if (audioContextInputRef.current) {
            audioContextInputRef.current.close();
            audioContextInputRef.current = null;
        }
        // Close Output Context (Web)
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
                connected && styles.iconContainerActive,
                isRecording && styles.iconContainerRecording
            ]}>
                {connected ? (
                    isSpeaking ? (
                        <AudioWaveform size={48} color="white" />
                    ) : isRecording ? (
                        <Mic size={48} color="white" />
                    ) : (
                        <MicOff size={48} color="white" />
                    )
                ) : (
                    <Phone size={48} color="#9ca3af" />
                )}
            </View>

            {/* Title */}
            <Text style={styles.title}>
                {connected
                    ? (isSpeaking ? 'Chike is speaking...' : isRecording ? 'Listening...' : 'Connected')
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

            {/* Action Buttons */}
            {!connected ? (
                <TouchableOpacity onPress={connect} style={styles.callButton}>
                    <Phone size={24} color="white" />
                    <Text style={styles.callButtonText}>Call Chike</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.connectedButtons}>
                    <TouchableOpacity onPress={disconnect} style={styles.endButton}>
                        <X size={24} color="#ef4444" />
                        <Text style={styles.endButtonText}>End Call</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Info note */}
            <Text style={styles.note}>
                💡 Speak naturally - Chike will respond in real-time
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
        backgroundColor: '#22c55e',
    },
    iconContainerRecording: {
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
    connectedButtons: {
        alignItems: 'center',
        gap: 16,
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
