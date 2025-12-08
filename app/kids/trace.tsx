import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, PanResponder, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { Trash2, Eraser } from 'lucide-react-native';
import { styled } from 'nativewind';
import Layout from '../../components/Layout';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const CHARS = ['A', 'B', 'C', '1', '2', '3'];

export default function TraceBook() {
    const [currentCharIdx, setCurrentCharIdx] = useState(0);
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');

    const currentChar = CHARS[currentCharIdx];

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                const { locationX, locationY } = evt.nativeEvent;
                setCurrentPath(`M${locationX},${locationY}`);
            },
            onPanResponderMove: (evt, gestureState) => {
                const { locationX, locationY } = evt.nativeEvent;
                setCurrentPath((prev) => `${prev} L${locationX},${locationY}`);
            },
            onPanResponderRelease: () => {
                setPaths((prev) => [...prev, currentPath]);
                setCurrentPath('');
            },
        })
    ).current;

    const clearCanvas = () => {
        setPaths([]);
        setCurrentPath('');
    };

    const nextChar = () => {
        clearCanvas();
        setCurrentCharIdx((prev) => (prev + 1) % CHARS.length);
    };

    return (
        <Layout title="Trace Book" showBack backPath="/kids" isKidsMode hideBottomNav>
            <StyledView className="flex-1 items-center p-4">
                <StyledView className="flex-row justify-between w-full mb-4 items-center">
                    <StyledText className="text-xl font-kids text-orange-700 font-bold">Trace: {currentChar}</StyledText>
                    <StyledTouchableOpacity onPress={clearCanvas} className="p-2 bg-red-100 rounded-full">
                        <Eraser size={24} color="#ef4444" />
                    </StyledTouchableOpacity>
                </StyledView>

                {/* Canvas Area */}
                <StyledView
                    className="w-full aspect-square bg-white rounded-3xl border-4 border-dashed border-orange-200 overflow-hidden relative shadow-sm"
                    {...panResponder.panHandlers}
                >
                    {/* Background Letter Guide */}
                    <StyledView className="absolute inset-0 items-center justify-center pointer-events-none">
                         <StyledText className="text-[250px] font-bold text-gray-200" style={{ fontFamily: 'System' }}>{currentChar}</StyledText>
                    </StyledView>

                    {/* Drawing Layer */}
                    <Svg style={StyleSheet.absoluteFill}>
                        {paths.map((p, i) => (
                            <Path
                                key={i}
                                d={p}
                                stroke="#FF6B00"
                                strokeWidth={15}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ))}
                        {currentPath ? (
                            <Path
                                d={currentPath}
                                stroke="#FF6B00"
                                strokeWidth={15}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ) : null}
                    </Svg>
                </StyledView>

                <StyledTouchableOpacity
                    onPress={nextChar}
                    className="mt-8 bg-orange-500 py-4 px-12 rounded-full shadow-lg active:scale-95 transition-transform"
                >
                    <StyledText className="text-white font-bold text-xl">Next Letter</StyledText>
                </StyledTouchableOpacity>
            </StyledView>
        </Layout>
    );
}
