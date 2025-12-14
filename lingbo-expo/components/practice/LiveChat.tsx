import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Phone, AudioWaveform, Mic, X, MicOff } from 'lucide-react-native';
import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { Audio } from 'expo-av';
import { base64ToUint8Array, uint8ArrayToBase64, pcmToAudioBuffer, float32ToInt16, playPCMAudio, extractPcmFromWav } from '../../utils/audioUtils';
import { readAsStringAsync } from 'expo-file-system/legacy';

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
    const recordingRef = useRef<Audio.Recording | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioQueueRef = useRef<string[]>([]);
    const isPlayingRef = useRef<boolean>(false);

    useEffect(() => {
        // Cleanup on unmount
        return () => disconnect();
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

    // Native mobile: Start recording with expo-av
    const startNativeRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                setError('Microphone permission denied');
                return false;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync({
                android: {
                    extension: '.wav',
                    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
                    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.wav',
                    audioQuality: Audio.IOSAudioQuality.HIGH,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {
                    mimeType: 'audio/webm',
                    bitsPerSecond: 128000,
                },
            });

            await recording.startAsync();
            recordingRef.current = recording;
            setIsRecording(true);
            return true;
        } catch (e) {
            console.error('Recording start error:', e);
            setError('Could not start recording');
            return false;
        }
    };

    // Native mobile: Stop recording and send to Gemini
    const stopNativeRecording = async () => {
        if (!recordingRef.current) return;

        try {
            setIsRecording(false);
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;

            if (uri && sessionRef.current) {
                // Read the audio file and convert to base64
                const wavBase64 = await readAsStringAsync(uri, {
                    encoding: 'base64',
                });

                // Extract raw PCM data from WAV (strip WAV header)
                const pcmBase64 = extractPcmFromWav(wavBase64);

                // Send to Gemini Live API
                sessionRef.current.sendRealtimeInput({
                    media: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: pcmBase64
                    }
                });
            }
        } catch (e) {
            console.error('Recording stop error:', e);
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
                // Native mobile: Use expo-av for push-to-talk style
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

    // Native mobile connection with expo-av
    const connectNative = async (client: GoogleGenAI) => {
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
    };

    // Handle recording button press (native mobile)
    const handleRecordPress = async () => {
        if (!connected) return;
        
        if (isRecording) {
            await stopNativeRecording();
        } else {
            await startNativeRecording();
        }
    };

    const disconnect = () => {
        setConnected(false);
        setIsSpeaking(false);
        setIsRecording(false);

        // Clear recording interval
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }

        // Stop native recording
        if (recordingRef.current) {
            recordingRef.current.stopAndUnloadAsync();
            recordingRef.current = null;
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
                    ? (isSpeaking ? 'Chike is speaking...' : isRecording ? 'Listening...' : 'Tap to speak')
                    : 'Start Call'}
            </Text>

            {/* Description */}
            <Text style={styles.description}>
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : connected
                    ? Platform.OS === 'web' 
                        ? 'Speak naturally in English or Igbo.'
                        : 'Hold the mic button to speak, release to send.'
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
                    {/* Push-to-talk button for native mobile */}
                    {Platform.OS !== 'web' && (
                        <TouchableOpacity 
                            onPressIn={handleRecordPress}
                            onPressOut={handleRecordPress}
                            style={[
                                styles.recordButton,
                                isRecording && styles.recordButtonActive
                            ]}
                        >
                            <Mic size={32} color="white" />
                            <Text style={styles.recordButtonText}>
                                {isRecording ? 'Release to send' : 'Hold to speak'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity onPress={disconnect} style={styles.endButton}>
                        <X size={24} color="#ef4444" />
                        <Text style={styles.endButtonText}>End Call</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Info note */}
            <Text style={styles.note}>
                {Platform.OS === 'web' 
                    ? '💡 Speak naturally - Chike will respond in real-time'
                    : '💡 Hold the mic button to record, release to send to Chike'}
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
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f97316',
        paddingHorizontal: 32,
        paddingVertical: 20,
        borderRadius: 32,
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    recordButtonActive: {
        backgroundColor: '#ef4444',
        shadowColor: '#ef4444',
    },
    recordButtonText: {
        color: 'white',
        fontSize: 16,
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
