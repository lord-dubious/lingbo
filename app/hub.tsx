import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Gamepad2, Video, Library as LibraryIcon, Star, Mic, ChevronRight } from 'lucide-react-native';
import { styled } from 'nativewind';
import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

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
       <StyledView className="mb-6 mt-2">
          <StyledView className="flex-row items-center justify-between mb-2">
             <StyledText className="text-2xl font-bold text-gray-800">
                Ndewo, {activeProfile?.name || 'Friend'}!
             </StyledText>
             <StyledText className="text-3xl">{activeProfile?.avatar}</StyledText>
          </StyledView>
          <StyledView className="flex-row items-center gap-2 bg-yellow-50 self-start px-3 py-1 rounded-full border border-yellow-100">
              <Star size={16} color="#EAB308" fill="#EAB308" />
              <StyledText className="font-bold text-yellow-700">{activeProfile?.xp || 0} XP</StyledText>
          </StyledView>
       </StyledView>

       <StyledView className="gap-4">
          {/* Large Items */}
          <StyledView className="flex-row gap-4">
             {MENU_ITEMS.filter(i => i.size === 'large').map(item => (
                <StyledTouchableOpacity
                   key={item.id}
                   onPress={() => router.push(item.path)}
                   className={`${item.color} flex-1 p-4 rounded-3xl h-40 justify-between shadow-lg shadow-gray-200`}
                >
                   <StyledView className="bg-white/20 self-start p-3 rounded-2xl">
                      <item.icon size={28} color="white" />
                   </StyledView>
                   <StyledView>
                      <StyledText className="text-white font-bold text-xl leading-6">{item.title}</StyledText>
                      <StyledText className="text-white/80 text-xs font-medium mt-1">{item.subtitle}</StyledText>
                   </StyledView>
                </StyledTouchableOpacity>
             ))}
          </StyledView>

          {/* Medium Items List */}
          <StyledView className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100">
             {MENU_ITEMS.filter(i => i.size === 'medium').map((item, index, arr) => (
                 <StyledTouchableOpacity
                    key={item.id}
                    onPress={() => router.push(item.path)}
                    className={`flex-row items-center p-4 ${index !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}
                 >
                    <StyledView className={`${item.color} w-12 h-12 rounded-2xl items-center justify-center mr-4`}>
                       <item.icon size={24} color="white" />
                    </StyledView>
                    <StyledView className="flex-1">
                       <StyledText className="font-bold text-gray-800 text-lg">{item.title}</StyledText>
                       <StyledText className="text-gray-500 text-xs">{item.subtitle}</StyledText>
                    </StyledView>
                    <ChevronRight size={20} color="#D1D5DB" />
                 </StyledTouchableOpacity>
             ))}
          </StyledView>
       </StyledView>
    </Layout>
  );
}
