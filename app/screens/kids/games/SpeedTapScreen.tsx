import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { playGameSound } from '../../../utils/audioUtils';
import { ChevronLeft } from 'lucide-react-native';

const SpeedTapScreen = () => {
  const navigation = useNavigation<any>();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const targets = ['🐱', '🐕', '🐦', '🚗'];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameActive(false);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, gameOver]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setGameOver(false);
    setCurrent(0);
  };

  const handleTap = (index: number) => {
    if (!gameActive) return;

    if (index === current) {
      playGameSound('success');
      setScore(s => s + 10);
      setCurrent((c) => (c + 1) % targets.length);
    } else {
      playGameSound('error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Speed Tap</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {!gameActive && !gameOver && (
          <>
            <Text style={styles.instruction}>Tap the correct emoji as fast as you can!</Text>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          </>
        )}

        {(gameActive || gameOver) && (
          <>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Score</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Time</Text>
                <Text style={[styles.statValue, timeLeft < 10 && styles.timeWarning]}>
                  {timeLeft}s
                </Text>
              </View>
            </View>

            {gameActive && (
              <>
                <Text style={styles.targetLabel}>Tap this emoji:</Text>
                <View style={styles.targetBox}>
                  <Text style={styles.targetEmoji}>{targets[current]}</Text>
                </View>

                <View style={styles.optionsGrid}>
                  {targets.map((emoji, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.option,
                        i === current && styles.optionActive,
                      ]}
                      onPress={() => handleTap(i)}
                    >
                      <Text style={styles.optionEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {gameOver && (
              <>
                <View style={styles.gameOverBox}>
                  <Text style={styles.finalScore}>{score}</Text>
                  <Text style={styles.gameOverText}>Final Score</Text>
                </View>
                <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
                  <Text style={styles.playAgainButtonText}>Play Again</Text>
                </TouchableOpacity>
              </>
            )}
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
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  timeWarning: {
    color: '#ef4444',
  },
  targetLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  targetBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  targetEmoji: {
    fontSize: 64,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    gap: 12,
  },
  option: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: '#6366f1',
  },
  optionEmoji: {
    fontSize: 48,
  },
  gameOverBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f97316',
  },
  gameOverText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  playAgainButton: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  playAgainButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});

export default SpeedTapScreen;
