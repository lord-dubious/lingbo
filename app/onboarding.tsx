import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Check } from 'lucide-react-native';






const AVATARS = ['🦁', '🐘', '🦒', '🦓', '🐒', '🦅', '🦋', '🐢'];

export default function Onboarding() {
  const router = useRouter();
  const { createProfile, profiles, switchProfile } = useUser();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [step, setStep] = useState<'welcome' | 'create'>('welcome');

  const handleStart = () => {
    if (profiles.length > 0) {
       // If profiles exist, let user select one
       // For simplicity in this demo, just auto select first or show list.
       // Let's just show create if empty, else list.
    }
    setStep('create');
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createProfile(name, selectedAvatar);
    router.replace('/hub');
  };

  const handleSelectProfile = (id: string) => {
      switchProfile(id);
      router.replace('/hub');
  };

  if (step === 'welcome' && profiles.length > 0) {
      return (
          <SafeAreaView className="flex-1 bg-orange-50 justify-center px-6">
              <View className="items-center mb-10">
                  <Text className="text-4xl font-bold text-primary mb-2">Nnọ!</Text>
                  <Text className="text-gray-600 text-lg">Welcome back to Lingbo</Text>
              </View>

              <Text className="font-bold text-gray-700 mb-4">Who is learning today?</Text>

              <View className="gap-4">
                  {profiles.map(p => (
                      <TouchableOpacity
                          key={p.id}
                          onPress={() => handleSelectProfile(p.id)}
                          className="bg-white p-4 rounded-2xl flex-row items-center gap-4 shadow-sm border border-gray-100"
                      >
                          <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center">
                              <Text className="text-2xl">{p.avatar}</Text>
                          </View>
                          <View>
                              <Text className="font-bold text-lg text-gray-800">{p.name}</Text>
                              <Text className="text-sm text-gray-500">Level {p.level}</Text>
                          </View>
                      </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                      onPress={() => setStep('create')}
                      className="mt-4 border-2 border-dashed border-gray-300 p-4 rounded-2xl items-center"
                  >
                      <Text className="font-bold text-gray-500">+ Add New Profile</Text>
                  </TouchableOpacity>
              </View>
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
        <View className="items-center mb-12">
            <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-6">
                <Text className="text-5xl">🌍</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-800 text-center mb-2">
                Start Learning Igbo
            </Text>
            <Text className="text-center text-gray-500">
                Create your profile to begin your journey
            </Text>
        </View>

        <View className="space-y-6">
            <View>
                <Text className="font-bold text-gray-700 mb-2 ml-1">What's your name?</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg font-medium text-gray-800 focus:border-primary"
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            <View>
                <Text className="font-bold text-gray-700 mb-3 ml-1">Choose your avatar</Text>
                <View className="flex-row flex-wrap justify-between gap-3">
                    {AVATARS.map(avatar => (
                        <TouchableOpacity
                            key={avatar}
                            onPress={() => setSelectedAvatar(avatar)}
                            className={`w-16 h-16 rounded-xl items-center justify-center border-2 ${selectedAvatar === avatar ? 'bg-orange-50 border-primary' : 'bg-gray-50 border-transparent'}`}
                        >
                            <Text className="text-3xl">{avatar}</Text>
                            {selectedAvatar === avatar && (
                                <View className="absolute -top-2 -right-2 bg-primary w-6 h-6 rounded-full items-center justify-center">
                                    <Check size={14} color="white" strokeWidth={3} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                onPress={handleCreate}
                disabled={!name.trim()}
                className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 mt-8 ${!name.trim() ? 'bg-gray-200' : 'bg-primary shadow-lg shadow-orange-200'}`}
            >
                <Text className={`font-bold text-lg ${!name.trim() ? 'text-gray-400' : 'text-white'}`}>
                    Start Adventure
                </Text>
                <ArrowRight size={20} color={!name.trim() ? '#9CA3AF' : 'white'} />
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
