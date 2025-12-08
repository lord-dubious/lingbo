import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LogOut, Trophy, Flame, Star, BookOpen, Target } from 'lucide-react-native';
import Layout from '@/components/Layout';
import { useUser } from '@/context/UserContext';
import { ACHIEVEMENTS } from '@/constants';

export default function ProfilePage() {
    const router = useRouter();
    const { activeProfile, logout } = useUser();

    const handleLogout = () => {
        logout();
        router.replace('/onboarding');
    };

    const unlockedAchievements = activeProfile?.progress?.achievements || [];

    return (
        <Layout title="Profile" showBack>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Avatar & Info */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatar}>{activeProfile?.avatar || '👤'}</Text>
                    </View>
                    <Text style={styles.name}>{activeProfile?.name}</Text>
                    <Text style={styles.joined}>
                        Member since {activeProfile?.joinedDate || new Date().toLocaleDateString()}
                    </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: '#fff7ed' }]}>
                        <Flame size={28} color="#f97316" />
                        <Text style={styles.statValue}>{activeProfile?.streak || 0}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
                        <Star size={28} color="#eab308" />
                        <Text style={styles.statValue}>{activeProfile?.xp || 0}</Text>
                        <Text style={styles.statLabel}>Total XP</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
                        <BookOpen size={28} color="#22c55e" />
                        <Text style={styles.statValue}>Lvl {activeProfile?.level || 1}</Text>
                        <Text style={styles.statLabel}>Level</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
                        <Target size={28} color="#3b82f6" />
                        <Text style={styles.statValue}>
                            {activeProfile?.progress?.completedLessons?.length || 0}
                        </Text>
                        <Text style={styles.statLabel}>Lessons</Text>
                    </View>
                </View>

                {/* Achievements */}
                <View style={styles.achievementsSection}>
                    <View style={styles.sectionHeader}>
                        <Trophy size={20} color="#f97316" />
                        <Text style={styles.sectionTitle}>Achievements</Text>
                    </View>
                    <View style={styles.achievementsGrid}>
                        {ACHIEVEMENTS.slice(0, 6).map((achievement) => {
                            const isUnlocked = unlockedAchievements.includes(achievement.id);
                            return (
                                <View
                                    key={achievement.id}
                                    style={[
                                        styles.achievementItem,
                                        !isUnlocked && styles.achievementLocked
                                    ]}
                                >
                                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                                    <Text style={[
                                        styles.achievementName,
                                        !isUnlocked && styles.achievementNameLocked
                                    ]} numberOfLines={1}>
                                        {achievement.name}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 32,
        gap: 24,
    },
    header: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#fff7ed',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 4,
        borderColor: '#fed7aa',
    },
    avatar: {
        fontSize: 56,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    joined: {
        fontSize: 14,
        color: '#6b7280',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    achievementsSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    achievementItem: {
        width: '30%',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fef3c7',
        borderRadius: 12,
    },
    achievementLocked: {
        backgroundColor: '#f3f4f6',
        opacity: 0.5,
    },
    achievementIcon: {
        fontSize: 32,
        marginBottom: 4,
    },
    achievementName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
    },
    achievementNameLocked: {
        color: '#9ca3af',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        backgroundColor: '#fee2e2',
        borderRadius: 16,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
    },
});
