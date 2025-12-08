import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Lightbulb, BookOpen, Lock, ChevronRight, CheckCircle, Trophy, Volume2 } from 'lucide-react-native';
import { styled } from 'nativewind';
import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';
import { ADULT_CURRICULUM, FUN_FACTS } from '../../constants';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function AdultDashboard() {
  const router = useRouter();
  const { activeProfile } = useUser();
  const [funFact, setFunFact] = useState(FUN_FACTS[0]);

  useEffect(() => {
    setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  }, []);

  const completedLessons = activeProfile?.progress?.completedLessons || [];

  return (
    <Layout title="Curriculum" showBack backPath="/hub">
      <StyledView className="space-y-6">
        <StyledView className="flex-row items-center justify-between bg-orange-50 p-6 rounded-2xl border border-orange-100">
           <StyledView>
              <StyledText className="text-2xl font-bold text-gray-800 mb-1">Nnọ, {activeProfile?.name || 'Friend'}!</StyledText>
              <StyledView className="flex-row items-center gap-2">
                 <StyledText className="text-gray-600 text-sm">Level {activeProfile?.level || 1}</StyledText>
                 <StyledView className="w-1 h-1 rounded-full bg-gray-400"></StyledView>
                 <StyledText className="text-primary font-bold text-sm">{activeProfile?.xp || 0} XP</StyledText>
              </StyledView>
           </StyledView>
           <StyledText className="text-4xl">{activeProfile?.avatar}</StyledText>
        </StyledView>

        <StyledView className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex-row items-start gap-3">
           <Lightbulb size={24} color="#3b82f6" className="mt-1" />
           <StyledView className="flex-1">
              <StyledText className="font-bold text-blue-700 text-sm mb-1">Did You Know?</StyledText>
              <StyledText className="text-blue-900 text-sm leading-6">{funFact}</StyledText>
           </StyledView>
        </StyledView>

        <StyledView className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <StyledText className="font-bold text-gray-800 mb-4 flex-row items-center gap-2">
               <BookOpen size={20} color="#FF6B00"/>
               <StyledText> Reference Materials</StyledText>
           </StyledText>
           <StyledView className="flex-row gap-4">
              <StyledTouchableOpacity onPress={() => router.push('/alphabet')} className="flex-1 flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 active:bg-gray-100">
                 <StyledView className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center">
                    <StyledText className="text-purple-600 font-bold">Ab</StyledText>
                 </StyledView>
                 <StyledView>
                     <StyledText className="font-bold text-gray-800">Alphabet</StyledText>
                     <StyledText className="text-xs text-gray-500">Abidii</StyledText>
                 </StyledView>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity onPress={() => router.push('/numbers')} className="flex-1 flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 active:bg-gray-100">
                 <StyledView className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
                    <StyledText className="text-blue-600 font-bold">123</StyledText>
                 </StyledView>
                 <StyledView>
                     <StyledText className="font-bold text-gray-800">Numbers</StyledText>
                     <StyledText className="text-xs text-gray-500">Onuogugu</StyledText>
                 </StyledView>
              </StyledTouchableOpacity>
           </StyledView>
        </StyledView>

        <StyledView className="gap-4 pb-4">
          <StyledText className="font-bold text-gray-800 text-lg">Lessons</StyledText>
          {ADULT_CURRICULUM.map((level, index) => {
            const isCompleted = completedLessons.includes(level.level_id);
            const isUnlocked = index === 0 || completedLessons.includes(ADULT_CURRICULUM[index-1].level_id);

            return (
              <StyledTouchableOpacity
                key={level.level_id}
                onPress={() => isUnlocked && router.push(`/adults/level/${level.level_id}`)}
                disabled={!isUnlocked}
                className={`p-6 rounded-2xl border-2 flex-row items-center justify-between ${!isUnlocked ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 active:border-primary/30 active:shadow-md'}`}
              >
                <StyledView className="flex-row items-center gap-5 flex-1">
                  <StyledView className={`w-12 h-12 rounded-full items-center justify-center ${isCompleted ? 'bg-green-100' : isUnlocked ? 'bg-orange-100' : 'bg-gray-200'}`}>
                    {isCompleted ? <CheckCircle size={24} color="#16a34a" /> : <StyledText className={`font-bold text-lg ${isUnlocked ? 'text-orange-600' : 'text-gray-500'}`}>{level.level_id}</StyledText>}
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-xs font-bold text-gray-400 uppercase tracking-wide">Level {level.level_id}</StyledText>
                    <StyledText className="font-bold text-gray-800 text-xl">{level.title}</StyledText>
                    {level.description && <StyledText className="text-sm text-gray-500 mt-1" numberOfLines={2}>{level.description}</StyledText>}
                  </StyledView>
                </StyledView>
                {!isUnlocked ? <Lock size={24} color="#d1d5db" /> : <ChevronRight size={24} color="#FF6B00" />}
              </StyledTouchableOpacity>
            );
          })}
        </StyledView>
      </StyledView>
    </Layout>
  );
}
