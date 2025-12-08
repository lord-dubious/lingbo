import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import Layout from '../components/Layout';
import { Book, Video } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function Library() {
    return (
        <Layout title="Library" showBack>
            <StyledView className="flex-1 items-center justify-center p-6">
                <StyledText className="text-gray-500 text-lg text-center">
                    Workbooks and resources will appear here.
                </StyledText>

                <StyledView className="mt-8 w-full gap-4">
                     <StyledTouchableOpacity className="bg-white p-4 rounded-2xl flex-row items-center gap-4 shadow-sm border border-gray-100">
                         <StyledView className="p-3 bg-purple-100 rounded-xl">
                            <Book size={24} color="#9333ea" />
                         </StyledView>
                         <StyledView>
                             <StyledText className="font-bold text-lg text-gray-800">My First Igbo Book</StyledText>
                             <StyledText className="text-gray-500">PDF • 12 Pages</StyledText>
                         </StyledView>
                     </StyledTouchableOpacity>
                </StyledView>
            </StyledView>
        </Layout>
    );
}
