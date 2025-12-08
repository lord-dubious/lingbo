import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { styled } from 'nativewind';
import Layout from '../components/Layout';
import { Play } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

export default function VideoLibrary() {
    return (
        <Layout title="Videos" showBack>
            <StyledView className="flex-1 items-center justify-center p-6">
                <StyledText className="text-gray-500 text-lg text-center mb-6">
                    Watch and learn!
                </StyledText>

                <StyledView className="w-full gap-6">
                     <StyledTouchableOpacity className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                         <StyledView className="h-48 bg-gray-200 items-center justify-center relative">
                             {/* Placeholder for thumbnail */}
                             <StyledView className="absolute bg-black/30 p-4 rounded-full">
                                <Play size={32} color="white" fill="white" />
                             </StyledView>
                         </StyledView>
                         <StyledView className="p-4">
                             <StyledText className="font-bold text-lg text-gray-800">Learn Colors in Igbo</StyledText>
                             <StyledText className="text-gray-500">Duration: 5:00</StyledText>
                         </StyledView>
                     </StyledTouchableOpacity>
                </StyledView>
            </StyledView>
        </Layout>
    );
}
