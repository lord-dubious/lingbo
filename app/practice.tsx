import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
import { styled } from 'nativewind';
import Layout from '../components/Layout';
import { Audio } from 'expo-av';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function SpeakPractice() {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    async function startRecording() {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        setRecording(null);
        setIsRecording(false);
        if (recording) {
            await recording.stopAndUnloadAsync();
            // const uri = recording.getURI();
            // Here you would send uri to backend or analyze it
        }
    }

    return (
        <Layout title="Speak Practice" showBack>
            <StyledView className="flex-1 items-center justify-center p-6">
                 <StyledView className="bg-orange-50 p-8 rounded-full mb-8 border-4 border-orange-100">
                     <Mic size={64} color="#FF6B00" />
                 </StyledView>

                 <StyledText className="text-2xl font-bold text-gray-800 text-center mb-2">Practice Speaking</StyledText>
                 <StyledText className="text-gray-500 text-center mb-12">Tap the button and say "Kedu"</StyledText>

                 <StyledTouchableOpacity
                    onPress={isRecording ? stopRecording : startRecording}
                    className={`p-6 rounded-full shadow-lg ${isRecording ? 'bg-red-500' : 'bg-primary'}`}
                 >
                     {isRecording ? <Square size={32} color="white" fill="white" /> : <Mic size={32} color="white" />}
                 </StyledTouchableOpacity>
                 <StyledText className="mt-4 font-bold text-gray-400">{isRecording ? 'Recording...' : 'Tap to Record'}</StyledText>
            </StyledView>
        </Layout>
    );
}
