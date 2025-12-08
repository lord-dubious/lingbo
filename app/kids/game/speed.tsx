import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Play, Timer } from 'lucide-react-native';

import Layout from '../../../components/Layout';
import { playGameSound } from '../../../utils/audioUtils';





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
            <View className="flex-1 items-center justify-center p-4">
                {!isPlaying ? (
                    <View className="items-center bg-white/80 p-8 rounded-3xl shadow-sm">
                        <Text className="text-4xl font-kids font-bold text-indigo-600 mb-2">Speed Tap!</Text>
                        <Text className="text-gray-500 mb-6 font-medium">Tap the orange dots as fast as you can!</Text>
                        {timeLeft === 0 && <Text className="text-2xl font-bold text-green-600 mb-4">Score: {score}</Text>}
                        <TouchableOpacity onPress={startGame} className="bg-indigo-500 py-4 px-12 rounded-full shadow-lg active:scale-95 transition-transform">
                            <Play size={32} color="white" fill="white" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View className="flex-row justify-between w-full max-w-sm mb-8 bg-white/50 p-4 rounded-2xl">
                             <View className="flex-row items-center gap-2">
                                 <Text className="font-bold text-2xl text-indigo-700">Score: {score}</Text>
                             </View>
                             <View className="flex-row items-center gap-2">
                                 <Timer size={24} color="#4338ca"/>
                                 <Text className="font-bold text-2xl text-indigo-700">{timeLeft}s</Text>
                             </View>
                        </View>

                        <View className="flex-row flex-wrap w-full max-w-sm gap-4 justify-center">
                            {Array.from({ length: MOLES }).map((_, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => handleTap(i)}
                                    className={`w-24 h-24 rounded-full border-4 shadow-inner ${activeMole === i ? 'bg-orange-500 border-orange-600' : 'bg-indigo-200 border-indigo-300'}`}
                                >
                                    {activeMole === i && <View className="w-full h-full items-center justify-center"><Text className="text-4xl">🐹</Text></View>}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}
            </View>
        </Layout>
    );
}
