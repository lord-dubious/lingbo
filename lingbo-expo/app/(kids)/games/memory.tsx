import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    Image
} from 'react-native';
import { ArrowLeft, RotateCw, Star, Trophy } from 'lucide-react-native';
import { MEMORY_GAME_DATA } from '@/constants';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 64) / 4 - 8;

interface Card {
    id: string;
    content: string;
    type: 'text' | 'image';
    matchId: string;
    isFlipped: boolean;
    isMatched: boolean;
}

export default function MemoryMatch() {
    const router = useRouter();
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);
    const [moves, setMoves] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        resetGame();
    }, []);

    const resetGame = () => {
        const shuffled = [...MEMORY_GAME_DATA]
            .sort(() => Math.random() - 0.5)
            .map((card) => ({
                ...card,
                isFlipped: false,
                isMatched: false,
            }));
        setCards(shuffled);
        setFlippedCards([]);
        setMatches(0);
        setMoves(0);
        setIsComplete(false);
    };

    const handleCardPress = (index: number) => {
        if (
            flippedCards.length === 2 ||
            cards[index].isFlipped ||
            cards[index].isMatched
        ) {
            return;
        }

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedCards, index];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [first, second] = newFlipped;

            if (cards[first].matchId === cards[second].matchId) {
                // Match found
                setTimeout(() => {
                    const matched = [...cards];
                    matched[first].isMatched = true;
                    matched[second].isMatched = true;
                    setCards(matched);
                    setMatches(m => {
                        const newMatches = m + 1;
                        if (newMatches === MEMORY_GAME_DATA.length / 2) {
                            setIsComplete(true);
                        }
                        return newMatches;
                    });
                    setFlippedCards([]);
                }, 500);
            } else {
                // No match - flip back
                setTimeout(() => {
                    const reset = [...cards];
                    reset[first].isFlipped = false;
                    reset[second].isFlipped = false;
                    setCards(reset);
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Memory Match</Text>
                <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
                    <RotateCw size={20} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Star size={20} color="#eab308" fill="#eab308" />
                    <Text style={styles.statText}>{matches} Matches</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statText}>{moves} Moves</Text>
                </View>
            </View>

            {/* Game Complete */}
            {isComplete && (
                <View style={styles.completeCard}>
                    <Trophy size={32} color="#eab308" />
                    <Text style={styles.completeText}>You Won! 🎉</Text>
                    <TouchableOpacity onPress={resetGame} style={styles.playAgainButton}>
                        <Text style={styles.playAgainText}>Play Again</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Card Grid */}
            <View style={styles.grid}>
                {cards.map((card, index) => (
                    <TouchableOpacity
                        key={`${card.id}-${index}`}
                        onPress={() => handleCardPress(index)}
                        style={[
                            styles.card,
                            card.isFlipped && styles.cardFlipped,
                            card.isMatched && styles.cardMatched,
                        ]}
                        activeOpacity={0.8}
                    >
                        {card.isFlipped || card.isMatched ? (
                            card.type === 'image' ? (
                                <Image source={{ uri: card.content }} style={styles.cardImage} />
                            ) : (
                                <Text style={styles.cardText}>{card.content}</Text>
                            )
                        ) : (
                            <Text style={styles.cardBack}>?</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fef3c7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: 'white',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    resetButton: {
        width: 44,
        height: 44,
        backgroundColor: 'white',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        paddingVertical: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    completeCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        gap: 12,
    },
    completeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    playAgainButton: {
        backgroundColor: '#22d3ee',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    playAgainText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    card: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        backgroundColor: '#22d3ee',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0891b2',
    },
    cardFlipped: {
        backgroundColor: 'white',
        borderColor: '#22d3ee',
    },
    cardMatched: {
        backgroundColor: '#86efac',
        borderColor: '#22c55e',
    },
    cardBack: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    cardText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        padding: 4,
    },
    cardImage: {
        width: '90%',
        height: '90%',
        borderRadius: 8,
    },
});
