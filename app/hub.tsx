import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Gamepad2, Video, Library as LibraryIcon, Star, Mic, ChevronRight } from 'lucide-react-native';

import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';





export default function Hub() {
  const router = useRouter();
  const { activeProfile } = useUser();

  const MENU_ITEMS = [
    {
        id: 'adults',
        title: 'Learn Igbo',
        subtitle: 'Structured Lessons',
        icon: BookOpen,
        color: 'bg-orange-500',
        path: '/adults',
        size: 'large'
    },
    {
        id: 'kids',
        title: 'Kids Corner',
        subtitle: 'Games & Fun',
        icon: Gamepad2,
        color: 'bg-sky-500',
        path: '/kids',
        size: 'large'
    },
    {
        id: 'library',
        title: 'Library',
        subtitle: 'Books & Resources',
        icon: LibraryIcon,
        color: 'bg-purple-500',
        path: '/library',
        size: 'medium'
    },
    {
        id: 'practice',
        title: 'Speak',
        subtitle: 'Practice Pronunciation',
        icon: Mic,
        color: 'bg-green-500',
        path: '/practice',
        size: 'medium'
    },
    {
        id: 'videos',
        title: 'Videos',
        subtitle: 'Watch & Learn',
        icon: Video,
        color: 'bg-red-500',
        path: '/videos',
        size: 'medium'
    }
  ];

  return (
    <Layout>
       <View className="mb-6 mt-2">
          <View className="flex-row items-center justify-between mb-2">
             <Text className="text-2xl font-bold text-gray-800">
                Ndewo, {activeProfile?.name || 'Friend'}!
             </Text>
             <Text className="text-3xl">{activeProfile?.avatar}</Text>
          </View>
          <View className="flex-row items-center gap-2 bg-yellow-50 self-start px-3 py-1 rounded-full border border-yellow-100">
              <Star size={16} color="#EAB308" fill="#EAB308" />
              <Text className="font-bold text-yellow-700">{activeProfile?.xp || 0} XP</Text>
          </View>
       </View>

       <View className="gap-4">
          {/* Large Items */}
          <View className="flex-row gap-4">
             {MENU_ITEMS.filter(i => i.size === 'large').map(item => (
                <TouchableOpacity
                   key={item.id}
                   onPress={() => router.push(item.path)}
                   className={`${item.color} flex-1 p-4 rounded-3xl h-40 justify-between shadow-lg shadow-gray-200`}
                >
                   <View className="bg-white/20 self-start p-3 rounded-2xl">
                      <item.icon size={28} color="white" />
                   </View>
                   <View>
                      <Text className="text-white font-bold text-xl leading-6">{item.title}</Text>
                      <Text className="text-white/80 text-xs font-medium mt-1">{item.subtitle}</Text>
                   </View>
                </TouchableOpacity>
             ))}
          </View>

          {/* Medium Items List */}
          <View className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
             {MENU_ITEMS.filter(i => i.size === 'medium').map((item, index, arr) => (
                 <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(item.path)}
                    className={`flex-row items-center p-4 ${index !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}
                 >
                    <View className={`${item.color} w-12 h-12 rounded-2xl items-center justify-center mr-4`}>
                       <item.icon size={24} color="white" />
                    </View>
                    <View className="flex-1">
                       <Text className="font-bold text-gray-800 text-lg">{item.title}</Text>
                       <Text className="text-gray-500 text-xs">{item.subtitle}</Text>
                    </View>
                    <ChevronRight size={20} color="#D1D5DB" />
                 </TouchableOpacity>
             ))}
          </View>
       </View>
    </Layout>
  );
}
