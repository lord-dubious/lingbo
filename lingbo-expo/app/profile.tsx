import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Modal,
    TextInput
} from 'react-native';
import { LogOut, Trophy, Flame, Star, BookOpen, Target, Edit2, X } from 'lucide-react-native';
import Layout from '@/components/Layout';
import { useUser } from '@/context/UserContext';
import { ACHIEVEMENTS, AVATAR_OPTIONS } from '@/constants';

// Avatar options for kids to pick from
const avatars = ['🐻', '🦊', '🐰', '🐸', '🐼', '🦁', '🐶', '🐱', '🦄', '🐲', '🎭', '👑'];

export default function ProfilePage() {
    const router = useRouter();
    const { activeProfile, logout, updateProfile } = useUser();
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState(activeProfile?.name || '');

    const handleLogout = () => {
        logout();
        router.replace('/onboarding');
    };

    const handleAvatarSelect = (avatar: string) => {
        if (activeProfile && updateProfile) {
            updateProfile(activeProfile.id, { avatar });
        }
        setShowAvatarPicker(false);
    };

    const handleNameSave = () => {
        if (activeProfile && updateProfile && newName.trim()) {
            updateProfile(activeProfile.id, { name: newName.trim() });
        }
        setEditingName(false);
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
                    <TouchableOpacity
                        onPress={() => setShowAvatarPicker(true)}
                        style={styles.avatarContainer}
                    >
                        <Text style={styles.avatar}>{activeProfile?.avatar || '👤'}</Text>
                        <View style={styles.editBadge}>
                            <Edit2 size={12} color="white" />
                        </View>
                    </TouchableOpacity>

                    {editingName ? (
                        <View style={styles.nameEditRow}>
                            <TextInput
                                value={newName}
                                onChangeText={setNewName}
                                style={styles.nameInput}
                                autoFocus
                                onSubmitEditing={handleNameSave}
                            />
                            <TouchableOpacity onPress={handleNameSave} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => setEditingName(true)}>
                            <Text style={styles.name}>{activeProfile?.name}</Text>
                        </TouchableOpacity>
                    )}

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

            {/* Avatar Picker Modal */}
            <Modal
                visible={showAvatarPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAvatarPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Your Avatar</Text>
                            <TouchableOpacity onPress={() => setShowAvatarPicker(false)}>
                                <X size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.avatarGrid}>
                            {avatars.map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    onPress={() => handleAvatarSelect(emoji)}
                                    style={[
                                        styles.avatarOption,
                                        activeProfile?.avatar === emoji && styles.avatarOptionSelected
                                    ]}
                                >
                                    <Text style={styles.avatarEmoji}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
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
        position: 'relative',
    },
    avatar: {
        fontSize: 56,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#f97316',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    nameEditRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    nameInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        minWidth: 150,
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#22c55e',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
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
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 360,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    avatarOption: {
        width: 64,
        height: 64,
        backgroundColor: '#f3f4f6',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
    },
    avatarOptionSelected: {
        borderColor: '#f97316',
        backgroundColor: '#fff7ed',
    },
    avatarEmoji: {
        fontSize: 36,
    },
});
