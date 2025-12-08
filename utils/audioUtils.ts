import { Audio } from 'expo-av';

export const playPCMAudio = async (base64Audio: string) => {
  try {
    const sound = new Audio.Sound();
    // Assuming the service returns mp3 data in base64
    const uri = `data:audio/mp3;base64,${base64Audio}`;

    await sound.loadAsync({ uri });
    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
            await sound.unloadAsync();
        }
    });
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

// Placeholder for sound effects since no audio files are in assets currently
export const playGameSound = async (type: 'success' | 'error' | 'win' | 'click' | 'pop') => {
   // In a real app, we would load sound files here.
   // const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/success.mp3'));
   // await sound.playAsync();
   console.log(`[Audio Mock] Playing sound: ${type}`);
};
