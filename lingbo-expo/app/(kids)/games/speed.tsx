import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Dimensions
} from 'react-native';
import { ArrowLeft, Timer, Trophy } from 'lucide-react-native';
import { KIDS_FLASHCARDS } from '@/constants';
import { playGameSound } from '@/utils/audioUtils';

const { width } = Dimensions.get('window');

export default function SpeedTap() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [currentQuestion, setCurrentQuestion] = useState(KIDS_FLASHCARDS[0]);
    const [options, setOptions] = useState<typeof KIDS_FLASHCARDS>([]);
    const [gameOver, setGameOver] = useState(false);
    const [shake, setShake] = useState(false);

    const generateRound = useCallback(() => {
        const target = KIDS_FLASHCARDS[Math.floor(Math.random() * KIDS_FLASHCARDS.length)];
        let opts = [target];
        while (opts.length < 4) {
            const r = KIDS_FLASHCARDS[Math.floor(Math.random() * KIDS_FLASHCARDS.length)];
            if (!opts.find(o => o.igbo === r.igbo)) opts.push(r);
        }
        setOptions(opts.sort(() => Math.random() - 0.5));
        setCurrentQuestion(target);
    }, []);

    useEffect(() => {
        generateRound();
    }, [generateRound]);

    useEffect(() => {
        if (timeLeft > 0 && !gameOver) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setGameOver(true);
            playGameSound('win');
        }
    }, [timeLeft, gameOver]);

    const handleTap = (item: typeof KIDS_FLASHCARDS[0]) => {
        if (item.igbo === currentQuestion.igbo) {
            setScore(s => s + 10);
            playGameSound('success');
            generateRound();
        } else {
            setScore(s => Math.max(0, s - 5));
            playGameSound('error');
            setShake(true);
            setTimeout(() => setShake(false), 400);
        }
    };

    const restart = () => {
        setScore(0);
        setTimeLeft(30);
        setGameOver(false);
        generateRound();
    };

    if (gameOver) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.gameOverContent}>
                    <View style={styles.trophyContainer}>
                        <Trophy size={48} color="#7c3aed" />
                    </View>
                    <Text style={styles.gameOverTitle}>Time's Up!</Text>
                    <Text style={styles.gameOverSubtitle}>You scored</Text>
                    <Text style={styles.finalScore}>{score}</Text>
                    <TouchableOpacity onPress={restart} style={styles.playAgainButton}>
                        <Text style={styles.playAgainText}>Play Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                        <Text style={styles.backLinkText}>Back to Games</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Speed Tap</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.timerContainer}>
                    <Timer size={18} color="#6b7280" />
                    <Text style={styles.timerText}>{timeLeft}s</Text>
                </View>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${(timeLeft / 30) * 100}%`,
                                backgroundColor: timeLeft < 10 ? '#ef4444' : '#8b5cf6'
                            }
                        ]}
                    />
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>{score}</Text>
                </View>
            </View>

            {/* Target Word */}
            <View style={[styles.targetContainer, shake && styles.shake]}>
                <Text style={styles.targetLabel}>TAP THE PICTURE FOR</Text>
                <View style={styles.targetCard}>
                    <Text style={styles.targetWord}>{currentQuestion.igbo}</Text>
                </View>
            </View>

            {/* Options Grid */}
            <View style={styles.optionsGrid}>
                {options.map((opt, i) => (
                    <TouchableOpacity
                        key={i}
                        onPress={() => handleTap(opt)}
                        style={styles.optionCard}
                        activeOpacity={0.9}
                    >
                        <Image
                            source={{ uri: opt.image }}
                            style={styles.optionImage}
                            resizeMode="contain"
                        />
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 16,
        gap: 12,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    timerText: {
        fontWeight: 'bold',
        color: '#6b7280',
    },
    progressBar: {
        flex: 1,
        height: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
    scoreContainer: {
        backgroundColor: '#f3e8ff',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9d5ff',
    },
    scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7c3aed',
    },
    targetContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    shake: {
        transform: [{ translateX: 4 }],
    },
    targetLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: 2,
        marginBottom: 8,
    },
    targetCard: {
        backgroundColor: 'white',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 24,
        borderBottomWidth: 4,
        borderBottomColor: '#e5e7eb',
    },
    targetWord: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    optionsGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 16,
        paddingBottom: 24,
    },
    optionCard: {
        width: (width - 48) / 2,
        aspectRatio: 1,
        backgroundColor: 'white',
        borderRadius: 24,
        borderBottomWidth: 6,
        borderBottomColor: '#e5e7eb',
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionImage: {
        width: '100%',
        height: '100%',
    },
    // Game Over styles
    gameOverContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    trophyContainer: {
        width: 96,
        height: 96,
        backgroundColor: '#f3e8ff',
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    gameOverTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#7c3aed',
        marginBottom: 8,
    },
    gameOverSubtitle: {
        fontSize: 16,
        color: '#9ca3af',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    finalScore: {
        fontSize: 72,
        fontWeight: '900',
        color: '#1f2937',
        marginBottom: 32,
    },
    playAgainButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 32,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
    },
    playAgainText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    backLink: {
        padding: 12,
    },
    backLinkText: {
        color: '#6b7280',
        fontWeight: 'bold',
    },
});
