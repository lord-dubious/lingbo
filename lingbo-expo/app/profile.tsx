import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ArrowLeft, User, LogOut, Info } from 'lucide-react-native';
import { useUser } from '@/context/UserContext';

export default function ProfilePage() {
    const router = useRouter();
    const { activeProfile, logout } = useUser();

    const handleLogout = () => {
        logout();
        router.replace('/onboarding');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.content}>
                {/* Avatar & Name */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatar}>{activeProfile?.avatar || '👤'}</Text>
                    </View>
                    <Text style={styles.name}>{activeProfile?.name}</Text>
                    <Text style={styles.joined}>Joined {activeProfile?.joinedDate}</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>🔥 {activeProfile?.streak || 0}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>⭐ {activeProfile?.xp || 0}</Text>
                        <Text style={styles.statLabel}>XP</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>📚 {activeProfile?.level || 1}</Text>
                        <Text style={styles.statLabel}>Level</Text>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
    backButton: { width: 44, height: 44, backgroundColor: 'white', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
    content: { flex: 1, padding: 24, gap: 24 },
    avatarSection: { alignItems: 'center', marginBottom: 16 },
    avatarContainer: { width: 100, height: 100, backgroundColor: '#fff7ed', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    avatar: { fontSize: 56 },
    name: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
    joined: { fontSize: 14, color: '#6b7280' },
    statsRow: { flexDirection: 'row', gap: 12 },
    statCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 16, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#6b7280' },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, backgroundColor: '#fee2e2', borderRadius: 16, marginTop: 'auto' },
    logoutText: { fontSize: 16, fontWeight: 'bold', color: '#ef4444' },
});
