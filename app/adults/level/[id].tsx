import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trophy, Volume2 } from 'lucide-react-native';
import { styled } from 'nativewind';
import Layout from '../../../components/Layout';
import { useUser } from '../../../context/UserContext';
import { ADULT_CURRICULUM } from '../../../constants';
import { playPCMAudio, playGameSound } from '../../../utils/audioUtils';
import { generateIgboSpeech } from '../../../services/geminiService';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

export default function LessonView() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { completeLesson } = useUser();

  const levelId = Number(id);
  const level = ADULT_CURRICULUM.find(l => l.level_id === levelId);

  const [activeTab, setActiveTab] = useState<'vocab' | 'quiz'>('vocab');
  const [quizScore, setQuizScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0); // For pagination if needed, or simple scroll
  const [answeredMap, setAnsweredMap] = useState<Record<number, boolean>>({});

  if (!level) return <StyledText>Level not found</StyledText>;

  const vocabLesson = level.lessons?.find(l => l.type === 'vocabulary');
  const quizLesson = level.lessons?.find(l => l.type === 'quiz_section');

  const handleQuizAnswer = (isCorrect: boolean, index: number) => {
      // Prevent multiple answers
      if (answeredMap[index]) return;

      setAnsweredMap(prev => ({ ...prev, [index]: true }));

      if (isCorrect) {
          playGameSound('success');
          setQuizScore(s => s + 10);
      } else {
          playGameSound('error');
      }
  };

  const finishQuiz = () => {
      // Assuming 20 points is passing for this demo
      if (quizScore >= 20) {
          setIsCompleted(true);
          completeLesson(levelId);
          playGameSound('win');
          Alert.alert("Level Complete!", "O ga - adiri gi mma! +100 XP", [
              { text: "Continue", onPress: () => router.push('/adults') }
          ]);
      } else {
          Alert.alert("Keep Trying", "Score at least 20 points to pass.", [
             { text: "Try Again", onPress: () => {
                 setQuizScore(0);
                 setAnsweredMap({});
             }}
          ]);
      }
  };

  const playAudio = async (text: string) => {
      const b64 = await generateIgboSpeech(text);
      if(b64) playPCMAudio(b64);
  };

  return (
    <Layout title={level.title} showBack backPath="/adults">
       <StyledView className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <StyledText className="text-gray-500 mb-4 text-base">{level.description}</StyledText>
          <StyledView className="flex-row bg-gray-100 p-1 rounded-xl">
             <StyledTouchableOpacity onPress={() => setActiveTab('vocab')} className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'vocab' ? 'bg-white shadow-sm' : ''}`}>
                 <StyledText className={`font-bold text-sm ${activeTab === 'vocab' ? 'text-primary' : 'text-gray-500'}`}>Vocabulary</StyledText>
             </StyledTouchableOpacity>
             <StyledTouchableOpacity onPress={() => setActiveTab('quiz')} className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'quiz' ? 'bg-white shadow-sm' : ''}`}>
                 <StyledText className={`font-bold text-sm ${activeTab === 'quiz' ? 'text-primary' : 'text-gray-500'}`}>Quiz</StyledText>
             </StyledTouchableOpacity>
          </StyledView>
       </StyledView>

       {activeTab === 'vocab' && vocabLesson && (
          <StyledView className="gap-4 pb-8">
             {vocabLesson.data?.map((item, i) => (
                <StyledView key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row items-center gap-4">
                   <StyledImage source={{ uri: item.image }} className="w-16 h-16 rounded-lg bg-gray-200" resizeMode="cover" />
                   <StyledView className="flex-1">
                      <StyledText className="font-bold text-lg text-gray-800">{item.igbo}</StyledText>
                      <StyledText className="text-gray-500 text-sm">{item.english}</StyledText>
                   </StyledView>
                   <StyledTouchableOpacity onPress={() => playAudio(item.igbo)} className="p-3 bg-orange-100 rounded-full">
                       <Volume2 size={20} color="#FF6B00"/>
                   </StyledTouchableOpacity>
                </StyledView>
             ))}
             <StyledTouchableOpacity onPress={() => setActiveTab('quiz')} className="w-full bg-primary py-4 rounded-xl shadow-lg mt-4 items-center">
                 <StyledText className="text-white font-bold text-lg">Take Quiz</StyledText>
             </StyledTouchableOpacity>
          </StyledView>
       )}

       {activeTab === 'quiz' && quizLesson && (
          <StyledView className="gap-6 pb-10">
             <StyledView className="items-center p-4 bg-orange-50 rounded-xl border border-orange-100 flex-row justify-center gap-2">
                 <Trophy size={20} color="#c2410c"/>
                 <StyledText className="font-bold text-orange-700">Quiz Score: {quizScore}</StyledText>
             </StyledView>

             {quizLesson.activities?.map((q, i) => (
                <StyledView key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <StyledText className="font-bold text-gray-800 mb-4 text-base">Q{i+1}: {q.question || q.instruction}</StyledText>

                   {q.quiz_type === 'multiple_choice_3_options' && (
                      <StyledView className="gap-2">
                         {q.options?.map(opt => (
                            <StyledTouchableOpacity
                                key={opt}
                                onPress={() => handleQuizAnswer(opt === q.correct_answer, i)}
                                disabled={answeredMap[i]}
                                className={`w-full p-3 border rounded-lg ${answeredMap[i] && opt === q.correct_answer ? 'bg-green-50 border-green-500' : answeredMap[i] ? 'opacity-50' : 'bg-white border-gray-200 active:bg-blue-50'}`}
                            >
                                <StyledText className={`font-medium ${answeredMap[i] && opt === q.correct_answer ? 'text-green-700' : 'text-gray-700'}`}>{opt}</StyledText>
                            </StyledTouchableOpacity>
                         ))}
                      </StyledView>
                   )}

                   {q.quiz_type === 'match_picture_to_word' && (
                      <StyledView className="flex-row flex-wrap justify-between gap-2">
                         {q.options?.map(opt => (
                            <StyledTouchableOpacity
                                key={opt}
                                onPress={() => handleQuizAnswer(opt === q.correct_answer, i)}
                                disabled={answeredMap[i]}
                                className={`w-[30%] aspect-square border rounded-lg overflow-hidden ${answeredMap[i] && opt === q.correct_answer ? 'border-green-500 border-2' : 'border-gray-200'}`}
                            >
                                <StyledImage source={{ uri: opt }} className="w-full h-full" resizeMode="cover"/>
                            </StyledTouchableOpacity>
                         ))}
                      </StyledView>
                   )}
                </StyledView>
             ))}

             <StyledTouchableOpacity onPress={finishQuiz} className="w-full bg-green-500 py-4 rounded-xl shadow-lg items-center mt-4">
                 <StyledText className="text-white font-bold text-lg">Submit Quiz</StyledText>
             </StyledTouchableOpacity>
          </StyledView>
       )}
    </Layout>
  );
}
