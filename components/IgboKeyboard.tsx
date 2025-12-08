import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Keyboard as KeyboardIcon, X } from 'lucide-react-native';
import { styled } from 'nativewind';
import { useUser } from '../context/UserContext';
import * as Clipboard from 'expo-clipboard';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const IgboKeyboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const { activeProfile } = useUser();

  // Only show for adults or if setting enabled (assuming logic)
  // For now show always if profile exists
  if (!activeProfile) return null;

  const specializedChars = [
    'ị', 'Ị', 'ọ', 'Ọ', 'ụ', 'Ụ',
    'ṅ', 'Ṅ', 'gw', 'Gw', 'kp', 'Kp',
    'kw', 'Kw', 'nw', 'Nw', 'ny', 'Ny',
    'gh', 'Gh', 'sh', 'Sh'
  ];

  const handleCharClick = async (char: string) => {
    // In React Native we can't easily insert into the focused input unless we control it.
    // So we will copy to clipboard and show a toast/feedback.
    await Clipboard.setStringAsync(char);
    // Ideally show a toast here "Copied!"
  };

  return (
    <>
      {!isOpen && (
        <StyledTouchableOpacity
          onPress={() => setIsOpen(true)}
          className="absolute bottom-24 right-4 bg-primary p-3 rounded-full shadow-lg z-50"
        >
           <KeyboardIcon color="white" size={24} />
        </StyledTouchableOpacity>
      )}

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <StyledView className="flex-1 justify-end">
            <StyledView className="bg-white border-t border-gray-200 shadow-xl pb-8">
                <StyledView className="flex-row items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
                    <StyledText className="font-bold text-gray-700">Igbo Characters (Tap to Copy)</StyledText>
                    <StyledTouchableOpacity onPress={() => setIsOpen(false)} className="p-1 bg-gray-200 rounded-full">
                        <X size={20} color="#4b5563" />
                    </StyledTouchableOpacity>
                </StyledView>

                <StyledView className="p-4 flex-row flex-wrap justify-center gap-3">
                    {specializedChars.map((char) => (
                        <StyledTouchableOpacity
                            key={char}
                            onPress={() => handleCharClick(char)}
                            className="w-12 h-12 bg-white border border-gray-200 rounded-xl items-center justify-center shadow-sm active:bg-orange-50 active:border-primary"
                        >
                            <StyledText className="text-lg font-bold text-gray-800">{char}</StyledText>
                        </StyledTouchableOpacity>
                    ))}
                </StyledView>
            </StyledView>
        </StyledView>
      </Modal>
    </>
  );
};

export default IgboKeyboard;
