import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Animated,
    Dimensions
} from 'react-native';
import { ArrowLeft, RefreshCcw, Sparkles, CheckCircle, Star } from 'lucide-react-native';
import { MEMORY_GAME_DATA } from '@/constants';
import { playGameSound } from '@/utils/audioUtils';
import { ConfettiOverlay } from '@/components/ConfettiOverlay';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 64) / 3 - 8;

interface GameCard {
    id: string;
    matchId: string;
    type: 'text' | 'image';
    content: string;
    flipped: boolean;
    matched: boolean;
    isError: boolean;
}

export default function MemoryMatch() {
    const router = useRouter();
    const [cards, setCards] = useState<GameCard[]>([]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [solved, setSolved] = useState(false);
    const [moves, setMoves] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [showMatchOverlay, setShowMatchOverlay] = useState(false);

    const initGame = useCallback(() => {
        const gameCards = [...MEMORY_GAME_DATA, ...MEMORY_GAME_DATA.map(i => ({ ...i, id: i.id + '_pair' }))]
            .sort(() => Math.random() - 0.5)
            .map(c => ({ ...c, flipped: false, matched: false, isError: false }));
        setCards(gameCards);
        setFlipped([]);
        setSolved(false);
        setMoves(0);
        setIsChecking(false);
    }, []);

    useEffect(() => {
        initGame();
    }, [initGame]);

    // Check for match
    useEffect(() => {
        if (flipped.length === 2) {
            setMoves(m => m + 1);
            const [first, second] = flipped;
            setIsChecking(true);

            if (cards[first].matchId === cards[second].matchId) {
                // MATCH!
                setTimeout(() => {
                    playGameSound('success');
                    setCards(prev => prev.map((c, i) =>
                        (i === first || i === second) ? { ...c, matched: true } : c
                    ));
                    setFlipped([]);
                    setIsChecking(false);

                    // Show match overlay
                    setShowMatchOverlay(true);
                    setTimeout(() => setShowMatchOverlay(false), 1200);
                }, 500);
            } else {
                // NO MATCH
                setTimeout(() => {
                    playGameSound('error');
                    setCards(prev => prev.map((c, i) =>
                        (i === first || i === second) ? { ...c, isError: true } : c
                    ));

                    setTimeout(() => {
                        setCards(prev => prev.map((c, i) =>
                            (i === first || i === second) ? { ...c, flipped: false, isError: false } : c
                        ));
                        setFlipped([]);
                        setIsChecking(false);
                    }, 800);
                }, 500);
            }
        }
    }, [flipped, cards]);

    // Check for win
    useEffect(() => {
        if (cards.length > 0 && cards.every(c => c.matched)) {
            setTimeout(() => {
                setSolved(true);
                playGameSound('win');
            }, 500);
        }
    }, [cards]);

    const handleCardClick = (index: number) => {
        if (isChecking || cards[index].flipped || cards[index].matched) return;

        playGameSound('click');
        setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
        setFlipped(prev => [...prev, index]);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Win Overlay */}
            {solved && (
                <ConfettiOverlay
                    onRestart={initGame}
                    title="You Won!"
                    subtitle={`Found all pairs in ${moves} moves`}
                />
            )}

            {/* Match Overlay */}
            {showMatchOverlay && (
                <View style={styles.matchOverlay}>
                    <View style={styles.matchCard}>
                        <Star size={80} color="#facc15" fill="#facc15" />
                        <Text style={styles.matchText}>MATCH!</Text>
                    </View>
                </View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Memory Match</Text>
                <TouchableOpacity onPress={initGame} style={styles.resetButton}>
                    <RefreshCcw size={20} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Moves Counter */}
            <View style={styles.movesContainer}>
                <View style={styles.movesCard}>
                    <RefreshCcw size={18} color="#6366f1" />
                    <Text style={styles.movesText}>Moves: {moves}</Text>
                </View>
            </View>

            {/* Card Grid */}
            <View style={styles.grid}>
                {cards.map((card, i) => (
                    <TouchableOpacity
                        key={card.id}
                        onPress={() => handleCardClick(i)}
                        style={[
                            styles.cardContainer,
                            card.isError && styles.cardShake
                        ]}
                        activeOpacity={0.9}
                        disabled={isChecking || card.flipped || card.matched}
                    >
                        {/* Card Front (visible when not flipped) */}
                        {!card.flipped && !card.matched ? (
                            <View style={styles.cardFront}>
                                <Sparkles size={32} color="rgba(165, 180, 252, 0.5)" />
                            </View>
                        ) : (
                            /* Card Back (content) */
                            <View style={[
                                styles.cardBack,
                                card.matched && styles.cardMatched,
                                card.isError && styles.cardError
                            ]}>
                                {card.matched && (
                                    <View style={styles.checkBadge}>
                                        <CheckCircle size={16} color="white" fill="#22c55e" />
                                    </View>
                                )}
                                {card.type === 'image' ? (
                                    <Image
                                        source={{ uri: card.content }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text style={styles.cardText} numberOfLines={2}>{card.content}</Text>
                                )}
                            </View>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 22,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    movesContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    movesCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#c7d2fe',
    },
    movesText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    cardContainer: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    cardShake: {
        // Animation placeholder
    },
    cardFront: {
        width: '100%',
        height: '100%',
        backgroundColor: '#6366f1',
        borderRadius: 16,
        borderBottomWidth: 6,
        borderBottomColor: '#4338ca',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBack: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 4,
        borderColor: '#c7d2fe',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    cardMatched: {
        borderColor: '#86efac',
        backgroundColor: '#f0fdf4',
    },
    cardError: {
        borderColor: '#fca5a5',
        backgroundColor: '#fef2f2',
    },
    cardImage: {
        width: '90%',
        height: '90%',
        borderRadius: 8,
    },
    cardText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    checkBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        zIndex: 10,
        backgroundColor: '#22c55e',
        borderRadius: 10,
        padding: 2,
    },
    matchOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    matchCard: {
        backgroundColor: '#22c55e',
        paddingHorizontal: 40,
        paddingVertical: 32,
        borderRadius: 24,
        alignItems: 'center',
    },
    matchText: {
        fontSize: 48,
        fontWeight: '900',
        color: 'white',
        marginTop: 16,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
});
