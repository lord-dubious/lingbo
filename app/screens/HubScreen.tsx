import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import {
  BookOpen,
  Gamepad2,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react-native';

const HubScreen = () => {
  const { activeProfile, logout, switchProfile, profiles } = useUser();
  const navigation = useNavigation<any>();

  const menuItems = [
    {
      title: 'Curriculum',
      description: 'Learn Igbo vocabulary and grammar',
      icon: BookOpen,
      color: '#3b82f6',
      onPress: () => navigation.navigate('Adults'),
    },
    {
      title: 'Practice',
      description: 'Chat, speak, and improve pronunciation',
      icon: Zap,
      color: '#f97316',
      onPress: () => navigation.navigate('Practice'),
    },
    {
      title: 'Resources',
      description: 'Books, videos, and references',
      icon: Settings,
      color: '#8b5cf6',
      onPress: () => navigation.navigate('MediaLibrary'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {activeProfile?.name}!</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>Level {activeProfile?.level || 1}</Text>
              <Text style={styles.statDot}>•</Text>
              <Text style={styles.statText}>{activeProfile?.xp || 0} XP</Text>
            </View>
          </View>
          <Text style={styles.avatar}>{activeProfile?.avatar || '👤'}</Text>
        </View>

        {/* Menu Grid */}
        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <item.icon size={28} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile Selector */}
        {profiles.length > 1 && (
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Switch Profile</Text>
            <View style={styles.profilesList}>
              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={[
                    styles.profileOption,
                    activeProfile?.id === profile.id && styles.profileOptionActive,
                  ]}
                  onPress={() => switchProfile(profile.id)}
                >
                  <Text style={styles.profileAvatar}>{profile.avatar}</Text>
                  <Text
                    style={[
                      styles.profileName,
                      activeProfile?.id === profile.id && styles.profileNameActive,
                    ]}
                  >
                    {profile.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <LogOut size={18} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statDot: {
    marginHorizontal: 8,
    color: '#ccc',
  },
  avatar: {
    fontSize: 48,
  },
  menu: {
    marginBottom: 32,
  },
  menuItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: '#999',
  },
  profileSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  profilesList: {
    flexDirection: 'row',
  },
  profileOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  profileOptionActive: {
    backgroundColor: '#fef2f2',
  },
  profileAvatar: {
    fontSize: 32,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  profileNameActive: {
    color: '#f97316',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HubScreen;
