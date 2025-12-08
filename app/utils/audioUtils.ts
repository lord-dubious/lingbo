import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

let audioSession: Audio.Sound | null = null;

export const playPCMAudio = async (base64: string) => {
  try {
    // Stop any existing playback
    if (audioSession) {
      await audioSession.unloadAsync();
      audioSession = null;
    }

    const buffer = base64ToUint8Array(base64);
    
    // Create WAV header for PCM data
    const numChannels = 1;
    const sampleRate = 24000;
    const bytesPerSample = 2;
    const numSamples = buffer.length / bytesPerSample;
    
    const wavBuffer = createWavHeader(sampleRate, numChannels, numSamples, buffer);
    const base64Wav = uint8ArrayToBase64(wavBuffer);
    
    // Load and play audio
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${base64Wav}` }
    );
    
    audioSession = sound;
    await sound.playAsync();
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

function createWavHeader(sampleRate: number, numChannels: number, numSamples: number, pcmData: Uint8Array): Uint8Array {
  const bytesPerSample = 2;
  const byteRate = sampleRate * numChannels * bytesPerSample;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numSamples * blockAlign;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  
  const uint8Array = new Uint8Array(buffer);
  uint8Array.set(pcmData, 44);
  
  return uint8Array;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const playGameSound = async (type: 'success' | 'error' | 'click' | 'win' | 'flip') => {
  try {
    let frequency = 500;
    let duration = 0.1;
    
    switch (type) {
      case 'success':
        frequency = 700;
        duration = 0.2;
        break;
      case 'error':
        frequency = 300;
        duration = 0.15;
        break;
      case 'win':
        frequency = 800;
        duration = 0.3;
        break;
      case 'click':
        frequency = 600;
        duration = 0.05;
        break;
      case 'flip':
        frequency = 650;
        duration = 0.1;
        break;
    }
    
    // Speak a quick sound using Speech API as a workaround for tone generation
    // This is a simplified approach; for better audio synthesis, consider using Expo's native modules
    await Speech.speak('', {
      language: 'en',
      rate: 1.5,
      pitch: frequency / 200,
      duration: Math.min(duration * 1000, 1000),
    });
  } catch (e) {
    console.error("Game sound failed", e);
  }
};

export const startAudioRecording = async () => {
  try {
    // Request permission
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Audio permission not granted');
    }
    
    // Setup audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    
    // Start recording
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    
    return recording;
  } catch (e) {
    console.error("Recording failed to start", e);
    throw e;
  }
};

export const stopAudioRecording = async (recording: Audio.Recording) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return uri;
  } catch (e) {
    console.error("Recording failed to stop", e);
    throw e;
  }
};

export const convertAudioToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Audio conversion failed", e);
    throw e;
  }
};
