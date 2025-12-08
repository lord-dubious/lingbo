import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { styled } from 'nativewind';
import Layout from '../../../components/Layout';
import { playGameSound } from '../../../utils/audioUtils';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const CARDS = [
    { id: 1, content: '🦁', type: 'image' },
    { id: 1, content: 'Odum', type: 'text' },
    { id: 2, content: '🐘', type: 'image' },
    { id: 2, content: 'Enyi', type: 'text' },
    { id: 3, content: '🦅', type: 'image' },
    { id: 3, content: 'Ugo', type: 'text' },
    { id: 4, content: '🐢', type: 'image' },
    { id: 4, content: 'Mbe', type: 'text' },
];

export default function MemoryMatch() {
    const [gameCards, setGameCards] = useState<any[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<number[]>([]);
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        resetGame();
    }, []);

    const resetGame = () => {
        const shuffled = [...CARDS]
            .sort(() => Math.random() - 0.5)
            .map((card, index) => ({ ...card, uniqueId: index }));
        setGameCards(shuffled);
        setFlipped([]);
        setMatched([]);
        setLocked(false);
    };

    const handleFlip = (index: number) => {
        if (locked || flipped.includes(index) || matched.includes(gameCards[index].id)) return;

        playGameSound('click');
        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setLocked(true);
            const first = gameCards[newFlipped[0]];
            const second = gameCards[newFlipped[1]];

            if (first.id === second.id) {
                playGameSound('success');
                setMatched([...matched, first.id]);
                setFlipped([]);
                setLocked(false);
            } else {
                playGameSound('error');
                setTimeout(() => {
                    setFlipped([]);
                    setLocked(false);
                }, 1000);
            }
        }
    };

    return (
        <Layout title="Memory Match" showBack backPath="/kids/games" isKidsMode hideBottomNav>
            <StyledView className="flex-1 p-4 items-center justify-center">
                <StyledView className="flex-row flex-wrap justify-center gap-4">
                    {gameCards.map((card, index) => {
                        const isFlipped = flipped.includes(index) || matched.includes(card.id);
                        return (
                            <StyledTouchableOpacity
                                key={card.uniqueId}
                                onPress={() => handleFlip(index)}
                                className={`w-20 h-24 rounded-xl items-center justify-center shadow-sm border-b-4 transition-all ${isFlipped ? 'bg-white border-cyan-200' : 'bg-cyan-400 border-cyan-600'}`}
                            >
                                {isFlipped ? (
                                    <StyledText className="text-2xl font-bold">{card.content}</StyledText>
                                ) : (
                                    <StyledText className="text-3xl text-white/50">?</StyledText>
                                )}
                            </StyledTouchableOpacity>
                        );
                    })}
                </StyledView>

                {matched.length === CARDS.length / 2 && (
                    <StyledView className="mt-8 items-center bg-white/80 p-6 rounded-3xl">
                        <StyledText className="text-2xl font-bold text-green-600 mb-2">You Won! 🎉</StyledText>
                        <StyledTouchableOpacity onPress={resetGame} className="bg-cyan-500 py-3 px-6 rounded-full">
                            <StyledText className="text-white font-bold">Play Again</StyledText>
                        </StyledTouchableOpacity>
                    </StyledView>
                )}
            </StyledView>
        </Layout>
    );
}
