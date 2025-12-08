import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { ADULT_CURRICULUM, FUN_FACTS } from '../../constants';
import { Lock, CheckCircle, Lightbulb } from 'lucide-react-native';

const AdultDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { activeProfile } = useUser();
  const [funFact, setFunFact] = useState(FUN_FACTS[0]);

  useEffect(() => {
    setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  }, []);

  const completedLessons = activeProfile?.progress?.completedLessons || [];

  const renderLevelCard = ({ item, index }: { item: any; index: number }) => {
    const isCompleted = completedLessons.includes(item.level_id);
    const isUnlocked = index === 0 || completedLessons.includes(ADULT_CURRICULUM[index - 1].level_id);

    return (
      <TouchableOpacity
        style={[
          styles.levelCard,
          !isUnlocked && styles.levelCardLocked,
        ]}
        onPress={() => isUnlocked && navigation.navigate('LessonView', { levelId: item.level_id })}
        disabled={!isUnlocked}
      >
        <View style={styles.levelCardContent}>
          <View
            style={[
              styles.levelNumber,
              isCompleted && styles.levelNumberCompleted,
              !isUnlocked && styles.levelNumberLocked,
            ]}
          >
            {isCompleted ? (
              <CheckCircle size={24} color="#10b981" />
            ) : (
              <Text style={styles.levelNumberText}>{item.level_id}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.levelTitle}>{item.title}</Text>
            {item.description && (
              <Text style={styles.levelDescription}>{item.description}</Text>
            )}
          </View>
        </View>
        {!isUnlocked && <Lock size={24} color="#ccc" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Curriculum</Text>
            <Text style={styles.headerSubtitle}>Nnọ, {activeProfile?.name}!</Text>
          </View>
          <Text style={styles.avatar}>{activeProfile?.avatar}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>Level {activeProfile?.level || 1}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{activeProfile?.xp || 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>

        {/* Fun Fact */}
        <View style={styles.funFactCard}>
          <View style={styles.funFactIconContainer}>
            <Lightbulb size={20} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.funFactTitle}>Did You Know?</Text>
            <Text style={styles.funFactText}>{funFact}</Text>
          </View>
        </View>

        {/* Lessons */}
        <Text style={styles.sectionTitle}>Lessons</Text>
        <FlatList
          data={ADULT_CURRICULUM}
          renderItem={renderLevelCard}
          keyExtractor={(item) => item.level_id.toString()}
          scrollEnabled={false}
        />
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
    marginBottom: 20,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  avatar: {
    fontSize: 40,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  funFactCard: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  funFactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#93c5fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  funFactTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  funFactText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  levelCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  levelCardLocked: {
    opacity: 0.6,
    backgroundColor: '#f3f4f6',
  },
  levelCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fed7aa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelNumberCompleted: {
    backgroundColor: '#dcfce7',
  },
  levelNumberLocked: {
    backgroundColor: '#e5e7eb',
  },
  levelNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ea580c',
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  levelDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default AdultDashboardScreen;
