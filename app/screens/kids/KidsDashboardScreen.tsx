import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import {
  ImageIcon,
  Gamepad2,
  Pencil,
  Type,
  Hash,
  PlayCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2;

const KidsDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { activeProfile } = useUser();

  const menu = [
    {
      label: "Words",
      sub: "Flashcards",
      icon: ImageIcon,
      bg: "#ec4899",
      path: "WordFlash",
    },
    {
      label: "Games",
      sub: "Play Time",
      icon: Gamepad2,
      bg: "#3b82f6",
      path: "KidsGameMenu",
    },
    {
      label: "Write",
      sub: "Trace Book",
      icon: Pencil,
      bg: "#f97316",
      path: "TraceBook",
    },
    {
      label: "ABC",
      sub: "Alphabet",
      icon: Type,
      bg: "#10b981",
      path: "AlphabetBoard",
    },
    {
      label: "123",
      sub: "Numbers",
      icon: Hash,
      bg: "#eab308",
      path: "NumbersBoard",
    },
    {
      label: "Watch",
      sub: "Videos",
      icon: PlayCircle,
      bg: "#ef4444",
      path: "MediaLibrary",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Big Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingAvatar}>{activeProfile?.avatar || '🐻'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>Hi, {activeProfile?.name}!</Text>
            <Text style={styles.greetingSubtext}>What do you want to do?</Text>
          </View>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {menu.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, { backgroundColor: item.bg }]}
              onPress={() => navigation.navigate(item.path)}
            >
              <item.icon size={48} color="#fff" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 24,
  },
  greetingAvatar: {
    fontSize: 48,
    marginRight: 16,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: itemWidth,
    aspectRatio: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  menuSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default KidsDashboardScreen;
