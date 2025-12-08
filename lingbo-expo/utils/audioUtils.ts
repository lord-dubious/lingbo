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
        // Note: This is a simplified implementation - for production,
        // you might need to write the audio to a temp file
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

/**
 * Play simple game sound effects using oscillator tones
 * Note: On React Native, we use pre-recorded sounds or vibration instead
 */
export const playGameSound = async (
    type: 'success' | 'error' | 'click' | 'win' | 'flip'
): Promise<void> => {
    try {
        // For React Native, we can use Haptics for feedback
        // or play short audio files
        // This is a simplified placeholder - you'd want actual sound files for production

        // Optional: Use haptic feedback on supported devices
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            // Import Haptics from expo-haptics if you want tactile feedback
            // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // For now, we'll skip audio synthesis on mobile
        // In production, bundle short audio files and play them
        console.log(`Game sound: ${type}`);
    } catch (error) {
        // Ignore sound errors
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

        // Read file as base64
        // Note: You'll need expo-file-system for this in production
        // For now, return the URI
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
};
