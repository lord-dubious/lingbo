import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Lightbulb, BookOpen, Lock, ChevronRight, CheckCircle, Trophy, Volume2 } from 'lucide-react-native';

import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';
import { ADULT_CURRICULUM, FUN_FACTS } from '../../constants';





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
      <View className="space-y-6">
        <View className="flex-row items-center justify-between bg-orange-50 p-6 rounded-2xl border border-orange-100">
           <View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">Nnọ, {activeProfile?.name || 'Friend'}!</Text>
              <View className="flex-row items-center gap-2">
                 <Text className="text-gray-600 text-sm">Level {activeProfile?.level || 1}</Text>
                 <View className="w-1 h-1 rounded-full bg-gray-400"></View>
                 <Text className="text-primary font-bold text-sm">{activeProfile?.xp || 0} XP</Text>
              </View>
           </View>
           <Text className="text-4xl">{activeProfile?.avatar}</Text>
        </View>

        <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex-row items-start gap-3">
           <Lightbulb size={24} color="#3b82f6" className="mt-1" />
           <View className="flex-1">
              <Text className="font-bold text-blue-700 text-sm mb-1">Did You Know?</Text>
              <Text className="text-blue-900 text-sm leading-6">{funFact}</Text>
           </View>
        </View>

        <View className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
           <Text className="font-bold text-gray-800 mb-4 flex-row items-center gap-2">
               <BookOpen size={20} color="#FF6B00"/>
               <Text> Reference Materials</Text>
           </Text>
           <View className="flex-row gap-4">
              <TouchableOpacity onPress={() => router.push('/alphabet')} className="flex-1 flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 active:bg-gray-100">
                 <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center">
                    <Text className="text-purple-600 font-bold">Ab</Text>
                 </View>
                 <View>
                     <Text className="font-bold text-gray-800">Alphabet</Text>
                     <Text className="text-xs text-gray-500">Abidii</Text>
                 </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/numbers')} className="flex-1 flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 active:bg-gray-100">
                 <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
                    <Text className="text-blue-600 font-bold">123</Text>
                 </View>
                 <View>
                     <Text className="font-bold text-gray-800">Numbers</Text>
                     <Text className="text-xs text-gray-500">Onuogugu</Text>
                 </View>
              </TouchableOpacity>
           </View>
        </View>

        <View className="gap-4 pb-4">
          <Text className="font-bold text-gray-800 text-lg">Lessons</Text>
          {ADULT_CURRICULUM.map((level, index) => {
            const isCompleted = completedLessons.includes(level.level_id);
            const isUnlocked = index === 0 || completedLessons.includes(ADULT_CURRICULUM[index-1].level_id);

            return (
              <TouchableOpacity
                key={level.level_id}
                onPress={() => isUnlocked && router.push(`/adults/level/${level.level_id}`)}
                disabled={!isUnlocked}
                className={`p-6 rounded-2xl border-2 flex-row items-center justify-between ${!isUnlocked ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 active:border-primary/30 active:shadow-md'}`}
              >
                <View className="flex-row items-center gap-5 flex-1">
                  <View className={`w-12 h-12 rounded-full items-center justify-center ${isCompleted ? 'bg-green-100' : isUnlocked ? 'bg-orange-100' : 'bg-gray-200'}`}>
                    {isCompleted ? <CheckCircle size={24} color="#16a34a" /> : <Text className={`font-bold text-lg ${isUnlocked ? 'text-orange-600' : 'text-gray-500'}`}>{level.level_id}</Text>}
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide">Level {level.level_id}</Text>
                    <Text className="font-bold text-gray-800 text-xl">{level.title}</Text>
                    {level.description && <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>{level.description}</Text>}
                  </View>
                </View>
                {!isUnlocked ? <Lock size={24} color="#d1d5db" /> : <ChevronRight size={24} color="#FF6B00" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Layout>
  );
}
