import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Puzzle,
  Sparkles,
  Timer,
  ImageIcon,
  ChevronLeft,
} from 'lucide-react-native';

const KidsGameMenuScreen = () => {
  const navigation = useNavigation<any>();

  const games = [
    {
      title: "Word Flash",
      icon: ImageIcon,
      color: "#ec4899",
      path: "WordFlash",
    },
    {
      title: "Sentence Puzzle",
      icon: Puzzle,
      color: "#f97316",
      path: "SentencePuzzle",
    },
    {
      title: "Memory Match",
      icon: Sparkles,
      color: "#06b6d4",
      path: "MemoryMatch",
    },
    {
      title: "Speed Tap",
      icon: Timer,
      color: "#6366f1",
      path: "SpeedTap",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Games</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {games.map((game, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.gameCard, { backgroundColor: game.color }]}
            onPress={() => navigation.navigate(game.path)}
          >
            <View style={styles.gameIconContainer}>
              <game.icon size={32} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameTapText}>Tap to play!</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollContent: {
    padding: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  gameIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  gameTapText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
});

export default KidsGameMenuScreen;
