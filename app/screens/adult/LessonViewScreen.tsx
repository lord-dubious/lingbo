import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ADULT_CURRICULUM } from '../../constants';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { generateIgboSpeech } from '../../services/geminiService';
import { playPCMAudio, playGameSound } from '../../utils/audioUtils';
import { Volume2, ChevronLeft } from 'lucide-react-native';

const LessonViewScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { completeLesson } = useUser();
  const { showToast } = useToast();
  
  const levelId = route.params?.levelId;
  const level = ADULT_CURRICULUM.find(l => l.level_id === levelId);
  
  const [activeTab, setActiveTab] = useState<'vocab' | 'quiz'>('vocab');
  const [quizScore, setQuizScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!level) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Lesson not found</Text>
      </SafeAreaView>
    );
  }

  const vocabLesson = level.lessons?.find(l => l.type === 'vocabulary');
  const quizLesson = level.lessons?.find(l => l.type === 'quiz_section');

  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      playGameSound('success');
      setQuizScore(s => s + 10);
    } else {
      playGameSound('error');
    }
  };

  const finishQuiz = () => {
    if (quizScore >= 20) {
      setIsCompleted(true);
      completeLesson(levelId);
      showToast(`Level ${levelId} Completed! +100 XP`, 'success');
      playGameSound('win');
    } else {
      showToast("Keep practicing to pass!", 'info');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{level.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>{level.description}</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'vocab' && styles.tabActive]}
            onPress={() => setActiveTab('vocab')}
          >
            <Text style={[styles.tabText, activeTab === 'vocab' && styles.tabTextActive]}>
              Vocabulary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'quiz' && styles.tabActive]}
            onPress={() => setActiveTab('quiz')}
          >
            <Text style={[styles.tabText, activeTab === 'quiz' && styles.tabTextActive]}>
              Quiz
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vocabulary Content */}
        {activeTab === 'vocab' && vocabLesson && (
          <View style={styles.content}>
            {vocabLesson.data?.map((item, i) => (
              <View key={i} style={styles.vocabCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.vocabImage}
                />
                <View style={styles.vocabText}>
                  <Text style={styles.vocabEnglish}>{item.english}</Text>
                  <View style={styles.vocabIgboContainer}>
                    <Text style={styles.vocabIgbo}>{item.igbo}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        generateIgboSpeech(item.igbo).then(b64 =>
                          b64 && playPCMAudio(b64)
                        )
                      }
                      style={styles.playButton}
                    >
                      <Volume2 size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quiz Content */}
        {activeTab === 'quiz' && quizLesson && (
          <View style={styles.content}>
            {quizLesson.activities?.map((activity, i) => (
              <View key={i} style={styles.quizItem}>
                <Text style={styles.quizQuestion}>{activity.question}</Text>
                {activity.options?.map((option, j) => (
                  <TouchableOpacity
                    key={j}
                    style={styles.quizOption}
                    onPress={() =>
                      handleQuizAnswer(option === activity.correct_answer)
                    }
                  >
                    <Text style={styles.quizOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            <TouchableOpacity style={styles.finishButton} onPress={finishQuiz}>
              <Text style={styles.finishButtonText}>Submit Quiz ({quizScore} points)</Text>
            </TouchableOpacity>
          </View>
        )}
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#f97316',
    fontWeight: '600',
  },
  content: {
    marginBottom: 20,
  },
  vocabCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vocabImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  vocabText: {
    flex: 1,
  },
  vocabEnglish: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  vocabIgboContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vocabIgbo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizItem: {
    marginBottom: 24,
  },
  quizQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  quizOption: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  quizOptionText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  finishButton: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LessonViewScreen;
