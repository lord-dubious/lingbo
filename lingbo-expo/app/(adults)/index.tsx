import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image
} from 'react-native';
import {
    Lightbulb,
    BookOpen,
    Lock,
    ChevronRight,
    CheckCircle,
    ArrowLeft
} from 'lucide-react-native';
import { useUser } from '@/context/UserContext';
import { ADULT_CURRICULUM, FUN_FACTS } from '@/constants';

export default function AdultDashboard() {
    const router = useRouter();
    const { activeProfile } = useUser();
    const [funFact, setFunFact] = useState(FUN_FACTS[0]);

    useEffect(() => {
        setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
    }, []);

    const completedLessons = activeProfile?.progress?.completedLessons || [];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Curriculum</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Card */}
                <View style={styles.welcomeCard}>
                    <View>
                        <Text style={styles.welcomeName}>Nnọ, {activeProfile?.name || 'Friend'}!</Text>
                        <View style={styles.statsRow}>
                            <Text style={styles.levelText}>Level {activeProfile?.level || 1}</Text>
                            <View style={styles.dot} />
                            <Text style={styles.xpText}>{activeProfile?.xp || 0} XP</Text>
                        </View>
                    </View>
                    <Text style={styles.avatar}>{activeProfile?.avatar}</Text>
                </View>

                {/* Fun Fact */}
                <View style={styles.funFactCard}>
                    <Lightbulb size={24} color="#3b82f6" />
                    <View style={styles.funFactContent}>
                        <Text style={styles.funFactLabel}>Did You Know?</Text>
                        <Text style={styles.funFactText}>{funFact}</Text>
                    </View>
                </View>

                {/* Reference Materials */}
                <View style={styles.referenceCard}>
                    <View style={styles.referenceHeader}>
                        <BookOpen size={20} color="#f97316" />
                        <Text style={styles.referenceTitle}>Reference Materials</Text>
                    </View>
                    <View style={styles.referenceGrid}>
                        <TouchableOpacity
                            onPress={() => router.push('/alphabet')}
                            style={styles.referenceButton}
                        >
                            <View style={[styles.referenceIcon, { backgroundColor: '#f3e8ff' }]}>
                                <Text style={[styles.referenceIconText, { color: '#9333ea' }]}>Ab</Text>
                            </View>
                            <View>
                                <Text style={styles.referenceLabel}>Alphabet</Text>
                                <Text style={styles.referenceSub}>Abidii</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/numbers')}
                            style={styles.referenceButton}
                        >
                            <View style={[styles.referenceIcon, { backgroundColor: '#dbeafe' }]}>
                                <Text style={[styles.referenceIconText, { color: '#2563eb' }]}>123</Text>
                            </View>
                            <View>
                                <Text style={styles.referenceLabel}>Numbers</Text>
                                <Text style={styles.referenceSub}>Onuogugu</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Lessons */}
                <Text style={styles.lessonsTitle}>Lessons</Text>
                {ADULT_CURRICULUM.map((level, index) => {
                    const isCompleted = completedLessons.includes(level.level_id);
                    const isUnlocked = index === 0 || completedLessons.includes(ADULT_CURRICULUM[index - 1].level_id);

                    return (
                        <TouchableOpacity
                            key={level.level_id}
                            onPress={() => isUnlocked && router.push(`/(adults)/level/${level.level_id}` as any)}
                            style={[
                                styles.lessonCard,
                                !isUnlocked && styles.lessonCardLocked
                            ]}
                            activeOpacity={isUnlocked ? 0.7 : 1}
                        >
                            <View style={styles.lessonRow}>
                                <View style={[
                                    styles.lessonNumber,
                                    isCompleted && styles.lessonNumberCompleted,
                                    isUnlocked && !isCompleted && styles.lessonNumberActive,
                                    !isUnlocked && styles.lessonNumberLocked
                                ]}>
                                    {isCompleted ? (
                                        <CheckCircle size={24} color="#16a34a" />
                                    ) : (
                                        <Text style={[
                                            styles.lessonNumberText,
                                            isUnlocked && styles.lessonNumberTextActive,
                                            !isUnlocked && styles.lessonNumberTextLocked
                                        ]}>{level.level_id}</Text>
                                    )}
                                </View>
                                <View style={styles.lessonInfo}>
                                    <Text style={styles.lessonLevel}>LEVEL {level.level_id}</Text>
                                    <Text style={styles.lessonTitle}>{level.title}</Text>
                                    {level.description && (
                                        <Text style={styles.lessonDesc}>{level.description}</Text>
                                    )}
                                </View>
                            </View>
                            {!isUnlocked ? (
                                <Lock size={24} color="#d1d5db" />
                            ) : (
                                <ChevronRight size={24} color="#f97316" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
        gap: 16,
    },
    welcomeCard: {
        backgroundColor: '#fff7ed',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fed7aa',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    levelText: {
        fontSize: 14,
        color: '#4b5563',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#9ca3af',
    },
    xpText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f97316',
    },
    avatar: {
        fontSize: 40,
    },
    funFactCard: {
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#bfdbfe',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    funFactContent: {
        flex: 1,
    },
    funFactLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1d4ed8',
        marginBottom: 4,
    },
    funFactText: {
        fontSize: 14,
        color: '#1e3a8a',
        lineHeight: 20,
    },
    referenceCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    referenceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    referenceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    referenceGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    referenceButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
    },
    referenceIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    referenceIconText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    referenceLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    referenceSub: {
        fontSize: 12,
        color: '#6b7280',
    },
    lessonsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 8,
    },
    lessonCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#f3f4f6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lessonCardLocked: {
        backgroundColor: '#f9fafb',
        opacity: 0.6,
    },
    lessonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        flex: 1,
    },
    lessonNumber: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lessonNumberCompleted: {
        backgroundColor: '#dcfce7',
    },
    lessonNumberActive: {
        backgroundColor: '#ffedd5',
    },
    lessonNumberLocked: {
        backgroundColor: '#e5e7eb',
    },
    lessonNumberText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    lessonNumberTextActive: {
        color: '#ea580c',
    },
    lessonNumberTextLocked: {
        color: '#6b7280',
    },
    lessonInfo: {
        flex: 1,
    },
    lessonLevel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#9ca3af',
        letterSpacing: 1,
    },
    lessonTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    lessonDesc: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
});
