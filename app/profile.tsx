import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useUser } from '../context/UserContext';
import Layout from '../components/Layout';
import { useRouter } from 'expo-router';
import { User, LogOut, Trash2, Volume2, Music, Check } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function ProfilePage() {
  const { activeProfile, switchProfile, profiles, deleteProfile } = useUser();
  const router = useRouter();

  if (!activeProfile) return null;

  const handleLogout = () => {
    switchProfile(''); // Or implement logout properly
    router.replace('/onboarding');
  };

  const handleDelete = () => {
      Alert.alert(
          "Delete Profile",
          "Are you sure? This cannot be undone.",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => {
                  deleteProfile(activeProfile.id);
                  router.replace('/onboarding');
              }}
          ]
      );
  };

  return (
    <Layout title="Profile" showBack>
        <StyledView className="items-center py-6">
            <StyledView className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
                <StyledText className="text-5xl">{activeProfile.avatar}</StyledText>
            </StyledView>
            <StyledText className="text-2xl font-bold text-gray-800">{activeProfile.name}</StyledText>
            <StyledText className="text-gray-500 font-medium">Level {activeProfile.level} • {activeProfile.xp} XP</StyledText>
        </StyledView>

        <StyledView className="space-y-6">
            <StyledView>
                <StyledText className="font-bold text-gray-900 mb-3 px-1 text-lg">Settings</StyledText>
                <StyledView className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <StyledView className="p-4 flex-row items-center justify-between border-b border-gray-50">
                        <StyledView className="flex-row items-center gap-3">
                            <StyledView className="p-2 bg-blue-50 rounded-lg"><Volume2 size={20} color="#3b82f6"/></StyledView>
                            <StyledText className="font-medium text-gray-700">Sound Effects</StyledText>
                        </StyledView>
                        <Check size={20} color="#22c55e" />
                    </StyledView>
                    <StyledView className="p-4 flex-row items-center justify-between">
                         <StyledView className="flex-row items-center gap-3">
                            <StyledView className="p-2 bg-purple-50 rounded-lg"><Music size={20} color="#a855f7"/></StyledView>
                            <StyledText className="font-medium text-gray-700">Background Music</StyledText>
                        </StyledView>
                        <Check size={20} color="#22c55e" />
                    </StyledView>
                </StyledView>
            </StyledView>

            <StyledView>
                 <StyledText className="font-bold text-gray-900 mb-3 px-1 text-lg">Account</StyledText>
                 <StyledView className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <StyledTouchableOpacity onPress={handleLogout} className="p-4 flex-row items-center gap-3 border-b border-gray-50 active:bg-gray-50">
                        <LogOut size={20} color="#6b7280" />
                        <StyledText className="font-medium text-gray-700">Switch Profile</StyledText>
                    </StyledTouchableOpacity>
                    <StyledTouchableOpacity onPress={handleDelete} className="p-4 flex-row items-center gap-3 active:bg-red-50">
                        <Trash2 size={20} color="#ef4444" />
                        <StyledText className="font-medium text-red-500">Delete Profile</StyledText>
                    </StyledTouchableOpacity>
                 </StyledView>
            </StyledView>
        </StyledView>
    </Layout>
  );
}
