import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Volume2, ArrowRight, RefreshCw } from 'lucide-react-native';
import { styled } from 'nativewind';
import Layout from '../../../components/Layout';
import { playPCMAudio } from '../../../utils/audioUtils';
import { generateIgboSpeech } from '../../../services/geminiService';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const WORDS = [
    { igbo: 'Nne', english: 'Mother', image: 'https://cdn-icons-png.flaticon.com/512/320/320338.png' },
    { igbo: 'Nna', english: 'Father', image: 'https://cdn-icons-png.flaticon.com/512/320/320336.png' },
    { igbo: 'Ulo', english: 'House', image: 'https://cdn-icons-png.flaticon.com/512/619/619153.png' },
    { igbo: 'Mmiri', english: 'Water', image: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png' },
    { igbo: 'Osisi', english: 'Tree', image: 'https://cdn-icons-png.flaticon.com/512/490/490091.png' }
];

export default function WordFlash() {
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const currentWord = WORDS[index];

    const nextCard = () => {
        setFlipped(false);
        setIndex((prev) => (prev + 1) % WORDS.length);
    };

    const playAudio = async () => {
        const b64 = await generateIgboSpeech(currentWord.igbo);
        if (b64) playPCMAudio(b64);
    };

    useEffect(() => {
        playAudio();
    }, [index]);

    return (
        <Layout title="Word Flash" showBack backPath="/kids/games" isKidsMode hideBottomNav>
            <StyledView className="flex-1 items-center justify-center py-10">
                <StyledTouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setFlipped(!flipped)}
                    className="w-full aspect-[3/4] max-w-sm bg-white rounded-[3rem] shadow-xl border-4 border-pink-200 items-center justify-center p-8 mb-8"
                >
                    {!flipped ? (
                        <>
                            <StyledImage
                                source={{ uri: currentWord.image }}
                                className="w-48 h-48 mb-6"
                                resizeMode="contain"
                            />
                            <StyledText className="text-5xl font-kids font-bold text-gray-800 text-center">{currentWord.igbo}</StyledText>
                            <StyledText className="text-gray-400 mt-4 font-bold">Tap to flip</StyledText>
                        </>
                    ) : (
                        <>
                             <StyledText className="text-4xl font-kids font-bold text-pink-500 text-center mb-4">{currentWord.english}</StyledText>
                             <StyledText className="text-gray-400 font-bold">Tap to flip back</StyledText>
                        </>
                    )}
                </StyledTouchableOpacity>

                <StyledView className="flex-row gap-6">
                    <StyledTouchableOpacity onPress={playAudio} className="bg-blue-400 p-5 rounded-full border-b-4 border-blue-600 active:border-b-0 active:translate-y-1 shadow-lg">
                        <Volume2 size={32} color="white" />
                    </StyledTouchableOpacity>

                    <StyledTouchableOpacity onPress={nextCard} className="bg-green-400 p-5 rounded-full border-b-4 border-green-600 active:border-b-0 active:translate-y-1 shadow-lg">
                        <ArrowRight size={32} color="white" />
                    </StyledTouchableOpacity>
                </StyledView>
            </StyledView>
        </Layout>
    );
}
