import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Check } from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

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
              <StyledView className="items-center mb-10">
                  <StyledText className="text-4xl font-bold text-primary mb-2">Nnọ!</StyledText>
                  <StyledText className="text-gray-600 text-lg">Welcome back to Lingbo</StyledText>
              </StyledView>

              <StyledText className="font-bold text-gray-700 mb-4">Who is learning today?</StyledText>

              <StyledView className="gap-4">
                  {profiles.map(p => (
                      <StyledTouchableOpacity
                          key={p.id}
                          onPress={() => handleSelectProfile(p.id)}
                          className="bg-white p-4 rounded-2xl flex-row items-center gap-4 shadow-sm border border-gray-100"
                      >
                          <StyledView className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center">
                              <StyledText className="text-2xl">{p.avatar}</StyledText>
                          </StyledView>
                          <StyledView>
                              <StyledText className="font-bold text-lg text-gray-800">{p.name}</StyledText>
                              <StyledText className="text-sm text-gray-500">Level {p.level}</StyledText>
                          </StyledView>
                      </StyledTouchableOpacity>
                  ))}

                  <StyledTouchableOpacity
                      onPress={() => setStep('create')}
                      className="mt-4 border-2 border-dashed border-gray-300 p-4 rounded-2xl items-center"
                  >
                      <StyledText className="font-bold text-gray-500">+ Add New Profile</StyledText>
                  </StyledTouchableOpacity>
              </StyledView>
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
        <StyledView className="items-center mb-12">
            <StyledView className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-6">
                <StyledText className="text-5xl">🌍</StyledText>
            </StyledView>
            <StyledText className="text-3xl font-bold text-gray-800 text-center mb-2">
                Start Learning Igbo
            </StyledText>
            <StyledText className="text-center text-gray-500">
                Create your profile to begin your journey
            </StyledText>
        </StyledView>

        <StyledView className="space-y-6">
            <StyledView>
                <StyledText className="font-bold text-gray-700 mb-2 ml-1">What's your name?</StyledText>
                <StyledTextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-lg font-medium text-gray-800 focus:border-primary"
                    placeholderTextColor="#9CA3AF"
                />
            </StyledView>

            <StyledView>
                <StyledText className="font-bold text-gray-700 mb-3 ml-1">Choose your avatar</StyledText>
                <StyledView className="flex-row flex-wrap justify-between gap-3">
                    {AVATARS.map(avatar => (
                        <StyledTouchableOpacity
                            key={avatar}
                            onPress={() => setSelectedAvatar(avatar)}
                            className={`w-16 h-16 rounded-xl items-center justify-center border-2 ${selectedAvatar === avatar ? 'bg-orange-50 border-primary' : 'bg-gray-50 border-transparent'}`}
                        >
                            <StyledText className="text-3xl">{avatar}</StyledText>
                            {selectedAvatar === avatar && (
                                <StyledView className="absolute -top-2 -right-2 bg-primary w-6 h-6 rounded-full items-center justify-center">
                                    <Check size={14} color="white" strokeWidth={3} />
                                </StyledView>
                            )}
                        </StyledTouchableOpacity>
                    ))}
                </StyledView>
            </StyledView>

            <StyledTouchableOpacity
                onPress={handleCreate}
                disabled={!name.trim()}
                className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 mt-8 ${!name.trim() ? 'bg-gray-200' : 'bg-primary shadow-lg shadow-orange-200'}`}
            >
                <StyledText className={`font-bold text-lg ${!name.trim() ? 'text-gray-400' : 'text-white'}`}>
                    Start Adventure
                </StyledText>
                <ArrowRight size={20} color={!name.trim() ? '#9CA3AF' : 'white'} />
            </StyledTouchableOpacity>
        </StyledView>
      </ScrollView>
    </SafeAreaView>
  );
}
