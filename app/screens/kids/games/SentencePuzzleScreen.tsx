import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { playGameSound } from '../../../utils/audioUtils';
import { ChevronLeft } from 'lucide-react-native';

const SentencePuzzleScreen = () => {
  const navigation = useNavigation<any>();
  const [gameWon, setGameWon] = useState(false);

  const exampleSentence = "Nkịta na-eri nri";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sentence Puzzle</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>Arrange the words to form the sentence</Text>
        <View style={styles.sentenceBox}>
          <Text style={styles.sentence}>{exampleSentence}</Text>
        </View>

        <View style={styles.blocksContainer}>
          <TouchableOpacity style={styles.block}>
            <Text style={styles.blockText}>Nkịta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.block}>
            <Text style={styles.blockText}>na-eri</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.block}>
            <Text style={styles.blockText}>nri</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => {
            setGameWon(true);
            playGameSound('win');
          }}
        >
          <Text style={styles.checkButtonText}>Check Answer</Text>
        </TouchableOpacity>

        {gameWon && (
          <View style={styles.celebrationBox}>
            <Text style={styles.celebrationText}>🎉 Correct! 🎉</Text>
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  sentenceBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    minHeight: 80,
    justifyContent: 'center',
  },
  sentence: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f97316',
    textAlign: 'center',
  },
  blocksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  block: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  blockText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  checkButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  celebrationBox: {
    marginTop: 24,
    alignItems: 'center',
  },
  celebrationText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
});

export default SentencePuzzleScreen;
