import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Dimensions
} from 'react-native';
import { ArrowLeft, RefreshCcw, Check } from 'lucide-react-native';
import { KIDS_GAMES } from '@/constants';
import { playGameSound } from '@/utils/audioUtils';
import { ConfettiOverlay } from '@/components/ConfettiOverlay';

const { width } = Dimensions.get('window');

export default function SentencePuzzle() {
    const router = useRouter();
    const [gameWon, setGameWon] = useState(false);
    const [builtSentence, setBuiltSentence] = useState<string[]>([]);

    const sentenceGame = KIDS_GAMES[0];
    const [availableBlocks, setAvailableBlocks] = useState<string[]>(
        sentenceGame?.example_round?.scrambled_blocks || ['Ụmụ', 'nwoke', 'na-egwu', 'bọọlụ']
    );

    const correctOrder = sentenceGame?.example_round?.correct_order || ['Ụmụ', 'nwoke', 'na-egwu', 'bọọlụ'];
    const targetSentence = sentenceGame?.example_round?.target_sentence || 'The boys are playing ball';

    const colors = [
        { bg: '#f87171', border: '#dc2626' },
        { bg: '#60a5fa', border: '#2563eb' },
        { bg: '#4ade80', border: '#16a34a' },
        { bg: '#facc15', border: '#ca8a04' },
        { bg: '#a78bfa', border: '#7c3aed' },
    ];

    const getBlockColor = (word: string) => {
        const index = word.length % colors.length;
        return colors[index];
    };

    const handleBlockClick = (word: string) => {
        playGameSound('click');
        const newSentence = [...builtSentence, word];
        setBuiltSentence(newSentence);
        setAvailableBlocks(availableBlocks.filter(b => b !== word));

        if (newSentence.length === correctOrder.length) {
            if (newSentence.every((val, i) => val === correctOrder[i])) {
                setTimeout(() => {
                    playGameSound('win');
                    setGameWon(true);
                }, 500);
            } else {
                setTimeout(() => {
                    playGameSound('error');
                }, 300);
            }
        }
    };

    const handleRemoveBlock = (word: string, index: number) => {
        playGameSound('click');
        const newSentence = [...builtSentence];
        newSentence.splice(index, 1);
        setBuiltSentence(newSentence);
        setAvailableBlocks([...availableBlocks, word]);
    };

    const reset = () => {
        setBuiltSentence([]);
        setAvailableBlocks(sentenceGame?.example_round?.scrambled_blocks || ['Ụmụ', 'nwoke', 'na-egwu', 'bọọlụ']);
        setGameWon(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Confetti Overlay */}
            {gameWon && (
                <ConfettiOverlay
                    onRestart={reset}
                    title="You did it!"
                    subtitle={targetSentence}
                />
            )}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sentence Puzzle</Text>
                <TouchableOpacity onPress={reset} style={styles.resetButton}>
                    <RefreshCcw size={20} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Goal Card */}
            <View style={styles.goalCard}>
                <View style={styles.goalIcon}>
                    <Check size={16} color="#f97316" />
                </View>
                <View style={styles.goalContent}>
                    <Text style={styles.goalLabel}>TARGET</Text>
                    <Text style={styles.goalText}>"{targetSentence}"</Text>
                </View>
            </View>

            {/* Drop Zone */}
            <View style={styles.dropZone}>
                {builtSentence.length === 0 ? (
                    <View style={styles.dropZonePlaceholder}>
                        <View style={styles.placeholderBox} />
                        <Text style={styles.placeholderText}>Put blocks here!</Text>
                    </View>
                ) : (
                    <View style={styles.builtSentenceContainer}>
                        {builtSentence.map((word, i) => {
                            const color = getBlockColor(word);
                            return (
                                <TouchableOpacity
                                    key={`${word}-${i}`}
                                    onPress={() => handleRemoveBlock(word, i)}
                                    style={[
                                        styles.block,
                                        { backgroundColor: color.bg, borderBottomColor: color.border }
                                    ]}
                                >
                                    <Text style={styles.blockText}>{word}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>

            {/* Block Pool */}
            <View style={styles.blockPool}>
                <View style={styles.poolHandle} />
                <View style={styles.poolBlocks}>
                    {availableBlocks.map((word, i) => (
                        <TouchableOpacity
                            key={`${word}-${i}`}
                            onPress={() => handleBlockClick(word)}
                            style={styles.poolBlock}
                        >
                            <Text style={styles.poolBlockText}>{word}</Text>
                        </TouchableOpacity>
                    ))}
                    {availableBlocks.length === 0 && (
                        <Text style={styles.noBlocksText}>No blocks left!</Text>
                    )}
                </View>
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
    },
    goalCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 2,
        borderColor: '#fed7aa',
    },
    goalIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#fff7ed',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalContent: {
        flex: 1,
    },
    goalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#f97316',
        letterSpacing: 1,
        marginBottom: 2,
    },
    goalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    dropZone: {
        flex: 1,
        marginHorizontal: 16,
        marginBottom: 200,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 24,
        borderWidth: 3,
        borderStyle: 'dashed',
        borderColor: '#93c5fd',
        padding: 16,
    },
    dropZonePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderBox: {
        width: 48,
        height: 48,
        borderWidth: 4,
        borderStyle: 'dashed',
        borderColor: '#93c5fd',
        borderRadius: 12,
        marginBottom: 12,
    },
    placeholderText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#93c5fd',
    },
    builtSentenceContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    block: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        borderBottomWidth: 4,
    },
    blockText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    blockPool: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f3f4f6',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 16,
        paddingBottom: 40,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 10,
    },
    poolHandle: {
        width: 48,
        height: 6,
        backgroundColor: '#d1d5db',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 16,
    },
    poolBlocks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    poolBlock: {
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    poolBlockText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    noBlocksText: {
        fontStyle: 'italic',
        color: '#9ca3af',
        padding: 8,
    },
});
