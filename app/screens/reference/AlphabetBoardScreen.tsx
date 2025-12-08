import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IGBO_ALPHABET_FULL } from '../../constants';
import { generateIgboSpeech } from '../../services/geminiService';
import { playPCMAudio } from '../../utils/audioUtils';
import { Volume2, ChevronLeft } from 'lucide-react-native';

const AlphabetBoardScreen = () => {
  const navigation = useNavigation<any>();

  const renderLetter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.letterCard}
      onPress={() =>
        generateIgboSpeech(item).then(b64 => b64 && playPCMAudio(b64))
      }
    >
      <Text style={styles.letter}>{item}</Text>
      <Volume2 size={16} color="#f97316" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Igbo Alphabet</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={IGBO_ALPHABET_FULL}
        renderItem={renderLetter}
        keyExtractor={(item) => item}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.scrollContent}
      />
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
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  letterCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
});

export default AlphabetBoardScreen;
