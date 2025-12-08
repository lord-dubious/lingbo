import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Puzzle, Sparkles, Timer, Image as ImageIcon, Play } from 'lucide-react-native';

import Layout from '../../components/Layout';





export default function KidsGameMenu() {
  const router = useRouter();
  const games = [
      { title: "Sentence Puzzle", icon: Puzzle, color: "bg-orange-400", border: "border-orange-600", path: "/kids/game/sentence" },
      { title: "Memory Match", icon: Sparkles, color: "bg-cyan-400", border: "border-cyan-600", path: "/kids/game/memory" },
      { title: "Speed Tap", icon: Timer, color: "bg-indigo-400", border: "border-indigo-600", path: "/kids/game/speed" },
      { title: "Word Flash", icon: ImageIcon, color: "bg-pink-400", border: "border-pink-600", path: "/kids/game/words" }
  ];

  return (
      <Layout title="Games" showBack backPath="/kids" isKidsMode hideBottomNav>
          <View className="space-y-4 p-2">
              {games.map((g, i) => (
                  <TouchableOpacity
                      key={i}
                      onPress={() => router.push(g.path)}
                      className={`
                          w-full ${g.color} rounded-3xl p-6
                          border-b-8 ${g.border} active:border-b-0 active:translate-y-2
                          flex-row items-center gap-6 shadow-lg mb-4
                      `}
                  >
                      <View className="bg-white/25 p-4 rounded-2xl">
                          <g.icon size={32} color="white" />
                      </View>
                      <View className="flex-1">
                          <Text className="font-bold text-2xl text-white">{g.title}</Text>
                          <Text className="text-white/80 font-bold text-sm">Tap to play!</Text>
                      </View>
                      <View className="bg-white/20 p-3 rounded-full">
                          <Play size={24} color="white" fill="white" />
                      </View>
                  </TouchableOpacity>
              ))}
          </View>
      </Layout>
  );
}
