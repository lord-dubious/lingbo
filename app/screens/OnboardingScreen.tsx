import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { ProfileType } from '../types';

const OnboardingScreen = () => {
  const { addProfile } = useUser();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<ProfileType | null>(null);

  const handleCreateProfile = () => {
    if (name.trim() && selectedType) {
      addProfile(name.trim(), selectedType);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to LingBo</Text>
            <Text style={styles.subtitle}>Learn Igbo Language</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Choose Your Role</Text>

            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedType === 'adult' && styles.roleCardSelected,
              ]}
              onPress={() => setSelectedType('adult')}
            >
              <Text style={styles.roleEmoji}>👨‍🎓</Text>
              <Text style={styles.roleTitle}>Adult Learner</Text>
              <Text style={styles.roleDescription}>
                Follow a structured curriculum with vocabulary, quizzes, and AI tutoring
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleCard,
                selectedType === 'kid' && styles.roleCardSelected,
              ]}
              onPress={() => setSelectedType('kid')}
            >
              <Text style={styles.roleEmoji}>👧</Text>
              <Text style={styles.roleTitle}>Kid Learner</Text>
              <Text style={styles.roleDescription}>
                Play games, trace letters, and learn through fun activities
              </Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={[
                styles.createButton,
                (!name.trim() || !selectedType) && styles.createButtonDisabled,
              ]}
              onPress={handleCreateProfile}
              disabled={!name.trim() || !selectedType}
            >
              <Text style={styles.createButtonText}>Create Profile</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 20,
  },
  roleCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  roleCardSelected: {
    backgroundColor: '#fef2f2',
    borderColor: '#f97316',
    borderWidth: 2,
  },
  roleEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#1f2937',
  },
  createButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
