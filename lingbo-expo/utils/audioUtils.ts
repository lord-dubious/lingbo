import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Global sound reference for cleanup
let globalSound: Audio.Sound | null = null;

/**
 * Convert base64 to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Convert Uint8Array to base64
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convert PCM data to AudioBuffer (for Web Audio API playback)
 * Used for Live API audio streaming on web platform
 */
export async function pcmToAudioBuffer(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

/**
 * Convert Float32 audio data to Int16 PCM
 * Used for sending microphone input to Live API
 */
export function float32ToInt16(float32Array: Float32Array): Int16Array {
    const int16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
}

/**
 * Play PCM audio from base64 encoded data
 * This uses expo-av for cross-platform audio playback
 */
export const playPCMAudio = async (base64: string): Promise<void> => {
    try {
        // Cleanup previous sound if any
        if (globalSound) {
            await globalSound.unloadAsync();
            globalSound = null;
        }

        // Set audio mode
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });

        // For PCM data, we need to convert to a playable format
        // expo-av requires a URI, so we create a data URI
        const audioUri = `data:audio/wav;base64,${createWavFromPcm(base64)}`;

        const { sound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: true }
        );

        globalSound = sound;

        // Clean up when done
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                sound.unloadAsync();
                globalSound = null;
            }
        });
    } catch (error) {
        console.error('Audio playback failed:', error);
    }
};

/**
 * Create a WAV file from raw PCM data
 * PCM is 16-bit, mono, 24000 Hz from Gemini
 */
function createWavFromPcm(pcmBase64: string): string {
    const pcmData = base64ToUint8Array(pcmBase64);
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;

    const dataLength = pcmData.length;
    const headerLength = 44;
    const totalLength = dataLength + headerLength;

    const buffer = new ArrayBuffer(totalLength);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    writeString(view, 8, 'WAVE');

    // fmt subchunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true); // ByteRate
    view.setUint16(32, numChannels * bitsPerSample / 8, true); // BlockAlign
    view.setUint16(34, bitsPerSample, true);

    // data subchunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    // Copy PCM data
    const uint8View = new Uint8Array(buffer);
    uint8View.set(pcmData, headerLength);

    // Convert to base64
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Sound cache for game sounds
const soundCache: { [key: string]: Audio.Sound } = {};

/**
 * Play simple game sound effects
 * Uses pre-loaded sound effects for performance
 */
export const playGameSound = async (
    type: 'success' | 'error' | 'click' | 'win' | 'flip'
): Promise<void> => {
    try {
        // Create audio context for web-based sound generation
        if (Platform.OS === 'web' && typeof AudioContext !== 'undefined') {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const now = audioContext.currentTime;

            switch (type) {
                case 'success':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(500, now);
                    oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    oscillator.start(now);
                    oscillator.stop(now + 0.3);
                    break;

                case 'error':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(150, now);
                    gainNode.gain.setValueAtTime(0.08, now);
                    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                    break;

                case 'win':
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(400, now);
                    oscillator.frequency.setValueAtTime(500, now + 0.1);
                    oscillator.frequency.setValueAtTime(600, now + 0.2);
                    oscillator.frequency.setValueAtTime(800, now + 0.3);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
                    oscillator.start(now);
                    oscillator.stop(now + 0.5);
                    break;

                case 'click':
                case 'flip':
                default:
                    oscillator.frequency.setValueAtTime(800, now);
                    gainNode.gain.setValueAtTime(0.03, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                    oscillator.start(now);
                    oscillator.stop(now + 0.05);
                    break;
            }
        } else {
            // For native platforms, use expo-av
            // In production, you would bundle actual sound files
            console.log(`Game sound: ${type}`);
        }
    } catch (error) {
        // Silently fail for sound effects
        console.log(`Sound effect failed: ${type}`);
    }
};

/**
 * Record audio from microphone
 * Returns base64 encoded audio data
 */
export const recordAudio = async (
    durationMs: number = 5000
): Promise<string | null> => {
    try {
        // Request permissions
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
            console.error('Audio recording permission denied');
            return null;
        }

        // Configure audio mode for recording
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
        });

        // Create recording
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

        // Record for specified duration
        await new Promise(resolve => setTimeout(resolve, durationMs));

        await recording.stopAndUnloadAsync();

        // Get the recorded file URI
        const uri = recording.getURI();
        if (!uri) return null;

        // For now, return the URI - in production, convert to base64
        return uri;
    } catch (error) {
        console.error('Recording failed:', error);
        return null;
    }
};

export default {
    playPCMAudio,
    playGameSound,
    recordAudio,
    base64ToUint8Array,
    uint8ArrayToBase64,
    pcmToAudioBuffer,
    float32ToInt16,
};
