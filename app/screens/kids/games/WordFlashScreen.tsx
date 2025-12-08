import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { KIDS_FLASHCARDS } from '../../../constants';
import { generateIgboSpeech } from '../../../services/geminiService';
import { playPCMAudio, playGameSound } from '../../../utils/audioUtils';
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react-native';

const WordFlashScreen = () => {
  const navigation = useNavigation<any>();
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = KIDS_FLASHCARDS[currentCard];

  useEffect(() => {
    setIsFlipped(false);
  }, [currentCard]);

  const next = () => {
    playGameSound('click');
    setCurrentCard((p) => (p + 1) % KIDS_FLASHCARDS.length);
  };

  const prev = () => {
    playGameSound('click');
    setCurrentCard((p) => (p - 1 + KIDS_FLASHCARDS.length) % KIDS_FLASHCARDS.length);
  };

  const toggleFlip = () => {
    playGameSound('flip');
    setIsFlipped(!isFlipped);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Word Flash</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Card */}
        <TouchableOpacity
          style={[styles.card, isFlipped && styles.cardFlipped]}
          onPress={toggleFlip}
        >
          {!isFlipped ? (
            <View style={styles.cardFront}>
              <Image source={{ uri: card.image }} style={styles.cardImage} />
              <Text style={styles.tapHint}>Tap to reveal</Text>
            </View>
          ) : (
            <View style={styles.cardBack}>
              <Text style={styles.cardIgbo}>{card.igbo}</Text>
              <Text style={styles.cardEnglish}>{card.english}</Text>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() =>
                  generateIgboSpeech(card.igbo).then(b64 => b64 && playPCMAudio(b64))
                }
              >
                <Volume2 size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressContainer}>
          {KIDS_FLASHCARDS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === currentCard && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navButton} onPress={prev}>
            <ChevronLeft size={32} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, styles.navButtonActive]} onPress={next}>
            <ChevronRight size={32} color="#fff" />
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  cardFlipped: {
    backgroundColor: '#3b82f6',
  },
  cardFront: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cardImage: {
    width: '80%',
    height: '70%',
    borderRadius: 12,
    marginBottom: 16,
  },
  tapHint: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '600',
  },
  cardBack: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIgbo: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  cardEnglish: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 24,
    fontWeight: '500',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#3b82f6',
  },
  navigation: {
    flexDirection: 'row',
    gap: 16,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonActive: {
    backgroundColor: '#3b82f6',
  },
});

export default WordFlashScreen;
