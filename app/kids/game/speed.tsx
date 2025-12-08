import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Play, Timer } from 'lucide-react-native';
import { styled } from 'nativewind';
import Layout from '../../../components/Layout';
import { playGameSound } from '../../../utils/audioUtils';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const MOLES = 9;
const GAME_DURATION = 30;

export default function SpeedTap() {
    const [activeMole, setActiveMole] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const moleTimerRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setIsPlaying(true);
        spawnMole();

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const endGame = () => {
        setIsPlaying(false);
        setActiveMole(null);
        if (timerRef.current) clearInterval(timerRef.current);
        if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
        playGameSound('win');
    };

    const spawnMole = () => {
        if (!isPlaying && timeLeft <= 0) return;

        const randomTime = Math.random() * 1000 + 500; // 0.5s - 1.5s
        const randomMole = Math.floor(Math.random() * MOLES);

        setActiveMole(randomMole);
        playGameSound('pop');

        moleTimerRef.current = setTimeout(() => {
            if (isPlaying) spawnMole();
        }, randomTime);
    };

    const handleTap = (index: number) => {
        if (!isPlaying) return;

        if (index === activeMole) {
            playGameSound('success');
            setScore(s => s + 1);
            setActiveMole(null);
            if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
            spawnMole();
        } else {
            playGameSound('error');
        }
    };

    // Clean up
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
        };
    }, []);

    return (
        <Layout title="Speed Tap" showBack backPath="/kids/games" isKidsMode hideBottomNav>
            <StyledView className="flex-1 items-center justify-center p-4">
                {!isPlaying ? (
                    <StyledView className="items-center bg-white/80 p-8 rounded-3xl shadow-sm">
                        <StyledText className="text-4xl font-kids font-bold text-indigo-600 mb-2">Speed Tap!</StyledText>
                        <StyledText className="text-gray-500 mb-6 font-medium">Tap the orange dots as fast as you can!</StyledText>
                        {timeLeft === 0 && <StyledText className="text-2xl font-bold text-green-600 mb-4">Score: {score}</StyledText>}
                        <StyledTouchableOpacity onPress={startGame} className="bg-indigo-500 py-4 px-12 rounded-full shadow-lg active:scale-95 transition-transform">
                            <Play size={32} color="white" fill="white" />
                        </StyledTouchableOpacity>
                    </StyledView>
                ) : (
                    <>
                        <StyledView className="flex-row justify-between w-full max-w-sm mb-8 bg-white/50 p-4 rounded-2xl">
                             <StyledView className="flex-row items-center gap-2">
                                 <StyledText className="font-bold text-2xl text-indigo-700">Score: {score}</StyledText>
                             </StyledView>
                             <StyledView className="flex-row items-center gap-2">
                                 <Timer size={24} color="#4338ca"/>
                                 <StyledText className="font-bold text-2xl text-indigo-700">{timeLeft}s</StyledText>
                             </StyledView>
                        </StyledView>

                        <StyledView className="flex-row flex-wrap w-full max-w-sm gap-4 justify-center">
                            {Array.from({ length: MOLES }).map((_, i) => (
                                <StyledTouchableOpacity
                                    key={i}
                                    onPress={() => handleTap(i)}
                                    className={`w-24 h-24 rounded-full border-4 shadow-inner ${activeMole === i ? 'bg-orange-500 border-orange-600' : 'bg-indigo-200 border-indigo-300'}`}
                                >
                                    {activeMole === i && <StyledView className="w-full h-full items-center justify-center"><StyledText className="text-4xl">🐹</StyledText></StyledView>}
                                </StyledTouchableOpacity>
                            ))}
                        </StyledView>
                    </>
                )}
            </StyledView>
        </Layout>
    );
}
