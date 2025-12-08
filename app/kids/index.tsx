import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Gamepad2,
  PlayCircle,
  Image as ImageIcon,
  Type,
  Hash,
  Pencil,
  Puzzle,
  Sparkles,
  Timer,
  Play
} from 'lucide-react-native';
import { styled } from 'nativewind';
import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function KidsDashboard() {
  const router = useRouter();
  const { activeProfile } = useUser();

  const menu = [
    { label: "Words", sub: "Flashcards", icon: ImageIcon, bg: "bg-pink-400", border: "border-pink-600", path: "/kids/game/words" },
    { label: "Games", sub: "Play Time", icon: Gamepad2, bg: "bg-blue-400", border: "border-blue-600", path: "/kids/games" },
    { label: "Write", sub: "Trace Book", icon: Pencil, bg: "bg-orange-400", border: "border-orange-600", path: "/kids/trace" },
    { label: "ABC", sub: "Alphabet", icon: Type, bg: "bg-green-400", border: "border-green-600", path: "/alphabet" },
    { label: "123", sub: "Numbers", icon: Hash, bg: "bg-yellow-400", border: "border-yellow-600", path: "/numbers" },
    { label: "Watch", sub: "Videos", icon: PlayCircle, bg: "bg-red-400", border: "border-red-600", path: "/videos" },
  ];

  return (
    <Layout title="Kids Corner" showBack backPath="/hub" isKidsMode hideBottomNav>
       <StyledView className="items-center pb-8">
          {/* Big Greeting */}
          <StyledView className="w-full bg-white/60 p-4 rounded-3xl mb-6 flex-row items-center gap-4 border-2 border-white/50 shadow-sm">
             <StyledText className="text-5xl">{activeProfile?.avatar || '🐻'}</StyledText>
             <StyledView>
                <StyledText className="font-bold text-3xl text-gray-800 tracking-wide">Hi, {activeProfile?.name}!</StyledText>
                <StyledText className="font-bold text-gray-500 text-sm">What do you want to do?</StyledText>
             </StyledView>
          </StyledView>

          {/* Grid */}
          <StyledView className="flex-row flex-wrap justify-between">
             {menu.map((item, i) => (
                <StyledTouchableOpacity
                  key={i}
                  onPress={() => router.push(item.path)}
                  className={`
                    ${item.bg} w-[48%] aspect-square rounded-3xl mb-4 p-2
                    border-b-8 ${item.border} active:border-b-0 active:translate-y-2
                    items-center justify-center gap-2 shadow-xl
                  `}
                >
                   {/* Background pattern equivalent could be images, skipping for simplicity */}

                   <StyledView className="items-center justify-center p-2">
                     <item.icon size={56} color="white" />
                   </StyledView>
                   <StyledView className="items-center">
                       <StyledText className="font-bold text-2xl text-white tracking-wide">{item.label}</StyledText>
                       <StyledText className="text-xs font-bold text-white/90 uppercase tracking-wider mt-1">{item.sub}</StyledText>
                   </StyledView>
                </StyledTouchableOpacity>
             ))}
          </StyledView>
       </StyledView>
    </Layout>
  );
}
