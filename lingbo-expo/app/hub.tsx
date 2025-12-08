import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, BookOpen, Gamepad2, Sparkles } from 'lucide-react-native';
import Layout from '@/components/Layout';
import { useUser } from '@/context/UserContext';
import { KIDS_FLASHCARDS } from '@/constants';
import { generateIgboSpeech } from '@/services/geminiService';
import { playPCMAudio } from '@/utils/audioUtils';

export default function Hub() {
    const router = useRouter();
    const { activeProfile } = useUser();
    const [dailyWord, setDailyWord] = useState(KIDS_FLASHCARDS[0]);
    const [audioLoading, setAudioLoading] = useState(false);

    useEffect(() => {
        const day = new Date().getDate();
        setDailyWord(KIDS_FLASHCARDS[day % KIDS_FLASHCARDS.length]);
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Ụtụtụ ọma (Good Morning)";
        if (hour < 18) return "Ehihie ọma (Good Afternoon)";
        return "Mgbede ọma (Good Evening)";
    };

    const handlePlayWord = async () => {
        if (audioLoading) return;
        setAudioLoading(true);
        try {
            const b64 = await generateIgboSpeech(dailyWord.igbo);
            if (b64) {
                await playPCMAudio(b64);
            }
        } catch (e) {
            console.error("Failed to play audio", e);
        } finally {
            setAudioLoading(false);
        }
    };

    return (
        <Layout title="Lingbo">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Greeting */}
                <View style={styles.greetingSection}>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.welcomeText}>
                        Welcome back, <Text style={styles.nameText}>{activeProfile?.name || 'Learner'}</Text>!
                    </Text>
                </View>

                {/* Daily Word Card */}
                <LinearGradient
                    colors={['#f97316', '#ea580c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dailyWordCard}
                >
                    <View style={styles.sparkleContainer}>
                        <Sparkles size={20} color="rgba(255,255,255,0.5)" />
                    </View>

                    <Text style={styles.dailyWordLabel}>Word of the Day</Text>

                    <View style={styles.dailyWordContent}>
                        <View style={styles.dailyWordTextContainer}>
                            <Text style={styles.dailyWordIgbo}>{dailyWord.igbo}</Text>
                            <Text style={styles.dailyWordEnglish}>{dailyWord.english}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={handlePlayWord}
                            style={styles.playButton}
                            disabled={audioLoading}
                        >
                            {audioLoading ? (
                                <ActivityIndicator color="#f97316" />
                            ) : (
                                <Volume2 size={28} color="#f97316" />
                            )}
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Mode Selection */}
                <Text style={styles.sectionTitle}>Start Learning</Text>

                <View style={styles.modeGrid}>
                    {/* Adult Mode */}
                    <TouchableOpacity
                        onPress={() => router.push('/(adults)')}
                        style={styles.modeCard}
                    >
                        <LinearGradient
                            colors={['#3b82f6', '#1d4ed8']}
                            style={styles.modeCardGradient}
                        >
                            <BookOpen size={48} color="white" />
                            <Text style={styles.modeTitle}>Adult Learning</Text>
                            <Text style={styles.modeSubtitle}>Structured Lessons</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Kids Mode */}
                    <TouchableOpacity
                        onPress={() => router.push('/(kids)')}
                        style={styles.modeCard}
                    >
                        <LinearGradient
                            colors={['#f472b6', '#db2777']}
                            style={styles.modeCardGradient}
                        >
                            <Gamepad2 size={48} color="white" />
                            <Text style={styles.modeTitle}>Kids Corner</Text>
                            <Text style={styles.modeSubtitle}>Fun & Games</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>🔥 {activeProfile?.streak || 0}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>⭐ {activeProfile?.xp || 0}</Text>
                        <Text style={styles.statLabel}>XP</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>📚 Lvl {activeProfile?.level || 1}</Text>
                        <Text style={styles.statLabel}>Level</Text>
                    </View>
                </View>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 32,
        gap: 24,
    },
    greetingSection: {
        marginBottom: 8,
    },
    greeting: {
        fontSize: 14,
        color: '#f97316',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    welcomeText: {
        fontSize: 24,
        color: '#1f2937',
    },
    nameText: {
        fontWeight: 'bold',
    },
    dailyWordCard: {
        borderRadius: 24,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    sparkleContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    dailyWordLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    dailyWordContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dailyWordTextContainer: {
        flex: 1,
    },
    dailyWordIgbo: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    dailyWordEnglish: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
    },
    playButton: {
        width: 64,
        height: 64,
        backgroundColor: 'white',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    modeGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    modeCard: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    modeCardGradient: {
        padding: 24,
        alignItems: 'center',
        gap: 12,
    },
    modeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    modeSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statItem: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
});
