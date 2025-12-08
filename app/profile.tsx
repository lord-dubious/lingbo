import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';

import { useUser } from '../context/UserContext';
import Layout from '../components/Layout';
import { useRouter } from 'expo-router';
import { User, LogOut, Trash2, Volume2, Music, Check } from 'lucide-react-native';





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
        <View className="items-center py-6">
            <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
                <Text className="text-5xl">{activeProfile.avatar}</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800">{activeProfile.name}</Text>
            <Text className="text-gray-500 font-medium">Level {activeProfile.level} • {activeProfile.xp} XP</Text>
        </View>

        <View className="space-y-6">
            <View>
                <Text className="font-bold text-gray-900 mb-3 px-1 text-lg">Settings</Text>
                <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <View className="p-4 flex-row items-center justify-between border-b border-gray-50">
                        <View className="flex-row items-center gap-3">
                            <View className="p-2 bg-blue-50 rounded-lg"><Volume2 size={20} color="#3b82f6"/></View>
                            <Text className="font-medium text-gray-700">Sound Effects</Text>
                        </View>
                        <Check size={20} color="#22c55e" />
                    </View>
                    <View className="p-4 flex-row items-center justify-between">
                         <View className="flex-row items-center gap-3">
                            <View className="p-2 bg-purple-50 rounded-lg"><Music size={20} color="#a855f7"/></View>
                            <Text className="font-medium text-gray-700">Background Music</Text>
                        </View>
                        <Check size={20} color="#22c55e" />
                    </View>
                </View>
            </View>

            <View>
                 <Text className="font-bold text-gray-900 mb-3 px-1 text-lg">Account</Text>
                 <View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <TouchableOpacity onPress={handleLogout} className="p-4 flex-row items-center gap-3 border-b border-gray-50 active:bg-gray-50">
                        <LogOut size={20} color="#6b7280" />
                        <Text className="font-medium text-gray-700">Switch Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} className="p-4 flex-row items-center gap-3 active:bg-red-50">
                        <Trash2 size={20} color="#ef4444" />
                        <Text className="font-medium text-red-500">Delete Profile</Text>
                    </TouchableOpacity>
                 </View>
            </View>
        </View>
    </Layout>
  );
}
