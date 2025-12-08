import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import Layout from '../components/Layout';
import { useRouter } from 'expo-router';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function AlphabetBoard() {
    const letters = [
        'A', 'B', 'Ch', 'D', 'E', 'F', 'G', 'Gb', 'Gh', 'Gw', 'H', 'I', 'Ị',
        'J', 'K', 'Kp', 'Kw', 'L', 'M', 'N', 'Ñ', 'Nw', 'Ny', 'O', 'Ọ', 'P',
        'R', 'S', 'Sh', 'T', 'U', 'Ụ', 'V', 'W', 'Y', 'Z'
    ];

    return (
        <Layout title="Alphabet" showBack>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <StyledView className="flex-row flex-wrap justify-between gap-2">
                    {letters.map((letter) => (
                        <StyledView key={letter} className="w-[30%] aspect-square bg-white rounded-xl items-center justify-center border border-gray-200 shadow-sm mb-2">
                            <StyledText className="text-3xl font-bold text-gray-800">{letter}</StyledText>
                        </StyledView>
                    ))}
                </StyledView>
            </ScrollView>
        </Layout>
    );
}
