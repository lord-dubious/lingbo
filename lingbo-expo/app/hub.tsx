import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import {
    Settings,
    Calendar,
    Sparkles,
    Volume2,
    GraduationCap,
    ChevronRight,
    Smile
} from 'lucide-react-native';
import { KIDS_FLASHCARDS } from '@/constants';
import { ProfileType } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';

export default function Hub() {
    const router = useRouter();
    const [dailyWord, setDailyWord] = useState(KIDS_FLASHCARDS[0]);
    const [audioLoading, setAudioLoading] = useState(false);

    useEffect(() => {
        const day = new Date().getDate();
        setDailyWord(KIDS_FLASHCARDS[day % KIDS_FLASHCARDS.length]);
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Ututu ọma (Good Morning)";
        if (hour < 18) return "Ehihie ọma (Good Afternoon)";
        return "Mgbede ọma (Good Evening)";
    };

    const handlePlayWord = async () => {
        if (audioLoading) return;
        setAudioLoading(true);
        // TODO: Implement audio playback with expo-av
        setTimeout(() => setAudioLoading(false), 1000);
    };

    const handleSelectMode = (type: ProfileType) => {
        if (type === 'adult') {
            router.push('/(adults)');
        } else {
            router.push('/(kids)');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoEmoji}>📚</Text>
                        <Text style={styles.logoText}>Lingbo</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        style={styles.settingsButton}
                    >
                        <Settings size={20} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                {/* Greeting */}
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingTitle}>{getGreeting()}</Text>
                    <Text style={styles.greetingSubtitle}>Let's learn something new today.</Text>
                </View>

                {/* Daily Word Card */}
                <View style={styles.dailyWordCard}>
                    <LinearGradient
                        colors={['#f97316', '#ec4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.dailyWordGradient}
                    >
                        <View style={styles.sparklesContainer}>
                            <Sparkles size={120} color="rgba(255,255,255,0.1)" />
                        </View>
                        <View style={styles.dailyWordContent}>
                            <View style={styles.dailyWordLeft}>
                                <View style={styles.dailyWordLabel}>
                                    <View style={styles.calendarIcon}>
                                        <Calendar size={16} color="white" />
                                    </View>
                                    <Text style={styles.dailyWordLabelText}>DAILY WORD</Text>
                                </View>
                                <Text style={styles.dailyWordIgbo}>{dailyWord.igbo}</Text>
                                <Text style={styles.dailyWordEnglish}>{dailyWord.english}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={handlePlayWord}
                                style={styles.playButton}
                                disabled={audioLoading}
                            >
                                {audioLoading ? (
                                    <ActivityIndicator size="small" color="#f97316" />
                                ) : (
                                    <Volume2 size={28} color="#f97316" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

                {/* Mode Selection */}
                <View style={styles.modeGrid}>
                    {/* Adult Learning */}
                    <TouchableOpacity
                        onPress={() => handleSelectMode('adult')}
                        style={styles.modeCard}
                        activeOpacity={0.8}
                    >
                        <View style={styles.modeCardInner}>
                            <View style={styles.modeCardHeader}>
                                <View style={styles.modeIconContainer}>
                                    <GraduationCap size={24} color="#f97316" />
                                </View>
                                <View style={styles.chevronContainer}>
                                    <ChevronRight size={16} color="#6b7280" />
                                </View>
                            </View>
                            <Text style={styles.modeTitle}>Adult Learning</Text>
                            <Text style={styles.modeDescription}>
                                Structured lessons, grammar rules, and cultural deep dives.
                            </Text>
                            <View style={styles.avatarStack}>
                                <View style={[styles.avatar, { backgroundColor: '#d1d5db' }]} />
                                <View style={[styles.avatar, { backgroundColor: '#9ca3af', marginLeft: -8 }]} />
                                <View style={[styles.avatar, styles.avatarCount, { marginLeft: -8 }]}>
                                    <Text style={styles.avatarCountText}>+3</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Kids Corner */}
                    <TouchableOpacity
                        onPress={() => handleSelectMode('kid')}
                        style={styles.modeCard}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.modeCardInner, styles.modeCardKids]}>
                            <View style={styles.modeCardHeader}>
                                <View style={[styles.modeIconContainer, { backgroundColor: 'white' }]}>
                                    <Smile size={24} color="#eab308" />
                                </View>
                                <View style={[styles.chevronContainer, styles.chevronKids]}>
                                    <ChevronRight size={16} color="#a16207" />
                                </View>
                            </View>
                            <Text style={styles.modeTitle}>Kids Corner</Text>
                            <Text style={styles.modeDescription}>
                                Interactive games, tracing books, and stories for children.
                            </Text>
                            <View style={styles.tagContainer}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>Games</Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>Stories</Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>ABC</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoEmoji: {
        fontSize: 28,
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        letterSpacing: -0.5,
    },
    settingsButton: {
        width: 40,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    greetingContainer: {
        marginBottom: 24,
    },
    greetingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    greetingSubtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    dailyWordCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    dailyWordGradient: {
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    sparklesContainer: {
        position: 'absolute',
        top: -20,
        right: -20,
    },
    dailyWordContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dailyWordLeft: {
        flex: 1,
    },
    dailyWordLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    calendarIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 6,
        borderRadius: 8,
    },
    dailyWordLabelText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    dailyWordIgbo: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    dailyWordEnglish: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.9)',
    },
    playButton: {
        width: 56,
        height: 56,
        backgroundColor: 'white',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    modeGrid: {
        gap: 16,
    },
    modeCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    modeCardInner: {
        backgroundColor: '#f9fafb',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'white',
    },
    modeCardKids: {
        backgroundColor: 'rgba(254, 249, 195, 0.5)',
    },
    modeCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    modeIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: 'white',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    chevronContainer: {
        backgroundColor: '#e5e7eb',
        padding: 6,
        borderRadius: 12,
    },
    chevronKids: {
        backgroundColor: '#fde68a',
    },
    modeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    modeDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
        marginBottom: 16,
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'white',
    },
    avatarCount: {
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCountText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    tagContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    tagText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9ca3af',
    },
});
