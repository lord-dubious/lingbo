import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { BarChart3, Zap, Calendar, LogOut } from 'lucide-react-native';

const ProfilePageScreen = () => {
  const { activeProfile, logout, deleteProfile } = useUser();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();

  const handleDeleteProfile = () => {
    if (activeProfile) {
      deleteProfile(activeProfile.id);
      showToast('Profile deleted', 'success');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Text style={styles.avatar}>{activeProfile?.avatar}</Text>
          <Text style={styles.name}>{activeProfile?.name}</Text>
          <Text style={styles.type}>
            {activeProfile?.type === 'kid' ? '👧 Kid Learner' : '👨‍🎓 Adult Learner'}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <BarChart3 size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{activeProfile?.level || 1}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statCard}>
            <Zap size={24} color="#f97316" />
            <Text style={styles.statValue}>{activeProfile?.xp || 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={24} color="#10b981" />
            <Text style={styles.statValue}>{activeProfile?.streak || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievements}>
            <View style={styles.achievement}>
              <Text style={styles.achievementEmoji}>👋</Text>
              <Text style={styles.achievementText}>First Steps</Text>
            </View>
            <View style={styles.achievement}>
              <Text style={styles.achievementEmoji}>🔥</Text>
              <Text style={styles.achievementText}>On Fire</Text>
            </View>
            <View style={styles.achievement}>
              <Text style={styles.achievementEmoji}>🏆</Text>
              <Text style={styles.achievementText}>Champion</Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Completed Lessons</Text>
              <Text style={styles.progressValue}>
                {activeProfile?.progress?.completedLessons?.length || 0}
              </Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Games Played</Text>
              <Text style={styles.progressValue}>
                {Object.keys(activeProfile?.progress?.gameScores || {}).length}
              </Text>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Tutorials Seen</Text>
              <Text style={styles.progressValue}>
                {activeProfile?.progress?.tutorialsSeen?.length || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <LogOut size={18} color="#fff" />
          <Text style={styles.logoutButtonText}>Switch Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteProfile}
        >
          <Text style={styles.deleteButtonText}>Delete Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  avatar: {
    fontSize: 64,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  achievements: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  achievement: {
    flex: 1,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  achievementText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ProfilePageScreen;
