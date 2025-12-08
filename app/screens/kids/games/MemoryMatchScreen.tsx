import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MEMORY_GAME_DATA } from '../../../constants';
import { playGameSound } from '../../../utils/audioUtils';
import { ChevronLeft } from 'lucide-react-native';

const MemoryMatchScreen = () => {
  const navigation = useNavigation<any>();
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...MEMORY_GAME_DATA].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
  };

  const handleCardPress = (index: number) => {
    if (flipped.includes(index) || matched.includes(cards[index]?.matchId)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    playGameSound('click');

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first]?.matchId === cards[second]?.matchId) {
        playGameSound('success');
        setMatched([...matched, cards[first]?.matchId]);
        setFlipped([]);
      } else {
        playGameSound('error');
        setTimeout(() => setFlipped([]), 600);
      }
    }
  };

  const renderCard = ({ item, index }: { item: any; index: number }) => {
    const isFlipped = flipped.includes(index);
    const isMatched = matched.includes(item.matchId);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isMatched && styles.cardMatched,
        ]}
        onPress={() => handleCardPress(index)}
        disabled={isMatched}
      >
        {isFlipped || isMatched ? (
          <Text style={styles.cardContent}>{item.content}</Text>
        ) : (
          <Text style={styles.cardBack}>?</Text>
        )}
      </TouchableOpacity>
    );
  };

  const allMatched = matched.length === MEMORY_GAME_DATA.length / 2;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Memory Match</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(_, i) => i.toString()}
          numColumns={4}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
        />

        {allMatched && (
          <>
            <View style={styles.celebrationBox}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.celebrationText}>You Won!</Text>
            </View>
            <TouchableOpacity style={styles.restartButton} onPress={initializeGame}>
              <Text style={styles.restartButtonText}>Play Again</Text>
            </TouchableOpacity>
          </>
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
    padding: 12,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMatched: {
    opacity: 0.5,
  },
  cardBack: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  celebrationBox: {
    alignItems: 'center',
    marginTop: 24,
  },
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  restartButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  restartButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MemoryMatchScreen;
